from algoslib.searches.sub_searches import linear_searche


def test_linear_searche_empty_arr():
    arr = []
    assert linear_searche(arr, 10) == []


def test_linear_searche_one_found():
    arr = [4, 1, 7, 3, 5]
    assert linear_searche(arr, 7) == [2]


def test_linear_searche_many_found():
    arr = [2, 7, 2, 9, 2]
    assert linear_searche(arr, 2) == [0, 2, 4]


def test_linear_searche_not_found():
    arr = [4, 1, 7, 3, 5]
    assert linear_searche(arr, 8) == []


def test_linear_searche_negative_values():
    arr = [-5, -2, 0, -2, 10]
    assert linear_searche(arr, -2) == [1, 3]
