#pragma once
#include <cstddef>
#include <utility>
#include <vector>

template <typename T>
std::vector<std::pair<size_t, size_t>> linear_searche_both_sides_h(const std::vector<T>& arr, T target)
{
    (void)target;
    const size_t arr_size = arr.size();
    std::vector<std::pair<size_t, size_t>> history;
    history.reserve((arr_size + 1) / 2);

    if (arr_size == 0)
        return history;

    size_t left = 0;
    size_t right = arr_size - 1;
    while (left <= right)
    {
        history.emplace_back(left, right);
        if (left == right)
            break;
        ++left;
        --right;
    }

    return history;
}

template <typename T>
std::vector<size_t> linear_searche_both_sides(const std::vector<T>& arr, T target)
{
    const size_t arr_size = arr.size();
    std::vector<size_t> result;
    result.reserve(arr_size);

    if (arr_size == 0)
        return result;

    size_t left = 0;
    size_t right = arr_size - 1;
    while (left <= right)
    {
        if (arr[left] == target)
            result.push_back(left);

        if (right != left && arr[right] == target)
            result.push_back(right);

        if (left == right)
            break;
        ++left;
        --right;
    }

    return result;
}
