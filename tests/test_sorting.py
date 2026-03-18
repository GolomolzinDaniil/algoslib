import pytest
import numpy as np
from numpy.random import randint, uniform

from algoslib.sorting.sub_sorting import bubble_sort


ALGORITHMS = [sorted, bubble_sort]

@pytest.mark.parametrize("func", ALGORITHMS)
def test_zero_arr(func):
    arr = []
    assert func(arr) == arr

@pytest.mark.parametrize("func", ALGORITHMS)
def test_one_el_arr(func):
    arr = [1]
    assert func(arr) == arr

@pytest.mark.parametrize("func", ALGORITHMS)
def test_ones_el_arr(func):
    arr = [1,1,1,1,1]
    assert func(arr) == arr

@pytest.mark.parametrize("func", ALGORITHMS)
def test_ordered_arr(func):
    arr = [1,2,3,4,5]
    assert func(arr) == arr

@pytest.mark.parametrize("func", ALGORITHMS)
def test_inversion_arr(func):
    arr = [5,4,3,2,1]
    assert func(arr) == [1,2,3,4,5]

@pytest.mark.parametrize("func", ALGORITHMS)
def test_many_el_arr(func):
    arr = [4,1,7,3,5]
    assert func(arr) == sorted(arr)

