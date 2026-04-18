#pragma once
#include <vector>
#include <utility>
#include <stack>


struct Quick_step
{
    size_t low;         // нижняя граница рассматриваемой части
    size_t high;        // верхняя
    size_t curr_ind;    // первый сраниваемый
    size_t target_ind;  // второй сравниваемый
    bool is_swap;       // была ли смена ?
};

template<typename T>
std::vector<Quick_step> quick_sort_h(std::vector<T>& arr)
{
    std::vector<Quick_step> history;
    const size_t size = arr.size();

    history.push_back({0, size-1, 0, 0, false});
    if (size <= 1) return history;


    std::stack<std::pair<size_t, size_t>> stack;
    stack.push({0, size-1});

    while (!stack.empty())
    {
        auto [low, high] = stack.top();
        stack.pop();
        
        if (low >= high) continue;

        size_t start = low;

        T pivot = arr[high];

        for (size_t i = low; i < high; i++)
        {
            if (arr[i] < pivot)
            {
                std::swap(arr[i], arr[start]);
                history.push_back({low, high, i, start, true});
                start++;
            }
            else history.push_back({low, high, i, i, false});
        }
        std::swap(arr[start], arr[high]);
        history.push_back({low, high, start, high, true});

        if (start > low) stack.push({low, start - 1});
        if (start+1 < high) stack.push({start+1, high});
    }
    history.push_back({0, size-1, 0, 0, false});
    return history;
}

template<typename T>
std::vector<T> quick_sort(std::vector<T>& arr)
{
    const size_t size = arr.size();

    if (size <= 1) return arr;

    std::stack<std::pair<size_t, size_t>> stack;
    stack.push({0, size-1});

    while (!stack.empty())
    {
        auto [low, high] = stack.top();
        stack.pop();
        
        if (low >= high) continue;

        size_t start = low;

        T pivot = arr[high];

        for (size_t i = low; i < high; i++)
        {
            if (arr[i] < pivot)
            {
                std::swap(arr[start], arr[i]);
                start++;
            }
        }
        std::swap(arr[start], arr[high]);

        if (start > low) stack.push({low, start - 1});
        if (start+1 < high) stack.push({start+1, high});
    }
    return arr;
}
