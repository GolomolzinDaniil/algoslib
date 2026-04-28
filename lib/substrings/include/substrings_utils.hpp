#pragma once
#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <iostream>
#include <vector>
#include <string>
#include <utility>

namespace py = pybind11;

struct Sub_step
{
    size_t text_idx;
    size_t pattern_idx;
    bool is_match;
    bool is_found;
    size_t found_pos;
    bool is_backtrack;
    size_t lps_value;
};

using KMP_step = Sub_step;

inline py::list to_py(const std::vector<Sub_step>& history)
{
    py::list res;
    for (const auto& step : history)
    {
        res.append(
            py::dict(
                py::arg("text_idx") = step.text_idx,
                py::arg("pattern_idx") = step.pattern_idx,
                py::arg("is_match") = step.is_match,
                py::arg("is_found") = step.is_found,
                py::arg("found_pos") = step.found_pos,
                py::arg("is_backtrack") = step.is_backtrack,
                py::arg("lps_value") = step.lps_value
            )
        );
    }
    return res;
}

inline const std::string& list2string(const std::string& str)
{
    return str;
}

template<typename Func, typename T>
py::list get_history(Func&& func, const T& input)
{   
    std::string text = list2string(input);
    auto history = func(text);
    return to_py(history);
}

template<typename Func, typename T>
size_t get_index(Func&& func, const T& input)
{   
    std::string text = list2string(input);
    return func(text);
}
