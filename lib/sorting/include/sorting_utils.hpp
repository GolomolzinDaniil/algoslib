#pragma once
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>
#include <iostream>
#include <vector>
#include <utility>
#include "bubble_sort.hpp"
#include "selection_sort.hpp"


namespace py = pybind11;

template<typename T>
std::vector<T> numpy2vector(const py::array& arr) {

    if (arr.ndim() != 1) {
        throw std::runtime_error("Expected 1D dimension, but passed " + std::to_string(arr.ndim()));
    }
    auto buf = arr.request();
    T* ptr = static_cast<T*>(buf.ptr);

    return std::vector<T>(ptr, ptr + buf.size);
};

template<typename T>
py::array_t<T> vector2numpy(const std::vector<T>& vec) {

    auto res = py::array_t<T>(vec.size());
    auto buf = res.request();
    T* ptr = static_cast<T*>(buf.ptr);
    std::copy(vec.begin(), vec.end(), ptr);

    return res;
};

inline py::list to_py(const std::vector<Bubble_step>& history) {
    py::list res;
    for (const auto& step : history) {
        res.append(
            py::dict(
                py::arg("compare_a") = step.compare_a,
                py::arg("compare_b") = step.compare_b,
                py::arg("is_swap") = step.is_swap,
                py::arg("sorted_num") = step.sorted_num
            )
        );
    }
    return res;
};

inline py::list to_py(const std::vector<Selection_step>& history) {
    py::list res;
    for (const auto& step : history) {
        res.append(
            py::dict(
                py::arg("curr_ind") = step.curr_ind,
                py::arg("min_index") = step.min_index,
                py::arg("is_swap") = step.is_swap,
                py::arg("sorted_num") = step.sorted_num
            )
        );
    }
    return res;
};

template<typename T, typename Func>
auto select_type(Func&& func, const py::array& arr) {
    auto vec = numpy2vector<T>(arr);
    auto history = func(vec);
    return to_py(history);
}


template<typename Func>
py::list type_dispatcher(Func&& func, const py::object& obj) {

    if (py::isinstance<py::array>(obj)) {

        auto arr = py::cast<py::array>(obj);
        auto dtype = arr.dtype();

        // знаковые
        if      (dtype.is(py::dtype::of<std::int8_t>()))   return select_type<std::int8_t>(func, arr);
        else if (dtype.is(py::dtype::of<std::int16_t>()))  return select_type<std::int16_t>(func, arr);
        else if (dtype.is(py::dtype::of<std::int32_t>()))  return select_type<std::int32_t>(func, arr);
        else if (dtype.is(py::dtype::of<std::int64_t>()))  return select_type<std::int64_t>(func, arr);
        // беззнаковые
        else if(dtype.is(py::dtype::of<std::uint8_t>()))   return select_type<std::uint8_t>(func, arr);
        else if (dtype.is(py::dtype::of<std::uint16_t>())) return select_type<std::uint16_t>(func, arr);
        else if (dtype.is(py::dtype::of<std::uint32_t>())) return select_type<std::uint32_t>(func, arr);
        else if (dtype.is(py::dtype::of<std::uint64_t>())) return select_type<std::uint64_t>(func, arr);
        // с плавающей точкой
        else if (dtype.is(py::dtype::of<float>()))         return select_type<float>(func, arr);
        else if (dtype.is(py::dtype::of<double>()))        return select_type<double>(func, arr);
        else throw std::invalid_argument("Unsupported type: " + py::str(dtype).cast<std::string>());
    }
    // иначе python объект
    else if (
        py::isinstance<py::list>(obj) || py::isinstance<py::tuple>(obj) ||
        py::isinstance<py::frozenset>(obj) || py::isinstance<py::set>(obj)) {

            std::cout << "For more type support, use np.array" << std::endl;
            try {
                auto vec = obj.cast<std::vector<int64_t>>();
                return to_py(func(vec));  
            } catch (...) {
                auto vec = obj.cast<std::vector<double>>();
                return to_py(func(vec));  
            }
    }
    throw std::invalid_argument(
        "The object of type '" + py::str(py::type(obj)).cast<std::string>() + "' is not supported. "
        "Expected: [np.array, list, tuple, set, frozenset]");
};
