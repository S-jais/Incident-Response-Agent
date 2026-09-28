"""
LLM Client Integration Layer
Interfaces with Groq models (openai/gpt-oss-120b, qwen/qwen3-32b, etc.)
with robust fallback parsing and structured fallback generation.
"""

import json
import logging
import re
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("hindsightops.llm")

def clean_json_output(raw_text: str) -> Dict[str, Any]:
    """Strips markdown code fences and cleans json before parsing."""
    text = raw_text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\n", "", text)
        text = re.sub(r"\n```$", "", text)
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        # Search for first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            snippet = text[start:end+1]
            return json.loads(snippet)
        raise

class LLMService:
    def __init__(self):
        self._client = None
        self._init_client()

    def _init_client(self):
        if settings.is_groq_configured:
            try:
                from groq import Groq
                self._client = Groq(api_key=settings.GROQ_API_KEY)
                logger.info(f"Groq LLM client initialized with model: {settings.GROQ_MODEL}")
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}. Fallback enabled.")
                self._client = None
        else:
            logger.info("Groq API key not provided. LLM service operating in structured demo mode.")

    @property
    def is_live(self) -> bool:
        return self._client is not None

    def generate(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.2) -> Dict[str, Any]:
        """Calls Groq with structured JSON output or falls back gracefully."""
        if self.is_live:
            try:
                messages = []
                if system_prompt:
                    messages.append({"role": "system", "content": system_prompt})
                messages.append({"role": "user", "content": prompt})

                response = self._client.chat.completions.create(
                    model=settings.GROQ_MODEL,
                    messages=messages,
                    temperature=temperature,
                    response_format={"type": "json_object"} if "openai" in settings.GROQ_MODEL or "json" in settings.GROQ_MODEL.lower() else None,
                    max_tokens=2500
                )
                raw_content = response.choices[0].message.content
                parsed = clean_json_output(raw_content)
                parsed["_llm_source"] = f"Groq ({settings.GROQ_MODEL})"
                parsed["_is_live"] = True
                return parsed
            except Exception as e:
                logger.error(f"Groq API call error: {e}. Executing graceful fallback recovery.", exc_info=True)

        return {"_is_live": False, "_llm_source": "Deterministic Agent Engine (Demo Mode)"}

llm_service = LLMService()
