try:
    from .sub_searches import linear_searche, linear_searche_h
except ImportError:
    linear_searche = None
    linear_searche_h = None

__all__ = ["linear_searche", "linear_searche_h"]
