export function renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed) {
    container.innerHTML = '';
    data.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, sortedCount, i)}`;
        cell.textContent = val;
        cell.style.transition = `all ${speed}ms ease`;
        container.appendChild(cell);
    });
}

export function updateSortingStep(container, history, initialArray, stepIndex, speed) {
    const step = history[stepIndex];
    const data = reconstructArray(initialArray, history, stepIndex);
    const { compare_a, compare_b, sorted_num: sortedCount } = step;

    const cells = container.querySelectorAll('.cell');
    if (cells.length === 0) {
        renderSortingCells(container, data, compare_a, compare_b, sortedCount, speed);
        return;
    }

    data.forEach((val, i) => {
        const cell = cells[i];
        if (!cell) return;
        cell.textContent = val;
        cell.className = `cell ${getCellColor(data.length, compare_a, compare_b, sortedCount, i)}`;
        if (i === compare_a || i === compare_b) {
            cell.style.transform = 'scale(1.15)';
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

function getCellColor(len, compare_a, compare_b, sortedCount, idx) {
    if (sortedCount >= len) return 'green';
    if (idx === compare_a || idx === compare_b) return 'red';
    if (sortedCount > 0 && idx >= len - sortedCount) return 'green';
    return 'blue';
}

function formatStatus(data, step, idx, total) {
    let msg;
    if (idx === 0) {
        msg = `Старт: [${data.join(', ')}]`;
    } else if (idx === total - 1) {
        msg = `Готово: [${data.join(', ')}]`;
    } else if (step.is_swap) {
        msg = `Шаг ${idx}/${total - 1} — Обмен: позиции ${step.compare_a} и ${step.compare_b}`;
    } else {
        msg = `Шаг ${idx}/${total - 1} — Сравнение: позиции ${step.compare_a} и ${step.compare_b}`;
    }
    return msg;
}
