import { renderSortingCells, updateSortingStep } from './sorting-viz.js';
import { renderGraph, updateGraphStep, setSpacing, setViewScale, renderFlowGraph, updateFlowGraphStep, updateTarjanStep, updateKosarajuStep, updateAStarStep, updateBiDijkstraStep, updateTopoSortStep, updateDSUStep, updateColoringStep } from './graph-viz.js';
import { renderSearchCells, updateSearchStep } from './searche-viz.js';
import { renderSubstringViz, updateSubstringStep } from './substring-viz.js';

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

const SUBSTRING_META = {
    kmp: {
        title: "Knuth-Morris-Pratt",
        desc: "Поиск подстроки за линейное время",
        time: "Время: O(N + M)",
        memory: "Память: O(M)",
    },
    boyer_moore: {
        title: "Boyer-Moore",
        desc: "Сравнивает паттерн справа налево и сдвигает его по правилу плохого символа",
        time: "Время: O(NM) в худшем, быстрее на практике",
        memory: "Память: O(Σ)",
    },
    quick_search: {
        title: "Sunday / Quick Search",
        desc: "Сравнивает окно слева направо, а сдвиг выбирает по символу сразу после окна",
        time: "Время: O(NM) в худшем, быстрее на практике",
        memory: "Память: O(Σ)",
    }
};
const GRAPH_ALGO_META = {
    bfs: {
        title: "BFS (Поиск в ширину)",
        desc: "Обходит граф уровень за уровнем, используя очередь. Находит кратчайший путь в невзвешенном графе.",
        time: "Время: O(V+E)",
        memory: "Память: O(V)"
    },
    dijkstra: {
        title: "Dijkstra",
        desc: "Находит кратчайшие пути от стартовой вершины во взвешенном графе без отрицательных рёбер.",
        time: "Время: O((V+E) log V)",
        memory: "Память: O(V)"
    },
    bellman_ford: {
        title: "Bellman-Ford",
        desc: "Находит кратчайшие пути, поддерживает отрицательные веса. Обнаруживает отрицательные циклы.",
        time: "Время: O(V·E)",
        memory: "Память: O(V)"
    },
    kruskal: {
        title: "Kruskal (MST)",
        desc: "Строит минимальное остовное дерево, добавляя рёбра в порядке возрастания веса (без циклов).",
        time: "Время: O(E log E)",
        memory: "Память: O(V)"
    },
    stalin_sort: {
        title: "Stalin Sort (Клика)",
        desc: "Находит максимальную клику в графе, 'удаляя' вершины, не связанные с текущей кликой.",
        time: "Время: O(V²)",
        memory: "Память: O(V)"
    },
    ford_fulkerson: {
        title: "Ford-Fulkerson (Макс. поток)",
        desc: "Находит максимальный поток в сети, последовательно находя увеличивающие пути.",
        time: "Время: O(E·max_flow)",
        memory: "Память: O(V+E)"
    },
    edmonds_karp: {
        title: "Edmonds-Karp",
        desc: "Оптимизация Форда-Фалкерсона с использованием BFS для поиска увеличивающих путей.",
        time: "Время: O(V·E²)",
        memory: "Память: O(V+E)"
    },
    tarjan: {
        title: "Tarjan (SCC)",
        desc: "Находит сильно связные компоненты за один проход DFS с использованием lowlink-значений.",
        time: "Время: O(V+E)",
        memory: "Память: O(V)"
    },
    kosaraju: {
        title: "Kosaraju (SCC)",
        desc: "Находит сильно связные компоненты в два прохода: прямой и обратный обход графа.",
        time: "Время: O(V+E)",
        memory: "Память: O(V)"
    },
    hierholzer: {
        title: "Hierholzer (Эйлеров путь)",
        desc: "Находит эйлеров цикл или путь в графе, где все вершины имеют чётную степень.",
        time: "Время: O(E)",
        memory: "Память: O(V+E)"
    },
    hamiltonian: {
        title: "Hamiltonian (Backtracking)",
        desc: "Ищет гамильтонов путь/цикл методом возврата. Экспоненциальная сложность.",
        time: "Время: O(V!)",
        memory: "Память: O(V)"
    },
    astar: {
        title: "A* Pathfinding",
        desc: "Эвристический поиск кратчайшего пути. Использует оценку расстояния до цели для ускорения.",
        time: "Время: O(E log V)*",
        memory: "Память: O(V)"
    },
    bidijkstra: {
        title: "Bi-Dijkstra",
        desc: "Запускает два поиска Дейкстры навстречу друг другу. Встреча фронтов даёт кратчайший путь.",
        time: "Время: O((V+E) log V)*",
        memory: "Память: O(V)"
    },
    topological_sort: {
        title: "Topological Sort (Kahn)",
        desc: "Упорядочивает вершины DAG так, что все рёбра идут слева направо. Обнаруживает циклы.",
        time: "Время: O(V+E)",
        memory: "Память: O(V)"
    },
    connected_components: {
        title: "Connected Components (DSU)",
        desc: "Находит компоненты связности в неориентированном графе с помощью системы непересекающихся множеств.",
        time: "Время: O(E·α(V))",
        memory: "Память: O(V)"
    },
    graph_coloring: {
        title: "Graph Coloring (Greedy)",
        desc: "Раскрашивает вершины графа так, чтобы соседние имели разные цвета. Жадный алгоритм.",
        time: "Время: O(V+E)",
        memory: "Память: O(V)"
    }
};

const MAX_SORT_ITEMS = 15;
const MAX_SORT_VISUAL_ITEMS = 15;
const SEARCH_COLLAPSED_MAX_ROWS = 3;
const SEARCH_COLLAPSED_ROW_HEIGHT = 50;
const SEARCH_COLLAPSED_ROW_GAP = 8;
const SEARCH_COLLAPSED_MAX_HEIGHT =
    SEARCH_COLLAPSED_MAX_ROWS * SEARCH_COLLAPSED_ROW_HEIGHT +
    (SEARCH_COLLAPSED_MAX_ROWS - 1) * SEARCH_COLLAPSED_ROW_GAP;

const SEARCH_META = {
    linear_searche: {
        title: "Linear Search",
        desc: "Линейно проходит по массиву и сравнивает каждый элемент с искомым значением",
        time: "Время: O(n)",
        memory: "Память: О(1)",
    },
    linear_searche_both_sides: {
        title: "Bilinear",
        desc: "Проверяет элементы одновременно с начала и конца массива",
        time: "Время: O(n)",
        memory: "Память: О(1)",
    },
    binary_search: {
        title: "Binary Search",
        desc: "Ищет элемент в отсортированном массиве, деля диапазон пополам",
        time: "Время: O(log n)",
        memory: "Память: О(1)",
    },
    exponential_search: {
        title: "Exponential Search",
        desc: "Сначала находит диапазон, в котором может находиться элемент (экспоненциальное увеличение границ), затем выполняет бинарный поиск в найденном диапазоне",
        time: "Время: O(log n)",
        memory: "Память: О(1)",
    },
};

document.addEventListener('DOMContentLoaded', () => {
    initSortingPage();
    initSearchPage();
    initSubstringsPage();
    if (window.lucide) setTimeout(() => lucide.createIcons(), 100);
});

function initSortingPage() {
    sortMode = 'single';
    updateSortModeButtons();

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

    if (sortSingleRow) sortSingleRow.style.display = 'flex';
    if (sortBattlePicker) sortBattlePicker.style.display = 'none';
    if (sortSingleViz) sortSingleViz.style.display = 'flex';
    if (sortBattleViz) sortBattleViz.style.display = 'none';
    if (sortBattleSummary) sortBattleSummary.style.display = 'none';
    if (sortDownloadFileBtn) sortDownloadFileBtn.style.display = 'inline-flex';

    if (sortFileInput) sortFileInput.value = '';
    uploadedSortData = null;
    resetSortingSession();
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

function initSubstringsPage() {
    const header = document.getElementById('substring-header');
    if (header) {
        header.style.display = 'block';
        document.getElementById('substring-title').textContent = 'Поиск подстроки';
        document.getElementById('substring-desc').textContent = 'Выберите алгоритм и введите данные';
        document.getElementById('substring-time').textContent = '';
        document.getElementById('substring-memory').textContent = '';
    }

    const algoSelect = document.getElementById('substring-algo');
    if (algoSelect) algoSelect.value = '';

    const plot = document.getElementById('substring-plot');
    if (plot) plot.innerHTML = '';

    const status = document.getElementById('substring-status');
    if (status) status.textContent = '';

    // Скрываем кнопки, пока не выбран алгоритм
    const controls = document.getElementById('substring-controls');
    if (controls) controls.style.display = 'none';

    stopPlayer(substringPlayer);
    substringPlayer.steps = [];
    substringPlayer.current = 0;
}

// --- TABS LOGIC ---
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        const pageId = tab.dataset.tab;
        const page = document.getElementById(pageId);
        if (page) page.classList.add('active');

        if (pageId === 'sorting') {
            initSortingPage();
        } else if (pageId === 'searches') {
            initSearchPage();
        } else if (pageId === 'substrings') {
            initSubstringsPage();
        }
    });
});

document.getElementById('sort-algo').addEventListener('change', (e) => {
    const algo = e.target.value;
    resetSortingSession();
    if (sortMode !== 'single') return;

    if (algo && SORTING_META[algo]) {
        sortPlayer.el.controls.style.display = 'flex';
        updateSortingHeaderForMode();
        renderSortInputPreview();
    } else {
        sortPlayer.el.controls.style.display = 'none';
        updateSortingHeaderForMode();
    }
});

// --- SUBSTRINGS ALGO CHANGE ---
document.getElementById('substring-algo').addEventListener('change', (e) => {
    const algo = e.target.value;
    resetSubstringSession();

    if (algo && SUBSTRING_META[algo]) {
        const meta = SUBSTRING_META[algo];
        // Показываем кнопки только после выбора алгоритма
        substringPlayer.el.controls.style.display = 'flex';
        document.getElementById('substring-title').textContent = meta.title;
        document.getElementById('substring-desc').textContent = meta.desc;
        document.getElementById('substring-time').textContent = meta.time;
        document.getElementById('substring-memory').textContent = meta.memory;
        
        // Сразу обновляем превью с текущими данными
        updateSubstringPreview();
    } else {
        // Скрываем кнопки, если алгоритм сброшен
        substringPlayer.el.controls.style.display = 'none';
        document.getElementById('substring-title').textContent = 'Поиск подстроки';
        document.getElementById('substring-desc').textContent = 'Выберите алгоритм и введите данные';
        document.getElementById('substring-time').textContent = '';
        document.getElementById('substring-memory').textContent = '';
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
const substringPlayer = createPlayer('substring');

let graphData = { nodes: [], edges: [], algorithm: 'bfs', nodeLabels: {}, source: null, sink: null };
let sortData = { history: [], initialArray: [], sortedArray: [], direction: 'end' };
let searchData = {
    steps: [],
    initialArray: [],
    result: [],
    target: null,
    source: '',
    historySource: '',
};
let substringData = {
    steps: [],
    text: "",
    pattern: ""
};

let uploadedSortData = null;
const sortPlot = document.getElementById('sort-plot');
const sortDataInput = document.getElementById('sort-data');
const sortFileInput = document.getElementById('sort-file');
const sortFileName = document.getElementById('sort-file-name');
const sortDownloadFileBtn = document.getElementById('sort-download-file');
const sortModeButtons = document.querySelectorAll('[data-sort-mode]');
const sortSingleRow = document.getElementById('sort-single-row');
const sortBattlePicker = document.getElementById('sort-battle-picker');
const sortSingleViz = document.getElementById('sort-single-viz');
const sortBattleViz = document.getElementById('sort-battle-viz');
const sortBattleSummary = document.getElementById('sort-battle-summary');
const sortBattleEls = {
    left: {
        select: document.getElementById('sort-battle-left'),
        lane: document.getElementById('sort-battle-left-lane'),
        title: document.getElementById('sort-battle-left-title'),
        metrics: document.getElementById('sort-battle-left-metrics'),
        plot: document.getElementById('sort-battle-left-plot'),
        status: document.getElementById('sort-battle-left-status'),
        badge: document.getElementById('sort-battle-left-badge'),
    },
    right: {
        select: document.getElementById('sort-battle-right'),
        lane: document.getElementById('sort-battle-right-lane'),
        title: document.getElementById('sort-battle-right-title'),
        metrics: document.getElementById('sort-battle-right-metrics'),
        plot: document.getElementById('sort-battle-right-plot'),
        status: document.getElementById('sort-battle-right-status'),
        badge: document.getElementById('sort-battle-right-badge'),
    },
};
const searchPlot = document.getElementById('search-plot');
const searchResultIndexes = document.getElementById('search-result-indexes');
const searchDataInput = document.getElementById('search-data');
const searchTargetInput = document.getElementById('search-target');
const searchAlgoSelect = document.getElementById('search-algo');
const searchArrayToggle = document.getElementById('search-array-toggle');
let sortMode = 'single';
let sortBattleData = createEmptyBattleData();
let searchPlotCollapsed = true;
let searchToggleRaf = null;

sortModeButtons.forEach((button) => {
    button.addEventListener('click', () => {
        setSortMode(button.dataset.sortMode);
        if (sortMode === 'battle') {
            sortPlayer.el.controls.style.display = 'flex';
        } else if (!document.getElementById('sort-algo').value) {
            sortPlayer.el.controls.style.display = 'none';
        }
    });
});

for (const side of ['left', 'right']) {
    sortBattleEls[side]?.select?.addEventListener('change', () => {
        if (sortMode !== 'battle') return;
        resetSortingSession();
        sortPlayer.el.controls.style.display = 'flex';
        renderSortInputPreview();
    });
}

function parseSortInput(raw) {
    return raw
        .split(/[\s,;]+/)
        .map(part => parseFloat(part.trim()))
        .filter(value => !Number.isNaN(value));
}

function getCurrentSortInputData() {
    return Array.isArray(uploadedSortData) && uploadedSortData.length > 0
        ? [...uploadedSortData]
        : parseSortInput(sortDataInput.value);
}

function createEmptyBattleLane() {
    return {
        algo: '',
        history: [],
        initialArray: [],
        sortedArray: [],
        direction: 'end',
        requestMs: 0,
        metrics: null,
    };
}

function createEmptyBattleData() {
    return {
        left: createEmptyBattleLane(),
        right: createEmptyBattleLane(),
        maxSteps: 0,
        winner: null,
        loaded: false,
    };
}

function getSortMeta(algo) {
    return SORTING_META[algo] || {};
}

function getSortTitle(algo) {
    return getSortMeta(algo).title || algo || 'Алгоритм';
}

function getBattleAlgo(side) {
    return sortBattleEls[side]?.select?.value || '';
}

function getBattleDirection(side) {
    const algo = getBattleAlgo(side);
    return getSortMeta(algo).direction || 'end';
}

function stripMetricPrefix(value, prefix) {
    return String(value || '').replace(new RegExp(`^${prefix}:\\s*`, 'i'), '') || '—';
}

function formatMetricNumber(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return '0';
    return new Intl.NumberFormat('ru-RU').format(number);
}

function formatDuration(ms) {
    const value = Number(ms);
    if (!Number.isFinite(value) || value <= 0) return '0 мс';
    if (value < 1000) return `${Math.round(value)} мс`;
    return `${(value / 1000).toFixed(value < 10000 ? 1 : 0)} с`;
}

function setBattleBadge(side, text, className = '') {
    const badge = sortBattleEls[side]?.badge;
    if (!badge) return;
    badge.textContent = text;
    badge.className = `battle-result-badge${className ? ` ${className}` : ''}`;
}

function setBattleLaneClass(side, className = '') {
    const lane = sortBattleEls[side]?.lane;
    if (!lane) return;
    lane.classList.remove('winner', 'finished');
    if (className) lane.classList.add(className);
}

function updateSortModeButtons() {
    sortModeButtons.forEach((button) => {
        const isActive = button.dataset.sortMode === sortMode;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-pressed', String(isActive));
    });
}

function updateSortingHeaderForMode() {
    if (sortMode === 'battle') {
        const leftAlgo = getBattleAlgo('left');
        const rightAlgo = getBattleAlgo('right');
        const leftMeta = getSortMeta(leftAlgo);
        const rightMeta = getSortMeta(rightAlgo);

        document.getElementById('sort-title').textContent = 'Батл сортировок';
        document.getElementById('sort-desc').textContent = `${getSortTitle(leftAlgo)} vs ${getSortTitle(rightAlgo)}`;
        document.getElementById('sort-time').textContent =
            `${stripMetricPrefix(leftMeta.time, 'Время')} / ${stripMetricPrefix(rightMeta.time, 'Время')}`;
        document.getElementById('sort-memory').textContent =
            `${stripMetricPrefix(leftMeta.memory, 'Память')} / ${stripMetricPrefix(rightMeta.memory, 'Память')}`;
        return;
    }

    const algo = document.getElementById('sort-algo').value;
    if (algo && SORTING_META[algo]) {
        const meta = SORTING_META[algo];
        document.getElementById('sort-title').textContent = meta.title;
        document.getElementById('sort-desc').textContent = meta.desc;
        document.getElementById('sort-time').textContent = meta.time;
        document.getElementById('sort-memory').textContent = meta.memory;
    } else {
        document.getElementById('sort-title').textContent = 'Сортировки';
        document.getElementById('sort-desc').textContent = 'Выберите алгоритм и введите массив';
        document.getElementById('sort-time').textContent = '';
        document.getElementById('sort-memory').textContent = '';
    }
}

function clearBattleView() {
    for (const side of ['left', 'right']) {
        const els = sortBattleEls[side];
        const algo = getBattleAlgo(side);
        if (els.title) els.title.textContent = getSortTitle(algo);
        if (els.metrics) els.metrics.innerHTML = '';
        if (els.plot) els.plot.innerHTML = '';
        if (els.status) els.status.textContent = '';
        setBattleBadge(side, 'Готов');
        setBattleLaneClass(side);
    }

    if (sortBattleSummary) {
        sortBattleSummary.textContent = '';
        sortBattleSummary.style.display = sortMode === 'battle' ? 'block' : 'none';
    }
}

function setSortMode(mode, options = {}) {
    sortMode = mode === 'battle' ? 'battle' : 'single';
    updateSortModeButtons();

    if (sortSingleRow) sortSingleRow.style.display = sortMode === 'single' ? 'flex' : 'none';
    if (sortBattlePicker) sortBattlePicker.style.display = sortMode === 'battle' ? 'grid' : 'none';
    if (sortSingleViz) sortSingleViz.style.display = sortMode === 'single' ? 'flex' : 'none';
    if (sortBattleViz) sortBattleViz.style.display = sortMode === 'battle' ? 'grid' : 'none';
    if (sortBattleSummary) sortBattleSummary.style.display = sortMode === 'battle' ? 'block' : 'none';
    if (sortDownloadFileBtn) sortDownloadFileBtn.style.display = sortMode === 'single' ? 'inline-flex' : 'none';

    if (options.reset !== false) {
        resetSortingSession();
    }

    updateSortingHeaderForMode();
    renderSortInputPreview();
    refreshIcons();
}

function setSortFileNameLabel(fileName = '') {
    if (!sortFileName) return;
    sortFileName.textContent = fileName || 'Файл не выбран';
}

function renderSortInputPreview() {
    if (sortMode === 'battle') {
        renderBattleInputPreview();
        return;
    }

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

function renderBattleInputPreview() {
    const data = parseSortInput(sortDataInput.value);
    clearBattleView();
    updateSortingHeaderForMode();

    if (data.length === 0) {
        if (sortBattleSummary) sortBattleSummary.textContent = '';
        return;
    }

    for (const side of ['left', 'right']) {
        const plot = sortBattleEls[side]?.plot;
        if (!plot) continue;
        renderSortingCells(plot, data, -1, -1, 0, sortPlayer.speed, getBattleDirection(side), MAX_SORT_VISUAL_ITEMS);
    }

    if (sortBattleSummary) {
        sortBattleSummary.textContent = 'Готово к сравнению';
    }
}

function resetSortingSession() {
    stopPlayer(sortPlayer);
    sortPlayer.steps = [];
    sortPlayer.current = 0;
    sortData = { history: [], initialArray: [], sortedArray: [], direction: 'end' };
    sortBattleData = createEmptyBattleData();
    if (sortPlot) sortPlot.innerHTML = '';
    clearBattleView();
    if (sortPlayer.el.status) sortPlayer.el.status.textContent = '';
}

function resetSubstringSession() {
    stopPlayer(substringPlayer);
    substringPlayer.steps = [];
    substringPlayer.current = 0;
    substringData = { steps: [], text: "", pattern: "" };
    const plot = document.getElementById('substring-plot');
    if (plot) plot.innerHTML = '';
    if (substringPlayer.el.status) substringPlayer.el.status.textContent = '';
    // Кнопки остаются видимыми, если алгоритм выбран, но мы сбрасываем состояние плеера
}

function normalizeSortingHistory(history) {
    if (!Array.isArray(history)) return [];
    return history
        .filter((step) => step && typeof step === 'object' && !Array.isArray(step))
        .map((step) => ({ ...step }));
}

function normalizePermutation(indexes, length) {
    if (!Array.isArray(indexes) || indexes.length !== length) return [];
    const seen = new Set();
    const normalized = [];

    for (const rawIdx of indexes) {
        const idx = Number(rawIdx);
        if (!Number.isInteger(idx) || idx < 0 || idx >= length || seen.has(idx)) {
            return [];
        }
        seen.add(idx);
        normalized.push(idx);
    }
    return normalized;
}

function toStableValueKey(value) {
    if (typeof value === 'number' && Number.isNaN(value)) return 'number:NaN';
    return `${typeof value}:${String(value)}`;
}

function buildPermutationForSortedArray(initialArray, sortedArray, fallbackIndexes = []) {
    const length = Array.isArray(initialArray) ? initialArray.length : 0;
    if (!Array.isArray(sortedArray) || sortedArray.length !== length || length === 0) {
        const normalizedFallback = normalizePermutation(fallbackIndexes, length);
        return normalizedFallback.length === length
            ? normalizedFallback
            : Array.from({ length }, (_, idx) => idx);
    }

    const valueToIndexes = new Map();
    initialArray.forEach((value, idx) => {
        const key = toStableValueKey(value);
        if (!valueToIndexes.has(key)) valueToIndexes.set(key, []);
        valueToIndexes.get(key).push(idx);
    });

    const permutation = [];
    for (const value of sortedArray) {
        const key = toStableValueKey(value);
        const queue = valueToIndexes.get(key);
        if (!queue || queue.length === 0) {
            const normalizedFallback = normalizePermutation(fallbackIndexes, length);
            return normalizedFallback.length === length
                ? normalizedFallback
                : Array.from({ length }, (_, idx) => idx);
        }
        permutation.push(queue.shift());
    }

    const normalizedPermutation = normalizePermutation(permutation, length);
    if (normalizedPermutation.length === length) {
        return normalizedPermutation;
    }

    const normalizedFallback = normalizePermutation(fallbackIndexes, length);
    return normalizedFallback.length === length
        ? normalizedFallback
        : Array.from({ length }, (_, idx) => idx);
}

function buildSortedArrayFromCountingMap(numsElems) {
    if (!numsElems || typeof numsElems !== 'object' || Array.isArray(numsElems)) return [];

    const numericEntries = [];
    const stringEntries = [];

    for (const [rawValue, rawCount] of Object.entries(numsElems)) {
        const count = Number(rawCount);
        if (!Number.isFinite(count) || count <= 0) continue;

        const numericValue = Number(rawValue);
        if (Number.isFinite(numericValue)) {
            numericEntries.push([numericValue, Math.trunc(count)]);
        } else {
            stringEntries.push([rawValue, Math.trunc(count)]);
        }
    }

    numericEntries.sort((a, b) => a[0] - b[0]);
    stringEntries.sort((a, b) => String(a[0]).localeCompare(String(b[0])));

    const output = [];
    for (const [value, count] of [...numericEntries, ...stringEntries]) {
        for (let i = 0; i < count; i++) output.push(value);
    }
    return output;
}

function toIndexOrMinusOne(value) {
    const idx = Number(value);
    return Number.isInteger(idx) ? idx : -1;
}

function pickFirstValidIndex(candidates, fallback = -1) {
    for (const candidate of candidates) {
        const idx = toIndexOrMinusOne(candidate);
        if (idx >= 0) return idx;
    }
    return fallback;
}

function getSortingStepCompareIndexes(step) {
    const compareA = pickFirstValidIndex([step?.compare_a, step?.curr_ind], -1);
    const compareB = pickFirstValidIndex(
        [step?.compare_b, step?.target_ind, step?.min_index],
        compareA
    );
    return { compareA, compareB };
}

function ensureFinalSortingGreenStep(history, algo, initialArray, sortedArray) {
    const safeHistory = normalizeSortingHistory(history);
    const dataLength = Array.isArray(initialArray) ? initialArray.length : 0;

    if (safeHistory.length === 0 || dataLength === 0) return safeHistory;

    const lastStep = safeHistory[safeHistory.length - 1] || {};

    if (algo === 'bogo') {
        const hasFinalGreenStep =
            Boolean(lastStep.is_sorted) &&
            normalizePermutation(lastStep.indexes, dataLength).length === dataLength;

        if (hasFinalGreenStep) return safeHistory;

        const fallbackIndexes = normalizePermutation(lastStep.indexes, dataLength);
        const finalIndexes = buildPermutationForSortedArray(initialArray, sortedArray, fallbackIndexes);
        safeHistory.push({ indexes: finalIndexes, is_sorted: true });
        return safeHistory;
    }

    if (algo === 'counting') {
        const doneOutput = Array.isArray(lastStep.output) ? lastStep.output : [];
        const hasFinalGreenStep =
            String(lastStep.phase || '').toLowerCase() === 'done' &&
            doneOutput.length >= dataLength;

        if (hasFinalGreenStep) return safeHistory;

        let output = [];
        if (Array.isArray(sortedArray) && sortedArray.length === dataLength) {
            output = [...sortedArray];
        } else {
            output = buildSortedArrayFromCountingMap(lastStep.nums_elems);
        }

        if (output.length === 0) return safeHistory;

        safeHistory.push({
            ...lastStep,
            phase: 'done',
            source_index: -1,
            bucket_index: -1,
            bucket_value: null,
            bucket_count: 0,
            write_index: -1,
            output: [...output],
        });
        return safeHistory;
    }

    const sortedNum = Number.isInteger(lastStep.sorted_num) ? lastStep.sorted_num : 0;
    if (sortedNum >= dataLength) return safeHistory;

    if (algo === 'insertion') {
        safeHistory.push({
            compare_a: -1,
            compare_b: -1,
            is_swap: false,
            sorted_num: dataLength,
        });
        return safeHistory;
    }

    safeHistory.push({
        ...lastStep,
        compare_a: -1,
        compare_b: -1,
        is_swap: false,
        sorted_num: dataLength,
    });
    return safeHistory;
}

function isBogoHistoryStep(step) {
    return Array.isArray(step?.indexes);
}

function isInsertionHistoryStep(step) {
    return Object.prototype.hasOwnProperty.call(step ?? {}, 'is_shift')
        && Object.prototype.hasOwnProperty.call(step ?? {}, 'value');
}

function isCountingHistoryStep(step) {
    return Object.prototype.hasOwnProperty.call(step ?? {}, 'phase')
        || (
            Object.prototype.hasOwnProperty.call(step ?? {}, 'nums_elems')
            && step?.nums_elems !== null
            && typeof step?.nums_elems === 'object'
            && !Array.isArray(step?.nums_elems)
        );
}

function createNormalizedSortingResult(result, algo, requestMs = 0) {
    const initialArray = Array.isArray(result.initial_array) ? result.initial_array : [];
    const sortedArray = Array.isArray(result.sorted_array) ? result.sorted_array : [];
    const history = ensureFinalSortingGreenStep(result.history, algo, initialArray, sortedArray);
    const direction = result.direction || getSortMeta(algo).direction || 'end';

    return {
        algo,
        initialArray,
        sortedArray,
        history,
        direction,
        requestMs,
        metrics: calculateSortingMetrics(history, algo, requestMs),
    };
}

function calculateSortingMetrics(history, algo, requestMs = 0) {
    const safeHistory = Array.isArray(history) ? history : [];
    let comparisons = 0;
    let swaps = 0;
    let writes = 0;
    let shuffles = 0;
    let countingReads = 0;

    for (const step of safeHistory) {
        if (isBogoHistoryStep(step)) {
            if (!step.is_sorted) shuffles++;
            continue;
        }

        if (isCountingHistoryStep(step)) {
            if (step.phase === 'count' || step.nums_elems) countingReads++;
            if (step.phase === 'build' || step.phase === 'done') writes++;
            continue;
        }

        const { compareA, compareB } = getSortingStepCompareIndexes(step);
        if (compareA >= 0 && compareB >= 0) comparisons++;
        if (step?.is_swap) swaps++;
        if (isInsertionHistoryStep(step)) writes++;
    }

    const operationValue = algo === 'bogo'
        ? shuffles
        : algo === 'counting'
            ? countingReads
            : comparisons;
    const operationLabel = algo === 'bogo'
        ? 'Перемешивания'
        : algo === 'counting'
            ? 'Подсчёты'
            : 'Сравнения';
    const mutationLabel = algo === 'counting' || algo === 'insertion'
        ? 'Записи'
        : 'Обмены';
    const mutationValue = algo === 'counting' || algo === 'insertion'
        ? writes
        : swaps;

    return {
        steps: safeHistory.length,
        operationLabel,
        operationValue,
        mutationLabel,
        mutationValue,
        visualMs: Math.max(0, safeHistory.length - 1) * sortPlayer.speed,
        requestMs,
    };
}

function renderBattleMetrics(side) {
    const lane = sortBattleData[side];
    const metricsEl = sortBattleEls[side]?.metrics;
    if (!lane || !metricsEl) return;

    const meta = getSortMeta(lane.algo);
    const metrics = calculateSortingMetrics(lane.history, lane.algo, lane.requestMs);
    lane.metrics = metrics;
    const entries = [
        ['Шаги', formatMetricNumber(metrics.steps)],
        [metrics.operationLabel, formatMetricNumber(metrics.operationValue)],
        [metrics.mutationLabel, formatMetricNumber(metrics.mutationValue)],
        ['Визуально', formatDuration(metrics.visualMs)],
        ['Оценка', stripMetricPrefix(meta.time, 'Время')],
        ['Память', stripMetricPrefix(meta.memory, 'Память')],
        ['Подготовка', formatDuration(metrics.requestMs)],
    ];

    metricsEl.innerHTML = entries.map(([label, value]) => `
        <div class="battle-metric">
            <span class="battle-metric-label">${label}</span>
            <span class="battle-metric-value">${value}</span>
        </div>
    `).join('');
}

function getBattleWinner(left, right) {
    if (!left.history.length || !right.history.length) return null;
    if (left.history.length === right.history.length) return 'tie';
    return left.history.length < right.history.length ? 'left' : 'right';
}

function renderBattleSummary() {
    if (!sortBattleSummary || !sortBattleData.loaded) return;

    const leftTitle = getSortTitle(sortBattleData.left.algo);
    const rightTitle = getSortTitle(sortBattleData.right.algo);
    const leftSteps = sortBattleData.left.history.length;
    const rightSteps = sortBattleData.right.history.length;

    if (sortBattleData.winner === 'tie') {
        sortBattleSummary.textContent = `Ничья: ${leftTitle} и ${rightTitle} прошли по ${leftSteps} шагов`;
        return;
    }

    const winner = sortBattleData.winner === 'left' ? sortBattleData.left : sortBattleData.right;
    const loser = sortBattleData.winner === 'left' ? sortBattleData.right : sortBattleData.left;
    sortBattleSummary.textContent =
        `${getSortTitle(winner.algo)} быстрее по визуальным шагам: ${winner.history.length} против ${loser.history.length}`;
}

function applySortingResult(result, algo) {
    const normalized = createNormalizedSortingResult(result, algo);
    sortData.initialArray = normalized.initialArray;
    sortData.sortedArray = normalized.sortedArray;
    sortData.history = normalized.history;
    sortData.direction = normalized.direction;
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

    const direction = normalized.direction || meta.direction || 'end';
    const firstStep = sortData.history[0] || {};
    const { compareA, compareB } = getSortingStepCompareIndexes(firstStep);
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

async function loadSortingData(algoOverride = null, dataOverride = null) {
    const data = Array.isArray(dataOverride)
        ? [...dataOverride]
        : getCurrentSortInputData();
    if (data.length === 0) {
        throw new Error('Введите числа через запятую');
    }

    const algo = algoOverride || document.getElementById('sort-algo').value;
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

async function loadBattleLaneData(side, data) {
    const algo = getBattleAlgo(side);
    const startedAt = performance.now();
    const result = await loadSortingData(algo, data);
    const requestMs = performance.now() - startedAt;
    return createNormalizedSortingResult(result, algo, requestMs);
}

async function loadBattleSortingData() {
    const leftAlgo = getBattleAlgo('left');
    const rightAlgo = getBattleAlgo('right');

    if (!leftAlgo || !rightAlgo) {
        throw new Error('Выберите два алгоритма');
    }
    if (leftAlgo === rightAlgo) {
        throw new Error('Выберите два разных алгоритма');
    }

    const data = getCurrentSortInputData();
    if (data.length === 0) {
        throw new Error('Введите числа через запятую');
    }

    const [left, right] = await Promise.all([
        loadBattleLaneData('left', data),
        loadBattleLaneData('right', data),
    ]);

    sortBattleData.left = left;
    sortBattleData.right = right;
    sortBattleData.maxSteps = Math.max(left.history.length, right.history.length);
    sortBattleData.winner = getBattleWinner(left, right);
    sortBattleData.loaded = true;
    sortPlayer.steps = Array.from({ length: sortBattleData.maxSteps }, (_, idx) => idx);
    sortPlayer.current = 0;

    for (const side of ['left', 'right']) {
        const lane = sortBattleData[side];
        const els = sortBattleEls[side];
        if (els.title) els.title.textContent = getSortTitle(lane.algo);
        renderBattleMetrics(side);
    }

    renderBattleStep(0);
    renderBattleSummary();
}

async function ensureBattleDataLoaded() {
    if (sortBattleData.loaded && sortBattleData.maxSteps > 0) return true;

    sortPlayer.el.status.textContent = 'Загрузка батла...';
    for (const side of ['left', 'right']) {
        setBattleBadge(side, 'Загрузка');
    }

    try {
        await loadBattleSortingData();
        sortPlayer.el.controls.style.display = 'flex';
        sortPlayer.el.status.textContent = 'Батл готов к запуску';
        return true;
    } catch (e) {
        sortPlayer.el.status.textContent = `Ошибка: ${e.message}`;
        console.error(e);
        return false;
    }
}

function renderActiveSortStep(idx) {
    if (sortMode === 'battle') {
        renderBattleStep(idx);
    } else {
        renderSortStep(idx);
    }
}

sortPlayer.el.play.addEventListener('click', async () => {
    if (sortMode === 'battle') {
        if (sortPlayer.playing) {
            stopPlayer(sortPlayer);
            return;
        }

        const ready = await ensureBattleDataLoaded();
        if (ready) startPlayer(sortPlayer, renderBattleStep);
        return;
    }

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
        renderActiveSortStep(sortPlayer.current);
    }
});

sortPlayer.el.next.addEventListener('click', () => {
    if (sortPlayer.current < sortPlayer.steps.length - 1) {
        sortPlayer.current++;
        renderActiveSortStep(sortPlayer.current);
    } else {
        stopPlayer(sortPlayer);
    }
});

sortPlayer.el.speed.addEventListener('input', (e) => {
    sortPlayer.speed = parseInt(e.target.value);
    sortPlayer.el.speedVal.textContent = sortPlayer.speed + 'ms';
    if (sortMode === 'battle' && sortBattleData.loaded) {
        renderBattleMetrics('left');
        renderBattleMetrics('right');
        renderBattleSummary();
    }
});

function renderBattleStep(idx) {
    if (!sortBattleData.loaded) return;

    for (const side of ['left', 'right']) {
        const lane = sortBattleData[side];
        const els = sortBattleEls[side];
        if (!lane.history.length || !els.plot) continue;

        const laneIdx = Math.min(idx, lane.history.length - 1);
        const msg = updateSortingStep(
            els.plot,
            lane.history,
            lane.initialArray,
            laneIdx,
            sortPlayer.speed,
            lane.direction,
            MAX_SORT_VISUAL_ITEMS
        );

        const isFinished = idx >= lane.history.length - 1;
        const isWinner = sortBattleData.winner === side;
        if (els.status) {
            els.status.textContent = `${laneIdx + 1} / ${lane.history.length}: ${msg}`;
        }

        if (isFinished) {
            setBattleBadge(side, isWinner ? 'Быстрее' : 'Финиш', isWinner ? 'winner' : 'finished');
            setBattleLaneClass(side, isWinner ? 'winner' : 'finished');
        } else {
            setBattleBadge(side, `Шаг ${laneIdx + 1}`);
            setBattleLaneClass(side);
        }
    }

    renderBattleSummary();
    sortPlayer.el.status.textContent = `Батл: шаг ${Math.min(idx + 1, sortBattleData.maxSteps)} / ${sortBattleData.maxSteps}`;
}

function renderSortStep(idx) {
    const algo = document.getElementById('sort-algo').value;
    const meta = SORTING_META[algo] || {};
    const direction = sortData.history[idx]?.direction || sortData.direction || meta.direction || 'end';

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

function applySearchPlotCollapsedState() {
    if (!searchPlot) return;

    searchPlot.classList.toggle('search-plot-collapsed', searchPlotCollapsed);

    if (!searchArrayToggle) return;
    searchArrayToggle.classList.toggle('expanded', !searchPlotCollapsed);
    const label = searchPlotCollapsed ? 'Развернуть массив' : 'Свернуть массив';
    searchArrayToggle.setAttribute('aria-label', label);
    searchArrayToggle.title = label;
}

function syncSearchArrayToggle() {
    if (!searchPlot || !searchArrayToggle) return;

    if (searchToggleRaf !== null) {
        cancelAnimationFrame(searchToggleRaf);
    }

    searchToggleRaf = requestAnimationFrame(() => {
        searchToggleRaf = null;

        const hasCells = searchPlot.children.length > 0;
        const hasOverflow = hasCells && searchPlot.scrollHeight > SEARCH_COLLAPSED_MAX_HEIGHT + 1;

        if (!hasOverflow) {
            searchPlotCollapsed = true;
            searchArrayToggle.style.display = 'none';
            searchPlot.classList.remove('search-plot-collapsed');
            searchArrayToggle.classList.remove('expanded');
            searchArrayToggle.setAttribute('aria-label', 'Развернуть массив');
            searchArrayToggle.title = 'Развернуть массив';
            return;
        }

        searchArrayToggle.style.display = 'inline-flex';
        applySearchPlotCollapsedState();
    });
}

function setSearchResultIndexes(indexes) {
    if (!searchResultIndexes) return;

    if (!Array.isArray(indexes) || indexes.length === 0) {
        searchResultIndexes.textContent = '';
        return;
    }

    if (indexes.length === 1) {
        searchResultIndexes.textContent = `Индекс первого совпадения: ${indexes[0]}`;
        return;
    }

    searchResultIndexes.textContent = `Индексы совпадений: ${indexes.join(', ')}`;
}

function resetSearchSession() {
    stopPlayer(searchPlayer);
    searchPlayer.steps = [];
    searchPlayer.current = 0;
    searchPlotCollapsed = true;
    searchData = {
        steps: [],
        initialArray: [],
        result: [],
        target: null,
        source: '',
        historySource: '',
    };
    if (searchPlot) searchPlot.innerHTML = '';
    setSearchResultIndexes([]);
    syncSearchArrayToggle();
    if (searchPlayer.el.status) searchPlayer.el.status.textContent = '';
}

function renderSearchInputPreview() {
    if (!searchPlot) return;
    const data = parseSortInput(searchDataInput?.value || '');
    if (data.length === 0) {
        searchPlot.innerHTML = '';
        syncSearchArrayToggle();
        return;
    }
    renderSearchCells(searchPlot, data, -1, [], -1);
    syncSearchArrayToggle();
}

function normalizeSearchResultIndexes(resultIndexes, dataLength) {
    if (!Array.isArray(resultIndexes)) return [];
    return resultIndexes
        .map((idx) => Number(idx))
        .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < dataLength);
}

function isSameIndexOrder(left, right) {
    if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) return false;
    for (let i = 0; i < left.length; i++) {
        if (left[i] !== right[i]) return false;
    }
    return true;
}

function appendFinalSearchResultStep(steps, resultIndexes) {
    const safeSteps = Array.isArray(steps) ? [...steps] : [];
    if (!Array.isArray(resultIndexes) || resultIndexes.length === 0) return safeSteps;

    const lastStep = safeSteps[safeSteps.length - 1] || {};
    const lastCurrentIndices = Array.isArray(lastStep.current_indices)
        ? lastStep.current_indices
        : (
            Number.isInteger(lastStep.current_index) && lastStep.current_index >= 0
                ? [lastStep.current_index]
                : []
        );
    const lastFoundIndices = Array.isArray(lastStep.found_indices)
        ? lastStep.found_indices
        : [];
    const lastActiveIndices = Array.isArray(lastStep.active_indices)
        ? lastStep.active_indices
        : [];

    if (lastCurrentIndices.length === 0 && isSameIndexOrder(lastFoundIndices, resultIndexes)) {
        return safeSteps;
    }

    const checkedUntil = Number.isInteger(lastStep.checked_until)
        ? lastStep.checked_until
        : (
            lastCurrentIndices.length > 0
                ? lastCurrentIndices[lastCurrentIndices.length - 1]
                : -1
        );

    safeSteps.push({
        current_indices: [],
        current_index: -1,
        checked_until: checkedUntil,
        found_indices: [...resultIndexes],
        active_indices: [...lastActiveIndices],
        is_match: true,
    });

    return safeSteps;
}

function prependInitialSearchStep(steps, dataLength) {
    const safeSteps = Array.isArray(steps) ? [...steps] : [];
    if (!Number.isInteger(dataLength) || dataLength <= 0 || safeSteps.length === 0) {
        return safeSteps;
    }

    const firstStep = safeSteps[0] || {};
    const firstCurrent = Array.isArray(firstStep.current_indices) ? firstStep.current_indices : [];
    const firstFound = Array.isArray(firstStep.found_indices) ? firstStep.found_indices : [];
    const firstActive = Array.isArray(firstStep.active_indices) ? firstStep.active_indices : [];
    if (firstStep.is_initial_state === true ||
        (firstCurrent.length === 0 && firstFound.length === 0 && firstActive.length === 0)) {
        return safeSteps;
    }

    return [
        {
            current_indices: [],
            current_index: -1,
            checked_until: -1,
            found_indices: [],
            active_indices: [],
            is_match: false,
            is_initial_state: true,
        },
        ...safeSteps,
    ];
}

function buildSearchSteps(data, resultIndexes, historyIndexes = []) {
    const safeData = Array.isArray(data) ? data : [];
    const safeResultIndexes = normalizeSearchResultIndexes(resultIndexes, safeData.length);
    const resultSet = new Set(safeResultIndexes);
    const foundSet = new Set();
    const foundSoFar = [];
    const steps = [];

    const rawHistory = Array.isArray(historyIndexes) ? historyIndexes : [];
    const hasObjectHistory = rawHistory.some(
        (item) => item && typeof item === 'object' && !Array.isArray(item)
    );
    const hasPairHistory = rawHistory.some((item) => Array.isArray(item));

    if (hasObjectHistory) {
        const objectHistory = rawHistory
            .map((item) => {
                if (!item || typeof item !== 'object' || Array.isArray(item)) return null;

                const mid = Number(item.mid_index);
                const left = Number(item.left_index);
                const right = Number(item.right_index);
                const comparedValue = Number(item.compared_value);
                const targetValue = Number(item.target_value);

                if (!Number.isInteger(mid) || mid < 0 || mid >= safeData.length) return null;

                const normalizedLeft = Number.isInteger(left)
                    ? Math.max(0, Math.min(left, safeData.length - 1))
                    : 0;
                const normalizedRight = Number.isInteger(right)
                    ? Math.max(0, Math.min(right, safeData.length - 1))
                    : safeData.length - 1;

                return {
                    mid,
                    left: normalizedLeft,
                    right: normalizedRight,
                    comparedValue: Number.isFinite(comparedValue) ? comparedValue : safeData[mid],
                    targetValue: Number.isFinite(targetValue) ? targetValue : null,
                    isMatch: Boolean(item.is_match),
                };
            })
            .filter((item) => item !== null);

        if (objectHistory.length === 0) {
            return appendFinalSearchResultStep([], safeResultIndexes);
        }

        const activeSet = new Set();
        for (const stepData of objectHistory) {
            const idx = stepData.mid;
            const isMatch = stepData.isMatch || resultSet.has(idx);
            activeSet.add(idx);

            if (isMatch && !foundSet.has(idx)) {
                foundSet.add(idx);
                foundSoFar.push(idx);
            }

            steps.push({
                current_indices: [idx],
                current_index: idx,
                checked_until: stepData.right,
                found_indices: [...foundSoFar],
                is_match: isMatch,
                left_index: stepData.left,
                right_index: stepData.right,
                compared_value: stepData.comparedValue,
                target_value: stepData.targetValue,
                active_indices: [...activeSet],
            });
        }

        return appendFinalSearchResultStep(steps, safeResultIndexes);
    }

    if (hasPairHistory) {
        const pairHistory = rawHistory
            .map((item) => {
                if (!Array.isArray(item) || item.length < 2) return null;
                const left = Number(item[0]);
                const right = Number(item[1]);
                if (!Number.isInteger(left) || !Number.isInteger(right)) return null;
                if (left < 0 || right < 0 || left >= safeData.length || right >= safeData.length) return null;
                return [left, right];
            })
            .filter((item) => item !== null);

        if (pairHistory.length === 0) {
            return appendFinalSearchResultStep([], safeResultIndexes);
        }

        const activeSet = new Set();
        for (const pair of pairHistory) {
            const [left, right] = pair;
            const currentIndices = left === right ? [left] : [left, right];
            let isMatch = false;

            for (const idx of currentIndices) {
                activeSet.add(idx);
                if (resultSet.has(idx)) {
                    isMatch = true;
                    if (!foundSet.has(idx)) {
                        foundSet.add(idx);
                        foundSoFar.push(idx);
                    }
                }
            }

            steps.push({
                current_indices: currentIndices,
                current_index: currentIndices[0] ?? -1,
                checked_until: currentIndices[currentIndices.length - 1] ?? -1,
                found_indices: [...foundSoFar],
                active_indices: [...activeSet],
                is_match: isMatch,
            });
        }
        return appendFinalSearchResultStep(steps, safeResultIndexes);
    }

    const linearHistory = rawHistory
        .map((idx) => Number(idx))
        .filter((idx) => Number.isInteger(idx) && idx >= 0 && idx < safeData.length);
    const traversal = linearHistory;
    const activeSet = new Set();

    for (const idx of traversal) {
        const isMatch = resultSet.has(idx);
        activeSet.add(idx);
        if (isMatch && !foundSet.has(idx)) {
            foundSet.add(idx);
            foundSoFar.push(idx);
        }
        steps.push({
            current_indices: [idx],
            current_index: idx,
            checked_until: idx,
            found_indices: [...foundSoFar],
            active_indices: [...activeSet],
            is_match: isMatch,
        });
    }

    return appendFinalSearchResultStep(steps, safeResultIndexes);
}

function applySearchResult(apiResult, data, target) {
    const visualData = Array.isArray(apiResult?.visual_data) ? apiResult.visual_data : data;
    const resultIndexes = Array.isArray(apiResult?.result) ? apiResult.result : [];
    const historyIndexes = Array.isArray(apiResult?.history) ? apiResult.history : [];
    const builtSteps = buildSearchSteps(visualData, resultIndexes, historyIndexes);
    const steps = prependInitialSearchStep(builtSteps, visualData.length);

    searchData = {
        steps,
        initialArray: [...visualData],
        result: [...resultIndexes],
        target,
        source: apiResult?.source || 'cpp',
        historySource: apiResult?.history_source || apiResult?.source || 'cpp',
    };
    searchPlayer.steps = steps;
    searchPlayer.current = 0;
    searchPlayer.el.controls.style.display = 'flex';

    if (searchData.initialArray.length === 0) {
        searchPlot.innerHTML = '';
        setSearchResultIndexes([]);
        syncSearchArrayToggle();
        searchPlayer.el.status.textContent = 'Нет данных для визуализации';
        return;
    }

    if (searchData.steps.length === 0) {
        renderSearchCells(searchPlot, searchData.initialArray, -1, [], -1);
        setSearchResultIndexes([]);
        syncSearchArrayToggle();
        searchPlayer.el.status.textContent = 'Совпадений нет';
        return;
    }

    setSearchResultIndexes([]);

    const firstStep = searchData.steps[0];
    renderSearchCells(
        searchPlot,
        searchData.initialArray,
        firstStep.current_indices || firstStep.current_index,
        firstStep.found_indices,
        firstStep.checked_until,
        firstStep.active_indices
    );

    syncSearchArrayToggle();
    renderSearchStep(0);
}

async function loadSearchData() {
    const data = parseSortInput(searchDataInput?.value || '');
    if (data.length === 0) {
        throw new Error('Введите числа через запятую');
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
        idx
    );
    syncSearchArrayToggle();

    const isLastStep = searchData.steps.length > 0 && idx >= searchData.steps.length - 1;
    if (!isLastStep) {
        searchPlayer.el.status.textContent = msg;
        setSearchResultIndexes([]);
        return;
    }

    const visibleResult = Array.isArray(searchData.steps[idx]?.found_indices)
        ? searchData.steps[idx].found_indices
        : [];

    if (visibleResult.length === 1) {
        searchPlayer.el.status.textContent = `Индекс первого совпадения: ${visibleResult[0]}`;
    } else if (visibleResult.length > 1) {
        searchPlayer.el.status.textContent = `Индексы совпадений: ${visibleResult.join(', ')}`;
    } else {
        searchPlayer.el.status.textContent = '❌ Совпадений не найдено';
    }

    setSearchResultIndexes([]);
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
    searchDataInput.addEventListener('input', () => {
        resetSearchSession();
        renderSearchInputPreview();
    });
}

if (searchTargetInput) {
    searchTargetInput.addEventListener('input', () => {
        resetSearchSession();
        renderSearchInputPreview();
    });
}

const searchExampleBtn = document.getElementById('search-example');
if (searchExampleBtn) {
    searchExampleBtn.addEventListener('click', () => {
        if (!searchDataInput || !searchTargetInput || !searchAlgoSelect) return;

        let algo = searchAlgoSelect.value;
        if (!algo) {
            algo = 'linear_searche';
            searchAlgoSelect.value = algo;
            searchAlgoSelect.dispatchEvent(new Event('change'));
        }

        if (algo === 'binary_search') {
            searchDataInput.value = '12, 5, 9, 1, 7, 3, 10, 2, 8, 6, 4, 11';
            searchTargetInput.value = '8';
        } else if (algo === 'linear_searche_both_sides') {
            searchDataInput.value = '14, 3, 9, 1, 7, 18, 5, 11, 6, 2';
            searchTargetInput.value = '11';
        } else {
            searchDataInput.value = '5, 3, 8, 1, 4, 2, 7, 6';
            searchTargetInput.value = '4';
        }

        resetSearchSession();
        renderSearchInputPreview();
        if (searchPlayer.el.status) searchPlayer.el.status.textContent = 'Пример загружен';
        if (window.lucide) lucide.createIcons();
    });
}

if (searchArrayToggle) {
    searchArrayToggle.addEventListener('click', () => {
        searchPlotCollapsed = !searchPlotCollapsed;
        applySearchPlotCollapsedState();
    });
}

window.addEventListener('resize', () => {
    syncSearchArrayToggle();
});

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
const spacingVal = document.getElementById('graph-spacing-val');
const scaleSlider = document.getElementById('graph-scale');
const scaleVal = document.getElementById('graph-scale-val');

function rerenderCurrentGraph() {
    if (!graphData) return;
    const algo = graphData.algorithm;
    if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
        renderFlowGraph(graphSvg, graphData.nodes, graphData.edges, graphData.source, graphData.sink, graphData.nodeLabels);
        if (graphPlayer.steps.length) renderFlowStepAt(graphPlayer.current);
    } else {
        const weighted = algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal' || algo === 'prim';
        renderGraph(graphSvg, graphData.nodes, graphData.edges, weighted, graphData.nodeLabels);
        if (graphPlayer.steps.length) renderGraphStepAt(graphPlayer.current);
    }
}

spacingSlider.addEventListener('input', () => {
    spacingVal.textContent = spacingSlider.value;
    setSpacing(Number(spacingSlider.value));
    rerenderCurrentGraph();
});

scaleSlider.addEventListener('input', () => {
    scaleVal.textContent = scaleSlider.value;
    setViewScale(Number(scaleSlider.value) / 100);
    rerenderCurrentGraph();
});

function graphSize(nodes, edges) {
    const n = Array.isArray(nodes) ? nodes.length : 0;
    const e = Array.isArray(edges) ? edges.length : 0;
    return { n, e, score: n + e * 0.65 };
}

function computeAutoSpacing(nodes, edges) {
    const { n, e } = graphSize(nodes, edges);
    if (n === 0) return 5;
    const raw = 5 + Math.max(0, n - 5) * 0.3 + Math.max(0, e - n) * 0.2;
    const min = Number(spacingSlider.min) || 1;
    const max = Number(spacingSlider.max) || 25;
    return Math.round(Math.max(min, Math.min(max, raw)));
}

function computeAutoViewScalePct(nodes, edges) {
    const { score } = graphSize(nodes, edges);
    if (score <= 9) return 100;
    const raw = 100 * Math.cbrt(9 / score);
    const min = Number(scaleSlider.min) || 40;
    const max = Number(scaleSlider.max) || 150;
    const pct = Math.max(min, Math.min(max, raw));
    return Math.round(pct / 5) * 5;
}

function applyAutoSpacing(nodes, edges) {
    const spacingValue = computeAutoSpacing(nodes, edges);
    spacingSlider.value = String(spacingValue);
    spacingVal.textContent = String(spacingValue);
    setSpacing(spacingValue);

    const scalePct = computeAutoViewScalePct(nodes, edges);
    scaleSlider.value = String(scalePct);
    scaleVal.textContent = String(scalePct);
    setViewScale(scalePct / 100);
}

document.getElementById('graph-algo').addEventListener('change', (e) => {
    const algo = e.target.value;
    
    const label = document.getElementById('edges-label');
    const sourceLabel = document.getElementById('source-label');
    const sinkField = document.getElementById('sink-field');
    const goalField = document.getElementById('goal-field');
    const cycleField = document.getElementById('hamiltonian-cycle-field');
    const startInput = document.getElementById('graph-start');
    
    if (sinkField) sinkField.style.display = 'none';
    if (goalField) goalField.style.display = 'none';
    if (cycleField) cycleField.style.display = 'none';

    startInput.disabled = false;
    startInput.placeholder = 'A';
    
    if (algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal' || algo === 'prim') {
        label.textContent = 'Рёбра (по одному на строке: A B вес):';
        if (sourceLabel) sourceLabel.textContent = 'Стартовая вершина:';
    } 
    else if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
        label.textContent = 'Рёбра (A B пропускная_способность):';
        if (sourceLabel) sourceLabel.textContent = 'Источник (source):';
        if (sinkField) sinkField.style.display = 'flex';
    } 
    else if (algo === 'tarjan' || algo === 'kosaraju') {
        label.textContent = 'Рёбра ориентированного графа (A B):';
        if (sourceLabel) sourceLabel.textContent = 'Не требуется:';
        startInput.disabled = true;
        startInput.placeholder = 'Не требуется';
        startInput.value = '';
    } 
    else if (algo === 'astar' || algo === 'bidijkstra') {
        label.textContent = 'Рёбра (по одному на строке: A B вес):';
        if (sourceLabel) sourceLabel.textContent = 'Старт:';
        if (goalField) goalField.style.display = 'flex'; 
    } 
    else if (algo === 'hierholzer') {
        label.textContent = 'Рёбра ориентированного графа (A B):';
        if (sourceLabel) sourceLabel.textContent = 'Не требуется:';
        startInput.disabled = true;
        startInput.placeholder = 'Не требуется';
        startInput.value = '';
    } 
    else if (algo === 'hamiltonian') {
        label.textContent = 'Рёбра (по одному на строке: A B):';
        if (sourceLabel) sourceLabel.textContent = 'Начальная вершина:';
        if (cycleField) cycleField.style.display = 'flex';
    }
    else if (algo === 'topological_sort') {
        label.textContent = 'Рёбра ориентированного графа (A B):';
        if (sourceLabel) sourceLabel.textContent = 'Не требуется:';
        if (sinkField) sinkField.style.display = 'none';
        if (goalField) goalField.style.display = 'none';
        startInput.disabled = true;
        startInput.placeholder = 'Не требуется';
        startInput.value = '';
    } else if (algo === 'connected_components') {
        label.textContent = 'Рёбра неориентированного графа (A B):';
        if (sourceLabel) sourceLabel.textContent = 'Не требуется:';
        if (sinkField) sinkField.style.display = 'none';
        if (goalField) goalField.style.display = 'none';
        startInput.disabled = true;
        startInput.placeholder = 'Не требуется';
        startInput.value = '';
    } else if (algo === 'graph_coloring') {
        label.textContent = 'Рёбра неориентированного графа (A B):';
        if (sourceLabel) sourceLabel.textContent = 'Не требуется:';
        if (sinkField) sinkField.style.display = 'none';
        if (goalField) goalField.style.display = 'none';
        startInput.disabled = true;
        startInput.placeholder = 'Не требуется';
        startInput.value = '';
    } else {
        label.textContent = 'Рёбра (по одному на строке: A B):';
        if (sourceLabel) sourceLabel.textContent = 'Начальная вершина:';
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
    } else if (algo === 'prim') {
        document.getElementById('graph-edges').value = 'A B 4\nA C 2\nB C 1\nB D 5\nC D 8\nC E 10\nD E 2\nD F 6\nE F 3';
        document.getElementById('graph-start').value = 'A';
    } else if (algo === 'tarjan' || algo === 'kosaraju') { 
    document.getElementById('graph-edges').value = 'A B\nB C\nC A\nC D\nD E\nE D\nF C';
    document.getElementById('graph-start').value = '';
    } else if (algo === 'stalin_sort') {
        document.getElementById('graph-edges').value = 'A B\nA C\nB C\nC D\nD E\nB E';
        document.getElementById('graph-start').value = '';
    } else if (algo === 'hierholzer') {
        // Граф K3 + квадрат с общей вершиной — все степени чётные, есть эйлеров цикл
        document.getElementById('graph-edges').value = 'A B\nB C\nC A\nA D\nD E\nE A';
        document.getElementById('graph-start').value = '';
    } else if (algo === 'hamiltonian') {
        // K4 — гамильтонов путь и цикл существуют
        document.getElementById('graph-edges').value = 'A B\nA C\nA D\nB C\nB D\nC D';
        document.getElementById('graph-start').value = 'A';
    } else if (algo === 'astar' || algo === 'bidijkstra') {
        document.getElementById('graph-edges').value = 'A B 1\nA C 4\nB D 2\nC D 1\nC E 3\nD F 2\nE F 1';
        document.getElementById('graph-start').value = 'A';
        document.getElementById('graph-goal').value = 'F';
    } else if (algo === 'topological_sort') {
        document.getElementById('graph-edges').value = 'A B\nA C\nB D\nC D\nD E';
        document.getElementById('graph-start').value = '';
    } else if (algo === 'connected_components') {
        document.getElementById('graph-edges').value = 'A B\nB C\nD E\nE F\nF D';
        document.getElementById('graph-start').value = '';
    } else if (algo === 'graph_coloring') {
        document.getElementById('graph-edges').value = 'A B\nA C\nB C\nB D\nC D\nD E\nE F\nF D';
        document.getElementById('graph-start').value = '';
    } else {
        document.getElementById('graph-edges').value = 'A B\nA C\nB D\nC D\nD E\nE F\nC F';
        document.getElementById('graph-start').value = 'A';
    }
});

function updateGraphEdgesLabelEnhanced(algo) {
    const label = document.getElementById('edges-label');
    if (algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal' || algo === 'prim') {
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
    const goalNode = document.getElementById('graph-goal')?.value.trim();

    if (!rawEdges) {
        graphPlayer.el.status.textContent = 'Введите рёбра';
        return;
    }

    if (!startNode && algo !== 'kruskal' && algo !== 'ford_fulkerson' && algo !== 'tarjan' && algo !== 'kosaraju' && algo !== 'stalin_sort' && algo !== 'hierholzer' && algo !== 'topological_sort' && algo !== 'connected_components' & algo !== 'graph_coloring') {
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
    
    if (algo === 'astar' || algo === 'bidijkstra') {
        if (!startNode || !goalNode) {
            graphPlayer.el.status.textContent = 'Введите старт и цель';
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
        if (algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal' || algo === 'prim' ||
            algo === 'ford_fulkerson' || algo === 'edmonds_karp' || algo === 'astar' || 
            algo === 'bidijkstra') {
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
        const findCycleInput = document.getElementById('graph-find-cycle');
        const findCycle = !!(findCycleInput && findCycleInput.checked);

        const reqBody = (algo === 'astar' || algo === 'bidijkstra')
            ? { edges, start_node: startNode, goal_node: goalNode, node_coords: [] }
            : (algo === 'kruskal' || algo === 'tarjan' || algo === 'kosaraju' || algo === 'stalin_sort' || algo === 'hierholzer' || algo === 'topological_sort' || algo === 'connected_components' || algo === 'graph_coloring')
                ? { edges }
                : algo === 'ford_fulkerson' || algo === 'edmonds_karp'
                    ? { edges, start_node: startNode, sink: sinkNode }
                    : algo === 'hamiltonian'
                        ? { edges, start_node: startNode, find_cycle: findCycle }
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

        applyAutoSpacing(graphData.nodes, graphData.edges);

        if (algo === 'ford_fulkerson' || algo === 'edmonds_karp') {
            graphPlayer.renderFn = renderFlowStepAt;
            renderFlowGraph(graphSvg, graphData.nodes, graphData.edges, graphData.source, graphData.sink, graphData.nodeLabels);
            renderFlowStepAt(0);
        } else if (algo === 'tarjan' || algo === 'kosaraju') { 
            graphPlayer.renderFn = algo === 'tarjan' ? renderTarjanStepAt : renderKosarajuStepAt;
            renderGraph(graphSvg, graphData.nodes, graphData.edges, false, graphData.nodeLabels);
            if (algo === 'tarjan') renderTarjanStepAt(0);
            else renderKosarajuStepAt(0);
        } else if (algo === 'astar') {
            graphPlayer.renderFn = renderAStarStepAt;
            renderGraph(graphSvg, graphData.nodes, graphData.edges, true, graphData.nodeLabels);
            renderAStarStepAt(0);
        } else if (algo === 'bidijkstra') {
            graphPlayer.renderFn = renderBiDijkstraStepAt;
            renderGraph(graphSvg, graphData.nodes, graphData.edges, true, graphData.nodeLabels);
            renderBiDijkstraStepAt(0);
        } else if (algo === 'topological_sort') {
            graphPlayer.renderFn = renderTopoSortStepAt;
            renderGraph(graphSvg, graphData.nodes, graphData.edges, false, graphData.nodeLabels);
            renderTopoSortStepAt(0);
        } else if (algo === 'connected_components') {
            graphPlayer.renderFn = renderDSUStepAt;
            renderGraph(graphSvg, graphData.nodes, graphData.edges, false, graphData.nodeLabels);
            renderDSUStepAt(0);
        } else if (algo === 'graph_coloring') {
            graphPlayer.renderFn = renderColoringStepAt;
            renderGraph(graphSvg, graphData.nodes, graphData.edges, false, graphData.nodeLabels);
            renderColoringStepAt(0);
        } else {
            graphPlayer.renderFn = renderGraphStepAt;
            const weighted = algo === 'dijkstra' || algo === 'bellman_ford' || algo === 'kruskal' || algo === 'prim';
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
function renderAStarStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateAStarStep(
        graphSvg,
        graphData.nodes,
        graphData.edges,
        step,
        graphData.nodeLabels,
        graphData.node_coords || {}
    );
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = step.path_found 
        ? `Путь найден! Шаг ${idx + 1}` 
        : `Шаг ${idx + 1} / ${graphPlayer.steps.length}`;
}
function renderBiDijkstraStepAt(idx) {
    const step = graphPlayer.steps[idx];
    graphInfo.innerHTML = updateBiDijkstraStep(graphSvg, graphData.nodes, graphData.edges, step, graphData.nodeLabels);
    graphPlayer.el.status.textContent = step.path_found ? `Путь найден!` : `Шаг ${idx+1} / ${graphPlayer.steps.length}`;
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

function renderTarjanStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateTarjanStep(  
        graphSvg,
        graphData.nodes,
        graphData.edges,
        step,
        graphData.nodeLabels
    );
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = `Шаг ${idx + 1} / ${graphPlayer.steps.length}`;
}

function renderKosarajuStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateKosarajuStep(
        graphSvg,
        graphData.nodes,
        graphData.edges,
        step,
        graphData.nodeLabels
    );
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = `Фаза ${step.phase}, шаг ${idx + 1} / ${graphPlayer.steps.length}`;
}
function renderTopoSortStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateTopoSortStep(graphSvg, graphData.nodes, graphData.edges, step, graphData.nodeLabels);
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = step.has_cycle 
        ? `Цикл обнаружен! Шаг ${idx + 1}` 
        : `Шаг ${idx + 1} / ${graphPlayer.steps.length}`;
}
function renderDSUStepAt(idx) {
    const step = graphPlayer.steps[idx];
    graphInfo.innerHTML = updateDSUStep(graphSvg, graphData.nodes, graphData.edges, step, graphData.nodeLabels);
    graphPlayer.el.status.textContent = `Компонент: ${step.components_count} | Шаг ${idx+1} / ${graphPlayer.steps.length}`;
}

function renderColoringStepAt(idx) {
    const step = graphPlayer.steps[idx];
    graphInfo.innerHTML = updateColoringStep(graphSvg, graphData.nodes, graphData.edges, step, graphData.nodeLabels);
    graphPlayer.el.status.textContent = `Цветов: ${step.used_colors} | Шаг ${idx+1} / ${graphPlayer.steps.length}` ;
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
    if (!Array.isArray(player.steps) || player.steps.length === 0) return;
    
    // Если мы уже в конце, начинаем сначала
    if (player.current >= player.steps.length - 1) {
        player.current = 0;
    }

    player.playing = true;
    player.el.play.innerHTML = '<i data-lucide="pause"></i> <span>Пауза</span>';
    player.el.play.classList.remove('primary');
    refreshIcons();

    // Сразу рендерим текущий шаг
    (player.renderFn || renderFn)(player.current);

    function loop() {
        // ПРОВЕРКА ПАУЗЫ: если playing false, выходим из цикла и меняем иконку
        if (!player.playing) {
            player.el.play.innerHTML = '<i data-lucide="play"></i> <span>Старт</span>';
            player.el.play.classList.add('primary');
            refreshIcons();
            return;
        }

        // Если достигли конца
        if (player.current >= player.steps.length - 1) {
            stopPlayer(player);
            return;
        }

        player.timer = setTimeout(() => {
            // Повторная проверка внутри таймаута на случай быстрой паузы
            if (!player.playing) return; 
            
            player.current++;
            
            // Рендерим новый шаг
            (player.renderFn || renderFn)(player.current);
            
            // Проверка для подстрок: если нашли совпадение, останавливаемся и показываем результат
            if (player === substringPlayer) {
                const currentStep = player.steps[player.current];
                if (currentStep && (currentStep['is_found'] || currentStep['is_full_match'])) {
                    stopPlayer(player);
                    // Принудительно обновляем статус, чтобы гарантировать вывод индекса
                    const foundPos = currentStep['found_pos'] !== undefined ? currentStep['found_pos'] : currentStep['match_start_pos'];
                    player.el.status.textContent = `Индекс первого совпадения: ${foundPos}`;
                    return;
                }
            }

            loop();
        }, player.speed);
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

// === Логика тултипа с описанием алгоритма ===
const algoInfoBtn = document.getElementById('graph-algo-info');
const algoTooltip = document.getElementById('graph-algo-tooltip');
const tooltipTitle = document.getElementById('tooltip-title');
const tooltipDesc = document.getElementById('tooltip-desc');
const tooltipTime = document.getElementById('tooltip-time');
const tooltipMemory = document.getElementById('tooltip-memory');
const graphAlgoSelect = document.getElementById('graph-algo');

function updateAlgoTooltip(algo) {
    const meta = GRAPH_ALGO_META[algo];
    if (!meta) return;
    
    tooltipTitle.textContent = meta.title;
    tooltipDesc.textContent = meta.desc;
    tooltipTime.textContent = meta.time;
    tooltipMemory.textContent = meta.memory;
}

if (algoInfoBtn && algoTooltip) {
    algoInfoBtn.addEventListener('mouseenter', () => {
        const algo = graphAlgoSelect.value;
        updateAlgoTooltip(algo);
        algoTooltip.style.display = 'block';
    });
    
    algoInfoBtn.addEventListener('mouseleave', () => {
        algoTooltip.style.display = 'none';
    });
    
    algoTooltip.addEventListener('mouseenter', () => {
        algoTooltip.style.display = 'block';
    });
    algoTooltip.addEventListener('mouseleave', () => {
        algoTooltip.style.display = 'none';
    });
}

if (graphAlgoSelect) {
    graphAlgoSelect.addEventListener('change', (e) => {
        if (algoTooltip.style.display !== 'none') {
            updateAlgoTooltip(e.target.value);
        }
    });
    updateAlgoTooltip(graphAlgoSelect.value);
}

// --- SUBSTRINGS CONTROLS INIT ---
substringPlayer.el.prev = document.getElementById('substring-prev');
substringPlayer.el.play = document.getElementById('substring-play');
substringPlayer.el.next = document.getElementById('substring-next');
substringPlayer.el.speed = document.getElementById('substring-speed');
substringPlayer.el.speedVal = document.getElementById('substring-speed-val');
substringPlayer.el.controls = document.getElementById('substring-controls');
substringPlayer.el.status = document.getElementById('substring-status');

if (substringPlayer.el.speed) {
    substringPlayer.el.speed.addEventListener('input', (e) => {
        substringPlayer.speed = parseInt(e.target.value);
        substringPlayer.el.speedVal.textContent = substringPlayer.speed + 'ms';
    });
}
if (substringPlayer.el.prev) {
    substringPlayer.el.prev.addEventListener('click', () => {
        if (substringPlayer.current > 0) {
            stopPlayer(substringPlayer);
            substringPlayer.current--;
            renderSubstringStep(substringPlayer.current);
        }
    });
}
if (substringPlayer.el.next) {
    substringPlayer.el.next.addEventListener('click', () => {
        if (substringPlayer.current < substringPlayer.steps.length - 1) {
            substringPlayer.current++;
            renderSubstringStep(substringPlayer.current);
        } else {
            stopPlayer(substringPlayer);
        }
    });
}
if (substringPlayer.el.play) {
    substringPlayer.el.play.addEventListener('click', async () => {
        const algo = document.getElementById('substring-algo').value;
        if (!algo) {
            substringPlayer.el.status.textContent = 'Выберите алгоритм';
            return;
        }

        if (substringPlayer.playing) {
            stopPlayer(substringPlayer);
            return;
        }

        const text = document.getElementById('substring-text').value;
        const pattern = document.getElementById('substring-pattern').value;
        const shouldReload =
            substringPlayer.steps.length === 0 ||
            substringData.text !== text ||
            substringData.pattern !== pattern;

        if (shouldReload) {
            substringPlayer.el.status.textContent = 'Загрузка...';
            try {
                await loadSubstringData();
            } catch (e) {
                substringPlayer.el.status.textContent = `Ошибка: ${e.message}`;
                return;
            }
        }

        startPlayer(substringPlayer, renderSubstringStep);
    });
}

// Обработчик кнопки "Пример" для подстрок
const substringExampleBtn = document.getElementById('substring-example');
if (substringExampleBtn) {
    substringExampleBtn.addEventListener('click', () => {
        const textInput = document.getElementById('substring-text');
        const patternInput = document.getElementById('substring-pattern');
        
        // Значения по умолчанию (укорочены до 15 символов)
        const algo = document.getElementById('substring-algo').value;
        if (algo === 'boyer_moore') {
            textInput.value = "HEREISASIMPLE";
            patternInput.value = "SIMPLE";
        } else if (algo === 'quick_search') {
            textInput.value = "abracadabra";
            patternInput.value = "cad";
        } else {
            textInput.value = "ABABDABACDABABC";
            patternInput.value = "ABABC";
        }
        
        // Сброс визуализации и триггер обновления превью
        resetSubstringSession();
        
        // Если алгоритм выбран, сразу показываем превью
        if (algo) {
             setTimeout(() => {
                 updateSubstringPreview();
             }, 10);
        }
        
        if (window.lucide) lucide.createIcons();
    });
}

// Функция для мгновенного обновления превью при изменении текста
async function updateSubstringPreview() {
    const algo = document.getElementById('substring-algo').value;
    if (!algo) return;

    const text = document.getElementById('substring-text').value;
    const pattern = document.getElementById('substring-pattern').value;

    // Показываем начальное состояние (шаг 0) или пустую визуализацию
    // Чтобы не спамить сервер при каждом нажатии клавиши, можно сделать debounce, 
    // но для простоты вызовем загрузку данных и сбросим плеер на шаг 0
    
    try {
        // Загружаем данные silently
        const res = await fetch(`/api/substrings/${algo}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, pattern }),
        });
        if (!res.ok) return;
        
        const result = await res.json();
        substringData = result;
        substringPlayer.steps = result.steps;
        substringPlayer.current = 0;
        
        // Обновляем визуализацию на первом шаге
        if (substringData.steps.length > 0) {
            renderSubstringStep(0);
        } else {
            renderSubstringViz(document.getElementById('substring-plot'), text, pattern, null);
        }
        substringPlayer.el.status.textContent = 'Готово к запуску';
    } catch (e) {
        // Игнорируем ошибки при превью
    }
}

// Слушатели изменений в полях ввода
const substringTextInput = document.getElementById('substring-text');
const substringPatternInput = document.getElementById('substring-pattern');

if (substringTextInput) {
    substringTextInput.addEventListener('input', () => {
        // Динамическое ограничение длины паттерна длиной текста
        const len = substringTextInput.value.length;
        substringPatternInput.maxLength = Math.max(1, len);
        
        // Если текущий паттерн длиннее нового текста, обрезаем его
        if (substringPatternInput.value.length > len) {
            substringPatternInput.value = substringPatternInput.value.substring(0, len);
        }
        
        updateSubstringPreview();
    });
}

if (substringPatternInput) {
    substringPatternInput.addEventListener('input', () => {
        updateSubstringPreview();
    });
}

async function loadSubstringData() {
    const algo = document.getElementById('substring-algo').value;
    const text = document.getElementById('substring-text').value;
    const pattern = document.getElementById('substring-pattern').value;
    
    if (!text && !pattern) throw new Error("Введите текст и паттерн");
    
    const res = await fetch(`/api/substrings/${algo}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, pattern }),
    });
    if (!res.ok) {
        let msg = res.statusText;
        try { const j = await res.json(); msg = j.detail || msg; } catch { }
        throw new Error(msg);
    }
    const result = await res.json();
    substringData = result;
    substringPlayer.steps = result.steps;
    substringPlayer.current = 0;
    // Кнопки всегда видны, но статус обновляем
    if (substringData.steps.length === 0) {
        renderSubstringViz(document.getElementById('substring-plot'), substringData.text, substringData.pattern, null);
        substringPlayer.el.status.textContent = 'Нет шагов';
        return;
    }
    renderSubstringStep(0);
}

function renderSubstringStep(idx) {
    const msg = updateSubstringStep(
        document.getElementById('substring-plot'),
        substringData.steps,
        substringData.text,
        substringData.pattern,
        idx
    );
    substringPlayer.el.status.textContent = msg;
}
