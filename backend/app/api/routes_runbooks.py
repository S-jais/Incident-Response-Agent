from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from app.runbooks.catalog import list_all_runbooks, get_runbook

router = APIRouter()

@router.get("/runbooks")
def get_runbooks():
    return list_all_runbooks()

@router.get("/runbooks/{runbook_id}")
def get_runbook_detail(runbook_id: str):
    rb = get_runbook(runbook_id.upper())
    if not rb:
        raise HTTPException(status_code=404, detail="Runbook not found")
    return rb
