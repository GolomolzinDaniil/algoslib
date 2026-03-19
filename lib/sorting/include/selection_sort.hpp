#pragma once
#include <vector>


struct Selection_step
{
    size_t curr_ind;      // текущий сраниваемый элемент (j)
    size_t min_index;     // индекс текущего минимума
    bool is_swap;         // произошла ли на данном этапе смена
    size_t sorted_num;    // кол-во отсортированных (в начало) (i)
};

template <typename T>
std::vector<Selection_step> selection_sort_h(std::vector<T> &vec)
{
    std::vector<Selection_step> history;

    history.push_back({0,0,false,0});

    const size_t size = vec.size();
    if (size == 0) 
    {
        history.push_back({0, 0, false, 0});
        return history;
    }
    
    size_t min_index;
    for (size_t i = 0; i < size - 1; i++)
    {
        min_index = i;
        for (size_t j = i + 1; j < size; j++)
        {
            if (vec[j] < vec[min_index]) min_index = j;
            history.push_back({j,min_index,false,i});
        }
        if (min_index != i)
        {
            std::swap(vec[i], vec[min_index]);
            history.push_back({i,min_index,true,i});
        }
    }
    history.push_back({0,0,false,size});
    return history;
};


template<typename T>
std::vector<T> selection_sort(std::vector<T>& arr)
{
    const size_t arr_size = arr.size();

    if (arr_size == 0) return arr;

    for (size_t i = 0; i < arr_size - 1; i++)
    {   
        size_t min_index = i;
        for (size_t j = i + 1; j < arr_size; j++)
        {
            if (arr[j] < arr[min_index]) min_index = j;
        }
        if (min_index != i)
        {
            std::swap(arr[i], arr[min_index]);
        }
    }
    return arr;
}