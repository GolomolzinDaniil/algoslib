#include "boyer_moore.hpp"

#include <algorithm>
#include <array>
#include <string>

namespace
{
constexpr size_t npos = std::string::npos;

std::array<int, 256> build_bad_char_table(const std::string& pattern)
{
    std::array<int, 256> bad_char{};
    bad_char.fill(-1);

    for (size_t i = 0; i < pattern.size(); ++i)
    {
        bad_char[static_cast<unsigned char>(pattern[i])] = static_cast<int>(i);
    }

    return bad_char;
}
}

std::vector<Sub_step> boyer_moore_h(const std::string& text, const std::string& pattern)
{
    std::vector<Sub_step> history;

    const size_t text_size = text.size();
    const size_t pattern_size = pattern.size();

    if (pattern_size == 0)
    {
        history.push_back({0, 0, false, true, 0, false, 0});
        return history;
    }

    if (text_size == 0 || pattern_size > text_size)
    {
        history.push_back({0, 0, false, false, npos, false, 0});
        return history;
    }

    const auto bad_char = build_bad_char_table(pattern);

    size_t shift = 0;
    while (shift <= text_size - pattern_size)
    {
        int j = static_cast<int>(pattern_size) - 1;

        while (j >= 0 && pattern[static_cast<size_t>(j)] == text[shift + static_cast<size_t>(j)])
        {
            history.push_back({
                shift + static_cast<size_t>(j),
                static_cast<size_t>(j),
                true,
                false,
                npos,
                false,
                0,
            });
            --j;
        }

        if (j < 0)
        {
            history.push_back({shift, 0, true, true, shift, false, 0});
            return history;
        }

        const size_t mismatch_text_idx = shift + static_cast<size_t>(j);
        const int last_occurrence = bad_char[static_cast<unsigned char>(text[mismatch_text_idx])];
        const size_t next_shift = static_cast<size_t>(std::max(1, j - last_occurrence));

        history.push_back({
            mismatch_text_idx,
            static_cast<size_t>(j),
            false,
            false,
            npos,
            true,
            next_shift,
        });

        shift += next_shift;
    }

    return history;
}

size_t boyer_moore(const std::string& text, const std::string& pattern)
{
    const size_t text_size = text.size();
    const size_t pattern_size = pattern.size();

    if (pattern_size == 0) return 0;
    if (text_size == 0 || pattern_size > text_size) return npos;

    const auto bad_char = build_bad_char_table(pattern);

    size_t shift = 0;
    while (shift <= text_size - pattern_size)
    {
        int j = static_cast<int>(pattern_size) - 1;

        while (j >= 0 && pattern[static_cast<size_t>(j)] == text[shift + static_cast<size_t>(j)])
        {
            --j;
        }

        if (j < 0) return shift;

        const size_t mismatch_text_idx = shift + static_cast<size_t>(j);
        const int last_occurrence = bad_char[static_cast<unsigned char>(text[mismatch_text_idx])];
        shift += static_cast<size_t>(std::max(1, j - last_occurrence));
    }

    return npos;
}
