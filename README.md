## algoslib - библиотека и тп



для загрузки зависимостей
```bash
pip install -r requirements.txt
```

сборка библиотеки
```bash
python setup.py build_ext --inplace
```

быстрый старт (установка + сборка + тесты)
```bash
pip install -r requirements.txt && python setup.py build_ext --inplace && pytest tests/
```

пример использования в файле main.py
```bash
python main.py
```

запуск тестов (после сборки)
```bash
pytest tests/
```
для Linux (не трогать если вам не надо)
```bash
python -m venv .venv && source .venv/bin/activate
```