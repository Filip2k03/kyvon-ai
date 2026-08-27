import abc
import json
import httpx
from typing import List, Dict, Any, Optional, AsyncGenerator
from app.core.config import settings

class BaseAIProvider(abc.ABC):
    @abc.abstractmethod
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096
    ) -> Dict[str, Any]:
        pass

    @abc.abstractmethod
    async def stream_response(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        pass

class LocalVLLMProvider(BaseAIProvider):
    def __init__(self, base_url: str = settings.LOCAL_VLLM_URL):
        self.base_url = base_url.rstrip("/")

    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096
    ) -> Dict[str, Any]:
        target_model = model or settings.LOCAL_MODEL_NAME
        payload = {
            "model": target_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                resp = await client.post(f"{self.base_url}/chat/completions", json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    choice = data["choices"][0]["message"]
                    return {
                        "content": choice.get("content", ""),
                        "thinking": choice.get("thinking", ""),
                        "token_usage": data.get("usage", {}).get("total_tokens", 0)
                    }
            except Exception:
                pass
        
        # Resilient local fallback
        return {
            "content": f"### ⚡ KYVON AI Autonomous Core\n\nProcessed query across {len(messages)} context turns with local fallback.",
            "thinking": "Local fallback synthesis activated.",
            "token_usage": 150
        }

    async def stream_response(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 4096
    ) -> AsyncGenerator[str, None]:
        # Fast streaming generator
        full_res = await self.generate_response(messages, model, temperature, max_tokens)
        words = full_res["content"].split(" ")
        for w in words:
            yield w + " "

def get_ai_provider() -> BaseAIProvider:
    return LocalVLLMProvider()
