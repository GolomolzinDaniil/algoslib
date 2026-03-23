import traceback

from fastapi import APIRouter
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from algoslib.sorting.sub_sorting import bubble_sort_h


router = APIRouter()

MAX_SIZE = 15


class SortRequest(BaseModel):
    data: list[float | int]


@router.post("/bubble")
async def run_bubble_sort(req: SortRequest):
    try:
        data = list(req.data[:MAX_SIZE])
        arr = list(data)
        raw_history = bubble_sort_h(arr)

        history = [dict(step) for step in raw_history]

        # Ensure initial and final steps exist (old .pyd may omit them)
        if not history or history[0].get("compare_b", 1) != 0:
            history.insert(0, {"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0})
        if not history or history[-1].get("sorted_num", 0) != len(data):
            history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": len(data)})

        return {"history": history, "initial_array": data}
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
