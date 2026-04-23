import pytest

# можно добавить и bogo_sort но тесты будут ложиться раз через раз
from algoslib.sorting.sub_sorting import (
    bubble_sort,
    selection_sort,
    gnome_sort,
    insertion_sort,
    quick_sort,
    counting_sort
)    


ALGORITHMS = (
    bubble_sort, selection_sort, gnome_sort, insertion_sort, quick_sort, counting_sort
)

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
