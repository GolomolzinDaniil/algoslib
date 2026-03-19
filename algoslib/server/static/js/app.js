import { renderSortingCells, updateSortingStep } from './sorting-viz.js';
import { renderGraph, updateGraphStep } from './graph-viz.js';

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab).classList.add('active');
    });
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
let sortData = { history: [], initialArray: [] };

const sortPlot = document.getElementById('sort-plot');

document.getElementById('sort-run').addEventListener('click', async () => {
    const raw = document.getElementById('sort-data').value;
    const data = raw.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (data.length === 0) {
        sortPlayer.el.status.textContent = 'Введите числа через запятую';
        return;
    }

    const algo = document.getElementById('sort-algo').value;
    sortPlayer.el.status.textContent = 'Загрузка...';

    try {
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
        const result = await res.json();

        sortData.history = result.history;
        sortData.initialArray = result.initial_array;
        sortPlayer.steps = result.history;
        sortPlayer.current = 0;
        stopPlayer(sortPlayer);

        sortPlayer.el.controls.style.display = 'flex';
        renderSortingCells(sortPlot, result.initial_array,
            result.history[0].fst, result.history[0].snd, result.history[0].sorted, sortPlayer.speed, result.direction);
        sortPlayer.el.status.textContent = updateSortingStep(
            sortPlot, sortData.history, sortData.initialArray, 0, sortPlayer.speed);
    } catch (e) {
        sortPlayer.el.status.textContent = `Ошибка: ${e.message}`;
    }
});

function renderSortStep(idx) {
    const msg = updateSortingStep(sortPlot, sortData.history, sortData.initialArray, idx, sortPlayer.speed);
    sortPlayer.el.status.textContent = msg;
}

const graphSvg = document.getElementById('graph-svg');
const graphInfo = document.getElementById('graph-info');

document.getElementById('graph-algo').addEventListener('change', (e) => {
    const label = document.getElementById('edges-label');
    if (e.target.value === 'dijkstra') {
        label.textContent = 'Рёбра (по одному на строку: u v вес):';
    } else {
        label.textContent = 'Рёбра (по одному на строку: u v):';
    }
});

document.getElementById('graph-example').addEventListener('click', () => {
    const algo = document.getElementById('graph-algo').value;
    if (algo === 'dijkstra') {
        document.getElementById('graph-edges').value = '0 1 4\n0 2 1\n1 3 1\n2 1 2\n2 3 5\n3 4 3';
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
        if (algo === 'dijkstra' && parts.length >= 3) {
            edges.push([parts[0], parts[1], parts[2]]);
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

        renderGraph(graphSvg, result.nodes, result.edges, algo === 'dijkstra');
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
    player.el.play.addEventListener('click', () => {
        if (player.playing) stopPlayer(player);
        else startPlayer(player, renderFn);
    });
    player.el.speed.addEventListener('input', (e) => {
        player.speed = parseInt(e.target.value);
        player.el.speedVal.textContent = player.speed + 'ms';
    });
}

wireControls(sortPlayer, renderSortStep);
wireControls(graphPlayer, renderGraphStepAt);
