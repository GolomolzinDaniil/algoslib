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

router = APIRouter()


INT64_MIN = -(2**63)
INT64_MAX = 2**63 - 1


class SearchRequest(BaseModel):
    data: list[float | int]
    target: float | int


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


def _prepare_cpp_args(data: list[float | int], target: float | int) -> tuple[bool, list[int], int]:
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


def _normalize_pair_history(raw_history: list[tuple[int | float, int | float]]) -> list[list[int]]:
    return [[int(left), int(right)] for left, right in raw_history]


def _require_cpp(func: object | None, algo_name: str) -> None:
    if func is None:
        raise HTTPException(
            status_code=501,
            detail=f"{algo_name} недоступен. Пересоберите sub_searches: python setup.py build_ext --inplace",
        )


def _get_normalized_cpp_args_or_400(data: list[float | int], target: float | int) -> tuple[list[int], int]:
    can_use_cpp, normalized_data, normalized_target = _prepare_cpp_args(data, target)
    if not can_use_cpp:
        raise HTTPException(
            status_code=400,
            detail=(
                "Алгоритм доступен только для целых значений в диапазоне int64 "
                "(без NaN/Infinity и дробной части)."
            ),
        )
    return normalized_data, normalized_target


@router.post("/linear_searche")
async def run_linear_searche(req: SearchRequest):
    try:
        _require_cpp(linear_searche_cpp, "linear_searche")
        _require_cpp(linear_searche_h_cpp, "linear_searche_h")

        data = list(req.data)
        target = req.target
        normalized_data, normalized_target = _get_normalized_cpp_args_or_400(data, target)

        result = [int(idx) for idx in linear_searche_cpp(normalized_data, normalized_target)]
        history = [int(idx) for idx in linear_searche_h_cpp(normalized_data, normalized_target)]

        return {
            "result": result,
            "history": history,
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
        normalized_data, normalized_target = _get_normalized_cpp_args_or_400(data, target)

        result = [int(idx) for idx in linear_searche_both_sides_cpp(normalized_data, normalized_target)]
        history = _normalize_pair_history(
            linear_searche_both_sides_h_cpp(normalized_data, normalized_target)
        )

        return {
            "result": result,
            "history": history,
            "source": "cpp",
            "history_source": "cpp",
        }
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
