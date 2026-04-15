import { renderSortingCells, updateSortingStep } from './sorting-viz.js';
import { renderGraph, updateGraphStep, setSpacing, renderFlowGraph, updateFlowGraphStep } from './graph-viz.js';
import { renderSearchCells, updateSearchStep } from './searche-viz.js';

const SORTING_META = {
    bubble: {
        title: "Bubble Sort",
        desc: "Последовательно сравнивает соседние элементы и меняет их местами",
        time: "Время: O(n²)",
        memory: "Память: О(1)",
        direction: "end"
    },
    selection: {
        title: "Selection Sort",
        desc: "Находит минимум и помещает его в начало неотсортированной части",
        time: "Время: O(n²)",
        memory: "Память: О(1)",
        direction: "start"
    },
    gnome: {
        title: "Gnome Sort",
        desc: "Сравнивает соседние элементы и меняет их местами, двигаясь назад при необходимости",
        time: "Время: O(n²)",
        memory: "Память: О(1)",
        direction: "end"
    },
    bogo: {
        title: "Bogo Sort",
        desc: "Случайно перемешивает индексы до момента, когда порядок элементов становится отсортированным",
        time: "Время: O((n + 1)!) в среднем",
        memory: "Память: О(n)",
        direction: "bogo"
    },
    quick: {
        title: "Quick Sort",
        desc: "Выбирает опорный элемент и делит массив на части, рекурсивно сортируя их",
        time: "Время: O(n log n) в среднем, O(n²) в худшем",
        memory: "Память: О(log n)",
        direction: "quick"
    },
    insertion: {
        title: "Insertion Sort",
        desc: "Сдвигает элементы вправо и вставляет текущий элемент в подходящую позицию",
        time: "Время: O(n²)",
        memory: "Память: О(1)",
        direction: "insertion"
    },
    counting: {
        title: "Counting Sort",
        desc: "Подсчитывает количество вхождений каждого значения и затем собирает отсортированный массив",
        time: "Время: O(n + k)",
        memory: "Память: О(k)",
        direction: "counting"
    }
};
const MAX_SORT_ITEMS = 15;
const MAX_SORT_VISUAL_ITEMS = 15;
const MAX_SEARCH_ITEMS = 15;
const MAX_SEARCH_VISUAL_ITEMS = 15;

const SEARCH_META = {
    linear_searche: {
        title: "Linear Search",
        desc: "Линейно проходит по массиву и сравнивает каждый элемент с искомым значением",
        time: "Время: O(n)",
        memory: "Память: О(1)",
    },
};

document.addEventListener('DOMContentLoaded', () => {
    initSortingPage();
    initSearchPage();
    if (window.lucide) setTimeout(() => lucide.createIcons(), 100);
});

function initSortingPage() {
    const header = document.getElementById('sort-header');
    if (header) {
        header.style.display = 'block';
        document.getElementById('sort-title').textContent = 'Сортировки';
        document.getElementById('sort-desc').textContent = 'Выберите алгоритм и введите массив';
        document.getElementById('sort-time').textContent = '';
        document.getElementById('sort-memory').textContent = '';
    }

    const algoSelect = document.getElementById('sort-algo');
    if (algoSelect) algoSelect.value = '';

    const plot = document.getElementById('sort-plot');
    if (plot) plot.innerHTML = '';

    const status = document.getElementById('sort-status');
    if (status) status.textContent = '';

    const controls = document.getElementById('sort-controls');
    if (controls) controls.style.display = 'none';

    if (sortFileInput) sortFileInput.value = '';
    uploadedSortData = null;
}

function initSearchPage() {
    const header = document.getElementById('search-header');
    if (header) {
        header.style.display = 'block';
        document.getElementById('search-title').textContent = 'Поиск';
        document.getElementById('search-desc').textContent = 'Выберите алгоритм поиска и введите данные';
        document.getElementById('search-time').textContent = '';
        document.getElementById('search-memory').textContent = '';
    }

    const algoSelect = document.getElementById('search-algo');
    if (algoSelect) algoSelect.value = '';

    const plot = document.getElementById('search-plot');
    if (plot) plot.innerHTML = '';

    const status = document.getElementById('search-status');
    if (status) status.textContent = '';

    const controls = document.getElementById('search-controls');
    if (controls) controls.style.display = 'none';

    if (searchTargetInput && searchTargetInput.value.trim() === '') {
        searchTargetInput.value = '4';
    }

    if (typeof resetSearchSession === 'function') {
        resetSearchSession();
    }
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');

        if (tab.dataset.tab === 'sorting') {
            initSortingPage();
        } else if (tab.dataset.tab === 'searches') {
            initSearchPage();
        }
    });
});

document.getElementById('sort-algo').addEventListener('change', (e) => {
    const algo = e.target.value;
    resetSortingSession();

    if (algo && SORTING_META[algo]) {
        const meta = SORTING_META[algo];
        sortPlayer.el.controls.style.display = 'flex';
        document.getElementById('sort-title').textContent = meta.title;
        document.getElementById('sort-desc').textContent = meta.desc;
        document.getElementById('sort-time').textContent = meta.time;
        document.getElementById('sort-memory').textContent = meta.memory;
        renderSortInputPreview();
    } else {
        sortPlayer.el.controls.style.display = 'none';
        document.getElementById('sort-title').textContent = 'Сортировки';
        document.getElementById('sort-desc').textContent = 'Выберите алгоритм и введите массив';
        document.getElementById('sort-time').textContent = '';
        document.getElementById('sort-memory').textContent = '';
    }
});

function createPlayer(prefix) {
    return {
        steps: [],
        current: 0,
        playing: false,
        timer: null,
        speed: parseInt(document.getElementById(`${prefix}-speed`).value),
        renderFn: null,
        el: {
            prev: document.getElementById(`${prefix}-prev`),
            play: document.getElementById(`${prefix}-play`),
            next: document.getElementById(`${prefix}-next`),
            speed: document.getElementById(`${prefix}-speed`),
            speedVal: document.getElementById(`${prefix}-speed-val`),
            controls: document.getElementById(`${prefix}-controls`),
            status: document.getElementById(`${prefix}-status`),
        },
    };
}

const sortPlayer = createPlayer('sort');
const graphPlayer = createPlayer('graph');
const searchPlayer = createPlayer('search');

let graphData = { nodes: [], edges: [], algorithm: 'bfs', nodeLabels: {}, source: null, sink: null };
let sortData = { history: [], initialArray: [], sortedArray: [] };
let searchData = {
    steps: [],
    initialArray: [],
    result: [],
    target: null,
    source: '',
};
let uploadedSortData = null;
const sortPlot = document.getElementById('sort-plot');
const sortDataInput = document.getElementById('sort-data');
const sortFileInput = document.getElementById('sort-file');
const sortFileName = document.getElementById('sort-file-name');
const sortDownloadFileBtn = document.getElementById('sort-download-file');
const searchPlot = document.getElementById('search-plot');
const searchResultIndexes = document.getElementById('search-result-indexes');
const searchDataInput = document.getElementById('search-data');
const searchTargetInput = document.getElementById('search-target');
const searchAlgoSelect = document.getElementById('search-algo');

function parseSortInput(raw) {
    return raw
        .split(/[\s,;]+/)
        .map(part => parseFloat(part.trim()))
        .filter(value => !Number.isNaN(value));
}

function setSortFileNameLabel(fileName = '') {
    if (!sortFileName) return;
    sortFileName.textContent = fileName || 'Файл не выбран';
}

function renderSortInputPreview() {
    if (!sortPlot) return;

    const data = parseSortInput(sortDataInput.value);
    if (data.length === 0) {
        sortPlot.innerHTML = '';
        return;
    }

    const algo = document.getElementById('sort-algo').value;
    const meta = SORTING_META[algo] || {};
    const direction = meta.direction || 'end';

    renderSortingCells(sortPlot, data, -1, -1, 0, sortPlayer.speed, direction, MAX_SORT_VISUAL_ITEMS);
}

function resetSortingSession() {
    stopPlayer(sortPlayer);
    sortPlayer.steps = [];
    sortPlayer.current = 0;
    sortData = { history: [], initialArray: [], sortedArray: [] };
    if (sortPlot) sortPlot.innerHTML = '';
    if (sortPlayer.el.status) sortPlayer.el.status.textContent = '';
}

function applySortingResult(result, algo) {
    sortData.history = result.history || [];
    sortData.initialArray = result.initial_array || [];
    sortData.sortedArray = Array.isArray(result.sorted_array)
        ? result.sorted_array
        : [...sortData.initialArray].sort((a, b) => a - b);
    sortPlayer.steps = sortData.history;
    sortPlayer.current = 0;

    const meta = SORTING_META[algo] || {};
    document.getElementById('sort-title').textContent = meta.title || algo;
    document.getElementById('sort-desc').textContent = meta.desc || '';
    document.getElementById('sort-time').textContent = meta.time || '';
    document.getElementById('sort-memory').textContent = meta.memory || '';
    sortPlayer.el.controls.style.display = 'flex';

    if (sortData.initialArray.length === 0 || sortData.history.length === 0) {
        sortPlot.innerHTML = '';
        sortPlayer.el.status.textContent = 'Нет данных для визуализации';
        return;
    }

    const direction = result.direction || meta.direction || 'end';
    const firstStep = sortData.history[0] || {};
    const compareA = Number.isInteger(firstStep.compare_a) ? firstStep.compare_a : -1;
    const compareB = Number.isInteger(firstStep.compare_b) ? firstStep.compare_b : -1;
    const sortedNum = Number.isInteger(firstStep.sorted_num) ? firstStep.sorted_num : 0;

    renderSortingCells(
        sortPlot,
        sortData.initialArray,
        compareA,
        compareB,
        sortedNum,
        sortPlayer.speed,
        direction,
        MAX_SORT_VISUAL_ITEMS
    );

    sortPlayer.el.status.textContent = updateSortingStep(
        sortPlot,
        sortData.history,
        sortData.initialArray,
        0,
        sortPlayer.speed,
        direction,
        MAX_SORT_VISUAL_ITEMS
    );
}

if (sortDataInput) {
    sortDataInput.addEventListener('input', (e) => {
        const input = e.target;
        uploadedSortData = null;
        const numbers = parseSortInput(input.value);
        let isClamped = false;
        if (numbers.length > MAX_SORT_ITEMS) {
            input.value = numbers.slice(0, MAX_SORT_ITEMS).join(', ');
            isClamped = true;
        }

        resetSortingSession();
        renderSortInputPreview();
        if (isClamped) {
            sortPlayer.el.status.textContent = `Можно ввести максимум ${MAX_SORT_ITEMS} чисел`;
        }
    });
}

if (sortFileInput) {
    sortFileInput.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            setSortFileNameLabel('');
            return;
        }

        setSortFileNameLabel(file.name);

        try {
            const text = await file.text();
            const numbers = parseSortInput(text);
            if (numbers.length === 0) {
                throw new Error('Файл не содержит чисел');
            }

            uploadedSortData = numbers;
            const previewNumbers = numbers.slice(0, MAX_SORT_VISUAL_ITEMS);
            sortDataInput.value = previewNumbers.join(', ');

            resetSortingSession();
            renderSortInputPreview();

            sortPlayer.el.status.textContent =
                `Файл ${file.name} загружен: ${numbers.length} чисел. На странице отображаются первые ${MAX_SORT_VISUAL_ITEMS}`;
        } catch (error) {
            uploadedSortData = null;
            sortPlayer.el.status.textContent = `Ошибка чтения файла: ${error.message}`;
        }
    });
}

if (sortDownloadFileBtn) {
    sortDownloadFileBtn.addEventListener('click', async () => {
        const algo = document.getElementById('sort-algo').value;
        if (!algo) {
            sortPlayer.el.status.textContent = 'Сначала выберите алгоритм сортировки';
            return;
        }

        sortPlayer.el.status.textContent = 'Подготовка файла...';
        try {
            const result = await loadSortingData();
            applySortingResult(result, algo);
            stopPlayer(sortPlayer);

            if (!sortData.sortedArray.length) {
                throw new Error('Не удалось получить отсортированный массив');
            }

            const fileName = `sorted_${algo}.txt`;
            const content = sortData.sortedArray.join(', ');
            const blob = new Blob([content + '\n'], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            sortPlayer.el.status.textContent = `Файл ${fileName} скачан`;
        } catch (error) {
            sortPlayer.el.status.textContent = `Ошибка: ${error.message}`;
            console.error(error);
        }
    });
}

async function loadSortingData() {
    const raw = sortDataInput.value;
    const data = Array.isArray(uploadedSortData) && uploadedSortData.length > 0
        ? [...uploadedSortData]
        : parseSortInput(raw);
    if (data.length === 0) {
        throw new Error('Введите числа через запятую');
    }

    const algo = document.getElementById('sort-algo').value;
    if (!algo) {
        throw new Error('Выберите алгоритм сортировки');
    }

    const res = await fetch(`/api/sorting/${algo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    });

    if (!res.ok) {
        let msg = res.statusText;
        try { const j = await res.json(); msg = j.detail || msg; } catch { }
        throw new Error(msg);
    }

    return await res.json();
}

sortPlayer.el.play.addEventListener('click', async () => {
    const algo = document.getElementById('sort-algo').value;

    if (sortPlayer.steps.length === 0 || !sortData.initialArray.length) {
        sortPlayer.el.status.textContent = 'Загрузка...';

        try {
            const result = await loadSortingData();
            applySortingResult(result, algo);

        } catch (e) {
            sortPlayer.el.status.textContent = `Ошибка: ${e.message}`;
            console.error(e);
            return;
        }
    }

    if (sortPlayer.playing) {
        stopPlayer(sortPlayer);
    } else {
        startPlayer(sortPlayer, renderSortStep);
    }
});

sortPlayer.el.prev.addEventListener('click', () => {
    if (sortPlayer.current > 0) {
        stopPlayer(sortPlayer);
        sortPlayer.current--;
        renderSortStep(sortPlayer.current);
    }
});

sortPlayer.el.next.addEventListener('click', () => {
    if (sortPlayer.current < sortPlayer.steps.length - 1) {
        sortPlayer.current++;
        renderSortStep(sortPlayer.current);
    } else {
        stopPlayer(sortPlayer);
    }
});

sortPlayer.el.speed.addEventListener('input', (e) => {
    sortPlayer.speed = parseInt(e.target.value);
    sortPlayer.el.speedVal.textContent = sortPlayer.speed + 'ms';
});

function renderSortStep(idx) {
    const algo = document.getElementById('sort-algo').value;
    const meta = SORTING_META[algo] || {};
    const direction = sortData.history[idx]?.direction || meta.direction || 'end';

    const msg = updateSortingStep(
        sortPlot,
        sortData.history,
        sortData.initialArray,
        idx,
        sortPlayer.speed,
        direction,
        MAX_SORT_VISUAL_ITEMS
    );
    sortPlayer.el.status.textContent = msg;
}

function parseSearchTarget(raw) {
    const value = parseFloat(String(raw ?? '').trim());
    if (Number.isNaN(value)) {
        throw new Error('Введите искомое значение');
    }
    return value;
}

function setSearchResultIndexes(indexes) {
    if (!searchResultIndexes) return;

    if (!Array.isArray(indexes) || indexes.length === 0) {
        searchResultIndexes.innerHTML = '';
        return;
    }

    const value = indexes.join(', ');
    searchResultIndexes.innerHTML =
        `<div class="search-result-chip">` +
        `<span class="search-result-label">Индексы искомого элемента:</span>` +
        `<span class="search-result-value">${value}</span>` +
        `</div>`;
}

function resetSearchSession() {
    stopPlayer(searchPlayer);
    searchPlayer.steps = [];
    searchPlayer.current = 0;
    searchData = {
        steps: [],
        initialArray: [],
        result: [],
        target: null,
        source: '',
    };
    if (searchPlot) searchPlot.innerHTML = '';
    setSearchResultIndexes([]);
    if (searchPlayer.el.status) searchPlayer.el.status.textContent = '';
}

function renderSearchInputPreview() {
    if (!searchPlot) return;
    const data = parseSortInput(searchDataInput?.value || '');
    if (data.length === 0) {
        searchPlot.innerHTML = '';
        return;
    }
    renderSearchCells(searchPlot, data, -1, [], -1, MAX_SEARCH_VISUAL_ITEMS);
}

function buildSearchSteps(data, resultIndexes) {
    const safeData = Array.isArray(data) ? data : [];
    const safeResultIndexes = Array.isArray(resultIndexes)
        ? resultIndexes
            .map((idx) => Number(idx))
            .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < safeData.length)
        : [];
    const resultSet = new Set(safeResultIndexes);
    const foundSoFar = [];
    const steps = [];

    for (let idx = 0; idx < safeData.length; idx++) {
        const isMatch = resultSet.has(idx);
        if (isMatch) foundSoFar.push(idx);
        steps.push({
            current_index: idx,
            checked_until: idx,
            found_indices: [...foundSoFar],
            is_match: isMatch,
        });
    }

    return steps;
}

function applySearchResult(apiResult, data, target) {
    const resultIndexes = Array.isArray(apiResult?.result) ? apiResult.result : [];
    const steps = buildSearchSteps(data, resultIndexes);

    searchData = {
        steps,
        initialArray: [...data],
        result: [...resultIndexes],
        target,
        source: apiResult?.source || 'python',
    };
    searchPlayer.steps = steps;
    searchPlayer.current = 0;
    searchPlayer.el.controls.style.display = 'flex';

    if (searchData.initialArray.length === 0) {
        searchPlot.innerHTML = '';
        setSearchResultIndexes([]);
        searchPlayer.el.status.textContent = 'Нет данных для визуализации';
        return;
    }

    if (searchData.steps.length === 0) {
        renderSearchCells(searchPlot, searchData.initialArray, -1, [], -1, MAX_SEARCH_VISUAL_ITEMS);
        setSearchResultIndexes([]);
        searchPlayer.el.status.textContent = 'Совпадений нет';
        return;
    }

    setSearchResultIndexes([]);

    const firstStep = searchData.steps[0];
    renderSearchCells(
        searchPlot,
        searchData.initialArray,
        firstStep.current_index,
        firstStep.found_indices,
        firstStep.checked_until,
        MAX_SEARCH_VISUAL_ITEMS
    );

    renderSearchStep(0);
}

async function loadSearchData() {
    const data = parseSortInput(searchDataInput?.value || '');
    if (data.length === 0) {
        throw new Error('Введите числа через запятую');
    }

    if (data.length > MAX_SEARCH_ITEMS) {
        throw new Error(`Можно ввести максимум ${MAX_SEARCH_ITEMS} чисел`);
    }

    const algo = searchAlgoSelect?.value;
    if (!algo) {
        throw new Error('Выберите алгоритм поиска');
    }

    const target = parseSearchTarget(searchTargetInput?.value);

    const res = await fetch(`/api/searches/${algo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, target }),
    });

    if (!res.ok) {
        let msg = res.statusText;
        try { const j = await res.json(); msg = j.detail || msg; } catch { }
        throw new Error(msg);
    }

    const payload = await res.json();
    return { payload, data, target };
}

function renderSearchStep(idx) {
    const msg = updateSearchStep(
        searchPlot,
        searchData.steps,
        searchData.initialArray,
        idx,
        MAX_SEARCH_VISUAL_ITEMS
    );
    searchPlayer.el.status.textContent = msg;

    const isLastStep = searchData.steps.length > 0 && idx >= searchData.steps.length - 1;
    if (isLastStep) {
        setSearchResultIndexes(searchData.result);
    } else {
        setSearchResultIndexes([]);
    }
}

if (searchAlgoSelect) {
    searchAlgoSelect.addEventListener('change', (e) => {
        const algo = e.target.value;
        resetSearchSession();

        if (algo && SEARCH_META[algo]) {
            const meta = SEARCH_META[algo];
            searchPlayer.el.controls.style.display = 'flex';
            document.getElementById('search-title').textContent = meta.title;
            document.getElementById('search-desc').textContent = meta.desc;
            document.getElementById('search-time').textContent = meta.time;
            document.getElementById('search-memory').textContent = meta.memory;
            renderSearchInputPreview();
        } else {
            searchPlayer.el.controls.style.display = 'none';
            document.getElementById('search-title').textContent = 'Поиск';
            document.getElementById('search-desc').textContent = 'Выберите алгоритм поиска и введите данные';
            document.getElementById('search-time').textContent = '';
            document.getElementById('search-memory').textContent = '';
        }
    });
}

if (searchDataInput) {
    searchDataInput.addEventListener('input', (e) => {
        const input = e.target;
        const numbers = parseSortInput(input.value);
        let isClamped = false;

        if (numbers.length > MAX_SEARCH_ITEMS) {
            input.value = numbers.slice(0, MAX_SEARCH_ITEMS).join(', ');
            isClamped = true;
        }

        resetSearchSession();
        renderSearchInputPreview();
        if (isClamped) {
            searchPlayer.el.status.textContent = `Можно ввести максимум ${MAX_SEARCH_ITEMS} чисел`;
        }
    });
}

if (searchTargetInput) {
    searchTargetInput.addEventListener('input', () => {
        resetSearchSession();
        renderSearchInputPreview();
    });
}

searchPlayer.el.play.addEventListener('click', async () => {
    const algo = searchAlgoSelect?.value;
    if (!algo) {
        searchPlayer.el.status.textContent = 'Выберите алгоритм поиска';
        return;
    }

    if (searchPlayer.steps.length === 0 || !searchData.initialArray.length) {
        searchPlayer.el.status.textContent = 'Загрузка...';
        try {
            const { payload, data, target } = await loadSearchData();
            applySearchResult(payload, data, target);
        } catch (e) {
            searchPlayer.el.status.textContent = `Ошибка: ${e.message}`;
            console.error(e);
            return;
        }
    }

    if (searchPlayer.playing) {
        stopPlayer(searchPlayer);
    } else {
        startPlayer(searchPlayer, renderSearchStep);
    }
});

searchPlayer.el.prev.addEventListener('click', () => {
    if (searchPlayer.current > 0) {
        stopPlayer(searchPlayer);
        searchPlayer.current--;
        renderSearchStep(searchPlayer.current);
    }
});

searchPlayer.el.next.addEventListener('click', () => {
    if (searchPlayer.current < searchPlayer.steps.length - 1) {
        searchPlayer.current++;
        renderSearchStep(searchPlayer.current);
    } else {
        stopPlayer(searchPlayer);
    }
});

searchPlayer.el.speed.addEventListener('input', (e) => {
    searchPlayer.speed = parseInt(e.target.value);
    searchPlayer.el.speedVal.textContent = searchPlayer.speed + 'ms';
});

const graphSvg = document.getElementById('graph-svg');
const graphInfo = document.getElementById('graph-info');

const spacingSlider = document.getElementById('graph-spacing');
const spacingVal   = document.getElementById('graph-spacing-val');
spacingSlider.addEventListener('input', () => {
    spacingVal.textContent = spacingSlider.value;
    setSpacing(Number(spacingSlider.value));
    if (graphData) {
        const algo = graphData.algorithm;
        if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
            renderFlowGraph(graphSvg, graphData.nodes, graphData.edges, graphData.source, graphData.sink);
            if (graphPlayer.steps.length) renderFlowStepAt(graphPlayer.current);
        } else {
            const weighted = algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal';
            renderGraph(graphSvg, graphData.nodes, graphData.edges, weighted, graphData.nodeLabels);
            if (graphPlayer.steps.length) renderGraphStepAt(graphPlayer.current);
        }
    }
});

document.getElementById('graph-algo').addEventListener('change', (e) => {
    const label = document.getElementById('edges-label');
    const sourceLabel = document.getElementById('source-label');
    const sinkField = document.getElementById('sink-field');
    const algo = e.target.value;
    if (algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal') {
        label.textContent = 'Рёбра (по одному на строке: A B вес):';
        if (sourceLabel) sourceLabel.textContent = 'Стартовая вершина:';
        if (sinkField) sinkField.style.display = 'none';
    } else if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
        label.textContent = 'Рёбра (A B пропускная_способность):';
        if (sourceLabel) sourceLabel.textContent = 'Источник (source):';
        if (sinkField) sinkField.style.display = 'block';
    } else {
        label.textContent = 'Рёбра (по одному на строке: A B):';
        if (sourceLabel) sourceLabel.textContent = 'Начальная вершина:';
        if (sinkField) sinkField.style.display = 'none';
    }

    const startInput = document.getElementById('graph-start');
    if (algo === 'kruskal') {
        startInput.disabled = true;
        startInput.placeholder = 'Не требуется';
    } else {
        startInput.disabled = false;
        startInput.placeholder = 'A';
    }
});

document.getElementById('graph-example').addEventListener('click', () => {
    const algo = document.getElementById('graph-algo').value;
    if (algo === 'dijkstra') {
        document.getElementById('graph-edges').value = 'A B 4\nA C 1\nB D 1\nC B 2\nC D 5\nD E 3';
        document.getElementById('graph-start').value = 'A';
    } else if (algo === 'bellman_ford') {
        document.getElementById('graph-edges').value = 'A B 4\nA C 5\nB C -3\nC D 2\nD B 1';
        document.getElementById('graph-start').value = 'A';
    } else if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
        document.getElementById('graph-edges').value = 'A B 10\nA C 10\nB C 2\nB D 4\nC E 9\nD C 4\nD F 10\nE D 6\nE F 10';
        document.getElementById('graph-start').value = 'A';
        const sinkInput = document.getElementById('graph-sink');
        if (sinkInput) sinkInput.value = 'F';
    } else if (algo === 'kruskal') {
        document.getElementById('graph-edges').value = 'A B 4\nA C 2\nB C 1\nB D 5\nC D 8\nC E 10\nD E 2\nD F 6\nE F 3';
        document.getElementById('graph-start').value = '';
    } else {
        document.getElementById('graph-edges').value = 'A B\nA C\nB D\nC D\nD E\nE F\nC F';
        document.getElementById('graph-start').value = 'A';
    }
});

function updateGraphEdgesLabelEnhanced(algo) {
    const label = document.getElementById('edges-label');
    if (algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal') {
        label.textContent = 'Рёбра (по одному на строке: A B вес):';
    } else if (algo === 'ford_fulkerson') {
        label.textContent = 'Рёбра (A B пропускная_способность):';
    } else {
        label.textContent = 'Рёбра (по одному на строке: A B):';
    }
}

updateGraphEdgesLabelEnhanced(document.getElementById('graph-algo').value);
document.getElementById('graph-algo').addEventListener('change', (e) => {
    updateGraphEdgesLabelEnhanced(e.target.value);
});

document.getElementById('graph-run').addEventListener('click', async () => {
    const algo = document.getElementById('graph-algo').value;
    const startNode = document.getElementById('graph-start').value.trim();
    const rawEdges = document.getElementById('graph-edges').value.trim();

    if (!rawEdges) {
        graphPlayer.el.status.textContent = 'Введите рёбра';
        return;
    }

    if (!startNode && algo !== 'kruskal' && algo !== 'ford_fulkerson') {
        graphPlayer.el.status.textContent = 'Введите стартовую ноду';
        return;
    }

    const sinkNode = algo === 'ford_fulkerson' || algo === 'edmonds_karp' 
        ? document.getElementById('graph-sink')?.value.trim() 
        : null;

    if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
        if (!sinkNode) {
            graphPlayer.el.status.textContent = 'Введите сток (sink)';
            return;
        }
    }

    const edges = [];
    for (const line of rawEdges.split('\n')) {
        const parts = line.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 0) continue;
        const [from, to] = parts;
        if ((from && from.length > 3) || (to && to.length > 3) || (startNode && startNode.length > 3)) {
            graphPlayer.el.status.textContent = 'Название ноды должно быть не длиннее 3 символов';
            return;
        }
        if (algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal' || 
            algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
            if (parts.length >= 3) edges.push([parts[0], parts[1], parts[2]]);
        } else if (parts.length >= 2) {
            edges.push([parts[0], parts[1]]);
        }
    }

    if (edges.length === 0) {
        graphPlayer.el.status.textContent = 'Не удалось распознать рёбра';
        return;
    }

    graphPlayer.el.status.textContent = 'Загрузка...';

    try {
        const reqBody = algo === 'kruskal'
            ? { edges }
            : algo === 'ford_fulkerson' || algo === 'edmonds_karp'
                ? { edges, start_node: startNode, sink: sinkNode }
                : { edges, start_node: startNode };
                
        const res = await fetch(`/api/graphs/${algo}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody),
        });
        if (!res.ok) {
            let msg = res.statusText;
            try { const j = await res.json(); msg = j.detail || msg; } catch { }
            throw new Error(msg);
        }
        const result = await res.json();

        graphData = {
            nodes: result.nodes,
            edges: result.edges,
            algorithm: algo,
            nodeLabels: result.node_labels || {},
            source: result.source,
            sink: result.sink,  
        };
        graphPlayer.steps = result.steps;
        graphPlayer.current = 0;
        stopPlayer(graphPlayer);

        graphPlayer.el.controls.style.display = 'flex';
        graphInfo.style.display = 'block';
        if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
            graphPlayer.renderFn = renderFlowStepAt;
            renderFlowGraph(graphSvg, graphData.nodes, graphData.edges, graphData.source, graphData.sink, graphData.nodeLabels);
            renderFlowStepAt(0);
        } else {
            graphPlayer.renderFn = renderGraphStepAt;
            const weighted = algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal';
            renderGraph(graphSvg, graphData.nodes, graphData.edges, weighted, graphData.nodeLabels);
            renderGraphStepAt(0);
        }
    } catch (e) {
        graphPlayer.el.status.textContent = `Ошибка: ${e.message}`;
        console.error('Graph run error:', e);
    }
});
function renderGraphStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateGraphStep(
        graphSvg,
        graphData.nodes,
        graphData.edges,
        step,
        graphData.algorithm,
        graphData.nodeLabels
    );
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = `Шаг ${idx + 1} / ${graphPlayer.steps.length}`;
}
function renderFlowStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateFlowGraphStep(
        graphSvg,
        graphData.nodes,
        graphData.edges,
        step,
        graphData.source,
        graphData.sink,
        graphData.nodeLabels
    );
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = `Итерация ${step.iteration} / ${graphPlayer.steps.length}`;
}

function refreshIcons() {
    if (window.lucide) lucide.createIcons();
}

function stopPlayer(player) {
    player.playing = false;
    clearTimeout(player.timer);
    player.el.play.innerHTML = '<i data-lucide="play"></i> <span>Старт</span>';
    player.el.play.classList.add('primary');
    refreshIcons();
}

function startPlayer(player, renderFn) {
    if (player.current >= player.steps.length - 1) player.current = 0;
    player.playing = true;
    player.el.play.innerHTML = '<i data-lucide="pause"></i> <span>Пауза</span>';
    player.el.play.classList.remove('primary');
    refreshIcons();

    function loop() {
        if (!player.playing || player.current >= player.steps.length - 1) {
            stopPlayer(player);
            return;
        }
        player.current++;
        (player.renderFn || renderFn)(player.current);
        player.timer = setTimeout(loop, player.speed);
    }
    loop();
}

function wireControls(player, renderFn) {
    player.renderFn = renderFn;
    player.el.prev.addEventListener('click', () => {
        if (player.current > 0) {
            stopPlayer(player);
            player.current--;
            player.renderFn(player.current);
        }
    });
    player.el.next.addEventListener('click', () => {
        if (player.current < player.steps.length - 1) {
            player.current++;
            player.renderFn(player.current);
        } else {
            stopPlayer(player);
        }
    });
    player.el.play.addEventListener('click', () => {
        if (player.playing) stopPlayer(player);
        else startPlayer(player, player.renderFn);
    });
    player.el.speed.addEventListener('input', (e) => {
        player.speed = parseInt(e.target.value);
        player.el.speedVal.textContent = player.speed + 'ms';
    });
}

wireControls(graphPlayer, renderGraphStepAt);

graphPlayer.el.play.addEventListener('click', () => {
    if (graphPlayer.steps.length === 0) return;
    if (graphPlayer.playing) {
        stopPlayer(graphPlayer);
    } else {
        startPlayer(graphPlayer, graphPlayer.renderFn || renderGraphStepAt);
    }
});
