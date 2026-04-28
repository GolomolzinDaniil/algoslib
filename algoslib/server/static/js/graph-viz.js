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

const SCC_PALETTE = [
    '#f38ba8', '#89b4fa', '#a6e3a1', '#fab387', '#cba6f7',
    '#f9e2af', '#94e2d5', '#eba0ac', '#b4befe', '#74c7ec'
];

const PHASE_COLORS = {
    1: { node: '#89b4fa', edge: '#89b4fa', label: 'Фаза 1: DFS (исходный граф)' },
    2: { node: '#fab387', edge: '#fab387', label: 'Фаза 2: Транспонирование' },
    3: { node: '#cba6f7', edge: '#cba6f7', label: 'Фаза 3: DFS (транспонированный)' },
};

const NODE_R = 22;
const W = 600;
const H = 400;

const WEIGHT_LABEL_W = 28;
const WEIGHT_LABEL_H = 20;
const FLOW_LABEL_W = 44;
const FLOW_LABEL_H = 18;

let positions = {};
let currentSpacing = 5;
let currentViewScale = 1;

export function setSpacing(val) {
    currentSpacing = val;
}

export function setViewScale(val) {
    const v = Number(val);
    if (!Number.isFinite(v)) return;
    currentViewScale = Math.max(0.3, Math.min(1.5, v));
}

function getNodeLabel(nodeId, nodeLabels = {}) {
    const label = nodeLabels[String(nodeId)];
    return label !== undefined ? label : String(nodeId);
}

export function renderGraph(svg, nodes, edges, weighted, nodeLabels = {}) {
    positions = forceLayout(nodes, edges, W, H, currentSpacing, weighted);
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

    // Hierholzer: подсвечиваем рёбра текущего пути (circuit) как «принятые»
    let hierholzerStackSet = null;
    let hierholzerCircuitSet = null;
    if (algorithm === 'hierholzer') {
        hierholzerStackSet = new Set(step.stack || []);
        hierholzerCircuitSet = new Set(step.circuit || []);
        // Рёбра пройденного пути (circuit) — рисуем как MST
        mstEdgeSet = new Set();
        const circuit = step.circuit || [];
        for (let i = 0; i < circuit.length - 1; i++) {
            mstEdgeSet.add(`${circuit[i]}-${circuit[i + 1]}`);
            mstEdgeSet.add(`${circuit[i + 1]}-${circuit[i]}`);
        }
    }

    // Hamiltonian: подсвечиваем рёбра текущего пути
    let hamiltonianPathSet = null;
    if (algorithm === 'hamiltonian') {
        hamiltonianPathSet = new Set(step.path || []);
        mstEdgeSet = new Set();
        const path = step.path || [];
        for (let i = 0; i < path.length - 1; i++) {
            mstEdgeSet.add(`${path[i]}-${path[i + 1]}`);
            mstEdgeSet.add(`${path[i + 1]}-${path[i]}`);
        }
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
        } else if (algorithm === 'hierholzer') {
            if (n === current) nodeColors[n] = COLORS.current;
            else if (hierholzerCircuitSet.has(n)) nodeColors[n] = COLORS.visited;
            else if (hierholzerStackSet.has(n)) nodeColors[n] = COLORS.queue;
            else nodeColors[n] = COLORS.defaultNode;
        } else if (algorithm === 'hamiltonian') {
            if (n === current && step.action !== 'backtrack') nodeColors[n] = COLORS.current;
            else if (hamiltonianPathSet.has(n)) nodeColors[n] = COLORS.visited;
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
    positions = forceLayout(nodes, edges, W, H, currentSpacing, true);
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

    svg.innerHTML = Math.abs(currentViewScale - 1) > 0.001
        ? `<g transform="scale(${currentViewScale})">${html}</g>`
        : html;
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
function forceLayout(nodes, edges, w, h, spacing, weighted = false) {
    const s = (spacing || 5) / 5;
    const scale = currentViewScale;
    const vw = w / scale;
    const vh = h / scale;
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

    const weightFactor = weighted ? 1.35 : 1.0;
    const baseDist = Math.max(60, Math.min(140, 600 / nodes.length)) * weightFactor;
    const linkDist = baseDist * s;
    const charge = -250 * s * (weighted ? 1.25 : 1);
    const collide = (NODE_R + (weighted ? 16 : 8)) * s;

    const sim = forceSimulation(simNodes)
        .force('charge', forceManyBody().strength(charge))
        .force('link', forceLink(simLinks).distance(linkDist).strength(1))
        .force('center', forceCenter(vw / 2, vh / 2))
        .force('collide', forceCollide(collide))
        .force('x', forceX(vw / 2).strength(0.05))
        .force('y', forceY(vh / 2).strength(0.05));

    if (weighted && simLinks.length > 1) {
        const labelDiag = Math.hypot(WEIGHT_LABEL_W, WEIGHT_LABEL_H);
        const midMinDist = labelDiag + 8;
        sim.force('midRepel', (alpha) => {
            const mids = new Array(simLinks.length);
            for (let i = 0; i < simLinks.length; i++) {
                const lk = simLinks[i];
                mids[i] = {
                    link: lk,
                    x: (lk.source.x + lk.target.x) / 2,
                    y: (lk.source.y + lk.target.y) / 2,
                };
            }
            for (let i = 0; i < mids.length; i++) {
                for (let j = i + 1; j < mids.length; j++) {
                    const a = mids[i];
                    const b = mids[j];
                    let dx = b.x - a.x;
                    let dy = b.y - a.y;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 0.01) {
                        dx = (Math.random() - 0.5) * 0.1;
                        dy = (Math.random() - 0.5) * 0.1;
                        dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
                    }
                    if (dist < midMinDist) {
                        const push = ((midMinDist - dist) / dist) * alpha * 0.35;
                        const fx = dx * push;
                        const fy = dy * push;
                        a.link.source.vx -= fx * 0.5;
                        a.link.source.vy -= fy * 0.5;
                        a.link.target.vx -= fx * 0.5;
                        a.link.target.vy -= fy * 0.5;
                        b.link.source.vx += fx * 0.5;
                        b.link.source.vy += fy * 0.5;
                        b.link.target.vx += fx * 0.5;
                        b.link.target.vy += fy * 0.5;
                    }
                }
            }
        });
    }

    sim.stop();
    const iterations = weighted ? 400 : 300;
    for (let i = 0; i < iterations; i++) sim.tick();

    const pos = {};
    for (const n of simNodes) {
        pos[n.id] = {
            x: Math.max(pad, Math.min(vw - pad, n.x)),
            y: Math.max(pad, Math.min(vh - pad, n.y)),
        };
    }
    return pos;
}

function buildWeightedLabelPlacements(edges, labelW, labelH) {
    const out = [];
    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        if (!edge || edge.length < 3) continue;
        const p1 = positions[edge[0]];
        const p2 = positions[edge[1]];
        if (!p1 || !p2) continue;
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.hypot(dx, dy) || 1;
        const tx = dx / len;
        const ty = dy / len;
        const bx = (p1.x + p2.x) / 2;
        const by = (p1.y + p2.y) / 2;
        out.push({
            edgeIdx: i,
            text: String(edge[2]),
            bx, by,
            x: bx, y: by,
            tx, ty,
            nx: -ty, ny: tx,
            len,
            w: labelW,
            h: labelH,
        });
    }
    return out;
}

function resolveLabelPlacements(placements, nodeObstacles, bounds) {
    const MARGIN = 3;
    const MAX_NORMAL = 28;
    const MAX_TANGENT_FRAC = 0.32;
    const ITERS = 60;

    for (let iter = 0; iter < ITERS; iter++) {
        let moved = false;

        for (let i = 0; i < placements.length; i++) {
            for (let j = i + 1; j < placements.length; j++) {
                const a = placements[i];
                const b = placements[j];
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const minDX = (a.w + b.w) / 2 + MARGIN;
                const minDY = (a.h + b.h) / 2 + MARGIN;
                const oX = minDX - Math.abs(dx);
                const oY = minDY - Math.abs(dy);
                if (oX > 0 && oY > 0) {
                    moved = true;
                    let px = 0;
                    let py = 0;
                    if (oX < oY) {
                        const s = dx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dx);
                        px = s * (oX / 2 + 0.25);
                    } else {
                        const s = dy === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(dy);
                        py = s * (oY / 2 + 0.25);
                    }
                    a.x -= px; a.y -= py;
                    b.x += px; b.y += py;
                }
            }
        }

        for (const p of placements) {
            for (const node of nodeObstacles) {
                const halfW = p.w / 2 + 1;
                const halfH = p.h / 2 + 1;
                const nearestX = Math.max(p.x - halfW, Math.min(node.x, p.x + halfW));
                const nearestY = Math.max(p.y - halfH, Math.min(node.y, p.y + halfH));
                const dx = nearestX - node.x;
                const dy = nearestY - node.y;
                const d2 = dx * dx + dy * dy;
                const minD = node.r + 2;
                if (d2 < minD * minD) {
                    moved = true;
                    const d = Math.sqrt(d2) || 0.01;
                    const push = (minD - d) / d;
                    p.x += dx * push * 0.7;
                    p.y += dy * push * 0.7;
                }
            }
        }

        for (const p of placements) {
            const offX = p.x - p.bx;
            const offY = p.y - p.by;
            let tan = offX * p.tx + offY * p.ty;
            let nrm = offX * p.nx + offY * p.ny;
            const maxTan = p.len * MAX_TANGENT_FRAC;
            if (tan > maxTan) tan = maxTan;
            else if (tan < -maxTan) tan = -maxTan;
            if (nrm > MAX_NORMAL) nrm = MAX_NORMAL;
            else if (nrm < -MAX_NORMAL) nrm = -MAX_NORMAL;
            p.x = p.bx + tan * p.tx + nrm * p.nx;
            p.y = p.by + tan * p.ty + nrm * p.ny;
        }

        if (bounds) {
            for (const p of placements) {
                const hw = p.w / 2;
                const hh = p.h / 2;
                if (p.x < bounds.minX + hw) p.x = bounds.minX + hw;
                else if (p.x > bounds.maxX - hw) p.x = bounds.maxX - hw;
                if (p.y < bounds.minY + hh) p.y = bounds.minY + hh;
                else if (p.y > bounds.maxY - hh) p.y = bounds.maxY - hh;
            }
        }

        if (!moved) break;
    }
    return placements;
}

function draw(svg, nodes, edges, weighted, nodeColors, distances, activeEdge, relaxedEdge, nodeLabels = {}, mstEdgeSet = null, exiledSet = null, cliqueSet = null, edgeColorOverride = null) {
    let html = '';

    for (const edge of edges) {
        const [u, v] = edge;
        const p1 = positions[u];
        const p2 = positions[v];
        if (!p1 || !p2) continue;

        let color = COLORS.defaultEdge;
        let strokeWidth = 2.5;
        let dashAttr = '';

        if (edgeColorOverride && activeEdge && activeEdge[0] === u && activeEdge[1] === v) {
            color = edgeColorOverride;
            strokeWidth = 4;
        } else if (exiledSet && (exiledSet.has(u) || exiledSet.has(v))) {
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
    }

    if (weighted) {
        const placements = buildWeightedLabelPlacements(edges, WEIGHT_LABEL_W, WEIGHT_LABEL_H);
        const nodeObstacles = [];
        for (const n of nodes) {
            const p = positions[n];
            if (p) nodeObstacles.push({ x: p.x, y: p.y, r: NODE_R });
        }
        const scale = currentViewScale;
        resolveLabelPlacements(placements, nodeObstacles, { minX: 0, minY: 0, maxX: W / scale, maxY: H / scale });

        for (const p of placements) {
            const ddx = p.x - p.bx;
            const ddy = p.y - p.by;
            if (ddx * ddx + ddy * ddy > 9) {
                html += `<line x1="${p.bx}" y1="${p.by}" x2="${p.x}" y2="${p.y}"
                               stroke="#5a5a5a" stroke-width="1" stroke-dasharray="2,2" opacity="0.75"/>`;
            }
            html += `<rect x="${p.x - p.w / 2}" y="${p.y - p.h / 2}" width="${p.w}" height="${p.h}" rx="4"
                           fill="#252526" stroke="#3e3e42" stroke-width="1"/>`;
            html += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle"
                           fill="${COLORS.distText}" font-size="12"
                           font-family="'JetBrains Mono', monospace">${p.text}</text>`;
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

    svg.innerHTML = Math.abs(currentViewScale - 1) > 0.001
        ? `<g transform="scale(${currentViewScale})">${html}</g>`
        : html;
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

    if (algorithm === 'hierholzer') {
        const actionLabels = {
            'init': 'Старт',
            'push': 'Переход по ребру',
            'pop': 'Тупик — добавление в путь',
            'no_path': 'Эйлеров путь не существует',
            'done': step.is_circuit ? 'Эйлеров цикл найден' : 'Эйлеров путь найден',
        };
        lines.push(`<span class="label">Действие:</span> <span class="value">${actionLabels[step.action] || step.action}</span>`);
        if (step.current_node !== undefined && step.current_node !== -1) {
            lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(step.current_node, nodeLabels)}</span>`);
        }
        const stackLabels = (step.stack || []).map(n => getNodeLabel(n, nodeLabels)).join(' → ');
        lines.push(`<span class="label">Стек:</span> <span class="value">[${stackLabels}]</span>`);
        const circuitLabels = (step.circuit || []).map(n => getNodeLabel(n, nodeLabels)).join(' → ');
        lines.push(`<span class="label">Путь (circuit):</span> <span class="value">[${circuitLabels}]</span>`);
        const remaining = (step.remaining_edges || [])
            .map(e => `${getNodeLabel(e[0], nodeLabels)}—${getNodeLabel(e[1], nodeLabels)}`)
            .join(', ');
        lines.push(`<span class="label">Непройденные рёбра:</span> <span class="value">[${remaining}]</span>`);
        return lines.join('<br>');
    }

    if (algorithm === 'hamiltonian') {
        const actionLabels = {
            'init': 'Старт',
            'visit': 'Посещение вершины',
            'backtrack': 'Откат',
            'found': 'Гамильтонов путь/цикл найден!',
            'fail': 'Путь не найден',
        };
        lines.push(`<span class="label">Действие:</span> <span class="value">${actionLabels[step.action] || step.action}</span>`);
        lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(step.current_node, nodeLabels)}</span>`);
        const pathLabels = (step.path || []).map(n => getNodeLabel(n, nodeLabels)).join(' → ');
        lines.push(`<span class="label">Путь:</span> <span class="value">[${pathLabels}]</span>`);
        lines.push(`<span class="label">Глубина:</span> <span class="value">${step.depth}</span>`);
        const visitedLabels = (step.visited || []).map(n => getNodeLabel(n, nodeLabels)).join(', ');
        lines.push(`<span class="label">Посещены:</span> <span class="value">[${visitedLabels}]</span>`);
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

export function updateTarjanStep(svg, nodes, edges, step, nodeLabels = {}) {
    const visited = new Set(Object.keys(step.index_map || {}).map(Number));
    const onStack = new Set(step.on_stack_nodes || []);

    // Создаём маппинг: вершина -> индекс SCC (для уже найденных компонент)
    const nodeToSccIndex = {};
    (step.completed_sccs || []).forEach((scc, idx) => {
        for (const n of scc) nodeToSccIndex[n] = idx;
    });

    let activeEdge = null;
    let edgeColor = COLORS.defaultEdge;
    if (step.edge_from !== null && step.edge_to !== null) {
        activeEdge = [step.edge_from, step.edge_to];
        switch (step.edge_type) {
            case 'tree': edgeColor = COLORS.activeEdge; break;
            case 'back': edgeColor = COLORS.relaxedEdge; break;
            case 'cross': case 'forward': edgeColor = '#7a7a7a'; break;
            default: edgeColor = COLORS.defaultEdge;
        }
    }

    const currentSccSet = new Set(step.current_scc || []);
    const nodeColors = {};

    for (const n of nodes) {
        if (currentSccSet.has(n)) {
            // Вершины, которые извлекаются прямо сейчас (ярко-красный акцент)
            nodeColors[n] = COLORS.current;
        } else if (nodeToSccIndex[n] !== undefined) {
            // Вершины в уже найденных SCC → уникальный цвет из палитры
            const sccIdx = nodeToSccIndex[n];
            nodeColors[n] = SCC_PALETTE[sccIdx % SCC_PALETTE.length];
        } else if (onStack.has(n)) {
            nodeColors[n] = COLORS.queue; // Оранжевый (в стеке DFS)
        } else if (visited.has(n)) {
            nodeColors[n] = COLORS.defaultNode; // Синий (посещена, но ещё не в SCC)
        } else {
            nodeColors[n] = '#3e3e42'; // Тёмно-серый (не посещена)
        }
    }

    draw(svg, nodes, edges, false, nodeColors, {}, activeEdge, null, nodeLabels, null, null, null, edgeColor);

    const lines = [];
    const actionLabels = { 'visit': 'Посещение', 'explore_edge': 'Исследование ребра', 'update_lowlink': 'Обновление lowlink', 'found_scc': 'Найдена SCC!', 'done': 'Завершено' };
    lines.push(`<span class="label">Действие:</span> <span class="value">${actionLabels[step.action] || step.action}</span>`);
    
    if (step.current_node !== null) lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(step.current_node, nodeLabels)}</span>`);
    if (activeEdge) lines.push(`<span class="label">Ребро:</span> <span class="value">${getNodeLabel(step.edge_from, nodeLabels)} → ${getNodeLabel(step.edge_to, nodeLabels)} (${step.edge_type})</span>`);
    
    if (step.current_node !== null && step.index_map?.[step.current_node] !== undefined) {
        lines.push(`<span class="label">index/lowlink:</span> <span class="value">${step.index_map[step.current_node]} / ${step.lowlink_map?.[step.current_node] ?? step.index_map[step.current_node]}</span>`);
    }
    
    const stackLabels = (step.stack || []).map(n => getNodeLabel(n, nodeLabels)).join(' → ') || '—';
    lines.push(`<span class="label">Стек:</span> <span class="value">[${stackLabels}]</span>`);
    
    if (step.current_scc?.length > 0) {
        lines.push(`<span class="label">SCC найдена:</span> <span class="value">{${step.current_scc.map(n => getNodeLabel(n, nodeLabels)).join(', ')}}</span>`);
    }
    
    if (step.completed_sccs?.length > 0) {
        const all = step.completed_sccs.map((scc, i) => {
            const color = SCC_PALETTE[i % SCC_PALETTE.length];
            return `<span style="color:${color}; font-size:1.1em;">■</span> {${scc.map(n => getNodeLabel(n, nodeLabels)).join(', ')}}`;
        }).join(', ');
        lines.push(`<span class="label">Все SCC:</span> <span class="value">[${all}]</span>`);
    }
    
    return lines.join('<br>');
}

export function updateKosarajuStep(svg, nodes, edges, step, nodeLabels = {}) {
    const phase = step.phase || 1;
    const phaseStyle = PHASE_COLORS[phase] || PHASE_COLORS[1];
    
    // Маппинг вершина -> индекс SCC
    const nodeToSccIndex = {};
    (step.completed_sccs || []).forEach((scc, idx) => {
        for (const n of scc) nodeToSccIndex[n] = idx;
    });

    let activeEdge = null;
    let edgeColor = COLORS.defaultEdge;
    
    if (step.edge_from !== null && step.edge_to !== null) {
        activeEdge = [step.edge_from, step.edge_to];
        edgeColor = step.is_transposed_edge ? COLORS.reverseEdge : phaseStyle.edge;
    }

    const currentSccSet = new Set(step.current_scc || []);
    const nodeColors = {};

    for (const n of nodes) {
        if (currentSccSet.has(n)) {
            nodeColors[n] = COLORS.current;  // Ярко-красный для текущей SCC
        } else if (nodeToSccIndex[n] !== undefined) {
            const sccIdx = nodeToSccIndex[n];
            nodeColors[n] = SCC_PALETTE[sccIdx % SCC_PALETTE.length];
        } else if (phase === 1) {
            // Фаза 1: подсветка по посещению/завершению
            if (step.finish_order.includes(n)) {
                nodeColors[n] = COLORS.visited;  // Уже завершена
            } else if (step.stack.includes(n)) {
                nodeColors[n] = COLORS.queue;    // В стеке
            } else {
                nodeColors[n] = '#3e3e42';       // Не посещена
            }
        } else if (phase === 3) {
            // Фаза 3: обработанные вершины
            if (step.processing_order.indexOf(n) < step.processing_order.indexOf(step.current_node ?? -1)) {
                nodeColors[n] = COLORS.visited;
            } else {
                nodeColors[n] = '#3e3e42';
            }
        } else {
            nodeColors[n] = phaseStyle.node;  // Фаза 2: нейтральный цвет
        }
    }

    // Отрисовка: для фазы 2 показываем рёбра как развёрнутые (пунктир)
    const isTransposedPhase = phase === 2;
    draw(
        svg,
        nodes,
        edges,
        false,
        nodeColors,
        {},
        activeEdge,
        null,
        nodeLabels,
        null,
        null,
        null,
        edgeColor,
    );

    // Инфо-панель
    const lines = [];
    lines.push(`<span class="label">Фаза:</span> <span class="value">${phaseStyle.label}</span>`);
    
    const actionLabels = {
        'start_dfs1': 'Запуск DFS на исходном графе',
        'visit': 'Посещение вершины',
        'finish': 'Завершение вершины (добавлена в стек)',
        'transpose': 'Транспонирование графа',
        'transpose_edge': `Разворот ребра`,
        'start_dfs2': 'Запуск DFS на транспонированном графе',
        'found_scc': 'Найдена компонента!',
        'done': 'Алгоритм завершён'
    };
    lines.push(`<span class="label">Действие:</span> <span class="value">${actionLabels[step.action] || step.action}</span>`);
    
    if (step.current_node !== null) {
        lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(step.current_node, nodeLabels)}</span>`);
    }
    
    if (activeEdge) {
        const arrow = step.is_transposed_edge ? '⇇' : '→';
        lines.push(`<span class="label">Ребро ${arrow}:</span> <span class="value">${getNodeLabel(step.edge_from, nodeLabels)} → ${getNodeLabel(step.edge_to, nodeLabels)}</span>`);
    }
    
    if (phase === 1 && step.finish_order.length > 0) {
        const orderLabels = step.finish_order.slice(-5).map(n => getNodeLabel(n, nodeLabels)).join(' ← ');
        lines.push(`<span class="label">Завершены (последние):</span> <span class="value">[${orderLabels}]</span>`);
    }
    
    if (phase === 3 && step.processing_order.length > 0) {
        const orderLabels = step.processing_order.slice(0, 5).map(n => getNodeLabel(n, nodeLabels)).join(' → ');
        lines.push(`<span class="label">Порядок обработки:</span> <span class="value">[${orderLabels}...]</span>`);
    }
    
    if (step.current_scc?.length > 0) {
        lines.push(`<span class="label">SCC найдена:</span> <span class="value">{${step.current_scc.map(n => getNodeLabel(n, nodeLabels)).join(', ')}}</span>`);
    }
    
    if (step.completed_sccs?.length > 0) {
        const all = step.completed_sccs.map((scc, i) => {
            const color = SCC_PALETTE[i % SCC_PALETTE.length];
            return `<span style="color:${color};">■</span> {${scc.map(n => getNodeLabel(n, nodeLabels)).join(', ')}}`;
        }).join(', ');
        lines.push(`<span class="label">Все SCC:</span> <span class="value">[${all}]</span>`);
    }
    
    return lines.join('<br>');
}

const ASTAR_COLORS = {
    open: '#ce9178',        // оранжевый — в open set
    closed: '#4ec9b0',      // бирюзовый — в closed set
    current: '#f44747',     // красный — текущая вершина
    path: '#b4befe',        // сиреневый — финальный путь
    edgeRelaxed: '#4ec9b0', // бирюзовый — релаксированное ребро
};

export function updateAStarStep(svg, nodes, edges, step, nodeLabels = {}, nodeCoords = {}) {
    const openSet = new Set(step.open_set || []);
    const closedSet = new Set(step.closed_set || []);
    const current = step.current_node;
    const pathSet = new Set(step.current_path || []);

    let activeEdge = null;
    let relaxedEdge = null;
    
    if (step.edge_from !== null && step.edge_to !== null) {
        activeEdge = [step.edge_from, step.edge_to];
        if (step.action === 'relax') {
            relaxedEdge = [step.edge_from, step.edge_to];
        }
    }

    // Цвета вершин
    const nodeColors = {};
    for (const n of nodes) {
        if (step.path_found && pathSet.has(n)) {
            nodeColors[n] = ASTAR_COLORS.path;  // Финальный путь
        } else if (n === current) {
            nodeColors[n] = ASTAR_COLORS.current;  // Текущая
        } else if (closedSet.has(n)) {
            nodeColors[n] = ASTAR_COLORS.closed;  // Обработана
        } else if (openSet.has(n)) {
            nodeColors[n] = ASTAR_COLORS.open;  // В очереди
        } else {
            nodeColors[n] = COLORS.defaultNode;  // Не посещена
        }
    }

    // Отрисовка
    draw(
        svg,
        nodes,
        edges,
        true,  // weighted = true для A*
        nodeColors,
        step.f_scores || {},  // Показываем f-значения как "расстояния"
        activeEdge,
        relaxedEdge,
        nodeLabels,
        null
    );

    // Инфо-панель
    const lines = [];
    const actionLabels = {
        'init': 'Инициализация',
        'expand': 'Обработка вершины',
        'relax': 'Релаксация ребра',
        'explore_edge': 'Исследование ребра',
        'found': 'Путь найден!',
        'no_path': 'Путь не найден'
    };
    
    lines.push(`<span class="label">Действие:</span> <span class="value">${actionLabels[step.action] || step.action}</span>`);
    
    if (current !== null && current !== -1) {
        lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(current, nodeLabels)}</span>`);
    }
    
    if (activeEdge) {
        lines.push(`<span class="label">Ребро:</span> <span class="value">${getNodeLabel(step.edge_from, nodeLabels)} → ${getNodeLabel(step.edge_to, nodeLabels)}</span>`);
    }
    
    // Показываем g/h/f для текущей вершины
    if (current !== null && current !== -1 && step.f_scores?.[current] !== undefined) {
        const g = step.g_scores?.[current] ?? 0;
        const h = step.h_scores?.[current] ?? 0;
        const f = step.f_scores[current];
        lines.push(`<span class="label">g/h/f:</span> <span class="value">${g.toFixed(2)} / ${h.toFixed(2)} / ${f.toFixed(2)}</span>`);
    }
    
    // Open/Closed sets
    if (step.open_set?.length > 0) {
        const openLabels = step.open_set.slice(0, 6).map(n => getNodeLabel(n, nodeLabels)).join(', ');
        const more = step.open_set.length > 6 ? `... +${step.open_set.length - 6}` : '';
        lines.push(`<span class="label">Open:</span> <span class="value">[${openLabels}${more}]</span>`);
    }
    
    if (step.closed_set?.length > 0) {
        lines.push(`<span class="label">Closed:</span> <span class="value">${step.closed_set.length} вершин</span>`);
    }
    
    // Финальный путь
    if (step.path_found && step.current_path?.length > 0) {
        const pathLabels = step.current_path.map(n => getNodeLabel(n, nodeLabels)).join(' → ');
        lines.push(`<span class="label">Путь:</span> <span class="value">${pathLabels}</span>`);
        const totalCost = step.g_scores?.[step.current_path[step.current_path.length - 1]] ?? 0;
        lines.push(`<span class="label">Стоимость:</span> <span class="value">${totalCost.toFixed(2)}</span>`);
    }
    
    return lines.join('<br>');
}

export function updateBiDijkstraStep(svg, nodes, edges, step, nodeLabels = {}) {
    const fOpen = new Set(step.forward_open || []);
    const fClosed = new Set(step.forward_closed || []);
    const bOpen = new Set(step.backward_open || []);
    const bClosed = new Set(step.backward_closed || []);
    const pathSet = new Set(step.current_path || []);

    let activeEdge = null;
    if (step.edge_from !== null && step.edge_to !== null) activeEdge = [step.edge_from, step.edge_to];

    const nodeColors = {};
    for (const n of nodes) {
        if (step.path_found && pathSet.has(n)) nodeColors[n] = '#a6e3a1'; // Путь
        else if (n === step.current_node) nodeColors[n] = '#f44747';      // Текущая
        else if (fClosed.has(n) && bClosed.has(n)) nodeColors[n] = '#cba6f7'; // Встреча
        else if (fClosed.has(n)) nodeColors[n] = '#89b4fa';               // Вперёд
        else if (bClosed.has(n)) nodeColors[n] = '#fab387';               // Назад
        else if (fOpen.has(n) || bOpen.has(n)) nodeColors[n] = '#ce9178'; // В очереди
        else nodeColors[n] = '#3e3e42';
    }

    draw(svg, nodes, edges, true, nodeColors, step.forward_dist, activeEdge, null, nodeLabels, null, null, null, null);

    const lines = [];
    const actLabels = {
        'init': 'Инициализация', 'forward_expand': 'Расширение вперёд',
        'backward_expand': 'Расширение назад', 'relax': 'Релаксация',
        'meet': 'Фронты встретились!', 'reconstruct': 'Восстановление пути', 'no_path': 'Путь не найден'
    };
    lines.push(`<span class="label">Действие:</span> <span class="value">${actLabels[step.action] || step.action}</span>`);
    if (step.current_node !== null) lines.push(`<span class="label">Вершина:</span> <span class="value">${getNodeLabel(step.current_node, nodeLabels)}</span>`);
    if (step.total_cost !== null && !isNaN(step.total_cost)) lines.push(`<span class="label">Стоимость:</span> <span class="value">${step.total_cost.toFixed(2)}</span>`);
    if (step.path_found && step.current_path.length > 0) {
        lines.push(`<span class="label">Путь:</span> <span class="value">${step.current_path.map(n => getNodeLabel(n, nodeLabels)).join(' → ')}</span>`);
    }
    lines.push(`<span class="label">Фронты:</span> <span class="value">F: ${fOpen.size} | B: ${bOpen.size}</span>`);
    return lines.join('<br>');
}
