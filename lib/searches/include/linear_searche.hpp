#pragma once
#include <vector>

template <typename T>
std::vector<size_t> linear_searche_h(std::vector<T> arr, T target)
{
    size_t arr_size = arr.size();
    std::vector<size_t> history;

    for (size_t i = 0; i < arr_size; i++)
    {
        history.push_back(i);

        if (arr[i] == target)
            break;
    }

    return history;
}

template <typename T>
std::vector<size_t> linear_searche(std::vector<T> arr, T target)
{
    size_t arr_size = arr.size();
    std::vector<size_t> result;

    for (size_t i = 0; i < arr_size; i++)
    {
        if (arr[i] == target)
        {
            result.push_back(i);
            break;
        }
    }

    return result;
}