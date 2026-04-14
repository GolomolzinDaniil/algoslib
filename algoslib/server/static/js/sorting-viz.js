export function getCellColor(len, compare_a, compare_b, sortedCount, idx, direction = 'end') {
    if (sortedCount >= len) return 'green';
    if (direction === 'start' && idx === compare_b) return 'yellow';
    if (direction === 'insertion' && idx === compare_b) return 'yellow';
    if (idx === compare_a || idx === compare_b) return 'red';

    if (sortedCount > 0) {
        if (direction === 'end') {
            if (idx >= len - sortedCount) return 'green';
        } else {
            if (idx < sortedCount) return 'green';
        }
    }
    return 'blue';
}

const DEFAULT_CELL_FONT_SIZE = 18;
const MIN_CELL_FONT_SIZE = 4;
const SCALE_FROM_DIGITS = 5;
const SCALE_FROM_CHARS = 8;

function getIntegerDigitCount(value) {
    if (!Number.isFinite(value)) return 1;
    const absValue = Math.abs(value);
    if (absValue < 1) return 1;
    return Math.floor(absValue).toString().length;
}

function getCellFontSize(value, displayText = String(value)) {
    const integerDigits = getIntegerDigitCount(value);
    const text = displayText;
    const shouldScale = integerDigits >= SCALE_FROM_DIGITS || text.length >= SCALE_FROM_CHARS;

    if (!shouldScale) {
        return `${DEFAULT_CELL_FONT_SIZE}px`;
    }

    const estimatedFitSize = Math.floor(72 / Math.max(text.length, 1));
    const fontSize = Math.max(
        MIN_CELL_FONT_SIZE,
        Math.min(DEFAULT_CELL_FONT_SIZE, estimatedFitSize)
    );

    return `${fontSize}px`;
}

function applyCellValue(cell, value) {
    const text = String(value);
    cell.textContent = text;
    cell.style.fontSize = getCellFontSize(Number(value), text);
}

function isBogoStep(step) {
    return Array.isArray(step?.indexes);
}

function isInsertionStep(step) {
    return Object.prototype.hasOwnProperty.call(step ?? {}, 'is_shift')
        && Object.prototype.hasOwnProperty.call(step ?? {}, 'value');
}

function isCountingStep(step) {
    return Object.prototype.hasOwnProperty.call(step ?? {}, 'phase')
        && Array.isArray(step?.buckets);
}

function getBogoStepColor(step, stepIndex) {
    if (stepIndex === 0) return 'blue';
    return step?.is_sorted ? 'green' : 'red';
}

function getIdentityIndexes(length) {
    return Array.from({ length }, (_, idx) => idx);
}

function normalizeBogoIndexes(indexes, length) {
    if (!Array.isArray(indexes) || indexes.length !== length) {
        return getIdentityIndexes(length);
    }

    const normalized = [];
    const seen = new Set();
    for (const rawIdx of indexes) {
        const idx = Number(rawIdx);
        if (!Number.isInteger(idx) || idx < 0 || idx >= length || seen.has(idx)) {
            return getIdentityIndexes(length);
        }
        normalized.push(idx);
        seen.add(idx);
    }
    return normalized;
}

function renderBogoCells(container, initialArray, indexes, speed, color) {
    container.innerHTML = '';
    const transitionDuration = Math.max(120, Math.floor(speed * 0.45));

    indexes.forEach((sourceIndex, order) => {
        const cell = document.createElement('div');
        cell.dataset.sourceIndex = String(sourceIndex);
        cell.style.order = String(order);
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.className = `cell ${color}`;
        applyCellValue(cell, initialArray[sourceIndex]);
        container.appendChild(cell);
    });
}

function updateBogoStep(container, initialArray, step, stepIndex, totalSteps, speed, maxVisible) {
    const normalizedIndexes = normalizeBogoIndexes(step.indexes, initialArray.length);
    const visibleIndexes = normalizedIndexes.slice(0, maxVisible);
    const visibleData = visibleIndexes.map((sourceIndex) => initialArray[sourceIndex]);
    const color = getBogoStepColor(step, stepIndex);
    const transitionDuration = Math.max(120, Math.floor(speed * 0.45));

    const existingCells = Array.from(container.querySelectorAll('.cell[data-source-index]'));
    const existingIndexes = existingCells.map((cell) => Number(cell.dataset.sourceIndex));
    const sameCells =
        existingCells.length === visibleIndexes.length &&
        visibleIndexes.every((idx) => existingIndexes.includes(idx));

    if (!sameCells) {
        renderBogoCells(container, initialArray, visibleIndexes, speed, color);
        return formatStatus(visibleData, step, stepIndex, totalSteps, initialArray.length);
    }

    const oldRects = new Map();
    existingCells.forEach((cell) => {
        oldRects.set(cell.dataset.sourceIndex, cell.getBoundingClientRect());
    });

    const nextOrder = new Map(visibleIndexes.map((sourceIndex, position) => [String(sourceIndex), position]));

    existingCells.forEach((cell) => {
        const sourceKey = cell.dataset.sourceIndex;
        const sourceIndex = Number(sourceKey);
        const order = nextOrder.get(sourceKey);
        if (order === undefined) return;

        cell.style.order = String(order);
        cell.className = `cell ${color}`;
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        applyCellValue(cell, initialArray[sourceIndex]);
    });

    const newRects = new Map();
    existingCells.forEach((cell) => {
        newRects.set(cell.dataset.sourceIndex, cell.getBoundingClientRect());
    });

    existingCells.forEach((cell) => {
        const sourceKey = cell.dataset.sourceIndex;
        const oldRect = oldRects.get(sourceKey);
        const newRect = newRects.get(sourceKey);
        if (!oldRect || !newRect) return;

        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;
        if (dx === 0 && dy === 0) return;

        cell.style.transition = 'none';
        cell.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    container.getBoundingClientRect();

    existingCells.forEach((cell) => {
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.style.transform = 'translate(0, 0)';
    });

    return formatStatus(visibleData, step, stepIndex, totalSteps, initialArray.length);
}

function reconstructSwapState(initial, history, upTo) {
    const values = [...initial];
    const ids = values.map((_, index) => index);

    for (let i = 1; i <= upTo; i++) {
        const step = history[i];
        if (!step || isInsertionStep(step) || isBogoStep(step) || !step.is_swap) continue;

        const a = Number(step.compare_a);
        const b = Number(step.compare_b);
        if (!Number.isInteger(a) || !Number.isInteger(b)) continue;
        if (a < 0 || b < 0 || a >= values.length || b >= values.length) continue;

        [values[a], values[b]] = [values[b], values[a]];
        [ids[a], ids[b]] = [ids[b], ids[a]];
    }

    return { values, ids };
}

function renderSwapCells(container, values, ids, compare_a, compare_b, sortedCount, speed, direction) {
    container.innerHTML = '';
    const transitionDuration = Math.max(120, Math.floor(speed * 0.45));

    values.forEach((value, position) => {
        const cell = document.createElement('div');
        cell.dataset.sortId = String(ids[position]);
        cell.style.order = String(position);
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.className = `cell ${getCellColor(values.length, compare_a, compare_b, sortedCount, position, direction)}`;
        applyCellValue(cell, value);
        container.appendChild(cell);
    });
}

function updateSwapStep(container, history, initialArray, step, stepIndex, speed, direction, maxVisible) {
    const { values, ids } = reconstructSwapState(initialArray, history, stepIndex);
    const visibleValues = values.slice(0, maxVisible);
    const visibleIds = ids.slice(0, maxVisible);
    const valueById = new Map(visibleIds.map((id, idx) => [id, visibleValues[idx]]));

    const compare_a = Number.isInteger(step.compare_a) ? step.compare_a : -1;
    const compare_b = Number.isInteger(step.compare_b) ? step.compare_b : -1;
    const sortedCount = Number.isInteger(step.sorted_num) ? step.sorted_num : 0;
    const transitionDuration = Math.max(120, Math.floor(speed * 0.45));

    const existingCells = Array.from(container.querySelectorAll('.cell[data-sort-id]'));
    const existingIds = existingCells.map((cell) => Number(cell.dataset.sortId));
    const sameCells =
        existingCells.length === visibleIds.length &&
        visibleIds.every((id) => existingIds.includes(id));

    if (!sameCells) {
        renderSwapCells(container, visibleValues, visibleIds, compare_a, compare_b, sortedCount, speed, direction);
        return formatStatus(visibleValues, step, stepIndex, history.length, values.length);
    }

    const oldRects = new Map();
    existingCells.forEach((cell) => {
        oldRects.set(cell.dataset.sortId, cell.getBoundingClientRect());
    });

    const nextOrder = new Map(visibleIds.map((id, position) => [String(id), position]));

    existingCells.forEach((cell) => {
        const key = cell.dataset.sortId;
        const position = nextOrder.get(key);
        if (position === undefined) return;

        cell.style.order = String(position);
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.className = `cell ${getCellColor(values.length, compare_a, compare_b, sortedCount, position, direction)}`;
        applyCellValue(cell, valueById.get(Number(key)));
    });

    const newRects = new Map();
    existingCells.forEach((cell) => {
        newRects.set(cell.dataset.sortId, cell.getBoundingClientRect());
    });

    existingCells.forEach((cell) => {
        const key = cell.dataset.sortId;
        const oldRect = oldRects.get(key);
        const newRect = newRects.get(key);
        if (!oldRect || !newRect) return;

        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;
        if (dx === 0 && dy === 0) return;

        cell.style.transition = 'none';
        cell.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    container.getBoundingClientRect();

    existingCells.forEach((cell) => {
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.style.transform = 'translate(0, 0)';
    });

    return formatStatus(visibleValues, step, stepIndex, history.length, values.length);
}

function reconstructInsertionState(initial, history, upTo) {
    const values = [...initial];
    const ids = values.map((_, index) => index);

    let currentIteration = 1;
    let keyId = currentIteration < ids.length ? ids[currentIteration] : null;

    for (let i = 1; i <= upTo; i++) {
        const step = history[i];
        if (!isInsertionStep(step)) continue;

        const from = Number(step.compare_a);
        const to = Number(step.compare_b);
        if (!Number.isInteger(to) || to < 0 || to >= values.length) continue;

        if (step.is_shift) {
            if (Number.isInteger(from) && from >= 0 && from < values.length) {
                values[to] = values[from];
                ids[to] = ids[from];
            } else {
                values[to] = step.value;
            }
            continue;
        }

        values[to] = step.value;
        if (keyId !== null) {
            ids[to] = keyId;
        }

        currentIteration += 1;
        keyId = currentIteration < ids.length ? ids[currentIteration] : null;
    }

    return { values, ids };
}

function renderInsertionCells(container, values, ids, compare_a, compare_b, sortedCount, speed) {
    container.innerHTML = '';
    values.forEach((value, position) => {
        const cell = document.createElement('div');
        cell.dataset.insertionId = String(ids[position]);
        cell.style.order = String(position);
        cell.style.transition = `transform ${speed}ms ease, background-color ${Math.max(120, Math.floor(speed * 0.45))}ms ease`;
        cell.className = `cell ${getCellColor(values.length, compare_a, compare_b, sortedCount, position, 'insertion')}`;
        applyCellValue(cell, value);
        container.appendChild(cell);
    });
}

function updateInsertionStep(container, history, initialArray, stepIndex, speed, maxVisible) {
    const step = history[stepIndex] ?? {};
    const { values, ids } = reconstructInsertionState(initialArray, history, stepIndex);
    const visibleValues = values.slice(0, maxVisible);
    const visibleIds = ids.slice(0, maxVisible);
    const valueById = new Map(visibleIds.map((id, idx) => [id, visibleValues[idx]]));

    const compare_a = Number.isInteger(step.compare_a) ? step.compare_a : -1;
    const compare_b = Number.isInteger(step.compare_b) ? step.compare_b : -1;
    const sortedCount = Number.isInteger(step.sorted_num) ? step.sorted_num : 0;
    const transitionDuration = Math.max(120, Math.floor(speed * 0.45));

    const existingCells = Array.from(container.querySelectorAll('.cell[data-insertion-id]'));
    const existingIds = existingCells.map((cell) => Number(cell.dataset.insertionId));
    const sameCells =
        existingCells.length === visibleIds.length &&
        visibleIds.every((id) => existingIds.includes(id));

    if (!sameCells) {
        renderInsertionCells(container, visibleValues, visibleIds, compare_a, compare_b, sortedCount, speed);
        return formatStatus(visibleValues, step, stepIndex, history.length, values.length);
    }

    const oldRects = new Map();
    existingCells.forEach((cell) => {
        oldRects.set(cell.dataset.insertionId, cell.getBoundingClientRect());
    });

    const nextOrder = new Map(visibleIds.map((id, position) => [String(id), position]));

    existingCells.forEach((cell) => {
        const key = cell.dataset.insertionId;
        const position = nextOrder.get(key);
        if (position === undefined) return;

        cell.style.order = String(position);
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.className = `cell ${getCellColor(values.length, compare_a, compare_b, sortedCount, position, 'insertion')}`;
        applyCellValue(cell, valueById.get(Number(key)));
    });

    const newRects = new Map();
    existingCells.forEach((cell) => {
        newRects.set(cell.dataset.insertionId, cell.getBoundingClientRect());
    });

    existingCells.forEach((cell) => {
        const key = cell.dataset.insertionId;
        const oldRect = oldRects.get(key);
        const newRect = newRects.get(key);
        if (!oldRect || !newRect) return;

        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;
        if (dx === 0 && dy === 0) return;

        cell.style.transition = 'none';
        cell.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    container.getBoundingClientRect();

    existingCells.forEach((cell) => {
        cell.style.transition = `transform ${speed}ms ease, background-color ${transitionDuration}ms ease`;
        cell.style.transform = 'translate(0, 0)';
    });

    return formatStatus(visibleValues, step, stepIndex, history.length, values.length);
}

function getDefaultCountingBuckets(initialArray) {
    const keys = [...new Set(initialArray)].sort((a, b) => a - b);
    return keys.map((value) => ({ value, count: 0 }));
}

function createCountingPreviewStep(initialArray) {
    return {
        phase: 'start',
        source_index: -1,
        bucket_index: -1,
        bucket_value: null,
        bucket_count: 0,
        write_index: -1,
        buckets: getDefaultCountingBuckets(initialArray),
        output: [],
    };
}

function normalizeCountingBuckets(step, initialArray) {
    if (!Array.isArray(step?.buckets) || step.buckets.length === 0) {
        return getDefaultCountingBuckets(initialArray);
    }

    return step.buckets.map((bucket) => ({
        value: bucket?.value,
        count: Number.isFinite(Number(bucket?.count)) ? Number(bucket.count) : 0,
    }));
}

function normalizeCountingOutput(step) {
    if (!Array.isArray(step?.output)) return [];
    return step.output;
}

function getCountingPreviewSuffix(sourceLength, maxVisible) {
    if (sourceLength <= maxVisible) return '';
    return ` (показаны первые ${maxVisible} из ${sourceLength})`;
}

function createCountingSection(title, sectionClass) {
    const section = document.createElement('div');
    section.className = `counting-section ${sectionClass}`;

    const heading = document.createElement('div');
    heading.className = 'counting-heading';
    heading.textContent = title;
    section.appendChild(heading);

    const row = document.createElement('div');
    row.className = 'plot counting-row';
    section.appendChild(row);

    return { section, row };
}

function renderCountingSourceRow(row, initialArray, sourceIndex, phase, maxVisible) {
    const visibleSource = initialArray.slice(0, maxVisible);
    visibleSource.forEach((value, idx) => {
        const cell = document.createElement('div');
        const isActive = phase === 'count' && idx === sourceIndex;
        cell.className = `cell ${isActive ? 'red' : 'blue'}`;
        applyCellValue(cell, value);
        row.appendChild(cell);
    });
}

function renderCountingBucketsRow(row, buckets, bucketIndex, phase, maxVisible) {
    buckets.slice(0, maxVisible).forEach((bucket, idx) => {
        const cell = document.createElement('div');
        const isActive = idx === bucketIndex && (phase === 'count' || phase === 'build');
        const isDone = phase === 'done';
        const color = isActive ? 'yellow' : (isDone ? 'green' : 'blue');
        cell.className = `cell counting-bucket ${color}`;

        const key = document.createElement('span');
        key.className = 'counting-bucket-key';
        key.textContent = String(bucket.value);

        const count = document.createElement('span');
        count.className = 'counting-bucket-count';
        count.textContent = String(bucket.count);

        cell.appendChild(key);
        cell.appendChild(count);
        row.appendChild(cell);
    });
}

function renderCountingOutputRow(row, initialArrayLength, output, writeIndex, phase, maxVisible) {
    const visibleLength = Math.min(initialArrayLength, maxVisible);
    for (let idx = 0; idx < visibleLength; idx++) {
        const cell = document.createElement('div');
        const hasValue = idx < output.length;
        const isActiveWrite = phase === 'build' && idx === writeIndex;

        if (hasValue) {
            cell.className = `cell ${isActiveWrite ? 'yellow' : 'green'}`;
            applyCellValue(cell, output[idx]);
        } else {
            cell.className = 'cell counting-output-empty';
            cell.textContent = '';
        }
        row.appendChild(cell);
    }
}

function formatCountingStatus(step, stepIndex, historyLength, initialArrayLength, maxVisible) {
    const previewSuffix = getCountingPreviewSuffix(initialArrayLength, maxVisible);
    if (step.phase === 'start') {
        return `Старт: инициализация корзин${previewSuffix}`;
    }
    if (step.phase === 'count') {
        return `🔢 Подсчёт: a[${step.source_index}] = ${step.bucket_value} → корзина ${step.bucket_value} = ${step.bucket_count}${previewSuffix}`;
    }
    if (step.phase === 'build') {
        return `📦 Сборка: ${step.bucket_value} записан в sorted[${step.write_index}]${previewSuffix}`;
    }
    if (step.phase === 'done' || stepIndex === historyLength - 1) {
        const output = normalizeCountingOutput(step).slice(0, maxVisible);
        return `✅ Готово: [${output.join(', ')}]${previewSuffix}`;
    }
    return `Шаг ${stepIndex + 1} из ${historyLength}${previewSuffix}`;
}

function updateCountingStep(container, initialArray, step, stepIndex, historyLength, maxVisible) {
    container.innerHTML = '';

    const layout = document.createElement('div');
    layout.className = 'counting-layout';

    const sourceIndex = Number.isInteger(step?.source_index) ? step.source_index : -1;
    const bucketIndex = Number.isInteger(step?.bucket_index) ? step.bucket_index : -1;
    const writeIndex = Number.isInteger(step?.write_index) ? step.write_index : -1;
    const phase = step?.phase ?? 'start';
    const buckets = normalizeCountingBuckets(step, initialArray);
    const output = normalizeCountingOutput(step);

    const source = createCountingSection('Массив', 'counting-source-section');
    renderCountingSourceRow(source.row, initialArray, sourceIndex, phase, maxVisible);

    const bucketsSection = createCountingSection('Корзины', 'counting-buckets-section');
    renderCountingBucketsRow(bucketsSection.row, buckets, bucketIndex, phase, maxVisible);

    const outputSection = createCountingSection('Отсортированный массив', 'counting-output-section');
    renderCountingOutputRow(outputSection.row, initialArray.length, output, writeIndex, phase, maxVisible);

    layout.appendChild(source.section);
    layout.appendChild(bucketsSection.section);
    layout.appendChild(outputSection.section);
    container.appendChild(layout);

    return formatCountingStatus(step, stepIndex, historyLength, initialArray.length, maxVisible);
}

export function renderSortingCells(
    container,
    data,
    compare_a,
    compare_b,
    sortedCount,
    speed,
    direction = 'end',
    maxVisible = data.length
) {
    container.innerHTML = '';
    if (direction === 'counting') {
        const previewStep = createCountingPreviewStep(data);
        updateCountingStep(container, data, previewStep, 0, 1, maxVisible);
        return;
    }

    const visibleData = data.slice(0, maxVisible);
    const safeSortedCount = sortedCount ?? 0;

    visibleData.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, safeSortedCount, i, direction)}`;
        applyCellValue(cell, val);
        cell.style.transition = `all ${speed}ms ease`;
        container.appendChild(cell);
    });
}

export function updateSortingStep(
    container,
    history,
    initialArray,
    stepIndex,
    speed,
    direction = 'end',
    maxVisible = initialArray.length
) {
    const step = history[stepIndex];
    if (!step) return 'Нет шага';

    if (isBogoStep(step)) {
        return updateBogoStep(container, initialArray, step, stepIndex, history.length, speed, maxVisible);
    }

    if (direction === 'insertion' || isInsertionStep(step)) {
        return updateInsertionStep(container, history, initialArray, stepIndex, speed, maxVisible);
    }
    if (direction === 'counting' || isCountingStep(step)) {
        return updateCountingStep(container, initialArray, step, stepIndex, history.length, maxVisible);
    }
    return updateSwapStep(container, history, initialArray, step, stepIndex, speed, direction, maxVisible);
}

function reconstructArray(initial, history, upTo) {
    const step = history[upTo];
    if (isBogoStep(step)) {
        const indexes = normalizeBogoIndexes(step.indexes, initial.length);
        return indexes.map((sourceIndex) => initial[sourceIndex]);
    }

    const data = [...initial];
    for (let i = 1; i <= upTo; i++) {
        const currentStep = history[i];
        if (isInsertionStep(currentStep)) {
            const from = Number(currentStep.compare_a);
            const to = Number(currentStep.compare_b);
            if (!Number.isInteger(to) || to < 0 || to >= data.length) continue;

            if (currentStep.is_shift) {
                const shiftedValue =
                    Number.isInteger(from) && from >= 0 && from < data.length
                        ? data[from]
                        : currentStep.value;
                data[to] = shiftedValue;
            } else {
                data[to] = currentStep.value;
            }
            continue;
        }

        if (currentStep.is_swap) {
            [data[currentStep.compare_a], data[currentStep.compare_b]] =
                [data[currentStep.compare_b], data[currentStep.compare_a]];
        }
    }
    return data;
}

export function formatStatus(data, step, idx, total, sourceLength = data.length) {
    const previewSuffix = sourceLength > data.length
        ? ` (показаны первые ${data.length} из ${sourceLength})`
        : '';

    if (isBogoStep(step)) {
        if (idx === 0) {
            return `Старт: [${data.join(', ')}]${previewSuffix}`;
        }
        if (step.is_sorted) {
            return `✅ Готово после ${idx} перемешиваний: [${data.join(', ')}]${previewSuffix}`;
        }
        if (idx === total - 1) {
            return `❌ Лимит перемешиваний достигнут, порядок не найден${previewSuffix}`;
        }
        return `❌ Перемешивание ${idx}: пока не отсортировано${previewSuffix}`;
    }

    if (isInsertionStep(step)) {
        if (step.is_shift) {
            return `↪ Сдвиг: ${step.value} из ${step.compare_a} в ${step.compare_b}${previewSuffix}`;
        }
        return `📌 Вставка: ${step.value} в позицию ${step.compare_b}${previewSuffix}`;
    }

    if (isCountingStep(step)) {
        return formatCountingStatus(step, idx, total, sourceLength, data.length);
    }

    if (idx === 0) {
        return `Старт: [${data.join(', ')}]${previewSuffix}`;
    } else if (idx === total - 1) {
        return `✅ Готово: [${data.join(', ')}]${previewSuffix}`;
    } else if (step.is_swap) {
        return `🔄 Обмен: ${step.compare_a} ↔ ${step.compare_b}`;
    } else {
        return `🔍 Сравнение: ${step.compare_a} и ${step.compare_b}`;
    }
}
