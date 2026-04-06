export function getCellColor(len, compare_a, compare_b, sortedCount, idx, direction = 'end') {
    if (sortedCount >= len) return 'green';
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
