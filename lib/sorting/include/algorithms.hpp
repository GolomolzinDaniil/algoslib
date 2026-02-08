#pragma once

#include <vector>
#include <utility>


template<typename T>
void bubble_sort(std::vector<T>& arr) {

    bool fl = false;
    const size_t arr_len = arr.size();

    for (size_t i = 0; i < arr_len - 1; ++i) {
        fl = false;
        for (size_t j = 0; j < arr_len - 1 - i; ++j) {

            if (arr[j] > arr[j+1]) {
                std::swap(arr[j], arr[j+1]);
                fl = true;
            }
        }
        if (!fl) break;
    }
}