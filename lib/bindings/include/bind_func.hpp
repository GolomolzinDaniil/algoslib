#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>

namespace py = pybind11;


// python - хранит в непрерывном куске памяти указатели на разные типы элементов
// numpy  - хранит сырые данные (явно, без указателей). Тоже непрерывно


// вспомогательные для перевода типов python <-> cpp
template<typename T>
std::vector<T> numpy_to_vector(const py::array_t<T>& arr) {

    auto buf = arr.request();
    T* ptr = static_cast<T*>(buf.ptr);

    return std::vector<T>(ptr, ptr + buf.size);
}

template<typename T>
py::array_t<T> vector_to_numpy(const std::vector<T>& vec) {

    auto res = py::array_t<T>(vec.size());
    auto buf = res.request();
    T* ptr = static_cast<T*>(buf.ptr);

    std::copy(vec.begin(), vec.end(), ptr);

    return res;
}