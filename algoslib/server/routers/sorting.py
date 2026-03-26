import traceback

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from algoslib.sorting.sub_sorting import (
    bubble_sort,
    bubble_sort_h,
    selection_sort,
    selection_sort_h,
    gnome_sort,
    gnome_sort_h,
)


router = APIRouter()

MAX_SIZE = 15


class SortRequest(BaseModel):
    data: list[float | int]


def get_sorted_array(data: list[float | int], algo: str) -> list[float | int]:
    data_copy = list(data)
    if algo == "bubble":
        return list(bubble_sort(data_copy))
    if algo == "selection":
        return list(selection_sort(data_copy))
    if algo == "gnome":
        return list(gnome_sort(data_copy))
    return sorted(data_copy)


def normalize_sort_step(step: dict, algo: str) -> dict:
    if algo == "bubble":
        return {
            "compare_a": step.get("compare_a", step.get("compare_a", 0)),
            "compare_b": step.get("compare_b", step.get("compare_b", 0)),
            "is_swap": step.get("is_swap", False),
            "sorted_num": step.get("sorted_num", step.get("sorted_num", 0))
        }
    elif algo == "selection":
        return {
            "compare_a": step.get("curr_ind", step.get("compare_a", 0)),
            "compare_b": step.get("min_index", step.get("compare_b", 0)),
            "is_swap": step.get("is_swap", False),
            "sorted_num": step.get("sorted_num", step.get("sorted_num", 0))
        }
    elif algo == 'gnom':
        return {
            "compare_a": step.get("compare_a", 0),
            "compare_b": step.get("compare_b", 0),
            "is_swap": step.get("is_swap", False),
            "sorted_num": step.get("sorted_num", 0)
        }
    return step


@router.post("/bubble")
async def run_bubble_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = list(data)
        raw_history = bubble_sort_h(arr)

        history = [normalize_sort_step(dict(s), algo="bubble") for s in raw_history]

        # Ensure initial and final steps exist (old .pyd may omit them)
        if not history or history[0].get("compare_b", 1) != 0:
            history.insert(0, {"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0})
        if not history or history[-1].get("sorted_num", 0) != len(data):
            history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": len(data)})

        return {
            "history": history,
            "initial_array": data,
            "sorted_array": get_sorted_array(data, "bubble"),
            "direction": "end",
            "algo": "bubble"
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
    
@router.post("/selection")
async def run_selection_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = list(data)
        raw_history = selection_sort_h(arr)

        history = [normalize_sort_step(dict(s), algo="selection") for s in raw_history]

        if not history or history[0].get("sorted_num", 1) != 0:
            history.insert(0, {"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0})
        if not history or history[-1].get("sorted_num", 0) != len(data):
            history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": len(data)})

        return {
            "history": history,
            "initial_array": data,
            "sorted_array": get_sorted_array(data, "selection"),
            "direction": "start",
            "algo": "selection"
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
    
@router.post("/gnome")
async def run_gnome_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = list(data)
        raw_history = gnome_sort_h(arr)
        history = [normalize_sort_step(dict(s), algo="gnome") for s in raw_history]
        if not history or (history[0].get("compare_a", 0) != 0 and history[0].get("compare_b", 0) != 0):
            history.insert(0, {"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0})
        if history and history[-1].get("is_swap") is False and history[-1].get("compare_b", 0) >= len(data) - 1:
            history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": len(data)})

        return {
            "history": history, 
            "initial_array": data, 
            "sorted_array": get_sorted_array(data, "gnome"),
            "direction": "bidirectional",
            "algo": "gnome"
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
