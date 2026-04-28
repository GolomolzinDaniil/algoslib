#pragma once

#include <string>
#include <vector>

#include "substrings_utils.hpp"

std::vector<Sub_step> boyer_moore_h(const std::string& text, const std::string& pattern);

size_t boyer_moore(const std::string& text, const std::string& pattern);
