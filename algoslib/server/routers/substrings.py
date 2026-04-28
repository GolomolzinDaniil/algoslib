import traceback
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

try:
    from algoslib.substrings import sub_substrings as sub_substrings_cpp
except Exception:
    sub_substrings_cpp = None

# Используем kmp_h, так как он возвращает список шагов (историю)
kmp_h_cpp = getattr(sub_substrings_cpp, "kmp_h", None) if sub_substrings_cpp else None
boyer_moore_h_cpp = getattr(sub_substrings_cpp, "boyer_moore_h", None) if sub_substrings_cpp else None
quick_search_h_cpp = getattr(sub_substrings_cpp, "quick_search_h", None) if sub_substrings_cpp else None

router = APIRouter()

class KMPRequest(BaseModel):
    text: str
    pattern: str

def _normalize_found_pos(value: object, text_len: int) -> int:
    try:
        idx = int(value)
    except (TypeError, ValueError, OverflowError):
        return -1

    if 0 <= idx <= text_len:
        return idx
    return -1

def _require_cpp(func: object | None, algo_name: str) -> None:
    if func is None:
        raise HTTPException(
            status_code=501,
            detail=f"{algo_name} недоступен. Пересоберите sub_substrings: python setup.py build_ext --inplace",
        )

def _steps_to_response(steps_raw: object, text: str, pattern: str) -> dict:
    steps = []
    for s in steps_raw:
        found_pos = _normalize_found_pos(s.get("found_pos", -1), len(text))
        steps.append({
            "text_idx": int(s.get("text_idx", 0)),
            "pattern_idx": int(s.get("pattern_idx", 0)),
            "is_match": bool(s.get("is_match", False)),
            "is_found": bool(s.get("is_found", False)),
            "found_pos": found_pos,
            "is_backtrack": bool(s.get("is_backtrack", False)),
            "lps_value": int(s.get("lps_value", 0))
        })

    return {
        "steps": steps,
        "text": text,
        "pattern": pattern
    }

def _run_substring_history(req: KMPRequest, history_func: object | None, algo_name: str) -> dict:
    try:
        _require_cpp(history_func, algo_name)
        
        text = req.text
        pattern = req.pattern
        steps_raw = history_func(text, pattern)
        return _steps_to_response(steps_raw, text, pattern)
        
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})

@router.post("/kmp")
async def run_kmp(req: KMPRequest):
    return _run_substring_history(req, kmp_h_cpp, "KMP Viz")

@router.post("/boyer_moore")
async def run_boyer_moore(req: KMPRequest):
    return _run_substring_history(req, boyer_moore_h_cpp, "Boyer-Moore Viz")

@router.post("/quick_search")
async def run_quick_search(req: KMPRequest):
    return _run_substring_history(req, quick_search_h_cpp, "Sunday / Quick Search Viz")
