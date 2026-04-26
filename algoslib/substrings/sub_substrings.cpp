#include "substrings_utils.hpp"
#include "knuth_morris_pratt.hpp"
#include "boyer_moore.hpp"

namespace py = pybind11;

PYBIND11_MODULE(sub_substrings, m)
{
    m.doc() = "C++ поиск подстрок для python";

    m.def(
        "kmp_h",
        [](const std::string& text, const std::string& pattern) {
            return get_history([&](const std::string& t) {
                return kmp_h(t, pattern);
            }, text);
        },
        py::arg("text"),
        py::arg("pattern")
    );

    m.def(
        "kmp",
        [](const std::string& text, const std::string& pattern) {
            size_t res = get_index([&](const std::string& t) {
                return kmp(t, pattern);
            }, text);

            if (res == std::string::npos) {
                return -1;
            }
            return static_cast<int>(res);
        },
        py::arg("text"),
        py::arg("pattern")
    );

    m.def(
        "boyer_moore_h",
        [](const std::string& text, const std::string& pattern) {
            return get_history([&](const std::string& t) {
                return boyer_moore_h(t, pattern);
            }, text);
        },
        py::arg("text"),
        py::arg("pattern")
    );

    m.def(
        "boyer_moore",
        [](const std::string& text, const std::string& pattern) {
            size_t res = get_index([&](const std::string& t) {
                return boyer_moore(t, pattern);
            }, text);

            if (res == std::string::npos) {
                return -1;
            }
            return static_cast<int>(res);
        },
        py::arg("text"),
        py::arg("pattern")
    );
}
