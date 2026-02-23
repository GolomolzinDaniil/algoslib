#include <cstdint>
#include <iostream>

#include "../../lib/bindings/include/bind_func.hpp"
#include "../../lib/sorting/include/bubble_sort.hpp"
#include "../../lib/sorting/include/sorting_utils.hpp"



PYBIND11_MODULE(sub_sorting, m) {

    m.doc() = "C++ сортировки для python";

    m.def("bubble_sort",
        [](py::array obj) {
            return type_dispatcher([](auto& arr) {
                return bubble_sort(arr);
            }, obj);
        }, py::arg("arr"), "История для визуала Сортировка пузырьком"
    );


};