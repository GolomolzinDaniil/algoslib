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

function getCellColor(index, currentIndex, _checkedUntil, foundSet) {
    if (index === currentIndex) return 'red';
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

    visible.forEach((value, idx) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(idx, currentIndex, checkedUntil, foundSet)}`;
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
    const currentIndex = Number.isInteger(step.current_index) ? step.current_index : -1;
    const checkedUntil = Number.isInteger(step.checked_until) ? step.checked_until : currentIndex;
    const foundIndexes = toSafeIndexList(step.found_indices, safeData.length);
    const visibleFound = foundIndexes.filter((idx) => idx < maxVisible);

    renderSearchCells(container, safeData, currentIndex, visibleFound, checkedUntil, maxVisible);

    const currentValue =
        currentIndex >= 0 && currentIndex < safeData.length ? safeData[currentIndex] : undefined;
    const matchLabel = step.is_match ? 'совпадение найдено' : 'совпадения нет';
    const stepLabel = `Шаг ${Math.min(stepIndex + 1, Math.max(1, safeSteps.length))} / ${Math.max(1, safeSteps.length)}`;
    const inspectLabel =
        currentIndex >= 0
            ? `проверяем индекс ${currentIndex} (значение ${currentValue})`
            : 'ожидание шага';
    return `${stepLabel} | ${inspectLabel} | ${matchLabel}`;
}
