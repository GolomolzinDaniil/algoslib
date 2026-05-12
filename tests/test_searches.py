import asyncio

from algoslib.server.routers.searches import (
    SearchRequest,
    run_binary_search,
    run_linear_searche,
)
from algoslib.searches.sub_searches import (
    linear_searche,
    linear_searche_both_sides,
    linear_searche_both_sides_h,
    binary_search,
    binary_search_h,
    binary_search_sorted,
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


def test_linear_searche_text_values():
    arr = ["b", "x", "a", "x"]
    assert linear_searche(arr, "a") == [2]


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


def test_linear_searche_both_sides_text_values():
    arr = ["a", "b", "c", "d"]
    assert linear_searche_both_sides(arr, "d") == [3]


def test_binary_search_sorted():
    arr = [5, 1, 4, 2, 3]
    assert binary_search_sorted(arr) == [1, 2, 3, 4, 5]


def test_binary_search_found_in_sorted_result():
    arr = [5, 1, 4, 2, 3]
    assert binary_search(arr, 4) == [3]


def test_binary_search_not_found():
    arr = [5, 1, 4, 2, 3]
    assert binary_search(arr, 9) == []


def test_binary_search_text_values():
    arr = ["delta", "alpha", "charlie", "bravo"]
    assert binary_search_sorted(arr, "") == ["alpha", "bravo", "charlie", "delta"]
    assert binary_search(arr, "charlie") == [2]


def test_binary_search_history_contains_comparison_details():
    arr = [5, 1, 4, 2, 3]
    history = binary_search_h(arr, 4)
    assert history == [
        (0, 4, 2, False),
        (3, 4, 3, True),
    ]


def test_search_router_accepts_text_values():
    response = asyncio.run(run_linear_searche(SearchRequest(data=["x", "a", "b"], target="a")))
    assert response["visual_data"] == ["x", "a", "b"]
    assert response["result"] == [1]
    assert response["history"] == [0, 1]


def test_search_router_stringifies_mixed_values_for_visualization():
    response = asyncio.run(run_linear_searche(SearchRequest(data=[1, "a", 3], target=1)))
    assert response["visual_data"] == ["1", "a", "3"]
    assert response["result"] == [0]


def test_binary_search_router_history_uses_indexes_for_text_values():
    response = asyncio.run(run_binary_search(SearchRequest(data=["delta", "alpha", "charlie"], target="charlie")))
    assert response["visual_data"] == ["alpha", "charlie", "delta"]
    assert response["result"] == [1]
    assert response["history"] == [
        {
            "left_index": 0,
            "right_index": 2,
            "mid_index": 1,
            "is_match": True,
        }
    ]
