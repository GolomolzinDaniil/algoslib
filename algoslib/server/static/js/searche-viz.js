const DEFAULT_MAX_VISIBLE_ITEMS = 15;

function toSafeIndexList(raw, upperBound) {
    if (!Array.isArray(raw)) return [];
    const seen = new Set();
    const normalized = [];

    for (const item of raw) {
        const idx = Number(item);
        if (!Number.isInteger(idx) || idx < 0 || idx >= upperBound || seen.has(idx)) continue;
        seen.add(idx);
        normalized.push(idx);
    }
    return normalized;
}

function getCellColor(index, currentSet, _checkedUntil, foundSet) {
    if (currentSet.has(index)) return 'red';
    if (foundSet.has(index)) return 'green';
    return 'blue';
}

export function renderSearchCells(
    container,
    data,
    currentIndex = -1,
    foundIndexes = [],
    checkedUntil = -1,
    maxVisible = DEFAULT_MAX_VISIBLE_ITEMS
) {
    if (!container) return;
    container.innerHTML = '';

    const visible = Array.isArray(data) ? data.slice(0, maxVisible) : [];
    const foundSet = new Set(toSafeIndexList(foundIndexes, visible.length));
    const currentIndexes = Array.isArray(currentIndex)
        ? toSafeIndexList(currentIndex, visible.length)
        : toSafeIndexList([currentIndex], visible.length);
    const currentSet = new Set(currentIndexes);

    visible.forEach((value, idx) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(idx, currentSet, checkedUntil, foundSet)}`;
        cell.textContent = String(value);
        container.appendChild(cell);
    });
}

export function updateSearchStep(
    container,
    steps,
    data,
    stepIndex,
    maxVisible = DEFAULT_MAX_VISIBLE_ITEMS
) {
    const safeData = Array.isArray(data) ? data : [];
    const safeSteps = Array.isArray(steps) ? steps : [];

    if (safeData.length === 0) {
        if (container) container.innerHTML = '';
        return 'Массив пуст, поиск выполнять не по чему';
    }

    const step = safeSteps[stepIndex] || {};
    const currentIndicesRaw = Array.isArray(step.current_indices)
        ? step.current_indices
        : [step.current_index];
    const currentIndices = toSafeIndexList(currentIndicesRaw, safeData.length);
    const currentIndex = currentIndices.length > 0 ? currentIndices[0] : -1;
    const checkedUntil = Number.isInteger(step.checked_until)
        ? step.checked_until
        : (currentIndices.length > 0 ? currentIndices[currentIndices.length - 1] : -1);
    const foundIndexes = toSafeIndexList(step.found_indices, safeData.length);
    const visibleFound = foundIndexes.filter((idx) => idx < maxVisible);

    renderSearchCells(container, safeData, currentIndices, visibleFound, checkedUntil, maxVisible);

    const currentValues = currentIndices
        .filter((idx) => idx >= 0 && idx < safeData.length)
        .map((idx) => safeData[idx]);
    const matchLabel = step.is_match ? 'совпадение найдено' : 'совпадения нет';
    const stepLabel = `Шаг ${Math.min(stepIndex + 1, Math.max(1, safeSteps.length))} / ${Math.max(1, safeSteps.length)}`;
    let inspectLabel = 'ожидание шага';
    if (currentIndices.length === 0 && visibleFound.length > 0) {
        inspectLabel = `результат: индекс(ы) ${visibleFound.join(', ')}`;
    } else if (currentIndices.length === 1) {
        inspectLabel = `проверяем индекс ${currentIndices[0]} (значение ${currentValues[0]})`;
    } else if (currentIndices.length > 1) {
        inspectLabel = `проверяем индексы ${currentIndices.join(' и ')} (значения ${currentValues.join(' и ')})`;
    }
    return `${stepLabel} | ${inspectLabel} | ${matchLabel}`;
}
