#!/usr/bin/env bash
# =============================================================================
# Standalone DPO Training Execution Script
# =============================================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=========================================================="
echo " Starting KYVON DPO Model Training"
echo "=========================================================="

export HF_HOME="${HF_CACHE_PATH:-$HOME/.cache/huggingface}"
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-0}"

python3 "$ROOT_DIR/kyvontrain.py" \
  --model_id "Qwen/Qwen2.5-Coder-7B-Instruct" \
  --dataset_path "$ROOT_DIR/datasets/training_dataset.jsonl" \
  --output_dir "/mnt/data/kyvon-training/checkpoints/dpo_final" \
  --merged_dir "/mnt/data/kyvon-training/checkpoints/dpo_merged_vllm" \
  --epochs 3 \
  --batch_size 2 \
  --grad_accum 4 \
  --lr 5e-5 \
  --beta 0.1 \
  --lora_r 16 \
  --lora_alpha 32 \
  --merge_vllm

echo "=========================================================="
echo " Training & Model Merging Complete!"
echo "=========================================================="
