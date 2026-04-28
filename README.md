# algoslib

Интерактивная библиотека визуализации алгоритмов: C++ под капотом, Python/FastAPI в роли сервера и браузерный интерфейс для пошагового просмотра.

Проект сделан как учебная лаборатория, где алгоритм можно не просто запустить, а реально увидеть: какие элементы сравниваются, куда двигается указатель, как меняется состояние графа или почему поиск подстроки сделал именно такой сдвиг.

## Что внутри

- Быстрые реализации алгоритмов на C++.
- Python bindings через `pybind11`.
- FastAPI-сервер с JSON API.
- Веб-интерфейс с плеером шагов: назад, вперед, старт, пауза, скорость.
- Тесты для проверки корректности алгоритмов.
- Нормальная структура, чтобы добавлять новые алгоритмы без боли.

## Алгоритмы

### Сортировки

- Bubble Sort
- Selection Sort
- Gnome Sort
- Bogo Sort
- Quick Sort
- Insertion Sort
- Counting Sort

### Поиск

- Linear Search
- Bilinear Search
- Binary Search

### Графы

- BFS
- Dijkstra
- Bellman-Ford
- Kruskal
- Ford-Fulkerson
- Edmonds-Karp
- Tarjan
- Kosaraju
- Stalin Sort для графовой секции проекта

### Подстроки

- Knuth-Morris-Pratt
- Boyer-Moore

## Быстрый старт

```bash
python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
python setup.py build_ext --inplace
python -m algoslib.server
```

После запуска открой:

```text
http://127.0.0.1:8000
```

## Проверка проекта

Запустить все тесты:

```bash
pytest tests/
```

Или коротко:

```bash
python setup.py build_ext --inplace && pytest -q
```

## Как это работает

Проект устроен в три слоя:

```text
C++ algorithm
    |
    | pybind11
    v
Python / FastAPI API
    |
    | fetch()
    v
Browser visualization
```

C++ возвращает не только итоговый ответ, но и историю шагов. Сервер нормализует эти шаги в JSON. Фронтенд берет JSON и отрисовывает визуализацию как небольшой интерактивный фильм.

## Структура

```text
algoslib/
  server/
    app.py                 FastAPI app
    routers/               API endpoints
    static/
      index.html           основная страница
      css/style.css        стили
      js/app.js            логика UI и плеера
      js/sorting-viz.js    визуализация сортировок
      js/searche-viz.js    визуализация поиска
      js/graph-viz.js      визуализация графов
      js/substring-viz.js  визуализация поиска подстрок

  sorting/                 pybind11-модуль сортировок
  searches/                pybind11-модуль поиска
  graphs/                  pybind11-модуль графов
  substrings/              pybind11-модуль подстрок

lib/
  sorting/                 C++ сортировки
  searches/                C++ поиск
  graphs/                  C++ графовые алгоритмы
  substrings/              C++ поиск подстрок

tests/                     pytest-тесты
setup.py                   сборка C++ extensions
```

## Как добавить новый алгоритм

### 1. Написать C++ реализацию

Добавь `.hpp` в:

```text
lib/<категория>/include/
```

Если нужен отдельный исходник, добавь `.cpp` в:

```text
lib/<категория>/src/
```

Алгоритм для визуализации должен возвращать историю шагов. Один шаг равен одному понятному действию: сравнение, сдвиг, посещение вершины, запись результата и так далее.

### 2. Подключить к pybind11

Добавь функцию в соответствующий файл:

```text
algoslib/<категория>/sub_<категория>.cpp
```

Например:

```text
algoslib/substrings/sub_substrings.cpp
```

### 3. Добавить файл в сборку

Если появился новый `.cpp`, пропиши его в `setup.py` в нужном extension.

После этого пересобери:

```bash
python setup.py build_ext --inplace
```

### 4. Добавить API endpoint

Роутеры лежат здесь:

```text
algoslib/server/routers/
```

Endpoint должен вернуть данные в формате, который понимает фронтенд: массив шагов, исходные данные и результат, если он нужен.

### 5. Добавить алгоритм в интерфейс

Обычно нужно:

- добавить `<option>` в `algoslib/server/static/index.html`;
- добавить мета-информацию в `SUBSTRING_META`, `SORTING_META`, `SEARCH_META` или аналогичный объект в `app.js`;
- при необходимости расширить визуализацию в `static/js/*-viz.js`.

## Если сборка странно себя ведет

Иногда помогает очистить старые артефакты:

```bash
rm -rf build/ dist/ *.egg-info
find . -name "*.so" -delete
find . -name "*.o" -delete

python setup.py build_ext --inplace
pytest tests/
```

## Идея проекта

`algoslib` не пытается быть просто набором функций. Его смысл в том, чтобы алгоритмы перестали быть черным ящиком.

Ты вводишь данные, нажимаешь старт и видишь весь процесс по шагам. Для учебы это сильно приятнее, чем смотреть на сухой псевдокод и делать вид, что все очевидно.

## Стек

- C++17
- Python
- pybind11
- FastAPI
- HTML/CSS/JavaScript
- pytest

## Статус

Проект активно расширяется. Новые алгоритмы добавляются постепенно, а визуализации улучшаются по мере того, как находятся неудобные места в интерфейсе.
