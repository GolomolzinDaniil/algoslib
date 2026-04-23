#!/bin/bash

rm -rf build/ dist/ *.egg-info
find . \( -name "*.so" -o -name "*.o" \) -delete