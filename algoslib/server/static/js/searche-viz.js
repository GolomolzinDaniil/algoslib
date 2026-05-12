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

function getCellColor(index, currentSet, foundSet, activeSet, excludedSet = new Set()) {
    if (foundSet.has(index)) return 'green';
    if (currentSet.has(index)) return 'yellow';
    if (excludedSet.has(index)) return 'red';
    if (activeSet.has(index)) return 'blue';
    return 'red';
}

function getWindowSearchCellColor(index, currentSet, foundSet, excludedSet, activeSet) {
    if (foundSet.has(index)) return 'green';
    if (currentSet.has(index)) return 'yellow';
    if (excludedSet.has(index)) return 'red';
    if (activeSet.has(index)) return 'blue';
    return 'blue';
}

export function renderSearchCells(
    container,
    data,
    currentIndex = -1,
    foundIndexes = [],
    checkedUntil = -1,
    activeIndexes = [],
    excludedIndexes = []
) {
    if (!container) return;
    container.innerHTML = '';

    const safeData = Array.isArray(data) ? data : [];
    const foundSet = new Set(toSafeIndexList(foundIndexes, safeData.length));
    const currentIndexes = Array.isArray(currentIndex)
        ? toSafeIndexList(currentIndex, safeData.length)
        : toSafeIndexList([currentIndex], safeData.length);
    const currentSet = new Set(currentIndexes);
    const activeSet = new Set(toSafeIndexList(activeIndexes, safeData.length));
    const excludedSet = new Set(toSafeIndexList(excludedIndexes, safeData.length));

    safeData.forEach((value, idx) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getCellColor(idx, currentSet, foundSet, activeSet, excludedSet)}`;
        cell.textContent = String(value);
        container.appendChild(cell);
    });
}

function renderWindowSearchCells(container, data, step, currentIndexes, foundIndexes) {
    if (!container) return;
    container.innerHTML = '';

    const safeData = Array.isArray(data) ? data : [];
    const foundSet = new Set(toSafeIndexList(foundIndexes, safeData.length));
    const currentSet = new Set(toSafeIndexList(currentIndexes, safeData.length));
    const excludedSet = new Set(toSafeIndexList(step.excluded_indices, safeData.length));
    const activeSet = new Set(toSafeIndexList(step.active_indices, safeData.length));

    safeData.forEach((value, idx) => {
        const cell = document.createElement('div');
        cell.className = `cell ${getWindowSearchCellColor(
            idx,
            currentSet,
            foundSet,
            excludedSet,
            activeSet
        )}`;
        cell.textContent = String(value);
        container.appendChild(cell);
    });
}

export function updateSearchStep(
    container,
    steps,
    data,
    stepIndex
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
    const activeIndexes = toSafeIndexList(step.active_indices, safeData.length);
    const excludedIndexes = toSafeIndexList(step.excluded_indices, safeData.length);

    if (step.history_mode === 'fibonacci' || step.history_mode === 'binary') {
        renderWindowSearchCells(container, safeData, step, currentIndices, foundIndexes);
    } else {
        renderSearchCells(container, safeData, currentIndices, foundIndexes, checkedUntil, activeIndexes, excludedIndexes);
    }

    const currentValues = currentIndices
        .filter((idx) => idx >= 0 && idx < safeData.length)
        .map((idx) => safeData[idx]);
    const matchLabel = step.is_initial_state
        ? 'ожидание запуска'
        : (step.is_match ? 'совпадение найдено' : 'совпадения нет');
    const stepLabel = step.is_initial_state
        ? 'Старт'
        : `Шаг ${Math.min(stepIndex + 1, Math.max(1, safeSteps.length))} / ${Math.max(1, safeSteps.length)}`;
    let inspectLabel = 'ожидание шага';
    if (step.is_initial_state) {
        inspectLabel = 'все элементы пока не просмотрены';
    } else if (currentIndices.length === 0 && foundIndexes.length > 0) {
        inspectLabel = `результат: индекс ${foundIndexes.join(', ')}`;
    } else if (
        currentIndices.length === 1 &&
        Number.isInteger(step.left_index) &&
        Number.isInteger(step.right_index)
    ) {
        const idx = currentIndices[0];
        const comparedValue = step.compared_value ?? safeData[idx];
        const targetValue = step.target_value ?? '?';
        const pivotLabel = step.history_mode === 'fibonacci' ? 'pred' : 'mid';
        inspectLabel =
            `диапазон [${step.left_index}, ${step.right_index}], ` +
            `${pivotLabel}=${idx} (значение ${comparedValue}), цель ${targetValue}`;
    } else if (currentIndices.length === 1) {
        inspectLabel = `проверяем индекс ${currentIndices[0]} (значение ${currentValues[0]})`;
    } else if (currentIndices.length > 1) {
        inspectLabel = `проверяем индексы ${currentIndices.join(' и ')} (значения ${currentValues.join(' и ')})`;
    }
    return `${stepLabel} | ${inspectLabel} | ${matchLabel}`;
}
