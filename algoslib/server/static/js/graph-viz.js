import {
    forceSimulation,
    forceLink,
    forceManyBody,
    forceCenter,
    forceCollide,
    forceX,
    forceY,
} from 'https://cdn.jsdelivr.net/npm/d3-force@3/+esm';

const COLORS = {
    defaultNode: '#569cd6',
    current:     '#f44747',
    visited:     '#4ec9b0',
    queue:       '#ce9178',
    defaultEdge: '#3e3e42',
    activeEdge:  '#f44747',
    relaxedEdge: '#4ec9b0',
    nodeText:    '#1e1e1e',
    distText:    '#cccccc',
};

const NODE_R = 22;
const W = 600;
const H = 400;

let positions = {};
let currentSpacing = 5;

export function setSpacing(val) {
    currentSpacing = val;
}

function getNodeLabel(nodeId, nodeLabels = {}) {
    const label = nodeLabels[String(nodeId)];
    return label !== undefined ? label : String(nodeId);
}

export function renderGraph(svg, nodes, edges, weighted, nodeLabels = {}) {
    positions = forceLayout(nodes, edges, W, H, currentSpacing);
    draw(svg, nodes, edges, weighted, {}, [], null, null, nodeLabels);
}

export function updateGraphStep(svg, nodes, edges, step, algorithm, nodeLabels = {}) {
    const weighted = algorithm === 'dijkstra' || algorithm === 'bellman_ford';
    const visited = new Set(step.visited || []);
    const inQueue = new Set(step.queue || []);
    const current = step.current_node !== undefined ? step.current_node : null;

    let activeEdge = null;
    let relaxedEdge = null;

    if (algorithm === 'bellman_ford') {
        activeEdge = [step.edge_from, step.edge_to];
        if (step.relaxed) {
            relaxedEdge = [step.edge_from, step.edge_to];
        }
    }

    const nodeColors = {};
    for (const n of nodes) {
        if (algorithm === 'bellman_ford') {
            if (n === step.edge_from) nodeColors[n] = COLORS.current;
            else if (visited.has(n)) nodeColors[n] = COLORS.visited;
            else nodeColors[n] = COLORS.defaultNode;
        } else {
            if (n === current) nodeColors[n] = COLORS.current;
            else if (visited.has(n)) nodeColors[n] = COLORS.visited;
            else if (inQueue.has(n)) nodeColors[n] = COLORS.queue;
            else nodeColors[n] = COLORS.defaultNode;
        }
    }

    draw(
        svg,
        nodes,
        edges,
        weighted,
        nodeColors,
        step.distances || {},
        activeEdge,
        relaxedEdge,
        nodeLabels
    );
    return formatInfo(step, algorithm, nodeLabels);
}

function forceLayout(nodes, edges, w, h, spacing) {
    const s = (spacing || 5) / 5;
    const pad = NODE_R + 20;

    const simNodes = nodes.map((id) => ({ id }));
    const nodeIndex = {};
    simNodes.forEach((n, i) => {
        nodeIndex[n.id] = i;
    });

    const simLinks = [];
    for (const e of edges) {
        const src = nodeIndex[e[0]];
        const tgt = nodeIndex[e[1]];
        if (src !== undefined && tgt !== undefined) {
            simLinks.push({ source: src, target: tgt });
        }
    }

    const baseDist = Math.max(60, Math.min(140, 600 / nodes.length));
    const linkDist = baseDist * s;
    const charge = -250 * s;
    const collide = (NODE_R + 8) * s;

    const sim = forceSimulation(simNodes)
        .force('charge', forceManyBody().strength(charge))
        .force('link', forceLink(simLinks).distance(linkDist).strength(1))
        .force('center', forceCenter(w / 2, h / 2))
        .force('collide', forceCollide(collide))
        .force('x', forceX(w / 2).strength(0.05))
        .force('y', forceY(h / 2).strength(0.05))
        .stop();

    for (let i = 0; i < 300; i++) sim.tick();

    const pos = {};
    for (const n of simNodes) {
        pos[n.id] = {
            x: Math.max(pad, Math.min(w - pad, n.x)),
            y: Math.max(pad, Math.min(h - pad, n.y)),
        };
    }
    return pos;
}

function draw(svg, nodes, edges, weighted, nodeColors, distances, activeEdge, relaxedEdge, nodeLabels = {}) {
    let html = '';

    for (const edge of edges) {
        const [u, v] = edge;
        const p1 = positions[u];
        const p2 = positions[v];
        if (!p1 || !p2) continue;

        let color = COLORS.defaultEdge;
        let strokeWidth = 2.5;

        if (relaxedEdge && relaxedEdge[0] === u && relaxedEdge[1] === v) {
            color = COLORS.relaxedEdge;
            strokeWidth = 4;
        } else if (activeEdge && activeEdge[0] === u && activeEdge[1] === v) {
            color = COLORS.activeEdge;
            strokeWidth = 4;
        }

        html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                       stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;

        if (weighted && edge.length >= 3) {
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2;
            html += `<rect x="${mx - 14}" y="${my - 10}" width="28" height="20" rx="4"
                           fill="#252526" stroke="#3e3e42" stroke-width="1"/>`;
            html += `<text x="${mx}" y="${my + 5}" text-anchor="middle"
                           fill="${COLORS.distText}" font-size="12"
                           font-family="'JetBrains Mono', monospace">${edge[2]}</text>`;
        }
    }

    for (const n of nodes) {
        const p = positions[n];
        if (!p) continue;
        const fill = nodeColors[n] || COLORS.defaultNode;
        html += `<circle cx="${p.x}" cy="${p.y}" r="${NODE_R}"
                         fill="${fill}" stroke="#1e1e1e" stroke-width="2.5"/>`;
        html += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle"
                       fill="${COLORS.nodeText}" font-size="15" font-weight="bold"
                       font-family="'JetBrains Mono', monospace">${getNodeLabel(n, nodeLabels)}</text>`;

        if (distances && distances[String(n)] !== undefined) {
            const d = distances[String(n)];
            const label = d === null ? '∞' : d;
            html += `<text x="${p.x}" y="${p.y - NODE_R - 8}" text-anchor="middle"
                           fill="${COLORS.distText}" font-size="12"
                           font-family="'JetBrains Mono', monospace">d=${label}</text>`;
        }
    }

    svg.innerHTML = html;
}

function formatInfo(step, algorithm, nodeLabels = {}) {
    const lines = [];

    if (algorithm === 'bellman_ford') {
        lines.push(`<span class="label">Итерация:</span> <span class="value">${step.iteration}</span>`);
        lines.push(
            `<span class="label">Ребро:</span> <span class="value">${getNodeLabel(step.edge_from, nodeLabels)} → ${getNodeLabel(step.edge_to, nodeLabels)}</span>`
        );
        lines.push(`<span class="label">Релаксация:</span> <span class="value">${step.relaxed ? 'Да' : 'Нет'}</span>`);
    } else {
        lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(step.current_node, nodeLabels)}</span>`);
        lines.push(
            `<span class="label">Посещены:</span> <span class="value">[${(step.visited || []).map((node) => getNodeLabel(node, nodeLabels)).join(', ')}]</span>`
        );
        lines.push(
            `<span class="label">Очередь:</span> <span class="value">[${(step.queue || []).map((node) => getNodeLabel(node, nodeLabels)).join(', ')}]</span>`
        );
    }

    if ((algorithm === 'dijkstra' || algorithm === 'bellman_ford') && step.distances) {
        const dists = Object.entries(step.distances)
            .map(([k, v]) => `${getNodeLabel(k, nodeLabels)}:${v === null ? '∞' : v}`)
            .join(', ');
        lines.push(`<span class="label">Расстояния:</span> <span class="value">{${dists}}</span>`);
    }

    return lines.join('<br>');
}
