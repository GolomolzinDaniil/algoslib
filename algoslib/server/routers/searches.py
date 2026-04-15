import math
import traceback

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

try:
    from algoslib.searches import sub_searches as sub_searches_cpp
except Exception:
    sub_searches_cpp = None


linear_searche_cpp = getattr(sub_searches_cpp, "linear_searche", None) if sub_searches_cpp else None

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


def _linear_searche_py(data: list[float | int], target: float | int) -> list[int]:
    result: list[int] = []
    for idx, value in enumerate(data):
        if value == target:
            result.append(idx)
    return result


@router.post("/linear_searche")
async def run_linear_searche(req: SearchRequest):
    try:
        data = list(req.data)
        target = req.target

        can_use_cpp, normalized_data, normalized_target = _prepare_cpp_args(data, target)
        if linear_searche_cpp is not None and can_use_cpp:
            result = [int(idx) for idx in linear_searche_cpp(normalized_data, normalized_target)]
            source = "cpp"
        else:
            result = _linear_searche_py(data, target)
            source = "python"

        return {
            "result": result,
            "source": source,
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
