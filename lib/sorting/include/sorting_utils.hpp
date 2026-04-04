#pragma once
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <pybind11/numpy.h>
#include <iostream>
#include <vector>
#include <utility>
#include "bubble_sort.hpp"
#include "selection_sort.hpp"
#include "gnome_sort.hpp"
#include "bogo_sort.hpp"
#include "insertion_sort.hpp"
#include "quick_sort.hpp"


namespace py = pybind11;


inline py::list to_py(const std::vector<Bubble_step>& history)
{
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

inline py::list to_py(const std::vector<Selection_step>& history)
{
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

inline py::list to_py(const std::vector<Gnome_step>& history)
{
    py::list res;
    for (const auto& step : history)
    {
        res.append(
            py::dict(
                py::arg("compare_a") = step.compare_a,
                py::arg("compare_b") = step.compare_b,
                py::arg("is_swap") = step.is_swap
            )
        );
    }
    return res;
};

inline py::list to_py(const std::vector<Bogo_step>& history)
{
    py::list res;
    for (const auto& step : history)
    {
        res.append(
            py::dict(
                py::arg("indexes") = step.indexes,
                py::arg("is_sorted") = step.is_sorted
            )
        );
    }
    return res;
};

inline py::list to_py(const std::vector<Insertion_step<std::int64_t>>& history)
{
    py::list res;
    for (const auto& step : history)
    {
        res.append(
            py::dict(
                py::arg("compare_a") = step.compare_a,
                py::arg("compare_b") = step.compare_b,
                py::arg("is_shift") = step.is_shift,
                py::arg("value") = step.value
            )
        );
    }
    return res;
};

inline py::list to_py(const std::vector<Insertion_step<double>>& history)
{
    py::list res;
    for (const auto& step : history)
    {
        res.append(
            py::dict(
                py::arg("compare_a") = step.compare_a,
                py::arg("compare_b") = step.compare_b,
                py::arg("is_shift") = step.is_shift,
                py::arg("value") = step.value
            )
        );
    }
    return res;
};

inline py::list to_py(const std::vector<Quick_step>& history)
{
    py::list res;
    for (const auto& step : history)
    {
        res.append(
            py::dict(
                py::arg("low") = step.low,
                py::arg("high") = step.high,
                py::arg("curr_ind") = step.curr_ind,
                py::arg("is_swap") = step.is_swap
            )
        );
    }
    return res;
};

template<typename T>
inline std::vector<T> list2vector(const py::list& list)
{
    return list.cast<std::vector<T>>();
};

template<typename Func>
py::list get_history(Func&& func, const py::list& list)
{   
    try {
        auto vec = list2vector<std::int64_t>(list);
        auto history = func(vec);
        return to_py(history);
    }
    catch (const py::cast_error&) {
        auto vec = list2vector<double>(list);
        auto history = func(vec);
        return to_py(history);
    }
    catch (const std::exception& e) {
        throw py::type_error(std::string("Conversion failed: ") + e.what());
    }
};

template<typename Func>
inline py::list get_sorted(Func&& func, const py::list& list)
{   
    try{
        auto vec = list2vector<std::int64_t>(list);
        auto sorted_vec = func(vec);
        return py::cast(sorted_vec);
    }
    catch (const py::cast_error&){
        auto vec = list2vector<double>(list);
        auto sorted_vec = func(vec);
        return py::cast(sorted_vec);
    }
    catch (const std::exception& e) {
        throw py::type_error(std::string("Conversion failed: ") + e.what());
    }
};


// template<typename T>
// std::vector<T> object2vector(const py::object& obj)
// {
//     if (py::isinstance<py::array>(obj))
//     {   
//         auto arr = py::cast<py::array>(obj);
//         if (arr.ndim() != 1) {
//             throw std::runtime_error("Expected 1D dimension, but passed " + std::to_string(arr.ndim()));
//         }
//         auto buf = arr.request();
//         T* ptr = static_cast<T*>(buf.ptr);
//         return std::vector<T>(ptr, ptr + buf.size);        
//     }
//     else if (py::isinstance<py::list>(obj) || py::isinstance<py::tuple>(obj))
//     {
//         return obj.cast<std::vector<T>>();
//     }
//     throw std::invalid_argument("Unsupported object type for conversion to vector");
// };

// template<typename T>
// py::object vector2object(const std::vector<T>& vec, bool use_np)
// {
//     if (use_np)
//     {
//         py::array_t<T> arr(vec.size());
//         auto buf = arr.request();
//         T* ptr = static_cast<T*>(buf.ptr);
//         std::copy(vec.begin(), vec.end(), ptr);
//         return arr;
//     }
//     else
//     {
//         return py::cast(vec);
//     }
// }



// template<typename T, typename Func>
// py::list get_history(Func&& func, const py::object& obj)
// {
//     auto vec = object2vector<T>(obj);
//     return to_py(func(vec));
// };




// template<typename T, typename Func>
// py::object get_typed_arr(Func&& func, const py::object& arr, bool use_np=true)
// {
//     auto vec = object2vector<T>(arr);
//     return vector2object<T>(func(vec), use_np);
// };

// template<typename Func>
// py::object type_dispatcher(Func&& func, const py::object& obj)
// {
//     // если np.array
//     if (py::isinstance<py::array>(obj)) {

//         auto arr = py::cast<py::array>(obj);
//         auto dtype = arr.dtype();

//         // знаковые
//         if      (dtype.is(py::dtype::of<std::int8_t>()))   return get_typed_arr<std::int8_t>(func, arr);
//         else if (dtype.is(py::dtype::of<std::int16_t>()))  return get_typed_arr<std::int16_t>(func, arr);
//         else if (dtype.is(py::dtype::of<std::int32_t>()))  return get_typed_arr<std::int32_t>(func, arr);
//         else if (dtype.is(py::dtype::of<std::int64_t>()))  return get_typed_arr<std::int64_t>(func, arr);
//         // беззнаковые
//         else if (dtype.is(py::dtype::of<std::uint8_t>()))  return get_typed_arr<std::uint8_t>(func, arr);
//         else if (dtype.is(py::dtype::of<std::uint16_t>())) return get_typed_arr<std::uint16_t>(func, arr);
//         else if (dtype.is(py::dtype::of<std::uint32_t>())) return get_typed_arr<std::uint32_t>(func, arr);
//         else if (dtype.is(py::dtype::of<std::uint64_t>())) return get_typed_arr<std::uint64_t>(func, arr);
//         // с плавающей точкой
//         else if (dtype.is(py::dtype::of<float>()))         return get_typed_arr<float>(func, arr);
//         else if (dtype.is(py::dtype::of<double>()))        return get_typed_arr<double>(func, arr);
//         // не поддерживаемый тип данных
//         else throw std::invalid_argument("Unsupported type: " + py::str(dtype).cast<std::string>());
//     }
//     // иначе python объект
//     else if (py::isinstance<py::list>(obj) || py::isinstance<py::tuple>(obj))
//     {
//         try{
//             return get_typed_arr<std::int64_t>(func, obj, false);
//         }
//         catch (const py::cast_error&){
//             return get_typed_arr<double>(func, obj, false);  
//         }
//         catch (const std::exception& e) {
//             throw py::type_error(std::string("Conversion failed: ") + e.what());
//         }
//     }
//     // не поддерживаемая структура
//     throw std::invalid_argument(
//         "The object of type '" + py::str(py::type(obj)).cast<std::string>() + "' is not supported. "
//         "Expected: [np.array, list, tuple]");
// };
