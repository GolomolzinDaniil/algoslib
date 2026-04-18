// #pragma once
// #include <cstddef>
// #include <utility>
// #include <vector>

// template <typename T>
// std::vector<std::pair<size_t, size_t>> linear_searche_both_sides_h(const std::vector<T> &arr, T target)
// {
//     (void)target;
//     const size_t arr_size = arr.size();
//     std::vector<std::pair<size_t, size_t>> history;

//     if (arr_size == 0)
//         return history;

//     for (size_t i = 0; i < arr_size / 2 + 1; i++)
//     {
//         history.emplace_back(i, arr_size - i - 1);
//         if (arr[i] == target || arr[arr_size - i - 1] == target)
//             break;
//     }

//     return history;
// }

// template <typename T>
// std::vector<size_t> linear_searche_both_sides(const std::vector<T> &arr, T target)
// {
//     const size_t arr_size = arr.size();
//     std::vector<size_t> result;
//     result.reserve(arr_size);

//     if (arr_size == 0)
//         return result;

//     for (size_t i = 0; i < arr_size / 2 + 1; i++)
//     {
//         if (arr[i] == target)
//         {
//             result.push_back(i);
//             break;
//         }
//         if (arr[arr_size - i - 1] == target)
//         {
//             result.push_back(arr_size - i - 1);
//             break;
//         }
//     }

//     return result;
// }

#pragma once
#include <cstddef>
#include <utility>
#include <vector>

template <typename T>
std::vector<std::pair<size_t, size_t>> linear_searche_both_sides_h(const std::vector<T> &arr, T target)
{
    (void)target;
    const size_t arr_size = arr.size();
    std::vector<std::pair<size_t, size_t>> history;

    if (arr_size == 0)
        return history;

    for (size_t i = 0; i < arr_size / 2 + 1; i++)
    {
        history.emplace_back(i, arr_size - i - 1);
        if (arr[i] == target || arr[arr_size - i - 1] == target)
            break;
    }

    return history;
}

template <typename T>
std::vector<size_t> linear_searche_both_sides(const std::vector<T> &arr, T target)
{
    const size_t arr_size = arr.size();
    std::vector<size_t> result;

    if (arr_size == 0)
        return result;

    for (size_t i = 0; i < arr_size / 2 + 1; i++)
    {
        if (arr[i] == target)
        {
            result.push_back(i);
            break;
        }
        if (arr[arr_size - i - 1] == target)
        {
            result.push_back(arr_size - i - 1);
            break;
        }
    }

    return result;
}
