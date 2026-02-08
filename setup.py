from setuptools import setup, Extension
import pybind11
import sys



# ВСЕ ЗАВИСИТ ОТ ОС
if sys.platform == 'win32':
    compile_flags = ['/O2', '/std:c++17', '/MD']
    link_flags = []
else:
    compile_flags = ['-O3', '-std=c++17', '-fPIC']
    link_flags = []


# расширения для нужной сборки
extensions = [

    # sorting
    Extension(
        name='algoslib.sorting.sub_sorting', # from algoslib.sorting import *
        sources=[
            'algoslib/sorting/sub_sorting.cpp',
            # 'algoslib/lib/sorting/algorithms/bubble_sort.cpp'
        ],
        include_dirs=[
            pybind11.get_include(),
            'algoslib/sorting/include'
        ],
        language='c++',
        extra_compile_args=compile_flags,
        # extra_link_args=
    ),
    # остальные разделы (типо graphs)
]

setup(
    name='algoslib',
    ext_modules=extensions,
    zip_safe=False
)
