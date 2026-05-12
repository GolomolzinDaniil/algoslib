#pragma once
#include <cstddef>
#include <tuple>
#include <vector>

#include "../../sorting/include/bubble_sort.hpp"

template <typename T>
using Binary_search_step = std::tuple<std::size_t, std::size_t, std::size_t, bool>;

template <typename T>
std::vector<T> binary_search_sorted(const std::vector<T>& arr)
{
    return bubble_sort(arr);
}

template <typename T>
std::vector<Binary_search_step<T>> binary_search_h(const std::vector<T>& arr, T target)
{
    std::vector<Binary_search_step<T>> history;
    if (arr.empty()) {
        return history;
    }

    const std::vector<T> sorted = binary_search_sorted(arr);
    std::size_t left = 0;
    std::size_t right = sorted.size() - 1;

    while (left <= right) {
        const std::size_t mid = left + (right - left) / 2;
        const bool is_match = sorted[mid] == target;
        history.emplace_back(left, right, mid, is_match);

        if (is_match) {
            break;
        }

        if (sorted[mid] < target) {
            left = mid + 1;
            continue;
        }

        if (mid == 0) {
            break;
        }
        right = mid - 1;
    }

    return history;
}

template <typename T>
std::vector<std::size_t> binary_search(const std::vector<T>& arr, T target)
{
    std::vector<std::size_t> result;
    if (arr.empty()) {
        return result;
    }

    const std::vector<T> sorted = binary_search_sorted(arr);
    std::size_t left = 0;
    std::size_t right = sorted.size() - 1;

    while (left <= right) {
        const std::size_t mid = left + (right - left) / 2;
        if (sorted[mid] == target) {
            result.push_back(mid);
            break;
        }

        if (sorted[mid] < target) {
            left = mid + 1;
            continue;
        }

        if (mid == 0) {
            break;
        }
        right = mid - 1;
    }

    return result;
}
