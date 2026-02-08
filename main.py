from algoslib.sorting import bubble_sort

# arr = [5.5,6.5,1.5,8.5,4.5,9.5,3.6,-1.5,5.5,4.5]

# прикол с типами обычного списка python, поэтому лучше использовать np.array
arr = [1,4,7,-1,34,6]

arr = bubble_sort(arr)
print(arr)