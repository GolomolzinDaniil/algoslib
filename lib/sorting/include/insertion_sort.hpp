#pragma once
#include <vector>


template<typename T>
struct Insertion_step
{
    size_t compare_a;   // слева сравниваемый (откуда берем)
    size_t compare_b;   // справа сравниваемый (куда сдвигаем)
    bool is_shift;      // true = сдвиг элемента вправо, false = финальная вставка ключа
    T value;            // элемент, который вставляется на освободившееся место
};

template<typename T>
std::vector<Insertion_step<T>> insertion_sort_h(std::vector<T>& vec)
{
    std::vector<Insertion_step<T>> history;
    const size_t size = vec.size();        
    
    if (size <= 1) return history;

    for (size_t i = 1; i < size; i++)
    {
        T curr_el = vec[i];
        size_t curr_ind = i;

        while (curr_ind > 0 && vec[curr_ind - 1] > curr_el)
        {
            history.push_back({curr_ind - 1, curr_ind, true, vec[curr_ind - 1]});
            
            vec[curr_ind] = vec[curr_ind - 1];
            curr_ind--;
        }
        history.push_back({i, curr_ind, false, curr_el}); 
        
        vec[curr_ind] = curr_el;
    }
    return history;
}

template<typename T>
std::vector<T> insertion_sort(std::vector<T>& arr)
{
    const size_t size = arr.size();
    if (size == 0) return arr;

    for (size_t i = 1; i < size; i++)
    {
        T curr_el = arr[i];
        size_t curr_ind = i;

        while (curr_ind > 0 && arr[curr_ind-1] > curr_el)
        {
            arr[curr_ind] = arr[curr_ind - 1];
            curr_ind--;
        }
        arr[curr_ind] = curr_el;
    }
    return arr;
}
