import math
import traceback

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

try:
    from algoslib.sorting import sub_sorting as sub_sorting_cpp
except Exception:
    sub_sorting_cpp = None


bubble_sort_h = getattr(sub_sorting_cpp, "bubble_sort_h", None) if sub_sorting_cpp else None
selection_sort_h = getattr(sub_sorting_cpp, "selection_sort_h", None) if sub_sorting_cpp else None
gnome_sort_h = getattr(sub_sorting_cpp, "gnome_sort_h", None) if sub_sorting_cpp else None
bogo_sort_h = getattr(sub_sorting_cpp, "bogo_sort_h", None) if sub_sorting_cpp else None
quick_sort_h = getattr(sub_sorting_cpp, "quick_sort_h", None) if sub_sorting_cpp else None
insertion_sort_h = getattr(sub_sorting_cpp, "insertion_sort_h", None) if sub_sorting_cpp else None
counting_sort_h = getattr(sub_sorting_cpp, "counting_sort_h", None) if sub_sorting_cpp else None

bubble_sort = getattr(sub_sorting_cpp, "bubble_sort", None) if sub_sorting_cpp else None
selection_sort = getattr(sub_sorting_cpp, "selection_sort", None) if sub_sorting_cpp else None
gnome_sort = getattr(sub_sorting_cpp, "gnome_sort", None) if sub_sorting_cpp else None
bogo_sort = getattr(sub_sorting_cpp, "bogo_sort", None) if sub_sorting_cpp else None
quick_sort = getattr(sub_sorting_cpp, "quick_sort", None) if sub_sorting_cpp else None
insertion_sort = getattr(sub_sorting_cpp, "insertion_sort", None) if sub_sorting_cpp else None
counting_sort = getattr(sub_sorting_cpp, "counting_sort", None) if sub_sorting_cpp else None


router = APIRouter()


class SortRequest(BaseModel):
    data: list[float | int]


def _require_cpp(func: object | None, func_name: str) -> None:
    if func is None:
        raise HTTPException(
            status_code=501,
            detail=f"{func_name} недоступен. Пересоберите sub_sorting: python setup.py build_ext --inplace",
        )


def _validate_sort_data(data: list[float | int]) -> list[float | int]:
    normalized: list[float | int] = []
    for value in data:
        if isinstance(value, bool):
            normalized.append(int(value))
            continue

        if isinstance(value, int):
            normalized.append(value)
            continue

        if isinstance(value, float):
            if not math.isfinite(value):
                raise HTTPException(status_code=400, detail="В массиве не должно быть NaN/Infinity")
            normalized.append(value)
            continue

        raise HTTPException(status_code=400, detail="Массив должен содержать только числа")

    return normalized


def _run_sort(
    req: SortRequest,
    history_func: object | None,
    sorted_func: object | None,
    history_name: str,
    sorted_name: str,
    algo: str,
    direction: str,
) -> dict:
    _require_cpp(history_func, history_name)
    _require_cpp(sorted_func, sorted_name)

    data = _validate_sort_data(list(req.data))
    history = list(history_func(data))
    sorted_array = list(sorted_func(data))

    return {
        "history": history,
        "initial_array": data,
        "sorted_array": list(sorted_array),
        "direction": direction,
        "algo": algo,
        "source": "cpp",
        "history_source": "cpp",
    }


@router.post("/bubble")
async def run_bubble_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            bubble_sort_h,
            bubble_sort,
            history_name="bubble_sort_h",
            sorted_name="bubble_sort",
            algo="bubble",
            direction="end",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/selection")
async def run_selection_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            selection_sort_h,
            selection_sort,
            history_name="selection_sort_h",
            sorted_name="selection_sort",
            algo="selection",
            direction="start",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/gnome")
async def run_gnome_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            gnome_sort_h,
            gnome_sort,
            history_name="gnome_sort_h",
            sorted_name="gnome_sort",
            algo="gnome",
            direction="bidirectional",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/bogo")
async def run_bogo_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            bogo_sort_h,
            bogo_sort,
            history_name="bogo_sort_h",
            sorted_name="bogo_sort",
            algo="bogo",
            direction="bogo",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/quick")
async def run_quick_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            quick_sort_h,
            quick_sort,
            history_name="quick_sort_h",
            sorted_name="quick_sort",
            algo="quick",
            direction="quick",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/insertion")
async def run_insertion_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            insertion_sort_h,
            insertion_sort,
            history_name="insertion_sort_h",
            sorted_name="insertion_sort",
            algo="insertion",
            direction="insertion",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})


@router.post("/counting")
async def run_counting_sort(req: SortRequest):
    try:
        return _run_sort(
            req,
            counting_sort_h,
            counting_sort,
            history_name="counting_sort_h",
            sorted_name="counting_sort",
            algo="counting",
            direction="counting",
        )
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
