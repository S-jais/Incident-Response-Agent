"""
Hindsight Client Integration Layer
Interfaces with the official Hindsight SDK (hindsight-client) when configured,
and provides transparent, clearly-marked local fallback simulation when API credentials are absent.
"""

import logging
import math
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.config import settings
from app.hindsight.formatter import format_incident_for_hindsight, format_postmortem_for_hindsight, extract_hindsight_tags

logger = logging.getLogger("hindsightops.hindsight")

class LocalFallbackMemoryStore:
    """
    Transparent local fallback store used only when Hindsight Cloud credentials are not configured.
    Implements token-based relevance ranking to simulate memory retention and recall.
    """
    def __init__(self):
        self.memories: List[Dict[str, Any]] = []

    def retain(self, content: str, metadata: Dict[str, str], tags: List[str]) -> str:
        memory_id = f"mem_local_{len(self.memories) + 1:04d}"
        entry = {
            "id": memory_id,
            "content": content,
            "metadata": metadata or {},
            "tags": tags or [],
            "timestamp": datetime.utcnow().isoformat(),
            "source": "Demo Fallback"
        }
        self.memories.append(entry)
        return memory_id

    def recall(self, query: str, service: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        query_words = set(re.findall(r"\w+", query.lower()))
        results = []
        for mem in self.memories:
            content_lower = mem["content"].lower()
            mem_words = set(re.findall(r"\w+", content_lower))
            
            # Service filter boost
            score = 0.0
            if service and service.lower() in content_lower:
                score += 0.35
            
            # Word overlap score (Jaccard / intersection)
            intersection = query_words.intersection(mem_words)
            if query_words:
                overlap = len(intersection) / len(query_words)
                score += overlap * 0.65

            if score > 0.15:
                results.append({
                    "memory_id": mem["id"],
                    "content": mem["content"],
                    "score": round(min(score, 0.98), 2),
                    "metadata": mem.get("metadata", {}),
                    "tags": mem.get("tags", []),
                    "timestamp": mem["timestamp"]
                })

        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:top_k]

    def count(self) -> int:
        return len(self.memories)


import concurrent.futures

_hindsight_executor = concurrent.futures.ThreadPoolExecutor(max_workers=4)

def _call_isolated(func, *args, **kwargs):
    future = _hindsight_executor.submit(func, *args, **kwargs)
    return future.result(timeout=45.0)

class HindsightService:
    def __init__(self):
        self._client = None
        self._fallback_store = LocalFallbackMemoryStore()
        self._init_client()

    def _init_client(self):
        if settings.is_hindsight_configured:
            try:
                from hindsight_client import Hindsight
                self._client = Hindsight(
                    base_url=settings.HINDSIGHT_BASE_URL,
                    api_key=settings.HINDSIGHT_API_KEY,
                    timeout=30.0
                )
                logger.info(f"Hindsight client initialized with base_url: {settings.HINDSIGHT_BASE_URL}")
            except Exception as e:
                logger.warning(f"Could not initialize Hindsight client: {e}. Fallback enabled.")
                self._client = None
        else:
            logger.info("Hindsight API key not set. Using transparent demo fallback memory store.")

    @property
    def is_live(self) -> bool:
        return self._client is not None

    def ensure_bank_exists(self, bank_id: Optional[str] = None) -> bool:
        bank = bank_id or settings.HINDSIGHT_BANK_ID
        if not self.is_live:
            return True
        try:
            _call_isolated(
                self._client.create_bank,
                bank_id=bank,
                name="HindsightOps Incident Memory Bank"
            )
            return True
        except Exception as e:
            # Bank might already exist or create_bank handles idempotency
            logger.debug(f"Bank ensure status: {e}")
            return True

    def retain_incident(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        """Stores incident memory into Hindsight."""
        content = format_incident_for_hindsight(incident)
        tags = extract_hindsight_tags(incident)
        metadata = {
            "incident_id": str(incident.get("id", "")),
            "service": str(incident.get("service", "")),
            "severity": str(incident.get("severity", "")),
            "runbook": str(incident.get("runbook_id", "") or "")
        }

        if self.is_live:
            try:
                self.ensure_bank_exists()
                resp = _call_isolated(
                    self._client.retain,
                    bank_id=settings.HINDSIGHT_BANK_ID,
                    content=content,
                    metadata=metadata,
                    tags=tags
                )
                return {
                    "success": True,
                    "memory_id": getattr(resp, "id", f"mem_{incident.get('id')}"),
                    "source": "Hindsight Cloud",
                    "is_live": True
                }
            except Exception as e:
                logger.error(f"Hindsight retain error: {e}. Storing in local fallback.", exc_info=True)
                mem_id = self._fallback_store.retain(content, metadata, tags)
                return {
                    "success": True,
                    "memory_id": mem_id,
                    "source": "Demo Fallback (Hindsight Cloud error)",
                    "is_live": False,
                    "error": str(e)
                }

        mem_id = self._fallback_store.retain(content, metadata, tags)
        return {
            "success": True,
            "memory_id": mem_id,
            "source": "Demo Fallback",
            "is_live": False
        }

    def retain_postmortem(self, postmortem: Dict[str, Any], incident_meta: Dict[str, Any]) -> Dict[str, Any]:
        """Stores postmortem institutional lessons into Hindsight."""
        content = format_postmortem_for_hindsight(postmortem, incident_meta)
        tags = ["postmortem", f"service:{incident_meta.get('service', '').lower()}", f"incident:{incident_meta.get('id', '').lower()}"]
        metadata = {
            "incident_id": str(incident_meta.get("id", "")),
            "service": str(incident_meta.get("service", "")),
            "type": "postmortem"
        }

        if self.is_live:
            try:
                self.ensure_bank_exists()
                resp = _call_isolated(
                    self._client.retain,
                    bank_id=settings.HINDSIGHT_BANK_ID,
                    content=content,
                    metadata=metadata,
                    tags=tags
                )
                return {
                    "success": True,
                    "memory_id": getattr(resp, "id", f"pm_{incident_meta.get('id')}"),
                    "source": "Hindsight Cloud",
                    "is_live": True
                }
            except Exception as e:
                logger.error(f"Hindsight postmortem retain error: {e}")
                mem_id = self._fallback_store.retain(content, metadata, tags)
                return {
                    "success": True,
                    "memory_id": mem_id,
                    "source": "Demo Fallback",
                    "is_live": False
                }

        mem_id = self._fallback_store.retain(content, metadata, tags)
        return {
            "success": True,
            "memory_id": mem_id,
            "source": "Demo Fallback",
            "is_live": False
        }

    def recall_memories(self, query: str, service: Optional[str] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        """Recalls memories matching the given query."""
        if self.is_live:
            try:
                tags = [f"service:{service.lower().replace(' ', '-')}"] if service else None
                recall_resp = _call_isolated(
                    self._client.recall,
                    bank_id=settings.HINDSIGHT_BANK_ID,
                    query=query,
                    tags=tags
                )
                # Parse recall response
                items = []
                results = getattr(recall_resp, "results", []) or []
                for res in results:
                    content = getattr(res, "content", str(res))
                    score = getattr(res, "score", 0.85)
                    meta = getattr(res, "metadata", {}) or {}
                    tags_list = getattr(res, "tags", []) or []
                    items.append({
                        "memory_id": getattr(res, "id", f"mem_rec_{len(items)+1}"),
                        "content": content,
                        "score": round(float(score) if score else 0.85, 2),
                        "metadata": meta,
                        "tags": tags_list,
                        "timestamp": datetime.utcnow().isoformat(),
                        "source": "Hindsight Cloud"
                    })
                if items:
                    return items[:top_k]
            except Exception as e:
                logger.error(f"Hindsight recall error: {e}. Falling back to local store.")

        # Fallback store search
        fallback_results = self._fallback_store.recall(query, service=service, top_k=top_k)
        return fallback_results

    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics on stored memory."""
        retained_count = self._fallback_store.count()
        if self.is_live:
            try:
                # Attempt to get bank config or list memories
                mems = self._client.list_memories(bank_id=settings.HINDSIGHT_BANK_ID)
                items = getattr(mems, "items", []) or []
                retained_count = max(retained_count, len(items))
            except Exception:
                pass

        return {
            "is_hindsight_live": self.is_live,
            "memory_source": "Hindsight Cloud" if self.is_live else "Demo Fallback Data",
            "bank_id": settings.HINDSIGHT_BANK_ID,
            "base_url": settings.HINDSIGHT_BASE_URL,
            "total_memories_retained": retained_count,
            "status": "Connected" if self.is_live else "Configured (Demo Mode)" if settings.ALLOW_DEMO_FALLBACK else "Not Configured"
        }

# Global singleton
hindsight_service = HindsightService()
