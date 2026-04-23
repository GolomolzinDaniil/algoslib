import pytest

# можно добавить и bogo_sort но тесты будут ложиться раз через раз
from algoslib.substrings.sub_substrings import (
    kmp
)    

ALGORITHMS = (
    kmp,
)

@pytest.mark.parametrize("func", ALGORITHMS)
def test_empty_pattern(func):
    """Пустой паттерн обычно считается найденным в начале (индекс 0)"""
    assert func("abc", "") == 0

@pytest.mark.parametrize("func", ALGORITHMS)
def test_empty_text(func):
    """В пустом тексте ничего не найти (возвращает npos, обычно -1)"""
    assert int(func("", "a")) == -1

@pytest.mark.parametrize("func", ALGORITHMS)
def test_no_match(func):
    """Нет совпадений"""
    assert int(func("abcdef", "xyz")) == -1

@pytest.mark.parametrize("func", ALGORITHMS)
def test_match_at_start(func):
    """Совпадение в начале"""
    assert func("abcdef", "abc") == 0

@pytest.mark.parametrize("func", ALGORITHMS)
def test_match_at_end(func):
    """Совпадение в конце"""
    assert func("abcdef", "def") == 3

@pytest.mark.parametrize("func", ALGORITHMS)
def test_match_in_middle(func):
    """Совпадение в середине"""
    assert func("abcdef", "cd") == 2

@pytest.mark.parametrize("func", ALGORITHMS)
def test_full_match(func):
    """Текст равен паттерну"""
    assert func("hello", "hello") == 0

@pytest.mark.parametrize("func", ALGORITHMS)
def test_single_char(func):
    """Поиск одного символа"""
    assert func("banana", "n") == 2

@pytest.mark.parametrize("func", ALGORITHMS)
def test_overlapping(func):
    """Перекрывающиеся паттерны (возвращает первый)"""
    assert func("aaa", "aa") == 0