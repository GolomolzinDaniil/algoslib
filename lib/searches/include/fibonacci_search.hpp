#pragma once

#include <iostream>
#include <vector>
#include <utility>
#include <string>
#include <algorithm>
#include <limits>


template<typename T>
std::vector<size_t> fibonacci_search_h(std::vector<T>& arr, T target)
{
    std::sort(arr.begin(), arr.end());

    std::vector<size_t> history;
    const size_t size = arr.size();
    if (size == 0) return history;

    size_t fib_m_2 = 0;
    size_t fib_m_1 = 1;
    size_t fib_m = fib_m_1 + fib_m_2;

    while (fib_m < size)
    {
        fib_m_2 = fib_m_1;
        fib_m_1 = fib_m;
        fib_m = fib_m_1 + fib_m_2;
    }

    size_t offset = std::numeric_limits<size_t>::max();

    while (fib_m > 1)
    {
        const size_t base = offset == std::numeric_limits<size_t>::max() ? 0 : offset + 1;
        const size_t i = std::min(base + fib_m_2, size - 1);
        history.push_back(i);

        if (arr[i] < target)
        {
            fib_m = fib_m_1;
            fib_m_1 = fib_m_2;
            fib_m_2 = fib_m - fib_m_1;
            offset = i;
        }
        else if (target < arr[i])
        {
            fib_m = fib_m_2;
            fib_m_1 = fib_m_1 - fib_m_2;
            fib_m_2 = fib_m - fib_m_1;
        }
        else
        {
            return history;
        }
    }

    if (fib_m_1 != 0)
    {
        const size_t next = offset == std::numeric_limits<size_t>::max() ? 0 : offset + 1;
        if (next < size)
        {
            history.push_back(next);
        }
    }

    return history;
}


template<typename T>
size_t fibonacci_search(std::vector<T>& arr, T target)
{
    std::sort(arr.begin(), arr.end());

    const size_t size = arr.size();
    if (size == 0) return std::string::npos;

    size_t fib_m_2 = 0;
    size_t fib_m_1 = 1;
    size_t fib_m = fib_m_1 + fib_m_2;

    while (fib_m < size)
    {
        fib_m_2 = fib_m_1;
        fib_m_1 = fib_m;
        fib_m = fib_m_1 + fib_m_2;
    }

    size_t offset = std::numeric_limits<size_t>::max();

    while (fib_m > 1)
    {
        const size_t base = offset == std::numeric_limits<size_t>::max() ? 0 : offset + 1;
        const size_t i = std::min(base + fib_m_2, size - 1);

        if (arr[i] < target)
        {
            fib_m = fib_m_1;
            fib_m_1 = fib_m_2;
            fib_m_2 = fib_m - fib_m_1;
            offset = i;
        }
        else if (target < arr[i])
        {
            fib_m = fib_m_2;
            fib_m_1 = fib_m_1 - fib_m_2;
            fib_m_2 = fib_m - fib_m_1;
        }
        else
        {
            return i;
        }
    }

    if (fib_m_1 != 0)
    {
        const size_t next = offset == std::numeric_limits<size_t>::max() ? 0 : offset + 1;
        if (next < size && arr[next] == target)
        {
            return next;
        }
    }

    return std::string::npos;
}
