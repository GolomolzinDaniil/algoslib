#pragma once
#include <vector>


struct Gnome_step
{
    size_t compare_a;     // пара сраниваемых
    size_t compare_b;     // (текущая позиция гнома если что)
    bool is_swap;         // была ли смена
};

template<typename T>
std::vector<Gnome_step> gnome_sort_h(std::vector<T>& vec)
{
    std::vector<Gnome_step> history;
    history.push_back({0,0,false});

    const size_t size = vec.size();
    if (size == 0 || size == 1)
    {
        history.push_back({0,0,false});
        return history;
    }
    
    size_t curr_ind = 1;
    while (curr_ind < size)
    {
        bool is_swap = vec[curr_ind-1] > vec[curr_ind];
        if (is_swap)
        {
            history.push_back({curr_ind-1, curr_ind, is_swap});
            std::swap(vec[curr_ind-1], vec[curr_ind]);

            if (curr_ind > 1) curr_ind--;
            else curr_ind++;
        }
        else
        {   
            history.push_back({curr_ind-1, curr_ind, is_swap});
            curr_ind++;
        }
    }
    return history;
};

template<typename T>
std::vector<T> gnome_sort(std::vector<T>& arr)
{
    const size_t size = arr.size();
    if (size == 0 || size == 1) return arr;

    size_t curr_ind = 1;
    while (curr_ind < size)
    {
        if (arr[curr_ind-1] > arr[curr_ind])
        {
            std::swap(arr[curr_ind-1], arr[curr_ind]);
            if (curr_ind > 1) curr_ind--;
            else curr_ind++;
        }
        else curr_ind++;
    }
    return arr;
};
