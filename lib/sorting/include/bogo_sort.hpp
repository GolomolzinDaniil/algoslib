#pragma once
#include <vector>
#include <random>
#include <algorithm>


struct Bogo_step
{
    std::vector<size_t> indexes;    // индексы перемешанного на предыдущем этапе массива
    bool is_sorted;                 // отсортированный или нет
};

template<typename T>
std::vector<Bogo_step> bogo_sort_h(std::vector<T> vec)
{
    std::random_device rd;
    std::mt19937 gen(rd());

    const size_t size = vec.size();
    std::vector<Bogo_step> history;

    std::vector<size_t> indexes(size);
    for (size_t ind = 0; ind < size; ind++) indexes[ind] = ind;
    bool is_sorted = false;
    history.push_back({indexes, is_sorted});

    size_t num_shuffle = 300;
    
    while (!is_sorted && num_shuffle > 0)
    {
        num_shuffle--;

        is_sorted = true;
        std::shuffle(indexes.begin(), indexes.end(), gen);

        for (size_t ind = 1; ind < size; ind++)
        {
            if (vec[indexes[ind-1]] > vec[indexes[ind]])
            {
                is_sorted = false;
                break;
            }
        }
        history.push_back({indexes, is_sorted});
    }
    return history;
};

template<typename T>
std::vector<T> bogo_sort(std::vector<T> arr)
{   
    if (arr.size() == 0) return arr;
    
    std::random_device rd;
    std::mt19937 gen(rd());

    size_t num_shuffle = 300;
    while (num_shuffle > 0)
    {   
        num_shuffle--;
        std::shuffle(arr.begin(), arr.end(), gen);
        if (std::is_sorted(arr.begin(), arr.end())) break;
    }
    return arr;
};
