import { renderSortingCells, updateSortingStep } from './sorting-viz.js';
import { renderGraph, updateGraphStep } from './graph-viz.js';

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
    }
};
const MAX_SORT_ITEMS = 15;

document.addEventListener('DOMContentLoaded', () => {
    initSortingPage();
    if (window.lucide) setTimeout(() => lucide.createIcons(), 100);
});

function initSortingPage() {
    const header = document.getElementById('sort-header');
    if (header) {
        header.style.display = 'block';
        document.getElementById('sort-title').textContent = '🔤 Сортировки';
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
}

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');

        if (tab.dataset.tab === 'sorting') {
            initSortingPage();
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
        document.getElementById('sort-title').textContent = '🔤 Сортировки';
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

let graphData = { nodes: [], edges: [], algorithm: 'bfs' };
let sortData = { history: [], initialArray: [], sortedArray: [] };
const sortPlot = document.getElementById('sort-plot');
const sortDataInput = document.getElementById('sort-data');
const sortFileInput = document.getElementById('sort-file');
const sortDownloadFileBtn = document.getElementById('sort-download-file');

function parseSortInput(raw) {
    return raw
        .split(/[\s,;]+/)
        .map(part => parseFloat(part.trim()))
        .filter(value => !Number.isNaN(value));
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

    renderSortingCells(sortPlot, data, -1, -1, 0, sortPlayer.speed, direction);
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
    renderSortingCells(
        sortPlot,
        sortData.initialArray,
        sortData.history[0]?.compare_a ?? 0,
        sortData.history[0]?.compare_b ?? 0,
        sortData.history[0]?.sorted_num ?? 0,
        sortPlayer.speed,
        direction
    );

    sortPlayer.el.status.textContent = updateSortingStep(
        sortPlot,
        sortData.history,
        sortData.initialArray,
        0,
        sortPlayer.speed,
        direction
    );
}

if (sortDataInput) {
    sortDataInput.addEventListener('input', (e) => {
        const input = e.target;
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
        if (!file) return;

        try {
            const text = await file.text();
            const numbers = parseSortInput(text);
            if (numbers.length === 0) {
                throw new Error('Файл не содержит чисел');
            }

            const limitedNumbers = numbers.slice(0, MAX_SORT_ITEMS);
            sortDataInput.value = limitedNumbers.join(', ');

            resetSortingSession();
            renderSortInputPreview();

            if (numbers.length > MAX_SORT_ITEMS) {
                sortPlayer.el.status.textContent =
                    `В файле больше ${MAX_SORT_ITEMS} чисел, взяты первые ${MAX_SORT_ITEMS}`;
            } else {
                sortPlayer.el.status.textContent = `Файл ${file.name} загружен`;
            }
        } catch (error) {
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
    const data = parseSortInput(raw);
    if (data.length === 0) {
        throw new Error('Введите числа через запятую');
    }
    if (data.length > MAX_SORT_ITEMS) {
        throw new Error(`Можно ввести максимум ${MAX_SORT_ITEMS} чисел`);
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
        direction
    );
    sortPlayer.el.status.textContent = msg;
}

const graphSvg = document.getElementById('graph-svg');
const graphInfo = document.getElementById('graph-info');

document.getElementById('graph-algo').addEventListener('change', (e) => {
    const label = document.getElementById('edges-label');
    const algo = e.target.value;
    if (algo === 'dijkstra' || algo === 'bellman_ford') {
        label.textContent = 'Рёбра (по одному на строке: u v вес):';
    } else {
        label.textContent = 'Рёбра (по одному на строке: u v):';
    }
});

document.getElementById('graph-example').addEventListener('click', () => {
    const algo = document.getElementById('graph-algo').value;
    if (algo === 'dijkstra') {
        document.getElementById('graph-edges').value = '0 1 4\n0 2 1\n1 3 1\n2 1 2\n2 3 5\n3 4 3';
    } else if (algo === 'bellman_ford') {
        document.getElementById('graph-edges').value = '0 1 4\n0 2 5\n1 2 -3\n2 3 2\n3 1 1';
    } else {
        document.getElementById('graph-edges').value = '0 1\n0 2\n1 3\n2 3\n3 4\n4 5\n2 5';
    }
    document.getElementById('graph-start').value = '0';
});

document.getElementById('graph-run').addEventListener('click', async () => {
    const algo = document.getElementById('graph-algo').value;
    const startNode = parseInt(document.getElementById('graph-start').value);
    const rawEdges = document.getElementById('graph-edges').value.trim();

    if (!rawEdges) {
        graphPlayer.el.status.textContent = 'Введите рёбра';
        return;
    }

    const edges = [];
    for (const line of rawEdges.split('\n')) {
        const parts = line.trim().split(/\s+/).map(Number);
        if (parts.some(isNaN)) continue;
        if (algo === 'dijkstra' || algo === 'bellman_ford') {
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
        const res = await fetch(`/api/graphs/${algo}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ edges, start_node: startNode }),
        });
        if (!res.ok) {
            let msg = res.statusText;
            try { const j = await res.json(); msg = j.detail || msg; } catch { }
            throw new Error(msg);
        }
        const result = await res.json();

        graphData = { nodes: result.nodes, edges: result.edges, algorithm: algo };
        graphPlayer.steps = result.steps;
        graphPlayer.current = 0;
        stopPlayer(graphPlayer);

        graphPlayer.el.controls.style.display = 'flex';
        graphInfo.style.display = 'block';

        renderGraph(graphSvg, result.nodes, result.edges, algo === 'dijkstra' || algo === 'bellman_ford');
        renderGraphStepAt(0);
    } catch (e) {
        graphPlayer.el.status.textContent = `Ошибка: ${e.message}`;
    }
});
function renderGraphStepAt(idx) {
    const step = graphPlayer.steps[idx];
    const info = updateGraphStep(graphSvg, graphData.nodes, graphData.edges, step, graphData.algorithm);
    graphInfo.innerHTML = info;
    graphPlayer.el.status.textContent = `Шаг ${idx + 1} / ${graphPlayer.steps.length}`;
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
        renderFn(player.current);
        player.timer = setTimeout(loop, player.speed);
    }
    loop();
}

function wireControls(player, renderFn) {
    player.el.prev.addEventListener('click', () => {
        if (player.current > 0) {
            stopPlayer(player);
            player.current--;
            renderFn(player.current);
        }
    });
    player.el.next.addEventListener('click', () => {
        if (player.current < player.steps.length - 1) {
            player.current++;
            renderFn(player.current);
        } else {
            stopPlayer(player);
        }
    });
    player.el.speed.addEventListener('input', (e) => {
        player.speed = parseInt(e.target.value);
        player.el.speedVal.textContent = player.speed + 'ms';
    });
}

wireControls(graphPlayer, renderGraphStepAt);
