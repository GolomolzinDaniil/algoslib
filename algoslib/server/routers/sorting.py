import traceback
import math
import random

from fastapi import APIRouter
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


router = APIRouter()


class SortRequest(BaseModel):
    data: list[float | int]


def get_sorted_array(data: list[float | int], algo: str) -> list[float | int]:
    _ = algo
    return sorted(list(data))


INT32_MIN = -(2**31)
INT32_MAX = 2**31 - 1


def can_use_cpp_binding(data: list[float | int]) -> bool:
    # Current pybind11 bindings cast Python list -> std::vector<int> (32-bit on most builds).
    for value in data:
        if isinstance(value, bool):
            value = int(value)

        if isinstance(value, int):
            if value < INT32_MIN or value > INT32_MAX:
                return False
            continue

        if isinstance(value, float):
            if not math.isfinite(value):
                return False
            if not value.is_integer():
                return False
            if value < INT32_MIN or value > INT32_MAX:
                return False
            continue

        return False

    return True


def bubble_sort_history_py(data: list[float | int]) -> list[dict]:
    arr = list(data)
    history = [{"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0}]
    size = len(arr)

    for i in range(size):
        swapped = False
        for j in range(size - 1 - i):
            is_swap = arr[j] > arr[j + 1]
            if is_swap:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
            history.append({
                "compare_a": j,
                "compare_b": j + 1,
                "is_swap": is_swap,
                "sorted_num": i
            })
        if not swapped:
            break

    if not history or history[-1].get("sorted_num", 0) != size:
        history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": size})
    return history


def selection_sort_history_py(data: list[float | int]) -> list[dict]:
    arr = list(data)
    history = [{"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0}]
    size = len(arr)

    if size == 0:
        history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0})
        return history

    for i in range(size - 1):
        min_index = i
        for j in range(i + 1, size):
            if arr[j] < arr[min_index]:
                min_index = j
            history.append({
                "compare_a": j,
                "compare_b": min_index,
                "is_swap": False,
                "sorted_num": i
            })
        if min_index != i:
            arr[i], arr[min_index] = arr[min_index], arr[i]
            history.append({
                "compare_a": i,
                "compare_b": min_index,
                "is_swap": True,
                "sorted_num": i
            })

    if not history or history[-1].get("sorted_num", 0) != size:
        history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": size})
    return history


def gnome_sort_history_py(data: list[float | int]) -> list[dict]:
    arr = list(data)
    history = [{"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0}]
    size = len(arr)

    if size <= 1:
        history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": size})
        return history

    curr_ind = 1
    while curr_ind < size:
        is_swap = arr[curr_ind - 1] > arr[curr_ind]
        history.append({
            "compare_a": curr_ind - 1,
            "compare_b": curr_ind,
            "is_swap": is_swap,
            "sorted_num": 0
        })
        if is_swap:
            arr[curr_ind - 1], arr[curr_ind] = arr[curr_ind], arr[curr_ind - 1]
            if curr_ind > 1:
                curr_ind -= 1
            else:
                curr_ind += 1
        else:
            curr_ind += 1

    history.append({"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": size})
    return history


def bogo_sort_history_py(data: list[float | int]) -> list[dict]:
    arr = list(data)
    size = len(arr)
    indexes = list(range(size))
    is_sorted = False
    history = [{"indexes": list(indexes), "is_sorted": is_sorted}]
    num_shuffle = 300

    while not is_sorted and num_shuffle > 0:
        num_shuffle -= 1
        random.shuffle(indexes)

        is_sorted = True
        for ind in range(1, size):
            if arr[indexes[ind - 1]] > arr[indexes[ind]]:
                is_sorted = False
                break

        history.append({"indexes": list(indexes), "is_sorted": is_sorted})

    return history


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
    elif algo == 'gnome':
        return {
            "compare_a": step.get("compare_a", 0),
            "compare_b": step.get("compare_b", 0),
            "is_swap": step.get("is_swap", False),
            "sorted_num": step.get("sorted_num", 0)
        }
    elif algo == "bogo":
        return {
            "indexes": [int(i) for i in step.get("indexes", [])],
            "is_sorted": bool(step.get("is_sorted", False)),
        }
    return step


@router.post("/bubble")
async def run_bubble_sort(req: SortRequest):
    try:
        data = list(req.data)
        if bubble_sort_h is not None and can_use_cpp_binding(data):
            arr = list(data)
            try:
                raw_history = bubble_sort_h(arr)
                history = [normalize_sort_step(dict(s), algo="bubble") for s in raw_history]
            except Exception:
                history = bubble_sort_history_py(data)
        else:
            history = bubble_sort_history_py(data)

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
        data = list(req.data)
        if selection_sort_h is not None and can_use_cpp_binding(data):
            arr = list(data)
            try:
                raw_history = selection_sort_h(arr)
                history = [normalize_sort_step(dict(s), algo="selection") for s in raw_history]
            except Exception:
                history = selection_sort_history_py(data)
        else:
            history = selection_sort_history_py(data)

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
        data = list(req.data)
        if gnome_sort_h is not None and can_use_cpp_binding(data):
            arr = list(data)
            try:
                raw_history = gnome_sort_h(arr)
                history = [normalize_sort_step(dict(s), algo="gnome") for s in raw_history]
            except Exception:
                history = gnome_sort_history_py(data)
        else:
            history = gnome_sort_history_py(data)

        if not history or (history[0].get("compare_a", 0) != 0 and history[0].get("compare_b", 0) != 0):
            history.insert(0, {"compare_a": 0, "compare_b": 0, "is_swap": False, "sorted_num": 0})
        if not history or history[-1].get("sorted_num", 0) != len(data):
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


@router.post("/bogo")
async def run_bogo_sort(req: SortRequest):
    try:
        data = list(req.data)
        if bogo_sort_h is not None and can_use_cpp_binding(data):
            arr = list(data)
            try:
                raw_history = bogo_sort_h(arr)
                history = [normalize_sort_step(dict(s), algo="bogo") for s in raw_history]
            except Exception:
                history = bogo_sort_history_py(data)
        else:
            history = bogo_sort_history_py(data)

        identity_indexes = list(range(len(data)))
        if not history:
            history = [{"indexes": identity_indexes, "is_sorted": len(data) <= 1}]
        elif history[0].get("indexes") != identity_indexes:
            history.insert(0, {"indexes": identity_indexes, "is_sorted": False})

        return {
            "history": history,
            "initial_array": data,
            "sorted_array": get_sorted_array(data, "bogo"),
            "direction": "bogo",
            "algo": "bogo"
        }
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"detail": str(e)})
