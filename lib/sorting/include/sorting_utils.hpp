#pragma once

#include <vector>
#include <utility>


struct Step {
    // индекс ПЕРВОГО сравниваемого элемента
    size_t fst;
    // индекс ВТОРОГО сравниваемого элемента
    size_t snd;
    // был ли обмен при сравнении
    bool is_swap;
    // сколько эл-ов УЖЕ отсортированно
    size_t sorted;
};


