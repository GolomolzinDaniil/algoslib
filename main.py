from algoslib.sorting import bubble_sort

# arr = [5.5,6.5,1.5,8.5,4.5,9.5,3.6,-1.5,5.5,4.5]

import numpy as np

arr = np.array([1,4,7,-1,34,6.0], dtype=np.float64)

arr = bubble_sort(arr)
# print(arr)

arr = np.array([arr])
print(arr.dtype)