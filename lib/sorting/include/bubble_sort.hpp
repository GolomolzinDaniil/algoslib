#pragma once
#include "sorting_utils.hpp"


template<typename T>
std::vector<Step> bubble_sort(std::vector<T>& arr) {

    std::vector<Step> history;

    bool flag;
    const size_t arr_len = arr.size();

    for (size_t i = 0; i < arr_len; ++i) {
        flag = false;
        for (size_t j = 0; j < arr_len - 1 - i; ++j) {

            bool is_swap = (arr[j] > arr[j+1]);

            if (is_swap) {
                std::swap(arr[j], arr[j+1]);
                flag = true;
            }
            history.push_back({j, j+1, is_swap, i});
        }
        if (!flag) break;
    }
    return history;
};
