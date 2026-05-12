#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include <cstdint>
#include <string>
#include <vector>
#include "linear_searche.hpp"
#include "linear_searche_both_sides.hpp"
#include "binary_search.hpp"

namespace py = pybind11;

template <typename T>
std::vector<T> cast_list(const py::list &data)
{
    return data.cast<std::vector<T>>();
}

std::vector<std::string> cast_string_list(const py::list &data)
{
    std::vector<std::string> result;
    result.reserve(data.size());

    for (const auto &item : data)
    {
        result.push_back(py::str(item));
    }

    return result;
}

PYBIND11_MODULE(sub_searches, m)
{
    m.doc() = "C++ search algorithms for python";

    m.def(
        "linear_searche_h",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return linear_searche_h<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search history. Returns visited indexes.");
    m.def(
        "linear_searche_h",
        [](const py::list &data, const std::string &target)
        {
            const auto vec = cast_string_list(data);
            return linear_searche_h<std::string>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search history for text values. Returns visited indexes.");

    m.def(
        "linear_searche",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return linear_searche<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search. Returns indexes where target is found.");
    m.def(
        "linear_searche",
        [](const py::list &data, const std::string &target)
        {
            const auto vec = cast_string_list(data);
            return linear_searche<std::string>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search for text values. Returns indexes where target is found.");

    m.def(
        "linear_searche_both_sides_h",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return linear_searche_both_sides_h<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search from both sides history. Returns checked index pairs.");
    m.def(
        "linear_searche_both_sides_h",
        [](const py::list &data, const std::string &target)
        {
            const auto vec = cast_string_list(data);
            return linear_searche_both_sides_h<std::string>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search from both sides history for text values. Returns checked index pairs.");
    m.def(
        "linear_searche_both_sides",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return linear_searche_both_sides<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search. Returns indexes where target is found.");
    m.def(
        "linear_searche_both_sides",
        [](const py::list &data, const std::string &target)
        {
            const auto vec = cast_string_list(data);
            return linear_searche_both_sides<std::string>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Linear search for text values. Returns indexes where target is found.");

    m.def(
        "binary_search_h",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return binary_search_h<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Binary search history. Returns tuples: left, right, mid, is_match.");
    m.def(
        "binary_search_h",
        [](const py::list &data, const std::string &target)
        {
            const auto vec = cast_string_list(data);
            return binary_search_h<std::string>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Binary search history for text values. Returns tuples: left, right, mid, is_match.");

    m.def(
        "binary_search",
        [](const py::list &data, std::int64_t target)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return binary_search<std::int64_t>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Binary search. Returns found index in sorted array.");
    m.def(
        "binary_search",
        [](const py::list &data, const std::string &target)
        {
            const auto vec = cast_string_list(data);
            return binary_search<std::string>(vec, target);
        },
        py::arg("data"),
        py::arg("target"),
        "Binary search for text values. Returns found index in sorted array.");

    m.def(
        "binary_search_sorted",
        [](const py::list &data)
        {
            const auto vec = cast_list<std::int64_t>(data);
            return binary_search_sorted<std::int64_t>(vec);
        },
        py::arg("data"),
        "Returns array sorted for binary search (via bubble_sort).");
    m.def(
        "binary_search_sorted",
        [](const py::list &data, const std::string &)
        {
            const auto vec = cast_string_list(data);
            return binary_search_sorted<std::string>(vec);
        },
        py::arg("data"),
        py::arg("target_hint"),
        "Returns text array sorted for binary search (via bubble_sort).");
}
