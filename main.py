from algoslib.sorting import bubble_sort

# arr = [5.5,6.5,1.5,8.5,4.5,9.5,3.6,-1.5,5.5,4.5]

import numpy as np

arr = np.array([1,5,2,8,45,2,8,2,8], dtype=np.int64)

arr = bubble_sort(arr)
print(*arr, sep='\n')