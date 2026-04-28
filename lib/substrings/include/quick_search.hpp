#pragma once

#include <string>
#include <vector>

#include "substrings_utils.hpp"

std::vector<Sub_step> quick_search_h(const std::string& text, const std::string& pattern);

size_t quick_search(const std::string& text, const std::string& pattern);
