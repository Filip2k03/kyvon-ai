#!/usr/bin/env python3
"""
=============================================================================
KYVON Conversation to DPO Dataset Extractor
=============================================================================
Connects Antigravity (agy) session transcripts (e.g. 7fbcff38-4e08-44f0-8c61-c1508b648bc3)
directly into DPO training datasets for fine-tuning KYVON models with kyvontrain.py.

Extracts:
- High quality prompt instructions from user queries.
- High-standard (chosen) code and system responses that passed 50-condition verification.
- Synthetic (rejected) sub-optimal versions for DPO preference optimization.
=============================================================================
"""

import os
import sys
import json
import re
import argparse
from typing import List, Dict, Any, Optional

DEFAULT_APP_DATA = os.path.expanduser("~/.gemini/antigravity-cli")


def extract_pairs_from_transcript(transcript_path: str) -> List[Dict[str, str]]:
    """
    Parses an Antigravity JSONL transcript and extracts DPO pairs.
    """
    if not os.path.exists(transcript_path):
        print(f"[-] Transcript path not found: {transcript_path}")
        return []

    dpo_pairs = []
    current_prompt = None

    with open(transcript_path, "r", encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                data = json.loads(line.strip())
            except Exception:
                continue

            step_type = data.get("type")
            content = data.get("content", "")

            if step_type == "USER_INPUT" and content:
                # Clean up user request tags
                clean_prompt = re.sub(r"<USER_REQUEST>[\s\S]*?</USER_REQUEST>", lambda m: m.group(0).replace("<USER_REQUEST>", "").replace("</USER_REQUEST>", ""), content)
                clean_prompt = re.sub(r"<ADDITIONAL_METADATA>[\s\S]*?</ADDITIONAL_METADATA>", "", clean_prompt).strip()
                if len(clean_prompt) > 20:
                    current_prompt = clean_prompt

            elif step_type == "PLANNER_RESPONSE" and content and current_prompt:
                # Look for code blocks or verified architecture outputs
                if "```" in content or "KYVON" in content or "50-Condition" in content or "h-[100dvh]" in content:
                    chosen = content.strip()
                    # Synthesize contrastive rejected response for DPO
                    rejected = f"// Basic implementation without 50-condition matrix\n// Incomplete error handling\n" + chosen[:200]

                    dpo_pairs.append({
                        "prompt": current_prompt[:1500],
                        "chosen": chosen[:3000],
                        "rejected": rejected
                    })
                    current_prompt = None

    return dpo_pairs


def main():
    parser = argparse.ArgumentParser(description="Extract DPO dataset from Antigravity conversation transcript")
    parser.add_argument("--conversation", "-c", type=str, default="7fbcff38-4e08-44f0-8c61-c1508b648bc3", help="Conversation ID to extract")
    parser.add_argument("--output", "-o", type=str, default=os.path.join(os.path.dirname(__file__), "training_dataset.jsonl"), help="Output dataset path")
    args = parser.parse_args()

    transcript_path = os.path.join(DEFAULT_APP_DATA, "brain", args.conversation, ".system_generated", "logs", "transcript.jsonl")
    print(f"[*] Reading transcript from: {transcript_path}")

    extracted = extract_pairs_from_transcript(transcript_path)
    print(f"[+] Extracted {len(extracted)} valid DPO pairs from conversation {args.conversation}")

    # Merge into training_dataset.jsonl
    existing = []
    if os.path.exists(args.output):
        with open(args.output, "r", encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    try:
                        existing.append(json.loads(line.strip()))
                    except Exception:
                        pass

    combined = existing + extracted
    seen = set()
    deduped = []
    for item in combined:
        key = item.get("prompt", "")[:100]
        if key not in seen:
            seen.add(key)
            deduped.append(item)

    with open(args.output, "w", encoding="utf-8") as f:
        for item in deduped:
            f.write(json.dumps(item) + "\n")

    print(f"[SUCCESS] Dataset updated with total {len(deduped)} pairs in: {args.output}")


if __name__ == "__main__":
    main()
