#pragma once
#include <vector>
#include <string>

#include "substrings_utils.hpp"

std::vector<size_t> lps_func(const std::string& str);

// std::vector<Lps_step> lps_func_h(const std::string& pattern);

size_t kmp(const std::string& str, const std::string& pattern);

std::vector<Sub_step> kmp_h(const std::string& text, const std::string& pattern);
