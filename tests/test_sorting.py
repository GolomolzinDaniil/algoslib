import pytest
import numpy as np

from algoslib.sorting.sub_sorting import *


SIZES = [0, 10, 100]

@pytest.fixture(params=SIZES)
def arr_int8(request):
    """int8: от -128 до 127"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.int8)
    return np.random.randint(-128, 127, size=size, dtype=np.int8)

@pytest.fixture(params=SIZES)
def arr_int16(request):
    """int16: от -32768 до 32767"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.int16)
    return np.random.randint(-32768, 32767, size=size, dtype=np.int16)

@pytest.fixture(params=SIZES)
def arr_int32(request):
    """int32: стандартный диапазон"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.int32)
    return np.random.randint(-100000, 100000, size=size, dtype=np.int32)

@pytest.fixture(params=SIZES)
def arr_int64(request):
    """int64: большие числа"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.int64)
    return np.random.randint(-1000000000, 1000000000, size=size, dtype=np.int64)


@pytest.fixture(params=SIZES)
def arr_uint8(request):
    """uint8: от 0 до 255"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.uint8)
    return np.random.randint(0, 255, size=size, dtype=np.uint8)

@pytest.fixture(params=SIZES)
def arr_uint16(request):
    """uint16: от 0 до 65535"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.uint16)
    return np.random.randint(0, 65535, size=size, dtype=np.uint16)

@pytest.fixture(params=SIZES)
def arr_uint32(request):
    """uint32: от 0 до 2^32-1"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.uint32)
    return np.random.randint(0, 1000000, size=size, dtype=np.uint32)

@pytest.fixture(params=SIZES)
def arr_uint64(request):
    """uint64: очень большие положительные числа"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.uint64)
    return np.random.randint(0, 10000000000, size=size, dtype=np.uint64)


@pytest.fixture(params=SIZES)
def arr_float32(request):
    """float32 (float в C++)"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.float32)
    # random.uniform лучше контролирует диапазон, чем rand
    return np.random.uniform(-100.0, 100.0, size=size).astype(np.float32)

@pytest.fixture(params=SIZES)
def arr_float64(request):
    """float64 (double в C++)"""
    size = request.param
    if size == 0:
        return np.array([], dtype=np.float64)
    return np.random.uniform(-100.0, 100.0, size=size).astype(np.float64)


@pytest.fixture(params=SIZES)
def py_list_int(request):
    """Обычный список Python с int"""
    size = request.param
    if size == 0:
        return []
    return list(np.random.randint(-100, 100, size=size))

@pytest.fixture(params=SIZES)
def py_tuple_int(request):
    """Кортеж Python с int"""
    size = request.param
    if size == 0:
        return tuple()
    return tuple(np.random.randint(-100, 100, size=size))

@pytest.fixture(params=SIZES)
def py_set_int(request):
    """Множество Python (размер может быть меньше из-за уникальности)"""
    size = request.param
    if size == 0:
        return set()
    return set(np.random.randint(-50, 50, size=size*2))
