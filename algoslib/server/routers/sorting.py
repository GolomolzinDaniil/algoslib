import traceback

import numpy as np
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from algoslib.sorting.sub_sorting import bubble_sort, selection_sort

router = APIRouter()

MAX_SIZE = 15


class SortRequest(BaseModel):
    data: list[float | int]


def normalize_sort_step(step: dict, algo: str) -> dict:
    if algo == "bubble":
        return {
            "fst": step.get("compare_a", step.get("fst", 0)),
            "snd": step.get("compare_b", step.get("snd", 0)),
            "is_swap": step.get("is_swap", False),
            "sorted": step.get("sorted_num", step.get("sorted", 0))
        }
    elif algo == "selection":
        return {
            "fst": step.get("curr_ind", step.get("fst", 0)),
            "snd": step.get("min_index", step.get("snd", 0)),
            "is_swap": step.get("is_swap", False),
            "sorted": step.get("sorted_num", step.get("sorted", 0))
        }
    return step


@router.post("/bubble")
async def run_bubble_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = np.array(data)
        raw_history = bubble_sort(arr)

        history = [normalize_sort_step(dict(s), algo="bubble") for s in raw_history]

        # Ensure initial and final steps exist (old .pyd may omit them)
        if not history or history[0].get("snd", 1) != 0:
            history.insert(0, {"fst": 0, "snd": 0, "is_swap": False, "sorted": 0})
        if not history or history[-1].get("sorted", 0) != len(data):
            history.append({"fst": 0, "snd": 0, "is_swap": False, "sorted": len(data)})

        return {"history": history, "initial_array": data, "direction": "end", "algo": "bubble"}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
    
@router.post("/selection")
async def run_selection_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = np.array(data)
        raw_history = selection_sort(arr)

        history = [normalize_sort_step(dict(s), algo="selection") for s in raw_history]

        if not history or history[0].get("sorted", 1) != 0:
            history.insert(0, {"fst": 0, "snd": 0, "is_swap": False, "sorted": 0})
        if not history or history[-1].get("sorted", 0) != len(data):
            history.append({"fst": 0, "snd": 0, "is_swap": False, "sorted": len(data)})

        return {"history": history, "initial_array": data, "direction": "start", "algo": "selection"}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
