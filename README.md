## algoslib - визуализация алгоритмов

C++ реализации алгоритмов с интерактивной визуализацией через веб-интерфейс.

### Установка

```bash
pip install -r requirements.txt
```

### Сборка C++ модулей

```bash
python setup.py build_ext --inplace
```

быстрый старт (установка + сборка + тесты)
```bash
pip install -r requirements.txt && python setup.py build_ext --inplace && pytest tests/
```

### Запуск веб-сервера

```bash
python -m algoslib.server
```

Откроется на http://127.0.0.1:8000

На сайте можно выбрать алгоритм, ввести данные и запустить визуализацию прямо в браузере.

### Запуск тестов

```bash
pytest tests/
```

### Структура проекта

```
algoslib/
  sorting/             - алгоритмы сортировки
    sub_sorting.cpp    - pybind11 биндинги
    visual.py          - генерация HTML (legacy)
    templates/         - HTML шаблоны (legacy)
  graphs/              - алгоритмы на графах
    sub_graphs.cpp     - pybind11 биндинги
  server/              - FastAPI сервер + фронтенд
    app.py             - точка входа FastAPI
    routers/
      sorting.py       - API для сортировок
      graphs.py        - API для графов
    static/
      index.html       - SPA страница
      css/style.css    - стили
      js/
        app.js         - контроллер (табы, fetch, плеер)
        sorting-viz.js - рендеринг сортировок
        graph-viz.js   - рендеринг графов (SVG)
lib/
  sorting/include/     - C++ реализации сортировок
  graphs/include/      - C++ реализации графовых алгоритмов
  graphs/src/          - C++ исходники (bfs, dijkstra)
  bindings/include/    - утилиты для pybind11 (type_dispatcher)
```

### Как добавить новый алгоритм

#### 1. C++ реализация

Добавить заголовочный файл в `lib/<категория>/include/` и при необходимости `.cpp` в `lib/<категория>/src/`.

Алгоритм должен возвращать вектор структур-шагов (history), описывающих каждое действие. Пример для сортировки - `Step` из `sorting_utils.hpp`, для графов - `BFS_Step`, `Dijkstra_Step` из `graph_utils.hpp`.

#### 2. Pybind11 биндинг

Добавить биндинг в соответствующий `sub_*.cpp` файл (например `algoslib/sorting/sub_sorting.cpp`).

Для сортировок используется `type_dispatcher` из `bind_func.hpp` - он автоматически обрабатывает numpy массивы и python списки.

Для графов биндинг делается напрямую через pybind11 классы и функции.

После добавления - пересобрать: `python setup.py build_ext --inplace`

#### 3. API endpoint

Добавить endpoint в соответствующий файл роутера (`algoslib/server/routers/sorting.py` или `graphs.py`).

Пример для сортировки:
```python
@router.post("/my_sort")
async def run_my_sort(req: SortRequest):
    data = list(req.data[:MAX_SIZE])
    arr = np.array(data)
    history = [dict(s) for s in my_sort(arr)]
    return {"history": history, "initial_array": data}
```

Пример для графового алгоритма:
```python
@router.post("/my_algo")
async def run_my_algo(req: BFSRequest):
    from algoslib.graphs import Graph, my_algo
    graph = Graph()
    nodes = set()
    for edge in req.edges:
        graph.add_edge(edge[0], edge[1])
        nodes.add(edge[0])
        nodes.add(edge[1])
    steps = my_algo(graph, req.start_node)
    result_steps = [{"current_node": int(s.current_node), ...} for s in steps]
    return {"steps": result_steps, "edges": req.edges, "nodes": sorted(nodes)}
```

#### 4. Фронтенд

- Добавить `<option>` в `<select>` в `index.html`
- Если визуализация аналогична существующей (ячейки для сортировки, SVG для графов) - больше ничего не нужно, фронтенд универсальный
- Если нужен новый тип визуализации - добавить JS модуль в `static/js/` и подключить в `app.js`

### Для Linux

```bash
python -m venv .venv && source .venv/bin/activate
```
#### Для очистки (может решить проблему при комплиции)
```bash
rm -rf build/ dist/ *.egg-info
find . -name "*.so" -delete
find . -name "*.o" -delete
```


