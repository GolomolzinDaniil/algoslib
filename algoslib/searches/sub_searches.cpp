#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include <cstdint>
#include <vector>
#include "linear_searche.hpp"
#include "linear_searche_both_sides.hpp"
#include "binary_search.hpp"

namespace py = pybind11;

PYBIND11_MODULE(sub_searches, m)
{
    m.doc() = "C++ search algorithms for python";

    m.def(
        "linear_searche_h",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return linear_searche_h<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search history. Returns visited indexes.");

    m.def(
        "linear_searche",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return linear_searche<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search. Returns indexes where target is found.");

    m.def(
        "linear_searche_both_sides_h",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return linear_searche_both_sides_h<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search from both sides history. Returns checked index pairs.");
    m.def(
        "linear_searche_both_sides",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return linear_searche_both_sides<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search. Returns indexes where target is found.");

    m.def(
        "binary_search_h",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return binary_search_h<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Binary search history. Returns tuples: left, right, mid, mid_value, target, is_match.");

    m.def(
        "binary_search",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return binary_search<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Binary search. Returns found index in sorted array.");

    m.def(
        "binary_search_sorted",
        [](const py::list &data)
        {
            const auto vec = data.cast<std::vector<std::int64_t>>();
            return binary_search_sorted<std::int64_t>(vec);
        },
        py::arg("data"),
        "Returns array sorted for binary search (via bubble_sort).");
}
