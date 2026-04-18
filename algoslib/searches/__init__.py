try:
    from .sub_searches import linear_searche, linear_searche_h, linear_searche_both_sides, linear_searche_both_sides_h
except ImportError:
    linear_searche = None
    linear_searche_h = None
    linear_searche_both_sides = None
    linear_searche_both_sides_h = None

__all__ = ["linear_searche", "linear_searche_h", "linear_searche_both_sides", "linear_searche_both_sides_h"]
