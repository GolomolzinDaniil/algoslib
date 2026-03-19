export function renderSortingCells(container, data, fst, snd, sortedCount, speed, direction = 'end') {
    container.innerHTML = '';
    data.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(data.length, fst, snd, sortedCount, i, direction)}`;
        cell.textContent = val;
        cell.style.transition = `all ${speed}ms ease`;
        container.appendChild(cell);
    });
}

export function updateSortingStep(container, history, initialArray, stepIndex, speed) {
    const step = history[stepIndex];
    const data = reconstructArray(initialArray, history, stepIndex);
    const { fst, snd, sorted: sortedCount } = step;

    const cells = container.querySelectorAll('.cell');
    if (cells.length === 0) {
        renderSortingCells(container, data, fst, snd, sortedCount, speed);
        return;
    }

    data.forEach((val, i) => {
        const cell = cells[i];
        if (!cell) return;
        cell.textContent = val;
        cell.className = `cell ${getCellColor(data.length, fst, snd, sortedCount, i, step.direction || 'end')}`;
        if (i === fst || i === snd) {
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
            [data[history[i].fst], data[history[i].snd]] =
                [data[history[i].snd], data[history[i].fst]];
        }
    }
    return data;
}

function getCellColor(len, fst, snd, sortedCount, idx, direction = 'end') {
    if (sortedCount >= len) return 'green';
    if (idx === fst || idx === snd) return 'red';

    if (direction === 'end') {
        if (sortedCount > 0 && idx >= len - sortedCount) return 'green';
    } else {
        if (sortedCount > 0 && idx < sortedCount) return 'green';
    }
    return 'blue';
}

function formatStatus(data, step, idx, total) {
    let msg;
    if (idx === 0) {
        msg = `Старт: [${data.join(', ')}]`;
    } else if (idx === total - 1) {
        msg = `Готово: [${data.join(', ')}]`;
    } else if (step.is_swap) {
        msg = `Шаг ${idx}/${total - 1} — Обмен: позиции ${step.fst} и ${step.snd}`;
    } else {
        msg = `Шаг ${idx}/${total - 1} — Сравнение: позиции ${step.fst} и ${step.snd}`;
    }
    return msg;
}
