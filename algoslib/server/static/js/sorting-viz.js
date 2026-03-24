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

export function renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed, direction = 'end') {
    container.innerHTML = '';
    data.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, sortedCount, i, direction)}`;
        cell.textContent = val;
        cell.style.transition = `all ${speed}ms ease`;
        container.appendChild(cell);
    });
}

export function updateSortingStep(container, history, initialArray, stepIndex, speed, direction = 'end') {
    const step = history[stepIndex];
    const data = reconstructArray(initialArray, history, stepIndex);
    const { compare_a, compare_b, sorted_num: sortedCount } = step;

    const cells = container.querySelectorAll('.cell');
    if (cells.length === 0) {
        renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed, direction);
        return formatStatus(data, step, stepIndex, history.length);
    }

    data.forEach((val, i) => {
        const cell = cells[i];
        if (!cell) return;
        cell.textContent = val;
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
