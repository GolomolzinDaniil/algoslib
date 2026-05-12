import math
import traceback

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

try:
    from algoslib.searches import sub_searches as sub_searches_cpp
except Exception:
    sub_searches_cpp = None


linear_searche_cpp = getattr(sub_searches_cpp, "linear_searche", None) if sub_searches_cpp else None
linear_searche_h_cpp = getattr(sub_searches_cpp, "linear_searche_h", None) if sub_searches_cpp else None
linear_searche_both_sides_cpp = getattr(sub_searches_cpp, "linear_searche_both_sides", None) if sub_searches_cpp else None
linear_searche_both_sides_h_cpp = getattr(sub_searches_cpp, "linear_searche_both_sides_h", None) if sub_searches_cpp else None
binary_search_cpp = getattr(sub_searches_cpp, "binary_search", None) if sub_searches_cpp else None
binary_search_h_cpp = getattr(sub_searches_cpp, "binary_search_h", None) if sub_searches_cpp else None
binary_search_sorted_cpp = getattr(sub_searches_cpp, "binary_search_sorted", None) if sub_searches_cpp else None
fibonacci_search_cpp = getattr(sub_searches_cpp, "fibonacci_search", None) if sub_searches_cpp else None
fibonacci_search_h_cpp = getattr(sub_searches_cpp, "fibonacci_search_h", None) if sub_searches_cpp else None
fibonacci_search_sorted_cpp = getattr(sub_searches_cpp, "fibonacci_search_sorted", None) if sub_searches_cpp else None

router = APIRouter()


INT64_MIN = -(2**63)
INT64_MAX = 2**63 - 1


class SearchRequest(BaseModel):
    data: list[float | int | str]
    target: float | int | str


def _to_int64(value: float | int) -> int | None:
    if isinstance(value, bool):
        value = int(value)

    if isinstance(value, int):
        if INT64_MIN <= value <= INT64_MAX:
            return int(value)
        return None

    if isinstance(value, float):
        if not math.isfinite(value) or not value.is_integer():
            return None
        int_value = int(value)
        if INT64_MIN <= int_value <= INT64_MAX:
            return int_value
        return None

    return None


def _prepare_cpp_args(data: list[float | int | str], target: float | int | str) -> tuple[bool, list[int], int]:
    normalized_target = _to_int64(target)
    if normalized_target is None:
        return False, [], 0

    normalized_data: list[int] = []
    for value in data:
        normalized_value = _to_int64(value)
        if normalized_value is None:
            return False, [], 0
        normalized_data.append(normalized_value)

    return True, normalized_data, normalized_target


def _require_cpp(func: object | None, algo_name: str) -> None:
    if func is None:
        raise HTTPException(
            status_code=501,
            detail=f"{algo_name} недоступен. Пересоберите sub_searches: python setup.py build_ext --inplace",
        )


def _stringify_search_value(value: float | int | str) -> str:
    return str(value).strip() if isinstance(value, str) else str(value)


def _prepare_search_args(data: list[float | int | str], target: float | int | str) -> tuple[list[int], int] | tuple[list[str], str]:
    can_use_cpp, normalized_data, normalized_target = _prepare_cpp_args(data, target)
    if can_use_cpp:
        return normalized_data, normalized_target

    text_data = [_stringify_search_value(value) for value in data]
    text_target = _stringify_search_value(target)
    return text_data, text_target


@router.post("/linear_searche")
async def run_linear_searche(req: SearchRequest):
    try:
        _require_cpp(linear_searche_cpp, "linear_searche")
        _require_cpp(linear_searche_h_cpp, "linear_searche_h")

        data = list(req.data)
        target = req.target
        search_data, search_target = _prepare_search_args(data, target)

        history = list(linear_searche_h_cpp(search_data, search_target))
        result = list(linear_searche_cpp(search_data, search_target))

        return {
            "result": result,
            "history": history,
            "visual_data": search_data,
            "visual_target": search_target,
            "source": "cpp",
            "history_source": "cpp",
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/linear_searche_both_sides")
async def run_linear_searche_both_sides(req: SearchRequest):
    try:
        _require_cpp(linear_searche_both_sides_cpp, "linear_searche_both_sides")
        _require_cpp(linear_searche_both_sides_h_cpp, "linear_searche_both_sides_h")

        data = list(req.data)
        target = req.target
        search_data, search_target = _prepare_search_args(data, target)

        history = list(linear_searche_both_sides_h_cpp(search_data, search_target))
        result = list(linear_searche_both_sides_cpp(search_data, search_target))

        return {
            "result": result,
            "history": history,
            "visual_data": search_data,
            "visual_target": search_target,
            "source": "cpp",
            "history_source": "cpp",
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/binary_search")
async def run_binary_search(req: SearchRequest):
    try:
        _require_cpp(binary_search_cpp, "binary_search")
        _require_cpp(binary_search_h_cpp, "binary_search_h")
        _require_cpp(binary_search_sorted_cpp, "binary_search_sorted")

        data = list(req.data)
        target = req.target
        search_data, search_target = _prepare_search_args(data, target)

        raw_history = list(binary_search_h_cpp(search_data, search_target))
        history = []
        for step in raw_history:
            left_idx = int(step[0]) if len(step) > 0 else 0
            right_idx = int(step[1]) if len(step) > 1 else 0
            mid_idx = int(step[2]) if len(step) > 2 else 0
            is_match = bool(step[3]) if len(step) > 3 else False

            history.append({
                "left_index": left_idx,
                "right_index": right_idx,
                "mid_index": mid_idx,
                "is_match": is_match,
            })

        result = list(binary_search_cpp(search_data, search_target))
        if isinstance(search_target, str):
            visual_data = list(binary_search_sorted_cpp(search_data, search_target))
        else:
            visual_data = list(binary_search_sorted_cpp(search_data))

        return {
            "result": result,
            "history": history,
            "visual_data": visual_data,
            "visual_target": search_target,
            "source": "cpp",
            "history_source": "cpp",
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/fibonacci_search")
async def run_fibonacci_search(req: SearchRequest):
    try:
        _require_cpp(fibonacci_search_cpp, "fibonacci_search")
        _require_cpp(fibonacci_search_h_cpp, "fibonacci_search_h")
        _require_cpp(fibonacci_search_sorted_cpp, "fibonacci_search_sorted")

        data = list(req.data)
        target = req.target
        search_data, search_target = _prepare_search_args(data, target)

        raw_history = list(fibonacci_search_h_cpp(search_data, search_target))
        history = [
            {"current_index": int(idx), "history_mode": "fibonacci"}
            for idx in raw_history
            if 0 <= int(idx) < len(search_data)
        ]

        raw_result = list(fibonacci_search_cpp(search_data, search_target))
        if isinstance(search_target, str):
            visual_data = list(fibonacci_search_sorted_cpp(search_data, search_target))
        else:
            visual_data = list(fibonacci_search_sorted_cpp(search_data))
        result = [int(idx) for idx in raw_result if 0 <= int(idx) < len(visual_data)]

        return {
            "result": result,
            "history": history,
            "visual_data": visual_data,
            "visual_target": search_target,
            "source": "cpp",
            "history_source": "cpp",
            "history_mode": "fibonacci",
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
