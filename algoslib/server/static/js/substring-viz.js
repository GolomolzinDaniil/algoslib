const SUBSTRING_CELL_STEP = 58;

function toInteger(value, fallback = -1) {
    const index = Number(value);
    return Number.isInteger(index) ? index : fallback;
}

function getStepTextIndex(step) {
    return toInteger(step?.text_idx !== undefined ? step.text_idx : step?.text_index);
}

function getStepPatternIndex(step) {
    return toInteger(step?.pattern_idx !== undefined ? step.pattern_idx : step?.pattern_index);
}

function getStepFoundPos(step, textLength) {
    const rawFoundPos = step?.found_pos !== undefined ? step.found_pos : step?.match_start_pos;
    const foundPos = toInteger(rawFoundPos);
    return foundPos >= 0 && foundPos <= textLength ? foundPos : -1;
}

function isStepFound(step, textLength) {
    return Boolean(step?.is_found || step?.is_full_match) && getStepFoundPos(step, textLength) >= 0;
}

function getPatternStartOffset(step, textLength, patternLength) {
    if (!step || typeof step !== 'object' || patternLength <= 0) return 0;

    const foundPos = getStepFoundPos(step, textLength);
    let offset = isStepFound(step, textLength) ? foundPos : 0;
    const textIdx = getStepTextIndex(step);
    const patternIdx = getStepPatternIndex(step);

    if (!isStepFound(step, textLength)) {
        if (textIdx >= 0 && patternIdx >= 0) {
            offset = textIdx - patternIdx;
        } else if (textIdx >= 0) {
            offset = textIdx;
        }
    }

    const maxOffset = Math.max(0, textLength - 1);
    return Math.max(0, Math.min(offset, maxOffset));
}

export function renderSubstringViz(container, text, pattern, step) {
    if (!container) return;
    container.innerHTML = '';

    const safeText = text || "";
    const safePattern = pattern || "";
    
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.flexDirection = 'column';
    wrapper.style.alignItems = 'flex-start';
    wrapper.style.gap = '8px';
    wrapper.style.fontFamily = "'JetBrains Mono', monospace";
    wrapper.style.position = 'relative';
    wrapper.style.minHeight = '100px';
    wrapper.style.padding = '10px 0';
    wrapper.style.maxWidth = '100%';

    // --- ROW 1: PATTERN (Top) ---
    if (safePattern.length > 0) {
        const patternRow = document.createElement('div');
        patternRow.style.display = 'flex';
        patternRow.style.marginBottom = '4px';
        
        const startOffset = getPatternStartOffset(step, safeText.length, safePattern.length);

        if (startOffset > 0) {
            const spacer = document.createElement('div');
            spacer.style.width = `${startOffset * SUBSTRING_CELL_STEP}px`;
            spacer.style.flex = '0 0 auto';
            patternRow.appendChild(spacer);
        }

        for (let i = 0; i < safePattern.length; i++) {
            const charBox = document.createElement('div');
            charBox.style.width = '50px';
            charBox.style.height = '50px';
            charBox.style.display = 'flex';
            charBox.style.alignItems = 'center';
            charBox.style.justifyContent = 'center';
            charBox.style.borderRadius = '8px';
            charBox.style.border = '2px solid #45475a';
            charBox.style.marginRight = '8px';
            charBox.style.backgroundColor = '#313244';
            charBox.style.color = '#cdd6f4';
            charBox.style.fontSize = '18px';
            charBox.style.fontWeight = '500';
            charBox.textContent = safePattern[i];

            if (step && typeof step === 'object') {
                const pIdx = getStepPatternIndex(step);
                const isMatch = step['is_match'];
                const isFound = isStepFound(step, safeText.length);

                if (pIdx === i) {
                     if (isMatch) {
                        charBox.style.backgroundColor = '#a6e3a1';
                        charBox.style.color = '#1e1e2e';
                        charBox.style.borderColor = '#a6e3a1';
                    } else {
                        charBox.style.backgroundColor = '#f38ba8';
                        charBox.style.color = '#1e1e2e';
                        charBox.style.borderColor = '#f38ba8';
                    }
                }
                
                 if (isFound) {
                     charBox.style.backgroundColor = '#b2c9ee';
                     charBox.style.color = '#1e1e2e';
                     charBox.style.borderColor = '#b2c9ee';
                 }
            }

            patternRow.appendChild(charBox);
        }
        wrapper.appendChild(patternRow);
    }

    // --- ROW 2: TEXT (Bottom) ---
    const textRow = document.createElement('div');
    textRow.style.display = 'flex';
    
    for (let i = 0; i < safeText.length; i++) {
        const charBox = document.createElement('div');
        charBox.style.width = '50px';
        charBox.style.height = '50px';
        charBox.style.display = 'flex';
        charBox.style.alignItems = 'center';
        charBox.style.justifyContent = 'center';
        charBox.style.borderRadius = '8px';
        charBox.style.border = '2px solid #45475a';
        charBox.style.marginRight = '8px';
        charBox.style.backgroundColor = '#1e1e2e';
        charBox.style.color = '#cdd6f4';
        charBox.style.fontSize = '18px';
        charBox.style.fontWeight = '500';
        charBox.textContent = safeText[i];
        
        if (step && typeof step === 'object') {
            const tIdx = getStepTextIndex(step);
            const isMatch = step['is_match'];
            const isFound = isStepFound(step, safeText.length);
            const foundPos = getStepFoundPos(step, safeText.length);

            if (tIdx === i) {
                if (isMatch) {
                    charBox.style.backgroundColor = '#a6e3a1';
                    charBox.style.color = '#1e1e2e';
                    charBox.style.borderColor = '#a6e3a1';
                } else if (!isMatch) {
                     charBox.style.backgroundColor = '#f38ba8';
                     charBox.style.color = '#1e1e2e';
                     charBox.style.borderColor = '#f38ba8';
                }
            }
            
            if (isFound && foundPos !== -1 && foundPos !== undefined) {
                 if (i >= foundPos && i < foundPos + safePattern.length) {
                     charBox.style.backgroundColor = '#b2c9ee';
                     charBox.style.color = '#1e1e2e';
                     charBox.style.borderColor = '#b2c9ee';
                 }
            }
        }

        textRow.appendChild(charBox);
    }
    wrapper.appendChild(textRow);

    container.appendChild(wrapper);
}

export function updateSubstringStep(container, steps, text, pattern, stepIndex) {
    const safeSteps = Array.isArray(steps) ? steps : [];
    const step = safeSteps[stepIndex] || {};
    const safeText = text || "";
    const safePattern = pattern || "";
    
    renderSubstringViz(container, safeText, safePattern, step);
    
    const total = safeSteps.length;
    const current = stepIndex + 1;
    
    let msg = `Шаг ${current} / ${total}`;
    
    if (step && typeof step === 'object') {
        const isFound = isStepFound(step, safeText.length);
        const foundPos = getStepFoundPos(step, safeText.length);
        const tIdx = getStepTextIndex(step);
        const pIdx = getStepPatternIndex(step);

        if (isFound) {
            // Если найдено, приоритет отдается сообщению об успехе
            msg = `✅ Индекс первого совпадения: ${foundPos}`;
        } else if (tIdx >= 0 && pIdx >= 0) {
            const tChar = safeText[tIdx] || '?';
            const pChar = safePattern[pIdx] || '?';
            msg += ` | T[${tIdx}]='${tChar}' vs P[${pIdx}]='${pChar}'`;
            msg += step['is_match'] ? " (совпали)" : " (не совпали)";
            if (!step['is_match'] && step['is_backtrack'] && Number(step['lps_value']) > 0) {
                msg += ` | сдвиг: ${step['lps_value']}`;
            }
        } else if (current === total && !isFound) {
             // Если шаги кончились, а совпадения нет
             msg = "❌ Совпадений не найдено";
        }
    }
    
    return msg;
}
