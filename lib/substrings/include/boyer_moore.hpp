#pragma once

#include <string>
#include <vector>

#include "knuth_morris_pratt.hpp"

std::vector<KMP_step> boyer_moore_h(const std::string& text, const std::string& pattern);

size_t boyer_moore(const std::string& text, const std::string& pattern);
