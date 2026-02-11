#include "../../lib/bindings/include/bind_func.hpp"
#include "../../lib/sorting/include/algorithms.hpp"
#include <cstdint>


// template<typename Func, typename ... Types>
// py::object helper(Func&& func, py::array arr) {

//     auto arr_dtype = arr.dtype();
//     bool fl = false;
//     py::object res;

//     (([&]() {
//         if (!fl && arr_dtype.is(py::dtype::of<Types>())) {
    
//             auto arr_typed = arr.cast<py::array_t<Types>>();

//             std::vector<Types> vec = numpy_to_vector(arr_typed);
    
//             func(vec);
            
//             res = vector_to_numpy(vec);
//             fl = true;
//         }
//     })(), ...);

//     if (!fl) {
//         throw std::runtime_error("Unsupported dtype: " + std::string(py::str(arr.dtype())));
//     }

//     return res;
// };

// template<typename Func, typename T>
// py::array_t<T> a(Func&& func, py::array_t<T> arr) {

//     // auto arr_typed = arr.cast<py::array_t<T>>();
//     std::vector<T> vec = numpy_to_vector(arr_typed);

//     func(vec);

//     return vector_to_numpy(vec);
// }

template<typename Func>
py::array bubble_sort_bind(Func&& func, py::object obj) {

    // будем переводить и работать с np.array
    py::array arr;

    // если python-list or python-tuple 
    if (py::isinstance<py::list>(obj) || py::isinstance<py::tuple>(obj) || py::isinstance<py::array>(obj)) {
        arr = py::array(obj);
    }
    // иначе если не np.array, то фигня
    else  {
        throw std::runtime_error("Input must be a [list, tuple, np.array(1D)]");
    }

    // оперируем (пока что) только одномерными массивами
    if (arr.ndim() != 1) {
        throw std::invalid_argument("");
    }


    // pybind11 требует явной передачи по типу (Гандон)
    // (Кто сможет переписать через ... Types = <double, float, ...> чтобы не было ошибки 304, тому куплю пива)

    auto arr_dtype = arr.dtype();

    py::array res;

    // временно такие типы, но желательно все типы, поддерживаемые numpy)))
    if      (arr_dtype.is(py::dtype::of<std::int32_t>())) {

        auto arr_typed = arr.cast<py::array_t<std::int32_t>>();
        std::vector<std::int32_t> vec = numpy_to_vector(arr_typed);
        func(vec);
        res = vector_to_numpy(vec);
    }
    else if (arr_dtype.is(py::dtype::of<std::int64_t>())) {

        auto arr_typed = arr.cast<py::array_t<std::int64_t>>();
        std::vector<std::int64_t> vec = numpy_to_vector(arr_typed);
        func(vec);
        res = vector_to_numpy(vec);
    }
    else if (arr_dtype.is(py::dtype::of<double>())) {

        auto arr_typed = arr.cast<py::array_t<double>>();
        std::vector<double> vec = numpy_to_vector(arr_typed);
        func(vec);
        res = vector_to_numpy(vec);
    }
    else if (arr_dtype.is(py::dtype::of<float>())) {

        auto arr_typed = arr.cast<py::array_t<std::float>>();
        std::vector<float> vec = numpy_to_vector(arr_typed);
        func(vec);
        res = vector_to_numpy(vec);
    }
    else {
        throw std::invalid_argument("Dolbaeb peredavai normalnye types");
    }

    // поэтому будем перебирать (можно попробовать через (... Types) сделать)
    // if (arr_dtype.is(py::dtype::of<double>())) {

    //     auto arr_typed = arr.cast<py::array_t<double>>();

    //     res = a(bubble_sort<double>, arr_typed);
    // }
    // else if (arr_dtype.is(py::dtype::of<std::int64_t>())) {
    //     res = a<std::int64_t>([](auto& v) { bubble_sort(v); }, arr);
    // }
    // else if (arr_dtype.is(py::dtype::of<double>())) {
    //     res = a<double>([](auto& v) { bubble_sort(v); }, arr);
    // }
    // else if (arr_dtype.is(py::dtype::of<float>())) {
    //     res = a<float>([](auto& v) { bubble_sort(v); }, arr);
    // }
    // else {
    //     throw std::runtime_error("Unsupported dtype: " + std::string(py::str(arr_dtype)));
    // }

    // return helper<std::int32_t, std::int64_t, float, double>(
    //     [](auto& vec) {
    //         bubble_sort(vec);
    //     },
    //     arr
    // );

    return res;
};


// Все PyBind11 bindings (sorting), нужные для перевода кода из Плюсов в Пайтон

PYBIND11_MODULE(sub_sorting, m) {

    m.doc() = "C++ сортировки для python";
    
    // при перегрузки тип данных будет присвоен типу ПЕРВОМУ объявлению
    // m.def("bubble_sort", bubble_sort_bind<float>,   py::arg("array"), "Сортировка пузырьком");
    // m.def("bubble_sort", bubble_sort_bind<double>,  py::arg("array"), "Сортировка пузырьком");
    // m.def("bubble_sort", bubble_sort_bind<int32_t>, py::arg("array"), "Сортировка пузырьком");
    // m.def("bubble_sort", bubble_sort_bind<int64_t>, py::arg("array"), "Сортировка пузырьком");

    // дабы избавиться от дублирования кода делаем через лямбду лямбды бляьб (в итоге все равно дублирование, то уже в bubble_sort_bind)
    m.def("bubble_sort", [](py::object obj) {
        return bubble_sort_bind([](auto& vec) {
            bubble_sort(vec);
        }, obj);
    }, py::arg("array"), "Сортировка пузырьком");



};