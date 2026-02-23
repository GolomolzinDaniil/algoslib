#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>
#include <iostream>

#include "../../sorting/include/sorting_utils.hpp"


namespace py = pybind11;

// python - хранит в непрерывном куске памяти указатели на разные типы элементов
// numpy  - хранит сырые данные (явно, без указателей). Тоже непрерывно


// вспомогательные для перевода типов python <-> cpp
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


template<typename Func>
py::list type_dispatcher(Func&& func, const py::object& obj) {

    std::vector<Step> history;

    // np.array
    if (py::isinstance<py::array>(obj)) {

        // auto arr = numpy2vector(obj);
        auto arr = py::cast<py::array>(obj);
        auto dtype = arr.dtype();

        // знаковые
        if      (dtype.is(py::dtype::of<std::int8_t>())) {
            auto vec = numpy2vector<int8_t>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<std::int16_t>())) {
            auto vec = numpy2vector<int16_t>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<std::int32_t>())) {
            auto vec = numpy2vector<int32_t>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<std::int64_t>())) {
            auto vec = numpy2vector<int64_t>(arr);
            history = func(vec);
        }
        // беззнаковые
        else if(dtype.is(py::dtype::of<std::uint8_t>())) {
            auto vec = numpy2vector<uint8_t>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<std::uint16_t>())) {
            auto vec = numpy2vector<uint16_t>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<std::uint32_t>())) {
            auto vec = numpy2vector<uint32_t>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<std::uint64_t>())) {
            auto vec = numpy2vector<uint64_t>(arr);
            history = func(vec);
        }
        // с плавающей точкой
        else if (dtype.is(py::dtype::of<float>())) {
            auto vec = numpy2vector<float>(arr);
            history = func(vec);
        }
        else if (dtype.is(py::dtype::of<double>())) {
            auto vec = numpy2vector<double>(arr);
            history = func(vec);          
        }
        else {
            throw std::invalid_argument("Unsupported type: " + py::str(dtype).cast<std::string>());
        }
    }
    // иначе python объект
    else if (
        py::isinstance<py::list>(obj) || py::isinstance<py::tuple>(obj) ||
        py::isinstance<py::frozenset>(obj) || py::isinstance<py::set>(obj)) {

            std::cout << "For more type support, use np.array" << std::endl;
            try {
                auto vec = obj.cast<std::vector<int64_t>>();
                // auto vec = numpy2vector<int64_t>(obj);
                history = func(vec);
            } catch (...) {
                auto vec = obj.cast<std::vector<double>>();
                // auto vec = numpy2vector<double>(obj);
                history = func(vec);
            }
    }
    else {
        throw std::invalid_argument(
            "The object of type '" + py::str(py::type(obj)).cast<std::string>() + "' is not supported. "
            "Expected: [np.array, list, tuple, set, frozenset]"
        );
    }

    py::list history_py;

    for (const auto& step : history) {

        history_py.append(
            py::dict(
                py::arg("fst") = step.fst,
                py::arg("snd") = step.snd,
                py::arg("is_swap") = step.is_swap,
                py::arg("sorted") = step.sorted
            )
        );
    }
    return history_py;
};