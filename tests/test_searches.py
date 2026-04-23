from algoslib.searches.sub_searches import linear_searche, linear_searche_both_sides, linear_searche_both_sides_h


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
