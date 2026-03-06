# from typing import Any
# import numpy as np


# class Step(dict[str, Any]):
#     fst: int
#     snd: int
#     is_swaped: bool
#     sorted: int

# def visual_bubble_sort(
#         data,
#         output_name: str = 'bubble_sort.html',
#         type_template: str = 'common'
#     ) -> None:
#     """"""


# # def bubble_sort(
# #         arr
# #         # arr : np.ndarray | list[int | float] | tuple[int | float] | set[int | float] | frozenset[int | float]
# #     ) -> list[Step]:
# #     """
# #     ## Сортировка пузырьком с возвратом истории шагов.

# #     Parameters
# #     ----------
# #     arr : array_like
# #         Входной одномерный массив данных может быть ``np.ndarray``, ``list``, ``tuple``, ``set``, ``frozenset``
        
# #         Поддерживаемые типы для ``np.array``:
# #         - знаковые: ``np.int8``, ``np.int16``, ``np.int32``, ``np.int64``
# #         - беззнаковые: ``np.uint8``, ``np.uint16``, ``np.uint32``, ``np.uint64``,
# #         - не целые: ``np.float32``, ``np.float64``

# #         Поддерживаемые типы для остальных: ``int``, ``float``

# #     Returns
# #     -------
# #     list of Step
# #         История операций сортировки.
# #         * ``fst`` : int - индекс первого элемента пары
# #         * ``snd`` : int - индекс второго элемента пары
# #         * ``is_swap`` : bool - флаг обмена
# #         * ``sorted`` : int - кол-во отсортированных элементов
            
# #     Raises
# #     ------
# #     RunTimeError
# #         Если переданы неподдерживаемые типы данных
# #     InvalidError
# #         Если переданные неподдерживаемые структуры данных

# #     Examples
# #     --------
# #     >>> import numpy as np
# #     >>> from algoslib.sorting import bubble_sort

# #     Сортировка с явным указанием типа данных
# #     >>> bubble_sort(np.array([3,2,1], dtype=np.int32))
# #     [{'fst': 0, 'snd': 1, 'is_swap': True, 'sorted': 0}, ...]

# #     По умолчанию
# #     >>> bubble_sort([3,2,1])
# #     [{'fst': 0, 'snd': 1, 'is_swap': True, 'sorted': 0}, ...]
# #     For more type support, use np.array
# #     """
