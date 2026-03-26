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

function getIntegerDigitCount(value) {
    if (!Number.isFinite(value)) return 1;
    const absValue = Math.abs(value);
    if (absValue < 1) return 1;
    return Math.floor(absValue).toString().length;
}

function getCellFontSize(value) {
    const integerDigits = getIntegerDigitCount(value);
    if (integerDigits < SCALE_FROM_DIGITS) {
        return `${DEFAULT_CELL_FONT_SIZE}px`;
    }

    const text = String(value);
    const estimatedFitSize = Math.floor(72 / Math.max(text.length, 1));
    const fontSize = Math.max(
        MIN_CELL_FONT_SIZE,
        Math.min(DEFAULT_CELL_FONT_SIZE, estimatedFitSize)
    );

    return `${fontSize}px`;
}

function applyCellValue(cell, value) {
    cell.textContent = value;
    cell.style.fontSize = getCellFontSize(Number(value));
}

export function renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed, direction = 'end') {
    container.innerHTML = '';
    data.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, sortedCount, i, direction)}`;
        applyCellValue(cell, val);
        cell.style.transition = `all ${speed}ms ease`;
        container.appendChild(cell);
    });
}

export function updateSortingStep(container, history, initialArray, stepIndex, speed, direction = 'end') {
    const step = history[stepIndex];
    const data = reconstructArray(initialArray, history, stepIndex);
    const { compare_a, compare_b, sorted_num: sortedCount } = step;

    const cells = container.querySelectorAll('.cell');
    if (cells.length !== data.length) {
        renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed, direction);
        return formatStatus(data, step, stepIndex, history.length);
    }

    data.forEach((val, i) => {
        const cell = cells[i];
        if (!cell) return;
        applyCellValue(cell, val);
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, sortedCount, i, direction)}`;

        if (i === compare_a || i === compare_b) {
            cell.style.transform = 'scale(1.1)';
            setTimeout(() => { cell.style.transform = 'scale(1)'; }, speed);
        }
    });

    return formatStatus(data, step, stepIndex, history.length);
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

export function formatStatus(data, step, idx, total) {
    if (idx === 0) {
        return `Старт: [${data.join(', ')}]`;
    } else if (idx === total - 1) {
        return `✅ Готово: [${data.join(', ')}]`;
    } else if (step.is_swap) {
        return `🔄 Обмен: ${step.compare_a} ↔ ${step.compare_b}`;
    } else {
        return `🔍 Сравнение: ${step.compare_a} и ${step.compare_b}`;
    }
}
