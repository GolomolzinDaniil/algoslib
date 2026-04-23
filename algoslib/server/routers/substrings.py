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

router = APIRouter()

class KMPRequest(BaseModel):
    text: str
    pattern: str

def _require_cpp(func: object | None, algo_name: str) -> None:
    if func is None:
        raise HTTPException(
            status_code=501,
            detail=f"{algo_name} недоступен. Пересоберите sub_substrings: python setup.py build_ext --inplace",
        )

@router.post("/kmp")
async def run_kmp(req: KMPRequest):
    try:
        _require_cpp(kmp_h_cpp, "KMP Viz")
        
        text = req.text
        pattern = req.pattern
        
        # kmp_h возвращает список словарей (py::list of py::dict)
        steps_raw = kmp_h_cpp(text, pattern)
        
        steps = []
        for s in steps_raw:
            # s - это словарь, обращаемся через ключи с дефолтными значениями на всякий случай
            steps.append({
                "text_idx": int(s.get("text_idx", 0)),
                "pattern_idx": int(s.get("pattern_idx", 0)),
                "is_match": bool(s.get("is_match", False)),
                "is_found": bool(s.get("is_found", False)),
                "found_pos": int(s.get("found_pos", -1)),
                "is_backtrack": bool(s.get("is_backtrack", False)),
                "lps_value": int(s.get("lps_value", 0))
            })
            
        return {
            "steps": steps,
            "text": text,
            "pattern": pattern
        }
        
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})