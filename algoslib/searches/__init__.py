try:
    from .sub_searches import (
        linear_searche,
        linear_searche_h,
        linear_searche_both_sides,
        linear_searche_both_sides_h,
        binary_search,
        binary_search_h,
        binary_search_sorted,
    )
except ImportError:
    linear_searche = None
    linear_searche_h = None
    linear_searche_both_sides = None
    linear_searche_both_sides_h = None
    binary_search = None
    binary_search_h = None
    binary_search_sorted = None

__all__ = [
    "linear_searche",
    "linear_searche_h",
    "linear_searche_both_sides",
    "linear_searche_both_sides_h",
    "binary_search",
    "binary_search_h",
    "binary_search_sorted",
]
