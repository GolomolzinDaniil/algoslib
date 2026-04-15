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
    exiled:      '#4a4a4a',
    defaultEdge: '#3e3e42',
    activeEdge:  '#f44747',
    relaxedEdge: '#4ec9b0',
    exiledEdge:  '#2a2a2a',
    nodeText:    '#1e1e1e',
    exiledText:  '#666666',
    distText:    '#cccccc',
    source:      '#4ec9b0',
    sink:        '#f38ba8',
    pathEdge:    '#ce9178',
    reverseEdge: '#7a7a7a',
    residualText: '#9cdcfe',
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
    draw(svg, nodes, edges, weighted, {}, [], null, null, nodeLabels, null);
}

export function updateGraphStep(svg, nodes, edges, step, algorithm, nodeLabels = {}) {
    const weighted = algorithm === 'dijkstra' || algorithm === 'bellman_ford' || algorithm === 'kruskal';
    const visited = new Set(step.visited || []);
    const inQueue = new Set(step.queue || []);
    const current = step.current_node !== undefined ? step.current_node : null;

    let activeEdge = null;
    let relaxedEdge = null;
    let mstEdgeSet = null;
    let exiledSet = null;
    let cliqueSet = null;

    if (algorithm === 'bellman_ford') {
        activeEdge = [step.edge_from, step.edge_to];
        if (step.relaxed) {
            relaxedEdge = [step.edge_from, step.edge_to];
        }
    }

    if (algorithm === 'kruskal') {
        activeEdge = [step.edge_from, step.edge_to];
        if (step.accepted) {
            relaxedEdge = [step.edge_from, step.edge_to];
        }
        // Собираем множество MST-рёбер для подсветки
        mstEdgeSet = new Set();
        for (const e of (step.mst_edges || [])) {
            mstEdgeSet.add(`${e[0]}-${e[1]}`);
            mstEdgeSet.add(`${e[1]}-${e[0]}`);
        }
    }

    if (algorithm === 'stalin_sort') {
        exiledSet = new Set(step.exiled || []);
        cliqueSet = new Set(step.clique || []);
    }

    const nodeColors = {};
    for (const n of nodes) {
        if (algorithm === 'stalin_sort') {
            if (n === current) {
                nodeColors[n] = step.accepted ? COLORS.visited : COLORS.current;
            } else if (cliqueSet.has(n)) {
                nodeColors[n] = COLORS.visited;
            } else if (exiledSet.has(n)) {
                nodeColors[n] = COLORS.exiled;
            } else {
                nodeColors[n] = COLORS.defaultNode;
            }
        } else if (algorithm === 'kruskal') {
            if (n === step.edge_from || n === step.edge_to) {
                nodeColors[n] = step.accepted ? COLORS.visited : COLORS.current;
            } else {
                // Подсвечиваем вершины, входящие в MST
                let inMst = false;
                for (const e of (step.mst_edges || [])) {
                    if (e[0] === n || e[1] === n) { inMst = true; break; }
                }
                nodeColors[n] = inMst ? COLORS.visited : COLORS.defaultNode;
            }
        } else if (algorithm === 'bellman_ford') {
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
        nodeLabels,
        mstEdgeSet,
        exiledSet,
        cliqueSet
    );
    return formatInfo(step, algorithm, nodeLabels);
}


export function renderFlowGraph(svg, nodes, edges, source, sink, nodeLabels = {}) {
    positions = forceLayout(nodes, edges, W, H, currentSpacing);
    drawFlowGraph(svg, nodes, edges, source, sink, new Set(), {}, nodeLabels);
}

export function updateFlowGraphStep(svg, nodes, edges, step, source, sink, nodeLabels = {}) {
    const pathEdges = new Set();
    const path = step.augmenting_path || [];
    for (let i = 0; i < path.length - 1; i++) {
        pathEdges.add(`${path[i]}-${path[i + 1]}`);
    }

    drawFlowGraph(svg, nodes, edges, source, sink, pathEdges, step.residual_capacities || {}, nodeLabels);
    return formatFlowInfo(step, source, sink, nodeLabels);
}

function drawFlowGraph(svg, nodes, edges, source, sink, pathEdges, residual, nodeLabels = {}) {
    let html = '';
    const allEdges = [];
    const edgeMap = new Map();
    
    for (const edge of edges) {
        const u = edge[0]; 
        const v = edge[1];
        const cap = edge[2];
        const key = `${u}-${v}`;
        
        allEdges.push({ u, v, cap, isOriginal: true });
        edgeMap.set(key, true);
    }
    
    for (const [u, targets] of Object.entries(residual)) {
        for (const [v, resCap] of Object.entries(targets)) {
            const uId = parseInt(u);
            const vId = parseInt(v);
            const key = `${uId}-${vId}`;
            
            if (resCap > 1e-9 && !edgeMap.has(key)) {
                allEdges.push({ 
                    u: uId, 
                    v: vId, 
                    cap: resCap, 
                    isOriginal: false 
                });
                edgeMap.set(key, true);
            }
        }
    }

    for (const edgeData of allEdges) {
        const { u, v } = edgeData;
        const reverseKey = `${v}-${u}`;
        edgeData.hasPair = edgeMap.has(reverseKey);
    }

    for (const edgeData of allEdges) {
        const { u, v, cap, isOriginal, hasPair } = edgeData;
        
        const p1 = positions[u]; 
        const p2 = positions[v];
        
        if (!p1 || !p2) {
            console.warn(`No position for edge ${u}→${v} (IDs). nodeLabels:`, nodeLabels);
            continue;
        }

        const edgeKey = `${u}-${v}`;
        const isReverse = !isOriginal;
        
        let color = isReverse ? COLORS.reverseEdge : COLORS.defaultEdge;
        let strokeWidth = isReverse ? 1.5 : 2.5;
        let strokeDash = isReverse ? '4,4' : 'none';

        if (pathEdges.has(edgeKey)) {
            color = COLORS.pathEdge;
            strokeWidth = 4;
            strokeDash = 'none';
        }

        if (hasPair) {
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            
            const nx = -dy / dist;
            const ny = dx / dist;
            const offset = 25;
            const direction = 1;
            
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;
            const ctrlX = midX + nx * offset * direction;
            const ctrlY = midY + ny * offset * direction;
            
            html += `<path d="M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}"
                           fill="none"
                           stroke="${color}" stroke-width="${strokeWidth}" 
                           stroke-dasharray="${strokeDash}"
                           stroke-linecap="round" marker-end="url(#arrowhead)"/>`;
            
            const textX = ctrlX;
            const textY = ctrlY - 10;
            const resCap = residual[String(u)]?.[String(v)];
            const capText = resCap !== undefined ? Number(resCap).toFixed(1) : String(cap);
            
            html += `<rect x="${textX - 22}" y="${textY - 9}" width="44" height="18" rx="3"
                           fill="${isReverse ? '#2a2a2a' : '#1e1e1e'}" 
                           stroke="#3e3e42" stroke-width="1"/>`;
            html += `<text x="${textX}" y="${textY + 5}" text-anchor="middle"
                           fill="${isReverse ? COLORS.residualText : COLORS.distText}" 
                           font-size="10"
                           font-family="'JetBrains Mono', monospace">
                ${capText}${isReverse ? '↩' : ''}
            </text>`;
        } else {
            html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                           stroke="${color}" stroke-width="${strokeWidth}" 
                           stroke-dasharray="${strokeDash}"
                           stroke-linecap="round" marker-end="url(#arrowhead)"/>`;
            
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2 - 10;
            const resCap = residual[String(u)]?.[String(v)];
            const capText = resCap !== undefined ? Number(resCap).toFixed(1) : String(cap);
            
            html += `<rect x="${mx - 22}" y="${my - 9}" width="44" height="18" rx="3"
                           fill="${isReverse ? '#2a2a2a' : '#1e1e1e'}" 
                           stroke="#3e3e42" stroke-width="1"/>`;
            html += `<text x="${mx}" y="${my + 5}" text-anchor="middle"
                           fill="${isReverse ? COLORS.residualText : COLORS.distText}" 
                           font-size="10"
                           font-family="'JetBrains Mono', monospace">
                ${capText}${isReverse ? '↩' : ''}
            </text>`;
        }
    }

    for (const nodeId of nodes) {  
        const p = positions[nodeId];
        if (!p) continue;
        
        const label = nodeLabels[String(nodeId)] || String(nodeId);  
        
        let fill = COLORS.defaultNode;
        let stroke = '#1e1e1e';
        let strokeWidth = 2.5;
        
        if (nodeId === source) {
            fill = COLORS.source;
            stroke = '#4ec9b0';
            strokeWidth = 3;
        } else if (nodeId === sink) {
            fill = COLORS.sink;
            stroke = '#f44747';
            strokeWidth = 3;
        }

        html += `<circle cx="${p.x}" cy="${p.y}" r="${NODE_R}"
                         fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
        html += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle"
                       fill="${COLORS.nodeText}" font-size="15" font-weight="bold"
                       font-family="'JetBrains Mono', monospace">${label}</text>`;
    }

    svg.innerHTML = html;
}

function formatFlowInfo(step, source, sink, nodeLabels = {}) {
    const lines = [];
    lines.push(`<span class="label">Итерация:</span> <span class="value">${step.iteration}</span>`);
    
    const path = step.augmenting_path || [];
    const pathString = Array.isArray(path) 
        ? path.map(n => getNodeLabel(n, nodeLabels)).join(' → ') 
        : '—';
    lines.push(`<span class="label">Путь:</span> <span class="value">${pathString}</span>`);
    
    lines.push(`<span class="label">Увеличение:</span> <span class="value">+${Number(step.flow_increase).toFixed(2)}</span>`);
    lines.push(`<span class="label">Макс. поток:</span> <span class="value">${Number(step.total_flow).toFixed(2)}</span>`);
    
    return lines.join('<br>');
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

function draw(svg, nodes, edges, weighted, nodeColors, distances, activeEdge, relaxedEdge, nodeLabels = {}, mstEdgeSet = null, exiledSet = null, cliqueSet = null) {
    let html = '';

    for (const edge of edges) {
        const [u, v] = edge;
        const p1 = positions[u];
        const p2 = positions[v];
        if (!p1 || !p2) continue;

        let color = COLORS.defaultEdge;
        let strokeWidth = 2.5;
        let dashAttr = '';

        if (exiledSet && (exiledSet.has(u) || exiledSet.has(v))) {
            color = COLORS.exiledEdge;
            strokeWidth = 1.5;
            dashAttr = ' stroke-dasharray="4 4"';
        } else if (cliqueSet && cliqueSet.has(u) && cliqueSet.has(v)) {
            color = COLORS.relaxedEdge;
            strokeWidth = 3.5;
        } else if (relaxedEdge && relaxedEdge[0] === u && relaxedEdge[1] === v) {
            color = COLORS.relaxedEdge;
            strokeWidth = 4;
        } else if (activeEdge && activeEdge[0] === u && activeEdge[1] === v) {
            color = COLORS.activeEdge;
            strokeWidth = 4;
        } else if (mstEdgeSet && (mstEdgeSet.has(`${u}-${v}`) || mstEdgeSet.has(`${v}-${u}`))) {
            color = COLORS.relaxedEdge;
            strokeWidth = 3.5;
        }

        html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                       stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round"${dashAttr}/>`;

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
        const isExiled = exiledSet && exiledSet.has(n);
        const textFill = isExiled ? COLORS.exiledText : COLORS.nodeText;
        const strokeColor = isExiled ? '#1a1a1a' : '#1e1e1e';
        html += `<circle cx="${p.x}" cy="${p.y}" r="${NODE_R}"
                         fill="${fill}" stroke="${strokeColor}" stroke-width="2.5"/>`;
        html += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle"
                       fill="${textFill}" font-size="15" font-weight="bold"
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

    if (algorithm === 'stalin_sort') {
        const currentLabel = getNodeLabel(step.current_node, nodeLabels);
        lines.push(`<span class="label">Вершина:</span> <span class="value">${currentLabel}</span>`);
        if (step.accepted) {
            lines.push(`<span class="label">Решение:</span> <span class="value">Принята в клику</span>`);
        } else {
            const conflictLabel = step.conflict_with !== undefined && step.conflict_with !== -1
                ? getNodeLabel(step.conflict_with, nodeLabels)
                : '—';
            lines.push(`<span class="label">Решение:</span> <span class="value">Сослана (нет ребра с ${conflictLabel})</span>`);
        }
        const cliqueLabels = (step.clique || [])
            .map(n => getNodeLabel(n, nodeLabels))
            .join(', ');
        lines.push(`<span class="label">Клика:</span> <span class="value">[${cliqueLabels}]</span>`);
        const exiledLabels = (step.exiled || [])
            .map(n => getNodeLabel(n, nodeLabels))
            .join(', ');
        lines.push(`<span class="label">В ссылке:</span> <span class="value">[${exiledLabels}]</span>`);
        return lines.join('<br>');
    }

    if (algorithm === 'kruskal') {
        lines.push(
            `<span class="label">Ребро:</span> <span class="value">${getNodeLabel(step.edge_from, nodeLabels)} — ${getNodeLabel(step.edge_to, nodeLabels)} (вес: ${step.edge_weight})</span>`
        );
        lines.push(`<span class="label">Принято в MST:</span> <span class="value">${step.accepted ? 'Да' : 'Нет (цикл)'}</span>`);
        const mstLabels = (step.mst_edges || [])
            .map(e => `${getNodeLabel(e[0], nodeLabels)}—${getNodeLabel(e[1], nodeLabels)}`)
            .join(', ');
        lines.push(`<span class="label">Рёбра MST:</span> <span class="value">[${mstLabels}]</span>`);
        lines.push(`<span class="label">Вес MST:</span> <span class="value">${step.total_weight}</span>`);
    } else if (algorithm === 'bellman_ford') {
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
