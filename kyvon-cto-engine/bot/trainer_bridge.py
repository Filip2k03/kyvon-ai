"""
KYVON Training Bridge
Triggers and manages background DPO training runs requested via `/KyvonCTOtrain`.
"""

import os
import sys
import subprocess
import threading
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("KYVON-TRAINER-BRIDGE")


class TrainerBridge:
    def __init__(self):
        self.is_training = False
        self.current_process: Optional[subprocess.Popen] = None
        self.last_logs: str = ""
        self.output_dir = os.getenv("KYVON_OUTPUT_DIR", "/mnt/data/kyvon-training/checkpoints/dpo_final")
        self.merged_dir = os.getenv("KYVON_MERGED_DIR", "/mnt/data/kyvon-training/checkpoints/dpo_merged_vllm")
        self.model_id = os.getenv("KYVON_BASE_MODEL", "Qwen/Qwen2.5-Coder-7B-Instruct")

    def get_status(self) -> Dict[str, Any]:
        return {
            "is_training": self.is_training,
            "base_model": self.model_id,
            "checkpoint_dir": self.output_dir,
            "merged_dir": self.merged_dir,
            "recent_logs": self.last_logs[-500:] if self.last_logs else "No active training."
        }

    def start_training(
        self,
        dataset_path: Optional[str] = None,
        epochs: int = 3,
        batch_size: int = 2,
        grad_accum: int = 4,
        lr: float = 5e-5,
        qlora_4bit: bool = False,
        callback_fn = None
    ) -> bool:
        if self.is_training:
            logger.warning("Training already in progress!")
            return False

        def _run_worker():
            self.is_training = True
            logger.info("[*] Background DPO training thread started...")

            # Locate kyvontrain.py
            root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            script_path = os.path.join(root_dir, "kyvontrain.py")

            cmd = [
                sys.executable,
                script_path,
                "--model_id", self.model_id,
                "--output_dir", self.output_dir,
                "--merged_dir", self.merged_dir,
                "--epochs", str(epochs),
                "--batch_size", str(batch_size),
                "--grad_accum", str(grad_accum),
                "--lr", str(lr)
            ]
            if dataset_path and os.path.exists(dataset_path):
                cmd.extend(["--dataset_path", dataset_path])
            if qlora_4bit:
                cmd.append("--qlora_4bit")

            try:
                self.current_process = subprocess.Popen(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.STDOUT,
                    text=True,
                    bufsize=1
                )
                output_buffer = []
                for line in self.current_process.stdout:
                    output_buffer.append(line)
                    if len(output_buffer) > 200:
                        output_buffer.pop(0)
                    self.last_logs = "".join(output_buffer)
                    print(line, end="")

                self.current_process.wait()
                exit_code = self.current_process.returncode

                success = (exit_code == 0)
                logger.info(f"[*] Training finished with exit code {exit_code}")
                if callback_fn:
                    callback_fn(success, self.last_logs)

            except Exception as e:
                logger.error(f"Error during training process: {e}")
                if callback_fn:
                    callback_fn(False, str(e))
            finally:
                self.is_training = False
                self.current_process = None

        thread = threading.Thread(target=_run_worker, daemon=True)
        thread.start()
        return True
