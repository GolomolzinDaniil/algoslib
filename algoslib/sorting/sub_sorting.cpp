#include <cstdint>
#include "sorting_utils.hpp"
#include "bubble_sort.hpp"
#include "selection_sort.hpp"
#include "gnome_sort.hpp"
#include "bogo_sort.hpp"


PYBIND11_MODULE(sub_sorting, m) {

    m.doc() = "C++ сортировки для python";

    m.def(
        "bubble_sort_h",
        [](const py::list& data) {
            return get_history([](std::vector<int>& vec) {
                return bubble_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "selection_sort_h",
        [](const py::list& data) {
            return get_history([](std::vector<int>& vec) {
                return selection_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "gnome_sort_h",
        [](const py::list& data) {
            return get_history([](std::vector<int>& vec) {
                return gnome_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "bogo_sort_h",
        [](const py::list& data) {
            return get_history([](std::vector<int>& vec) {
                return bogo_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );

    
    m.def(
        "bubble_sort",
        [](const py::list& data) {
            return get_sorted([](std::vector<int>& vec) {
                return bubble_sort(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "selection_sort",
        [](const py::list& data) {
            return get_sorted([](std::vector<int>& vec) {
                return selection_sort(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "gnome_sort",
        [](const py::list& data) {
            return get_sorted([](std::vector<int>& vec) {
                return gnome_sort(vec);
            }, data);
        },
        py::arg("data")
    );
        m.def(
        "bogo_sort",
        [](const py::list& data) {
            return get_sorted([](std::vector<int>& vec) {
                return bogo_sort(vec);
            }, data);
        },
        py::arg("data")
    );
};
