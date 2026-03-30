#include <cstdint>
#include "sorting_utils.hpp"
#include "bubble_sort.hpp"
#include "selection_sort.hpp"
#include "gnome_sort.hpp"
#include "bogo_sort.hpp"
#include <insertion_sort.hpp>


PYBIND11_MODULE(sub_sorting, m) {

    m.doc() = "C++ сортировки для python";

    m.def(
        "bubble_sort_h",
        [](const py::list& data) {
            return get_history([](auto vec) {
                return bubble_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "selection_sort_h",
        [](const py::list& data) {
            return get_history([](auto vec) {
                return selection_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "gnome_sort_h",
        [](const py::list& data) {
            return get_history([](auto vec) {
                return gnome_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "bogo_sort_h",
        [](const py::list& data) {
            return get_history([](auto vec) {
                return bogo_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "insertion_sort_h",
        [](const py::list& data) {
            return get_history([](auto vec) {
                return insertion_sort_h(vec);
            }, data);
        },
        py::arg("data")
    );
    
    m.def(
        "bubble_sort",
        [](const py::list& data) {
            return get_sorted([](auto vec) {
                return bubble_sort(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "selection_sort",
        [](const py::list& data) {
            return get_sorted([](auto vec) {
                return selection_sort(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "gnome_sort",
        [](const py::list& data) {
            return get_sorted([](auto vec) {
                return gnome_sort(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "bogo_sort",
        [](const py::list& data) {
            return get_sorted([](auto vec) {
                return bogo_sort(vec);
            }, data);
        },
        py::arg("data")
    );
    m.def(
        "insertion_sort",
        [](const py::list& data) {
            return get_sorted([](auto vec) {
                return insertion_sort(vec);
            }, data);
        },
        py::arg("data")
    );

};
