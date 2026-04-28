#include "quick_search.hpp"

#include <array>
#include <string>

namespace
{
constexpr size_t npos = std::string::npos;

std::array<size_t, 256> build_shift_table(const std::string& pattern)
{
    const size_t pattern_size = pattern.size();
    std::array<size_t, 256> shift{};
    shift.fill(pattern_size + 1);

    for (size_t i = 0; i < pattern_size; ++i)
    {
        shift[static_cast<unsigned char>(pattern[i])] = pattern_size - i;
    }

    return shift;
}
}

std::vector<Sub_step> quick_search_h(const std::string& text, const std::string& pattern)
{
    std::vector<Sub_step> history;

    const size_t text_size = text.size();
    const size_t pattern_size = pattern.size();

    if (pattern.empty())
    {
        history.push_back({0, 0, false, true, 0, false, 0});
        return history;
    }

    if (text.empty() || pattern_size > text_size)
    {
        history.push_back({0, 0, false, false, npos, false, 0});
        return history;
    }

    const auto shift_table = build_shift_table(pattern);

    size_t shift = 0;
    while (shift <= text_size - pattern_size)
    {
        size_t j = 0;

        while (j < pattern_size && text[shift + j] == pattern[j])
        {
            history.push_back({shift + j, j, true, false, npos, false, 0});
            ++j;
        }

        if (j == pattern_size)
        {
            history.push_back({shift, 0, true, true, shift, false, 0});
            return history;
        }

        const size_t lookahead_idx = shift + pattern_size;
        const size_t next_shift = lookahead_idx < text_size
            ? shift_table[static_cast<unsigned char>(text[lookahead_idx])]
            : pattern_size + 1;

        history.push_back({shift + j, j, false, false, npos, true, next_shift});
        shift += next_shift;
    }

    return history;
}

size_t quick_search(const std::string& text, const std::string& pattern)
{
    const size_t text_size = text.size();
    const size_t pattern_size = pattern.size();

    if (pattern_size == 0) return 0;
    if (text_size == 0 || pattern_size > text_size) return npos;

    const auto shift_table = build_shift_table(pattern);

    size_t shift = 0;
    while (shift <= text_size - pattern_size)
    {
        size_t j = 0;
        while (j < pattern_size && text[shift + j] == pattern[j])
        {
            ++j;
        }

        if (j == pattern_size) return shift;

        const size_t lookahead_idx = shift + pattern_size;
        shift += lookahead_idx < text_size
            ? shift_table[static_cast<unsigned char>(text[lookahead_idx])]
            : pattern_size + 1;
    }

    return npos;
}
