import traceback

import numpy as np
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from algoslib.sorting.sub_sorting import bubble_sort

router = APIRouter()

MAX_SIZE = 15


class SortRequest(BaseModel):
    data: list[float | int]


@router.post("/bubble")
async def run_bubble_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = np.array(data)
        raw_history = bubble_sort(arr)

        history = [dict(step) for step in raw_history]

        # Ensure initial and final steps exist (old .pyd may omit them)
        if not history or history[0].get("snd", 1) != 0:
            history.insert(0, {"fst": 0, "snd": 0, "is_swap": False, "sorted": 0})
        if not history or history[-1].get("sorted", 0) != len(data):
            history.append({"fst": 0, "snd": 0, "is_swap": False, "sorted": len(data)})

        return {"history": history, "initial_array": data}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
