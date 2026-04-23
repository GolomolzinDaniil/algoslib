#!/bin/bash

# Удаляем виртуальное окружение полностью
rm -rf .venv

# Создаем новое
python3 -m venv .venv
source .venv/bin/activate

# Обновляем установщик
pip install --upgrade pip setuptools wheel

# Устанавливаем зависимости БЕЗ кэша (чтобы скачать свежие binaries)
pip install --no-cache-dir -r requirements.txt