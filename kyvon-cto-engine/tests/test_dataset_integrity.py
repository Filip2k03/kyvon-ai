#!/usr/bin/env python3
"""
Unit tests for KYVON DPO Dataset Integrity and Schema Validation
"""
import os
import json
import unittest

class TestDatasetIntegrity(unittest.TestCase):
    def setUp(self):
        self.dataset_path = os.path.join(
            os.path.dirname(__file__), "..", "datasets", "training_dataset.jsonl"
        )

    def test_dataset_exists_and_non_empty(self):
        self.assertTrue(os.path.exists(self.dataset_path), "Dataset file must exist")
        self.assertGreater(os.path.getsize(self.dataset_path), 0, "Dataset file must not be empty")

    def test_dpo_triplet_schema(self):
        with open(self.dataset_path, "r", encoding="utf-8") as f:
            lines = [line.strip() for line in f if line.strip()]

        self.assertGreaterEqual(len(lines), 20, "Dataset must contain at least 20 curated pairs")

        for idx, line in enumerate(lines):
            try:
                data = json.loads(line)
            except Exception as e:
                self.fail(f"Invalid JSON at line {idx+1}: {e}")

            self.assertIn("prompt", data, f"Line {idx+1} missing 'prompt'")
            self.assertIn("chosen", data, f"Line {idx+1} missing 'chosen'")
            self.assertIn("rejected", data, f"Line {idx+1} missing 'rejected'")

            self.assertIsInstance(data["prompt"], str, f"Line {idx+1} prompt must be str")
            self.assertIsInstance(data["chosen"], str, f"Line {idx+1} chosen must be str")
            self.assertIsInstance(data["rejected"], str, f"Line {idx+1} rejected must be str")

            self.assertGreater(len(data["prompt"].strip()), 0, f"Line {idx+1} prompt is empty")
            self.assertGreater(len(data["chosen"].strip()), 0, f"Line {idx+1} chosen is empty")
            self.assertGreater(len(data["rejected"].strip()), 0, f"Line {idx+1} rejected is empty")

if __name__ == "__main__":
    unittest.main()
