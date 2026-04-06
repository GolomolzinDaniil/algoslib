export function getCellColor(len, compare_a, compare_b, sortedCount, idx, direction = 'end') {
    if (sortedCount >= len) return 'green';
    if (direction === 'start' && idx === compare_b) return 'yellow';
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

    const data = reconstructArray(initialArray, history, stepIndex);
    const { compare_a, compare_b, sorted_num: sortedCount } = step;
    const visibleData = data.slice(0, maxVisible);
    const safeSortedCount = sortedCount ?? 0;

    const cells = container.querySelectorAll('.cell');
    if (cells.length !== visibleData.length) {
        renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed, direction, maxVisible);
        return formatStatus(visibleData, step, stepIndex, history.length, data.length);
    }

    visibleData.forEach((val, i) => {
        const cell = cells[i];
        if (!cell) return;
        applyCellValue(cell, val);
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, safeSortedCount, i, direction)}`;

        if (i === compare_a || i === compare_b) {
            cell.style.transform = 'scale(1.1)';
            setTimeout(() => { cell.style.transform = 'scale(1)'; }, speed);
        }
    });

    return formatStatus(visibleData, step, stepIndex, history.length, data.length);
}

function reconstructArray(initial, history, upTo) {
    const step = history[upTo];
    if (isBogoStep(step)) {
        const indexes = normalizeBogoIndexes(step.indexes, initial.length);
        return indexes.map((sourceIndex) => initial[sourceIndex]);
    }

    const data = [...initial];
    for (let i = 1; i <= upTo; i++) {
        if (history[i].is_swap) {
            [data[history[i].compare_a], data[history[i].compare_b]] =
                [data[history[i].compare_b], data[history[i].compare_a]];
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
