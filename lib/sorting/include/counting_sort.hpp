#pragma once
#include <vector>
#include <set>
#include <unordered_map>


template <typename T>
struct Counting_step
{
    std::unordered_map<T, size_t> nums_elems;     // каждый элемент буквально корзинка

    explicit Counting_step(std::unordered_map<T, size_t> map_)
        : nums_elems(std::move(map_)) {};

    Counting_step() = default;
};

template <typename T>
std::vector<Counting_step<T>> counting_sort_h(const std::vector<T>& arr)
{
    std::vector<Counting_step<T>> history;

    const size_t size = arr.size();
    if (size == 0) return history;

    history.reserve(size);

    std::set<T, std::greater<T>> uniq_elems;
    for (const T& el : arr) uniq_elems.insert(el);

    std::unordered_map<T, size_t> mapping;
    for (const T& el : uniq_elems) mapping[el] = 0;

    for (const T& el : arr)
    {
        mapping[el]++;
        history.emplace_back(mapping);
    }
    return history;
}

template <typename T>
std::vector<T> counting_sort(std::vector<T>& arr)
{
    if (arr.size() == 0) return arr;

    std::set<T, std::greater<T>> uniq_elems;
    for (const T& el : arr) uniq_elems.insert(el);

    std::unordered_map<T, size_t> mapping;
    for (const T& el : uniq_elems) mapping[el] = 0;

    for (const T& el : arr) mapping[el]++;

    size_t base_ind = 0;
    for (const auto& [key, value] : mapping)
    {
        for (size_t i = 0; i < value; i++)
        {
            arr[base_ind + i] = key;
        }
        base_ind += value;
    }
    return arr;
}