#pragma once
#include <vector>


struct Bubble_step
{
    size_t compare_a;     // пара сраниваемых
    size_t compare_b;     // (для локального сравнения)
    bool is_swap;         // была ли смена
    size_t sorted_num;    // кол-во отсортированных (в конец)
};

template <typename T>
std::vector<Bubble_step> bubble_sort_h(std::vector<T> &vec)
{
    std::vector<Bubble_step> history;
    history.push_back({0, 0, false, 0});

    bool flag;
    const size_t size = vec.size();

    for (size_t i = 0; i < size; ++i)
    {
        flag = false;
        for (size_t j = 0; j < size - 1 - i; ++j)
        {
            bool is_swap = (vec[j] > vec[j + 1]);
            if (is_swap)
            {
                std::swap(vec[j], vec[j + 1]);
                flag = true;
            }
            history.push_back({j, j + 1, is_swap, i});
        }
        if (!flag) break;
    }
    history.push_back({0, 0, false, size});
    return history;
};


template<typename T>
std::vector<T> bubble_sort(std::vector<T> arr)
{
    size_t arr_size = arr.size();
    
    for (size_t i = 0; i < arr_size; i++)
    {   
        bool flag = false;
        for (size_t j = 0; j < arr_size - 1 - i; j++)
        {
            if (arr[j] > arr[j+1])
            {
                std::swap(arr[j], arr[j+1]);
                flag = true;
            }
        }
        if (!flag) break;
    }
    return arr;
}