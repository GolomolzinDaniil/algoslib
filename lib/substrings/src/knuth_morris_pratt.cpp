#pragma once

#include <vector>
#include <string>

#include "knuth_morris_pratt.hpp"


std::vector<size_t> lps_func(const std::string& str)
{
    const size_t size = str.size();

    std::vector<size_t> lps(size, 0);
    
    if (size == 0) return lps;

    size_t len = 0;
    size_t i = 1;

    while (i < size)
    {
        // если есть совпадение, запишем длину и увеличим все
        if (str[i] == str[len]) lps[i++] = ++len;
        else
        {
            // используем предыдущее значение
            if (len != 0) len = lps[len-1];
            // иначе нулевая длина
            else i++;
        }
    }
    return lps;
}

std::vector<KMP_step> kmp_h(const std::string& text, const std::string& pattern)
{
    std::vector<KMP_step> history;
    std::vector<size_t> lps = lps_func(pattern);

    const size_t text_size = text.size();
    const size_t pattern_size = pattern.size();

    if (pattern_size == 0) {
        history.push_back({0, 0, false, true, 0, false, 0});
        return history;
    }
    if (text_size == 0) {
        history.push_back({0, 0, false, false, std::string::npos, false, 0});
        return history;
    }

    history.push_back({0, 0, false, false, std::string::npos, false, 0});

    size_t i = 0, j = 0;
    while (i < text_size)
    {
        if (text[i] == pattern[j])
        {
            history.push_back({i, j, true, false, std::string::npos, false, 0});
            i++; j++;
            if (j == pattern_size) {
                history.push_back({i, j, true, true, i - j, false, 0});
                return history;
            }
        }
        else
        {
            if (j > 0)
            {
                history.push_back({i, j, false, false, std::string::npos, true, lps[j - 1]});
                j = lps[j - 1];
            }
            else
            {
                history.push_back({i, 0, false, false, std::string::npos, false, 0});
                i++;
            }
        }
    }
    return history;
}


size_t kmp(const std::string& str, const std::string& pattern)
{
    std::vector<size_t> lps = lps_func(pattern);

    const size_t pattern_size = pattern.size();
    const size_t str_size = str.size();
    
    if (pattern_size == 0) return 0;
    if (str_size == 0) return std::string::npos;

    size_t i = 0, j = 0;

    while (i < str_size)
    {
        if (str[i] == pattern[j])
        {
            i++; j++;
        }
        
        if (j == pattern_size) return i - j;
        
        if (i < str_size && str[i] != pattern[j])
        {
            if (j > 0) j = lps[j-1];
            else i++;
        }
    }
    return std::string::npos;
}

// std::vector<Lps_step> lps_func_h(const std::string& pattern)
// {
//     std::vector<Lps_step> history;
//     const size_t size = pattern.size();
//     if (size == 0) return history;

//     std::vector<size_t> lps(size, 0);
//     history.push_back({0, 0, false, false, 0, 0});

//     size_t len = 0;
//     size_t i = 1;

//     while (i < size)
//     {
//         if (pattern[i] == pattern[len])
//         {
//             len++;
//             lps[i] = len;
//             history.push_back({i, len - 1, true, false, i, len});
//             i++;
//         }
//         else
//         {
//             if (len != 0)
//             {
//                 history.push_back({i, len, false, true, len - 1, lps[len - 1]});
//                 len = lps[len - 1];
//             }
//             else
//             {
//                 history.push_back({i, 0, false, false, i, 0});
//                 i++;
//             }
//         }
//     }
//     return history;
// }


