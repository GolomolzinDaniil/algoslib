#include <cstdint>

#include "../../lib/bindings/include/bind_func.hpp"
#include "../../lib/sorting/include/bubble_sort.hpp"
#include "../../lib/sorting/include/sorting_utils.hpp"




// template<typename Func>
// py::array bubble_sort_bind(Func&& func, py::object obj) {

//     // будем переводить и работать с np.array
//     py::array arr;

//     // если python-list or python-tuple 
//     if (py::isinstance<py::list>(obj) || py::isinstance<py::tuple>(obj) || py::isinstance<py::array>(obj)) {
//         arr = py::array(obj);
//     }
//     // иначе если не np.array, то фигня
//     else  {
//         throw std::runtime_error("Input must be a [list, tuple, np.array(1D)]");
//     }

//     // оперируем (пока что) только одномерными массивами
//     if (arr.ndim() != 1) {
//         throw std::invalid_argument("");
//     }


//     auto arr_dtype = arr.dtype();

//     py::array res;

//     if      (arr_dtype.is(py::dtype::of<std::int32_t>())) {

//         auto arr_typed = arr.cast<py::array_t<std::int32_t>>();
//         std::vector<std::int32_t> vec = numpy_to_vector(arr_typed);
//         func(vec);
//         res = vector_to_numpy(vec);
//     }
//     else if (arr_dtype.is(py::dtype::of<std::int64_t>())) {

//         auto arr_typed = arr.cast<py::array_t<std::int64_t>>();
//         std::vector<std::int64_t> vec = numpy_to_vector(arr_typed);
//         func(vec);
//         res = vector_to_numpy(vec);
//     }
//     else if (arr_dtype.is(py::dtype::of<double>())) {

//         auto arr_typed = arr.cast<py::array_t<double>>();
//         std::vector<double> vec = numpy_to_vector(arr_typed);
//         func(vec);
//         res = vector_to_numpy(vec);
//     }
//     else if (arr_dtype.is(py::dtype::of<float>())) {

//         auto arr_typed = arr.cast<py::array_t<float>>();
//         std::vector<float> vec = numpy_to_vector(arr_typed);
//         func(vec);
//         res = vector_to_numpy(vec);
//     }
//     else {
//         throw std::invalid_argument("Dolbaeb peredavai normalnye types");
//     }
//     return res
// }



template<typename Func>
py::list sort_bind(Func&& func, py::array arr) {

    py::list history_py;

    std::vector<Step_0> history_cpp;

    auto arr_dtype = arr.dtype();

    // 1. типов много. Придумать как сократить код
    
    if (arr_dtype.is(py::dtype::of<std::int64_t>())) {

        auto typed_arr = arr.cast<py::array_t<std::int64_t>>();

        std::vector<std::int64_t> vec = numpy_to_vector(typed_arr);
        
        history_cpp = func(vec);

        // 2. разные сортировки -> разные (возможно) структуры. Вынести в отдельную функций цикл

        for (const auto& step : history_cpp) {

            history_py.append(
                py::dict(
                    py::arg("fst") = step.fst,
                    py::arg("snd") = step.snd,
                    py::arg("is_swap") = step.is_swap,
                    py::arg("sorted") = step.sorted
                )
            );
        }


    }
    else throw std::invalid_argument("Unsupported arr's type");

    return history_py;
};




PYBIND11_MODULE(sub_sorting, m) {

    m.doc() = "C++ сортировки для python";


    m.def("bubble_sort",
        [](py::array obj) {
            return sort_bind([](auto& arr) {
                return bubble_sort(arr);
            }, obj);
        }, py::arg("arr"), "История для визуала Сортировка пузырьком");


};