import numpy as np

from algoslib.sorting import bubble_sort


arr = np.array([3,2,1], dtype=np.int64)

l = [1,2,4,5]
history = bubble_sort(arr)

print(*history, sep='\n')