#include "../../lib/bindings/include/bind_func.hpp"
#include "../../lib/sorting/include/algorithms.hpp"



template<typename T>
py::array_t<T> bubble_sort_bind(py::array_t<T> arr) {

    // ВИДИМО ЗДЕСЬ нужно сделать обработку типа списка И ошибка на разный тип элементов списка ЛИБО делаем явное преобразования списка питона в np.array

    std::vector<T> vec = numpy_to_vector(arr);
    bubble_sort(vec);
    return vector_to_numpy(vec);
}


// Все PyBind11 bindings (sorting), нужные для перевода кода из Плюсов в Пайтон

PYBIND11_MODULE(sub_sorting, m) {

    m.doc() =
            "C++ сортировки для python";
    
    // при перегрузки тип данных будет присвоен типу ПЕРВОМУ объявлению
    m.def("bubble_sort", bubble_sort_bind<float>,   py::arg("array"), "Сортировка пузырьком");
    m.def("bubble_sort", bubble_sort_bind<double>,  py::arg("array"), "Сортировка пузырьком");
    m.def("bubble_sort", bubble_sort_bind<int32_t>, py::arg("array"), "Сортировка пузырьком");
    m.def("bubble_sort", bubble_sort_bind<int64_t>, py::arg("array"), "Сортировка пузырьком");


};