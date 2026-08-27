#!/usr/bin/env python3
"""
Unit tests for KYVON CTO Bot Evaluator
"""
import unittest
import json
import sys
import os

# Add bot to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "bot"))
from evaluator import build_evaluation_prompt, parse_and_format_report

class TestEvaluator(unittest.TestCase):
    def test_build_evaluation_prompt(self):
        messages = build_evaluation_prompt("Feature: Fast Search", "Add O(1) map search", "diff --git a/main.go b/main.go")
        self.assertEqual(len(messages), 2)
        self.assertEqual(messages[0]["role"], "system")
        self.assertEqual(messages[1]["role"], "user")
        self.assertIn("Feature: Fast Search", messages[1]["content"])

    def test_parse_and_format_report_valid_json(self):
        raw_json = json.dumps({
            "score": 95,
            "verdict": "APPROVE",
            "summary": "Clean O(1) lookup implementation with zero allocations.",
            "conditions_checked": 50,
            "passed_conditions_count": 48,
            "critical_issues": [],
            "optimizations": [
                {
                    "type": "Algorithm",
                    "file": "main.go",
                    "before": "linear search",
                    "after": "map search",
                    "complexity_delta": "O(N) -> O(1)",
                    "explanation": "Hash lookup"
                }
            ],
            "security_findings": [],
            "benchmark_estimate": "< 1ms response"
        })

        report = parse_and_format_report(raw_json)
        self.assertIn("95/100", report)
        self.assertIn("APPROVE", report)
        self.assertIn("O(N) -> O(1)", report)

    def test_parse_and_format_report_markdown_wrapped_json(self):
        wrapped = "```json\n" + json.dumps({
            "score": 80,
            "verdict": "NEEDS_OPTIMIZATION",
            "summary": "Needs index check",
            "conditions_checked": 50,
            "passed_conditions_count": 40,
            "critical_issues": [],
            "optimizations": [],
            "security_findings": [],
            "benchmark_estimate": "Fast"
        }) + "\n```"

        report = parse_and_format_report(wrapped)
        self.assertIn("80/100", report)
        self.assertIn("NEEDS_OPTIMIZATION", report)

    def test_parse_and_format_report_fallback_on_invalid_json(self):
        raw_text = "This is a plain text review without JSON formatting."
        report = parse_and_format_report(raw_text)
        self.assertIn("KYVON Autonomous CTO Code Review", report)
        self.assertIn(raw_text, report)

    def test_parse_and_format_report_with_critical_issues_and_security(self):
        raw_json = json.dumps({
            "score": 45,
            "verdict": "REQUEST_CHANGES",
            "summary": "Detected SQL injection and unhandled panic.",
            "conditions_checked": 50,
            "passed_conditions_count": 25,
            "critical_issues": [
                {
                    "category": "Security",
                    "severity": "CRITICAL",
                    "file": "auth.go",
                    "line_hint": "fmt.Sprintf(query)",
                    "description": "SQL injection via unsanitized parameter",
                    "suggested_fix": "db.QueryRow(ctx, query, id)"
                }
            ],
            "optimizations": [],
            "security_findings": [
                {
                    "vulnerability": "SQL Injection",
                    "severity": "CRITICAL",
                    "mitigation": "Use parameterized queries"
                }
            ],
            "benchmark_estimate": "High risk"
        })

        report = parse_and_format_report(raw_json)
        self.assertIn("45/100", report)
        self.assertIn("REQUEST_CHANGES", report)
        self.assertIn("CRITICAL", report)
        self.assertIn("SQL Injection", report)
        self.assertIn("db.QueryRow", report)

    def test_build_evaluation_prompt_large_diff_truncation(self):
        huge_diff = "diff --git a/huge.go b/huge.go\n" + ("+ line\n" * 5000)
        messages = build_evaluation_prompt("Huge PR", "A very large PR", huge_diff)
        self.assertEqual(len(messages), 2)
        # Verify content was capped to avoid overflowing context window
        self.assertLessEqual(len(messages[1]["content"]), 20000)

if __name__ == "__main__":
    unittest.main()
