from algoslib.searches.sub_searches import (
    linear_searche,
    linear_searche_both_sides,
    linear_searche_both_sides_h,
    binary_search,
    binary_search_h,
    binary_search_sorted,
    exponential_search,
    exponential_search_h,
    exponential_search_sorted,
)


def test_linear_searche_empty_arr():
    arr = []
    assert linear_searche(arr, 10) == []


def test_linear_searche_one_found():
    arr = [4, 1, 7, 3, 5]
    assert linear_searche(arr, 7) == [2]


def test_linear_searche_many_found():
    arr = [2, 7, 2, 9, 2]
    assert linear_searche(arr, 2) == [0]


def test_linear_searche_not_found():
    arr = [4, 1, 7, 3, 5]
    assert linear_searche(arr, 8) == []


def test_linear_searche_negative_values():
    arr = [-5, -2, 0, -2, 10]
    assert linear_searche(arr, -2) == [1]


def test_linear_searche_both_sides_empty_arr():
    arr = []
    assert linear_searche_both_sides(arr, 10) == []


def test_linear_searche_both_sides_found_from_edges():
    arr = [4, 1, 7, 3, 4]
    assert linear_searche_both_sides(arr, 4) == [0]


def test_linear_searche_both_sides_middle_on_odd_len():
    arr = [1, 9, 5, 9, 1]
    assert linear_searche_both_sides(arr, 5) == [2]


def test_linear_searche_both_sides_history_even_len():
    arr = [10, 20, 30, 40]
    assert linear_searche_both_sides_h(arr, 30) == [(0, 3), (1, 2)]


def test_linear_searche_both_sides_history_odd_len():
    arr = [1, 2, 3, 2, 1]
    assert linear_searche_both_sides_h(arr, 5) == [(0, 4), (1, 3), (2, 2)]


def test_binary_search_sorted():
    arr = [5, 1, 4, 2, 3]
    assert binary_search_sorted(arr) == [1, 2, 3, 4, 5]


def test_binary_search_found_in_sorted_result():
    arr = [5, 1, 4, 2, 3]
    assert binary_search(arr, 4) == [3]


def test_binary_search_not_found():
    arr = [5, 1, 4, 2, 3]
    assert binary_search(arr, 9) == []


def test_binary_search_history_contains_comparison_details():
    arr = [5, 1, 4, 2, 3]
    history = binary_search_h(arr, 4)
    assert history == [
        (0, 4, 2, 3, 4, False),
        (3, 4, 3, 4, 4, True),
    ]


def test_exponential_search_sorted():
    arr = [5, 1, 4, 2, 3]
    assert exponential_search_sorted(arr) == [1, 2, 3, 4, 5]


def test_exponential_search_empty():
    assert exponential_search([], 10) == []


def test_exponential_search_found_first_element():
    arr = [5, 1, 4, 2, 3]
    assert exponential_search(arr, 1) == [0]


def test_exponential_search_found_via_binary_search():
    arr = [5, 1, 4, 2, 3]
    assert exponential_search(arr, 4) == [3]


def test_exponential_search_not_found():
    arr = [5, 1, 4, 2, 3]
    assert exponential_search(arr, 9) == []


def test_exponential_search_history_first_element():
    arr = [1, 2, 3, 4, 5]
    history = exponential_search_h(arr, 1)
    assert history == [
        (0, 0, 0, 1, 1, True),
    ]


def test_exponential_search_history_after_binary_search():
    arr = [5, 1, 4, 2, 3]
    history = exponential_search_h(arr, 4)
    assert history[-1][5] == True  # last step is a match
    assert history[-1][2] == 3  # found at sorted index 3
