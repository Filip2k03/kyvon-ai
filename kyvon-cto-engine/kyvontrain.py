#!/usr/bin/env python3
"""
=============================================================================
KYVON CTO Engine - Autonomous DPO Training Pipeline (kyvontrain.py)
=============================================================================
Model: Qwen/Qwen2.5-Coder-7B-Instruct (or configurable base model)
Method: Direct Preference Optimization (DPO) with LoRA / QLoRA
Target: Enterprise Code Optimization, 50-Condition Architecture Audit,
        Clean Architecture, Concurrency, Zero-Allocation Go/TS/Python.

Features:
  - Multi-source dataset loader (JSONL / JSON / built-in high quality dataset)
  - Full LoRA target modules for Qwen2.5-Coder (all linear projections)
  - Proper ChatML conversation templating for prompt, chosen, and rejected pairs
  - Automatic LoRA adapter merging and export for direct zero-overhead vLLM serving
  - Multi-GPU & single-GPU memory optimizations (BF16, Flash Attention, Gradient Checkpointing)
=============================================================================
"""

import os
import sys
import json
import argparse
import logging
from typing import Dict, List, Any, Optional

import torch
from datasets import Dataset, load_dataset
from peft import LoraConfig, get_peft_model, PeftModel, TaskType
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    BitsAndBytesConfig,
    set_seed
)
from trl import DPOTrainer

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("KYVON-TRAINER")

# Default Parameters
DEFAULT_MODEL_ID = "Qwen/Qwen2.5-Coder-7B-Instruct"
DEFAULT_OUTPUT_DIR = "/mnt/data/kyvon-training/checkpoints/dpo_final"
DEFAULT_MERGED_DIR = "/mnt/data/kyvon-training/checkpoints/dpo_merged_vllm"

# System Prompt used to train KYVON CTO persona
SYSTEM_PROMPT = """Identity: KYVON Autonomous Engine.
Role: Principal CTO & Elite Systems Architect.
Task: Analyze, optimize, and enforce extreme performance, zero memory leaks, idiomatic concurrency, clean architecture, and strict security across all codebases.
Rules: Evaluate code against 50 CTO conditions. Deliver production-ready, benchmark-validated optimizations."""


def get_default_dataset() -> Dict[str, List[str]]:
    """
    Curated high-impact DPO pairs for Go, TypeScript, Python, SQL, Rust,
    and Architecture optimization.
    """
    return {
        "prompt": [
            # 1. Go Slice Search vs Map Indexing
            "Optimize this Go loop searching an unindexed slice:\nfor _, v := range list { if v.ID == target { return v } }",

            # 2. Go Goroutine Channel Leak & Concurrency
            "Fix the concurrency bug and memory leak in this Go worker:\nfunc fetchAll(urls []string) []string {\n    ch := make(chan string)\n    for _, u := range urls {\n        go func(url string) {\n            ch <- fetch(url)\n        }(u)\n    }\n    return []string{<-ch}\n}",

            # 3. TypeScript N+1 Database Query in API
            "Optimize this TypeScript Prisma API handler suffering from N+1 query overhead:\nconst users = await prisma.user.findMany();\nfor (const user of users) {\n    user.posts = await prisma.post.findMany({ where: { authorId: user.id } });\n}",

            # 4. Python Async Event Loop Blocking
            "Identify the performance flaw in this FastAPI route and optimize it for high concurrency:\n@app.get('/report/{id}')\nasync def get_report(id: str):\n    res = requests.get(f'https://internal.api/data/{id}')\n    time.sleep(2)\n    return res.json()",

            # 5. PostgreSQL Query & Missing Index Scan
            "Optimize this SQL query running on a 10M row table:\nSELECT * FROM orders WHERE status = 'COMPLETED' AND DATE(created_at) = CURRENT_DATE ORDER BY id DESC;",

            # 6. Go High Allocation JSON Streaming
            "Optimize high-throughput HTTP JSON payload processing in Go without unbounded heap allocations:\nbody, _ := io.ReadAll(r.Body)\nvar payload Data\njson.Unmarshal(body, &payload)",

            # 7. React / Next.js Unnecessary Re-renders
            "Refactor this React component with stateful subtrees to prevent cascading re-renders across the tree:\nexport function Dashboard({ metrics, user }) {\n  const [tick, setTick] = useState(0);\n  useEffect(() => { setInterval(() => setTick(t => t + 1), 1000); }, []);\n  return <div><h1>{user.name}</h1><ExpensiveChart data={metrics} /><Timer value={tick} /></div>;\n}",

            # 8. Security / JWT Hardcoded Secret & Verification
            "Audit and fix this authentication middleware security flaw:\nfunc AuthMiddleware(next http.Handler) http.Handler {\n    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n        token := r.Header.Get(\"Authorization\")\n        if token == \"admin-secret-token-123\" {\n            next.ServeHTTP(w, r)\n        }\n    })\n}"
        ],
        "chosen": [
            # 1. Chosen Go Map Lookup
            "// O(1) Lookup with Map Index\nif v, ok := lookupMap[target]; ok {\n    return v\n}\nreturn nil",

            # 2. Chosen Go sync.WaitGroup & Buffered/Context Channels
            "// Safe concurrent collector with sync.WaitGroup, context timeout & proper channel closure\nfunc fetchAll(ctx context.Context, urls []string) []string {\n    var wg sync.WaitGroup\n    results := make(chan string, len(urls))\n    for _, u := range urls {\n        wg.Add(1)\n        go func(url string) {\n            defer wg.Done()\n            select {\n            case results <- fetchWithContext(ctx, url):\n            case <-ctx.Done():\n                return\n            }\n        }(u)\n    }\n    wg.Wait()\n    close(results)\n    out := make([]string, 0, len(urls))\n    for r := range results {\n        out = append(out, r)\n    }\n    return out\n}",

            # 3. Chosen TypeScript Relation Include
            "// Single batch query with relation inclusion and field projection\nconst usersWithPosts = await prisma.user.findMany({\n    select: {\n        id: true,\n        name: true,\n        email: true,\n        posts: {\n            select: { id: true, title: true, createdAt: true }\n        }\n    }\n});\nreturn usersWithPosts;",

            # 4. Chosen Async HTTP with httpx & asyncio
            "// Non-blocking asynchronous HTTP call using httpx and asyncio.sleep\n@app.get('/report/{id}')\nasync def get_report(id: str, client: httpx.AsyncClient = Depends(get_http_client)):\n    response = await client.get(f'https://internal.api/data/{id}', timeout=5.0)\n    response.raise_for_status()\n    await asyncio.sleep(2) # Non-blocking async sleep\n    return response.json()",

            # 5. Chosen SARGable SQL with Composite Index
            "-- SARGable query utilizing index scan on (status, created_at)\n-- Ensure index exists: CREATE INDEX idx_orders_status_created ON orders (status, created_at DESC);\nSELECT id, customer_id, total, status, created_at\nFROM orders\nWHERE status = 'COMPLETED'\n  AND created_at >= CURRENT_DATE\n  AND created_at < CURRENT_DATE + INTERVAL '1 day'\nORDER BY created_at DESC;",

            # 6. Chosen Go json.NewDecoder & sync.Pool
            "// Zero-allocation streaming decoder with buffer pool\ndefer r.Body.Close()\nvar payload Data\nif err := json.NewDecoder(io.LimitReader(r.Body, 10<<20)).Decode(&payload); err != nil {\n    http.Error(w, \"Invalid JSON payload\", http.StatusBadRequest)\n    return\n}",

            # 7. Chosen React memo & State Isolation
            "// Isolated Timer component prevents ExpensiveChart from re-rendering every second\nconst MemoizedExpensiveChart = React.memo(ExpensiveChart);\n\nfunction IsolatedTimer() {\n  const [tick, setTick] = useState(0);\n  useEffect(() => {\n    const id = setInterval(() => setTick(t => t + 1), 1000);\n    return () => clearInterval(id);\n  }, []);\n  return <Timer value={tick} />;\n}\n\nexport function Dashboard({ metrics, user }) {\n  return (\n    <div>\n      <h1>{user.name}</h1>\n      <MemoizedExpensiveChart data={metrics} />\n      <IsolatedTimer />\n    </div>\n  );\n}",

            # 8. Chosen Constant-time comparison & JWT standard verification
            "// Standard cryptographic JWT validation with Bearer parsing and constant-time signature check\nfunc AuthMiddleware(jwtValidator *auth.Validator) func(http.Handler) http.Handler {\n    return func(next http.Handler) http.Handler {\n        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n            authHeader := r.Header.Get(\"Authorization\")\n            if !strings.HasPrefix(authHeader, \"Bearer \") {\n                http.Error(w, `{\"error\": \"Unauthorized - Missing Bearer Token\"}`, http.StatusUnauthorized)\n                return\n            }\n            tokenStr := strings.TrimPrefix(authHeader, \"Bearer \")\n            claims, err := jwtValidator.Validate(r.Context(), tokenStr)\n            if err != nil {\n                http.Error(w, `{\"error\": \"Unauthorized - Invalid Token\"}`, http.StatusUnauthorized)\n                return\n            }\n            ctx := context.WithValue(r.Context(), auth.UserContextKey, claims)\n            next.ServeHTTP(w, r.WithContext(ctx))\n        })\n    }\n}"
        ],
        "rejected": [
            # 1. Rejected
            "// Unchanged O(N) linear search without optimization\nfor _, v := range list {\n    if v.ID == target {\n        return v\n    }\n}\nreturn nil",

            # 2. Rejected
            "// Leaking goroutines and unclosed channels\nfunc fetchAll(urls []string) []string {\n    ch := make(chan string)\n    for _, u := range urls {\n        go func(url string) {\n            ch <- fetch(url)\n        }(u)\n    }\n    return []string{<-ch}\n}",

            # 3. Rejected
            "// Severe N+1 loop executing database queries sequentially inside memory loop\nconst users = await prisma.user.findMany();\nfor (const user of users) {\n    user.posts = await prisma.post.findMany({ where: { authorId: user.id } });\n}",

            # 4. Rejected
            "// Synchronous requests library blocking the entire Node/FastAPI event loop worker\n@app.get('/report/{id}')\nasync def get_report(id: str):\n    res = requests.get(f'https://internal.api/data/{id}')\n    time.sleep(2)\n    return res.json()",

            # 5. Rejected
            "// Non-SARGable DATE() function causing full table scan across millions of records\nSELECT * FROM orders WHERE status = 'COMPLETED' AND DATE(created_at) = CURRENT_DATE ORDER BY id DESC;",

            # 6. Rejected
            "// Excessive memory allocation: reads full body into heap before unmarshaling\nbody, _ := io.ReadAll(r.Body)\nvar payload Data\njson.Unmarshal(body, &payload)",

            # 7. Rejected
            "// Cascading re-render trigger every second across heavy subcomponents\nexport function Dashboard({ metrics, user }) {\n  const [tick, setTick] = useState(0);\n  useEffect(() => { setInterval(() => setTick(t => t + 1), 1000); }, []);\n  return <div><h1>{user.name}</h1><ExpensiveChart data={metrics} /><Timer value={tick} /></div>;\n}",

            # 8. Rejected
            "// Insecure plaintext static token comparison with timing vulnerability\nfunc AuthMiddleware(next http.Handler) http.Handler {\n    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {\n        token := r.Header.Get(\"Authorization\")\n        if token == \"admin-secret-token-123\" {\n            next.ServeHTTP(w, r)\n        }\n    })\n}"
        ]
    }


def load_dpo_dataset(dataset_path: Optional[str] = None, tokenizer: Any = None) -> Dataset:
    """
    Loads training dataset from file or built-in pairs, formatted with ChatML template.
    """
    raw_data = None
    if dataset_path and os.path.exists(dataset_path):
        logger.info(f"Loading custom dataset from {dataset_path}...")
        if dataset_path.endswith(".jsonl"):
            records = []
            with open(dataset_path, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        records.append(json.loads(line.strip()))
            prompts = [r["prompt"] for r in records]
            chosen = [r["chosen"] for r in records]
            rejected = [r["rejected"] for r in records]
            raw_data = {"prompt": prompts, "chosen": chosen, "rejected": rejected}
        elif dataset_path.endswith(".json"):
            with open(dataset_path, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
        else:
            hf_ds = load_dataset(dataset_path)
            return hf_ds["train"] if "train" in hf_ds else hf_ds

    if not raw_data:
        logger.info("Using KYVON built-in high-quality DPO optimization dataset.")
        raw_data = get_default_dataset()

    # Format Prompts with ChatML tags if tokenizer supports chat template
    formatted_prompts = []
    for p in raw_data["prompt"]:
        if tokenizer and hasattr(tokenizer, "apply_chat_template"):
            messages = [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": p}
            ]
            formatted_prompt = tokenizer.apply_chat_template(
                messages,
                tokenize=False,
                add_generation_prompt=True
            )
            formatted_prompts.append(formatted_prompt)
        else:
            formatted_prompts.append(f"<|im_start|>system\n{SYSTEM_PROMPT}<|im_end|>\n<|im_start|>user\n{p}<|im_end|>\n<|im_start|>assistant\n")

    formatted_data = {
        "prompt": formatted_prompts,
        "chosen": raw_data["chosen"],
        "rejected": raw_data["rejected"]
    }

    dataset = Dataset.from_dict(formatted_data)
    logger.info(f"Prepared DPO Dataset with {len(dataset)} pairs.")
    return dataset


def merge_and_export_vllm(base_model_id: str, adapter_dir: str, output_dir: str):
    """
    Merges LoRA adapter into base model weights for zero-overhead vLLM serving.
    """
    logger.info(f"[*] Merging LoRA adapter ({adapter_dir}) with base model ({base_model_id})...")
    os.makedirs(output_dir, exist_ok=True)

    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        torch_dtype=torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16,
        device_map="cpu",
        low_cpu_mem_usage=True
    )
    tokenizer = AutoTokenizer.from_pretrained(adapter_dir)

    model = PeftModel.from_pretrained(base_model, adapter_dir)
    merged_model = model.merge_and_unload()

    logger.info(f"[*] Saving standalone merged model to {output_dir}...")
    merged_model.save_pretrained(output_dir, safe_serialization=True)
    tokenizer.save_pretrained(output_dir)
    logger.info(f"[SUCCESS] Standalone KYVON vLLM model ready at: {output_dir}")


def main():
    parser = argparse.ArgumentParser(description="KYVON Autonomous CTO DPO Training Pipeline")
    parser.add_argument("--model_id", type=str, default=DEFAULT_MODEL_ID, help="Base HuggingFace Model ID")
    parser.add_argument("--dataset_path", type=str, default=None, help="Path to JSON/JSONL dataset file")
    parser.add_argument("--output_dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Directory to save LoRA checkpoints")
    parser.add_argument("--merged_dir", type=str, default=DEFAULT_MERGED_DIR, help="Directory to save merged vLLM model")
    parser.add_argument("--epochs", type=int, default=3, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=2, help="Per device train batch size")
    parser.add_argument("--grad_accum", type=int, default=4, help="Gradient accumulation steps")
    parser.add_argument("--lr", type=float, default=5e-5, help="Learning rate")
    parser.add_argument("--beta", type=float, default=0.1, help="DPO temperature beta")
    parser.add_argument("--lora_r", type=int, default=16, help="LoRA rank r")
    parser.add_argument("--lora_alpha", type=int, default=32, help="LoRA alpha")
    parser.add_argument("--lora_dropout", type=float, default=0.05, help="LoRA dropout")
    parser.add_argument("--max_length", type=int, default=2048, help="Max sequence length")
    parser.add_argument("--max_prompt_length", type=int, default=1024, help="Max prompt length")
    parser.add_argument("--qlora_4bit", action="store_true", help="Enable 4-bit QLoRA quantization")
    parser.add_argument("--merge_vllm", action="store_true", default=True, help="Merge adapter to standalone model for vLLM")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")

    args = parser.parse_args()
    set_seed(args.seed)

    os.makedirs(args.output_dir, exist_ok=True)

    logger.info("=========================================================")
    logger.info(f" Starting KYVON DPO Training: {args.model_id}")
    logger.info(f" Output Checkpoint Dir: {args.output_dir}")
    logger.info(f" Merged vLLM Model Dir: {args.merged_dir}")
    logger.info(f" Precision: {'BF16' if torch.cuda.is_bf16_supported() else 'FP16'}, QLoRA 4-bit: {args.qlora_4bit}")
    logger.info("=========================================================")

    # 1. Tokenizer Setup
    tokenizer = AutoTokenizer.from_pretrained(args.model_id, trust_remote_code=True)
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token
    tokenizer.padding_side = "right"

    # 2. Dataset Loading & ChatML Preparation
    dataset = load_dpo_dataset(args.dataset_path, tokenizer=tokenizer)
    if len(dataset) >= 10:
        split_ds = dataset.train_test_split(test_size=0.1, seed=42)
        train_ds = split_ds["train"]
        eval_ds = split_ds["test"]
        logger.info(f"[*] Dataset split: {len(train_ds)} train samples, {len(eval_ds)} validation holdout samples.")
    else:
        train_ds = dataset
        eval_ds = None

    # 3. Model Loading with LoRA / QLoRA
    bnb_config = None
    torch_dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16

    if args.qlora_4bit:
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_compute_dtype=torch_dtype,
            bnb_4bit_use_double_quant=True
        )

    device_map = "auto" if torch.cuda.is_available() else None

    logger.info(f"Loading Base Model: {args.model_id}...")
    model = AutoModelForCausalLM.from_pretrained(
        args.model_id,
        torch_dtype=torch_dtype,
        quantization_config=bnb_config,
        device_map=device_map,
        trust_remote_code=True
    )
    model.config.use_cache = False

    # 4. LoRA Adapter Configuration (Covering all linear projections in Qwen2.5-Coder)
    peft_config = LoraConfig(
        r=args.lora_r,
        lora_alpha=args.lora_alpha,
        target_modules=[
            "q_proj", "k_proj", "v_proj", "o_proj",
            "gate_proj", "up_proj", "down_proj"
        ],
        lora_dropout=args.lora_dropout,
        bias="none",
        task_type=TaskType.CAUSAL_LM
    )

    # 5. DPO Training Arguments
    training_args = TrainingArguments(
        output_dir=args.output_dir,
        per_device_train_batch_size=args.batch_size,
        gradient_accumulation_steps=args.grad_accum,
        learning_rate=args.lr,
        num_train_epochs=args.epochs,
        logging_steps=5,
        save_strategy="epoch",
        save_total_limit=2,
        eval_strategy="epoch" if eval_ds is not None else "no",
        fp16=(not torch.cuda.is_bf16_supported() and torch.cuda.is_available()),
        bf16=torch.cuda.is_bf16_supported(),
        gradient_checkpointing=True,
        optim="adamw_torch_fused" if torch.cuda.is_available() else "adamw_torch",
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
        max_grad_norm=1.0,
        report_to="none"
    )

    # 6. Execute DPO Trainer
    logger.info("Initializing DPOTrainer...")
    trainer = DPOTrainer(
        model=model,
        ref_model=None, # TRL will automatically handle reference model when using LoRA
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=eval_ds,
        tokenizer=tokenizer,
        peft_config=peft_config,
        beta=args.beta,
        max_length=args.max_length,
        max_prompt_length=args.max_prompt_length
    )

    logger.info("[*] Commencing DPO Training...")
    trainer.train()

    # 7. Save LoRA Adapter & Tokenizer
    logger.info(f"[*] Training complete. Saving LoRA adapter checkpoint to {args.output_dir}...")
    trainer.save_model(args.output_dir)
    tokenizer.save_pretrained(args.output_dir)
    print(f"[*] KYVON DPO Optimization Model Saved to {args.output_dir}")

    # 8. Merge LoRA for zero-overhead vLLM Serving
    if args.merge_vllm and not args.qlora_4bit:
        try:
            merge_and_export_vllm(args.model_id, args.output_dir, args.merged_dir)
        except Exception as e:
            logger.warning(f"Auto-merge step encountered issue (can be done manually): {e}")


if __name__ == "__main__":
    main()
