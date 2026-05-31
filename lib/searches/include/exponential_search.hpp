#pragma once
#include <cstddef>
#include <tuple>
#include <vector>

#include "../../sorting/include/bubble_sort.hpp"

template <typename T>
using Exponential_search_step = std::tuple<std::size_t, std::size_t, std::size_t, T, T, bool>;

template <typename T>
std::vector<T> exponential_search_sorted(const std::vector<T>& arr)
{
    return bubble_sort(arr);
}

template <typename T>
std::vector<Exponential_search_step<T>> exponential_search_h(const std::vector<T>& arr, T target)
{
    std::vector<Exponential_search_step<T>> history;
    if (arr.empty()) {
        return history;
    }

    const std::vector<T> sorted = exponential_search_sorted(arr);
    const std::size_t n = sorted.size();

    {
        const bool is_match = sorted[0] == target;
        history.emplace_back(0, 0, 0, sorted[0], target, is_match);
        if (is_match) return history;
    }
    if (n == 1) return history;

    std::size_t bound = 1;
    while (bound < n && sorted[bound] < target) {
        history.emplace_back(bound / 2, bound, bound, sorted[bound], target, false);
        bound *= 2;
    }

    if (bound < n) {
        const bool is_match = sorted[bound] == target;
        history.emplace_back(bound / 2, bound, bound, sorted[bound], target, is_match);
        if (is_match) return history;
    }

    std::size_t left = bound / 2;
    std::size_t right = (bound < n) ? bound : n - 1;

    while (left <= right) {
        const std::size_t mid = left + (right - left) / 2;
        const bool is_match = sorted[mid] == target;
        history.emplace_back(left, right, mid, sorted[mid], target, is_match);

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
std::vector<std::size_t> exponential_search(const std::vector<T>& arr, T target)
{
    std::vector<std::size_t> result;
    if (arr.empty()) {
        return result;
    }

    const std::vector<T> sorted = exponential_search_sorted(arr);
    const std::size_t n = sorted.size();

    if (sorted[0] == target) {
        result.push_back(0);
        return result;
    }
    if (n == 1) return result;

    std::size_t bound = 1;
    while (bound < n && sorted[bound] < target) {
        bound *= 2;
    }

    if (bound < n && sorted[bound] == target) {
        result.push_back(bound);
        return result;
    }

    std::size_t left = bound / 2;
    std::size_t right = (bound < n) ? bound : n - 1;

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
