#include <pybind11/pybind11.h>
#include <pybind11/stl.h>

#include <cstdint>
#include <vector>
#include "linear_searche.hpp"

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
}
