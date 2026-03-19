export function getCellColor(len, fst, snd, sortedCount, idx, direction = 'end') {
    if (sortedCount >= len) return 'green';
    if (idx === fst || idx === snd) return 'red';

    if (sortedCount > 0) {
        if (direction === 'end') {
            if (idx >= len - sortedCount) return 'green';
        } else {
            if (idx < sortedCount) return 'green';
        }
    }
    return 'blue';
}

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

export function updateSortingStep(container, history, initialArray, stepIndex, speed, direction = 'end') {
    const step = history[stepIndex];
    const data = reconstructArray(initialArray, history, stepIndex);
    const { fst, snd, sorted: sortedCount } = step;

    const cells = container.querySelectorAll('.cell');
    if (cells.length === 0) {
        renderSortingCells(container, data, fst, snd, sortedCount, speed, direction);
        return formatStatus(data, step, stepIndex, history.length);
    }

    data.forEach((val, i) => {
        const cell = cells[i];
        if (!cell) return;
        cell.textContent = val;
        cell.className = `cell ${getCellColor(data.length, fst, snd, sortedCount, i, direction)}`;

        if (i === fst || i === snd) {
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
            [data[history[i].fst], data[history[i].snd]] =
                [data[history[i].snd], data[history[i].fst]];
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
        return `🔄 Обмен: ${step.fst} ↔ ${step.snd}`;
    } else {
        return `🔍 Сравнение: ${step.fst} и ${step.snd}`;
    }
}
