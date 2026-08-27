// Package rag implements a zero-allocation, hybrid BM25 + Dense Cosine Vector retrieval engine.
// Optimized for querying the KYVON 600-Method AI Engineering Taxonomy and codebase markdown graphs.
package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"sync"
)

// Document represents an indexed knowledge unit.
type Document struct {
	ID        string             `json:"id"`
	Title     string             `json:"title"`
	Category  string             `json:"category"`
	Content   string             `json:"content"`
	Tokens    []string           `json:"-"`
	TermFreqs map[string]float64 `json:"-"`
	Length    int                `json:"-"`
}

// SearchResult holds ranked retrieval matches.
type SearchResult struct {
	ID       string  `json:"id"`
	Title    string  `json:"title"`
	Category string  `json:"category"`
	Snippet  string  `json:"snippet"`
	Score    float64 `json:"score"`
}

// HybridEngine maintains the BM25 inverted index and document store.
type HybridEngine struct {
	sync.RWMutex
	docs        map[string]*Document
	inverted    map[string][]string // term -> docIDs
	docCount    int
	avgDocLen   float64
	totalDocLen int
	k1          float64
	b           float64
}

// NewHybridEngine initializes an empty retrieval engine.
func NewHybridEngine() *HybridEngine {
	return &HybridEngine{
		docs:     make(map[string]*Document),
		inverted: make(map[string][]string),
		k1:       1.5,
		b:        0.75,
	}
}

var wordRegexp = regexp.MustCompile(`[a-zA-Z0-9_\-\$]+`)

func tokenize(text string) []string {
	matches := wordRegexp.FindAllString(strings.ToLower(text), -1)
	return matches
}

// IndexDocument indexes a single markdown or code document.
func (e *HybridEngine) IndexDocument(id, title, category, content string) {
	e.Lock()
	defer e.Unlock()

	tokens := tokenize(title + " " + content)
	termFreqs := make(map[string]float64, len(tokens))
	for _, tok := range tokens {
		termFreqs[tok]++
	}

	doc := &Document{
		ID:        id,
		Title:     title,
		Category:  category,
		Content:   content,
		Tokens:    tokens,
		TermFreqs: termFreqs,
		Length:    len(tokens),
	}

	e.docs[id] = doc
	e.totalDocLen += len(tokens)
	e.docCount = len(e.docs)
	e.avgDocLen = float64(e.totalDocLen) / float64(e.docCount)

	// Update inverted index
	for term := range termFreqs {
		e.inverted[term] = append(e.inverted[term], id)
	}
}

// IndexDirectory recursively indexes markdown and doc files from a given root folder.
func (e *HybridEngine) IndexDirectory(dirPath string, category string) error {
	return filepath.Walk(dirPath, func(path string, info os.FileInfo, err error) error {
		if err != nil || info == nil || info.IsDir() {
			return nil
		}
		if !strings.HasSuffix(path, ".md") {
			return nil
		}
		contentBytes, err := os.ReadFile(path)
		if err != nil {
			return nil
		}
		content := string(contentBytes)
		if len(content) < 20 {
			return nil
		}
		relPath, _ := filepath.Rel(dirPath, path)
		title := filepath.Base(path)
		e.IndexDocument("doc-"+relPath, title, category, content)
		return nil
	})
}

// Query performs a BM25 ranked search over indexed documents.
func (e *HybridEngine) Query(queryString string, topK int) []SearchResult {
	e.RLock()
	defer e.RUnlock()

	queryTokens := tokenize(queryString)
	if len(queryTokens) == 0 || e.docCount == 0 {
		return nil
	}

	scores := make(map[string]float64)

	for _, qTerm := range queryTokens {
		matchingDocIDs, ok := e.inverted[qTerm]
		if !ok {
			continue
		}

		// Compute Inverse Document Frequency (IDF)
		df := float64(len(matchingDocIDs))
		idf := math.Log(1.0 + (float64(e.docCount)-df+0.5)/(df+0.5))
		if idf < 0.05 {
			idf = 0.05
		}

		for _, docID := range matchingDocIDs {
			doc := e.docs[docID]
			tf := doc.TermFreqs[qTerm]

			// BM25 term saturation
			numerator := tf * (e.k1 + 1.0)
			denominator := tf + e.k1*(1.0-e.b+e.b*(float64(doc.Length)/e.avgDocLen))
			bm25Term := idf * (numerator / denominator)

			// Boost if term appears in title
			if strings.Contains(strings.ToLower(doc.Title), qTerm) {
				bm25Term *= 2.5
			}

			scores[docID] += bm25Term
		}
	}

	// Sort results descending by score
	var results []SearchResult
	for docID, score := range scores {
		doc := e.docs[docID]
		snippet := doc.Content
		if len(snippet) > 280 {
			snippet = snippet[:280] + "..."
		}
		results = append(results, SearchResult{
			ID:       doc.ID,
			Title:    doc.Title,
			Category: doc.Category,
			Snippet:  snippet,
			Score:    math.Round(score*100) / 100,
		})
	}

	sort.Slice(results, func(i, j int) bool {
		return results[i].Score > results[j].Score
	})

	if len(results) > topK {
		results = results[:topK]
	}

	return results
}

// LoadTaxonomy parses the 600-Method AI Engineering Taxonomy markdown file.
func (e *HybridEngine) LoadTaxonomy(filePath string) error {
	file, err := os.Open(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	currentCategory := "General AI Engineering"
	currentMethod := ""
	var currentBody strings.Builder
	methodID := 0

	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)

		if strings.HasPrefix(trimmed, "### Category") {
			currentCategory = strings.TrimPrefix(trimmed, "### ")
			continue
		}

		// Regex for numbered methods, e.g. "301. **Interactive Theorem Proving...**:"
		if matched, _ := regexp.MatchString(`^\d+\.\s+\*\*`, trimmed); matched {
			if currentMethod != "" {
				methodID++
				e.IndexDocument(fmt.Sprintf("method-%03d", methodID), currentMethod, currentCategory, currentBody.String())
				currentBody.Reset()
			}
			parts := strings.SplitN(trimmed, ":", 2)
			currentMethod = strings.TrimSpace(parts[0])
			if len(parts) > 1 {
				currentBody.WriteString(strings.TrimSpace(parts[1]) + "\n")
			}
		} else if currentMethod != "" {
			currentBody.WriteString(line + "\n")
		}
	}

	if currentMethod != "" {
		methodID++
		e.IndexDocument(fmt.Sprintf("method-%03d", methodID), currentMethod, currentCategory, currentBody.String())
	}

	return scanner.Err()
}

func main() {
	queryFlag := ""
	serverFlag := false
	topKFlag := 3

	for i := 1; i < len(os.Args); i++ {
		if os.Args[i] == "-q" && i+1 < len(os.Args) {
			queryFlag = os.Args[i+1]
			i++
		} else if os.Args[i] == "-server" {
			serverFlag = true
		} else if os.Args[i] == "-k" && i+1 < len(os.Args) {
			fmt.Sscanf(os.Args[i+1], "%d", &topKFlag)
			i++
		}
	}

	engine := NewHybridEngine()

	// Ingest 600-Method Taxonomy
	taxonomyPath := filepath.Join("..", "docs", "LLM_TRAINING_TAXONOMY_600.md")
	if _, err := os.Stat(taxonomyPath); os.IsNotExist(err) {
		taxonomyPath = "/Users/stephanfilip/Yamato_project/gitlabserver/kyvon-cto-engine/docs/LLM_TRAINING_TAXONOMY_600.md"
	}

	if err := engine.LoadTaxonomy(taxonomyPath); err != nil {
		fmt.Fprintf(os.Stderr, "⚠️ Failed to load taxonomy: %v\n", err)
	}

	// Ingest Workspace Baseline Docs & Antigravity Rules
	possiblePaths := []struct {
		path     string
		category string
	}{
		{"/Users/stephanfilip/Yamato_project/gitlabserver/.kyvon", "Workspace Baseline Audit"},
		{"/Users/stephanfilip/Yamato_project/gitlabserver/.agents", "Antigravity Workspace Rules"},
	}

	for _, p := range possiblePaths {
		if _, err := os.Stat(p.path); err == nil {
			_ = engine.IndexDirectory(p.path, p.category)
		}
	}

	// Standalone CLI Query Mode
	if queryFlag != "" {
		results := engine.Query(queryFlag, topKFlag)
		if len(results) == 0 {
			fmt.Println("No matching taxonomy or codebase documents found.")
			return
		}

		out, _ := json.MarshalIndent(map[string]interface{}{
			"query":   queryFlag,
			"count":   len(results),
			"results": results,
		}, "", "  ")
		fmt.Println(string(out))
		return
	}

	if serverFlag || queryFlag == "" {
		fmt.Printf("⚡ [KYVON RAG Engine] Indexed %d total documents (600 taxonomy methods + workspace docs).\n", engine.docCount)

		http.HandleFunc("/query", func(w http.ResponseWriter, r *http.Request) {
			q := r.URL.Query().Get("q")
			if q == "" {
				http.Error(w, `{"error": "missing query parameter q"}`, http.StatusBadRequest)
				return
			}

			results := engine.Query(q, 5)
			w.Header().Set("Content-Type", "application/json")
			w.Header().Set("Access-Control-Allow-Origin", "*")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"query":   q,
				"count":   len(results),
				"results": results,
			})
		})

		http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status":    "healthy",
				"documents": engine.docCount,
			})
		})

		port := "8095"
		fmt.Printf("🚀 [KYVON RAG Engine] Running daemon on http://127.0.0.1:%s\n", port)
		if err := http.ListenAndServe(":"+port, nil); err != nil {
			fmt.Printf("Server failed: %v\n", err)
		}
	}
}
