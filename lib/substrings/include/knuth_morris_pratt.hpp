#pragma once
#include <vector>
#include <string>


// struct Lps_step
// {
//     size_t i;
//     size_t len;
//     bool is_match;
//     bool is_backtrack;
//     size_t lps_index;
//     size_t lps_value;
// };

struct KMP_step
{
    size_t text_idx;
    size_t pattern_idx;
    bool is_match;
    bool is_found;
    size_t found_pos;
    bool is_backtrack;
    size_t lps_value;
};

std::vector<size_t> lps_func(const std::string& str);

// std::vector<Lps_step> lps_func_h(const std::string& pattern);

size_t kmp(const std::string& str, const std::string& pattern);

std::vector<KMP_step> kmp_h(const std::string& text, const std::string& pattern);