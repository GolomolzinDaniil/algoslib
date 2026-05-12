#pragma once

#include <iostream>
#include <vector>
#include <utility>
#include <string>
#include <algorithm>


template<typename T>
std::vector<size_t> fibonacci_search_h(std::vector<T>& arr, T target)
{
    std::sort(arr.begin(), arr.end());

    std::vector<size_t> history;
    history.push_back(0);

    const size_t size = arr.size();
    if (size == 0) return history;
    
    // пока может делать шаг, равный числу фибоначчи
    size_t pred = 0, curr = 1;
    
    T curr_el = arr[curr];
    while (curr_el < target)
    {
        if (curr >= size)
        {
            curr = size;
            break;
        }

        size_t new_curr = pred + curr;
        pred = curr;
        curr = new_curr;

        history.push_back(curr);
        curr_el = arr[curr];
    }

    // иначе перепрыгнули и делаем линейный поиск (хотя можно рекурсивно, хз)
    for (size_t i = pred + 1; i < curr; i++)
    {
        history.push_back(i);
    }
    return history;
}


template<typename T>
size_t fibonacci_search(std::vector<T>& arr, T target)
{
    std::sort(arr.begin(), arr.end());

    const size_t size = arr.size();    
    if (size == 0) return std::string::npos;
    
    size_t pred = 0, curr = 1;
    T curr_el = arr[curr];
    while (curr_el < target)
    {
        if (curr >= size)
        {
            curr = size;
            break;
        }
        
        size_t new_curr = pred + curr;
        pred = curr;
        curr = new_curr;

        curr_el = arr[curr];
    }

    for (size_t i = pred; i < curr; i++)
    {
        if (arr[i] == target) return i;
    }
    return std::string::npos;
}


int main()
{
    std::vector<int> arr = {};

    std::sort(arr.begin(), arr.end());
    auto res = fibonacci_search<int>(arr, 1);

    std::cout << res << std::endl;
    // for (const auto& el : res)
    // {
    //     printf("%ld ", el);
    // }
    // printf("\n");

    // for (const auto& el : res)
    // {
    //     printf("%d ", arr[el]);
    // }
    // printf("\n");
}