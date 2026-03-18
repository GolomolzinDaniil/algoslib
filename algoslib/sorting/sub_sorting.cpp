#include <cstdint>
#include "sorting_utils.hpp"
#include "bubble_sort.hpp"
#include "selection_sort.hpp"


PYBIND11_MODULE(sub_sorting, m) {

    m.doc() = "C++ сортировки для python";

    m.def(
        "bubble_sort",
        [](py::object obj) {
            return type_dispatcher([](auto& vec) {
                return bubble_sort(vec);
            }, obj);
        },
        py::arg("arr")
    );

    m.def(
        "selection_sort",
        [](py::object obj) {
            return type_dispatcher([](auto& vec) {
                return selection_sort(vec);
            }, obj);
        },
        py::arg("arr")
    );
};
