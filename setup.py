from setuptools import setup, Extension
import sys

import pybind11


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
        name='algoslib.sorting.sub_sorting',
        sources=[
            'algoslib/sorting/sub_sorting.cpp',
        ],
        include_dirs=[
            pybind11.get_include(),
            'lib/sorting/include/'
        ],
        language='c++',
        extra_compile_args=compile_flags,
        # extra_link_args=
    ),

    # graphs
    Extension(
        name='algoslib.graphs.sub_graphs',
        sources=[
            'algoslib/graphs/sub_graphs.cpp',
            'lib/graphs/src/bfs.cpp',
            'lib/graphs/src/dijkstra.cpp',
            'lib/graphs/src/bellman_ford.cpp',
            'lib/graphs/src/kruskal.cpp',
            'lib/graphs/src/stalin_sort.cpp',
            'lib/graphs/src/ford_fulkerson.cpp',
            'lib/graphs/src/edmonds_karp.cpp',
        ],
        include_dirs=[
            pybind11.get_include(),
            'lib/graphs/include/',  # заголовочные файлы для графов
        ],
        language='c++',
        extra_compile_args=compile_flags,
        # extra_link_args=
    ),
]

setup(
    name='algoslib',
    ext_modules=extensions,
    zip_safe=False,
    package_data={
        'algoslib.sorting': ['sub_sorting.pyi'],
        'algoslib.graphs' : ['sub_graphs.pyi']
    },
)
