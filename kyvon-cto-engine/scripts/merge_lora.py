#!/usr/bin/env python3
"""
KYVON LoRA Merge Utility
Merges LoRA adapter checkpoints into base weights to produce standalone Hugging Face / vLLM ready models.
"""

import os
import sys
import argparse
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import PeftModel


def merge_lora(base_model_id: str, adapter_path: str, output_path: str, push_to_hub: bool = False, hub_id: str = None):
    print(f"[*] Loading base model: {base_model_id}...")
    dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16

    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_id,
        torch_dtype=dtype,
        device_map="cpu",
        low_cpu_mem_usage=True,
        trust_remote_code=True
    )
    tokenizer = AutoTokenizer.from_pretrained(adapter_path, trust_remote_code=True)

    print(f"[*] Loading and attaching LoRA adapter: {adapter_path}...")
    peft_model = PeftModel.from_pretrained(base_model, adapter_path)

    print("[*] Merging weights...")
    merged_model = peft_model.merge_and_unload()

    print(f"[*] Exporting merged standalone model to: {output_path}...")
    os.makedirs(output_path, exist_ok=True)
    merged_model.save_pretrained(output_path, safe_serialization=True)
    tokenizer.save_pretrained(output_path)

    if push_to_hub and hub_id:
        print(f"[*] Pushing to Hugging Face Hub: {hub_id}...")
        merged_model.push_to_hub(hub_id, safe_serialization=True)
        tokenizer.push_to_hub(hub_id)

    print(f"[SUCCESS] Merged model successfully written to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Merge LoRA adapter into base model")
    parser.add_argument("--base_model", type=str, default="Qwen/Qwen2.5-Coder-7B-Instruct")
    parser.add_argument("--adapter", type=str, required=True, help="Path to LoRA checkpoint folder")
    parser.add_argument("--output", type=str, required=True, help="Path to output standalone merged folder")
    parser.add_argument("--push_to_hub", action="store_true")
    parser.add_argument("--hub_id", type=str, default=None)
    args = parser.parse_args()

    merge_lora(args.base_model, args.adapter, args.output, args.push_to_hub, args.hub_id)
