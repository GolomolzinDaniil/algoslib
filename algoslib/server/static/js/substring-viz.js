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

    // --- ROW 1: PATTERN (Top) ---
    if (safePattern.length > 0) {
        const patternRow = document.createElement('div');
        patternRow.style.display = 'flex';
        patternRow.style.marginBottom = '4px';
        
        let startOffset = 0;
        if (step && typeof step === 'object') {
            const tIdx = step['text_idx'] !== undefined ? step['text_idx'] : step['text_index'];
            const pIdx = step['pattern_idx'] !== undefined ? step['pattern_idx'] : step['pattern_index'];
            
            if (tIdx >= 0 && pIdx >= 0) {
                startOffset = tIdx - pIdx;
            } else if (tIdx >= 0) {
                startOffset = tIdx;
            }
        }

        if (startOffset > 0) {
            const spacer = document.createElement('div');
            spacer.style.width = `${startOffset * 58}px`; 
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
                const pIdx = step['pattern_idx'] !== undefined ? step['pattern_idx'] : step['pattern_index'];
                const isMatch = step['is_match'];
                const isFound = step['is_found'] || step['is_full_match'];

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
            const tIdx = step['text_idx'] !== undefined ? step['text_idx'] : step['text_index'];
            const isMatch = step['is_match'];
            const isFound = step['is_found'] || step['is_full_match'];
            const foundPos = step['found_pos'] !== undefined ? step['found_pos'] : step['match_start_pos'];

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
    
    renderSubstringViz(container, text, pattern, step);
    
    const total = safeSteps.length;
    const current = stepIndex + 1;
    
    let msg = `Шаг ${current} / ${total}`;
    
    if (step && typeof step === 'object') {
        const isFound = step['is_found'] || step['is_full_match'];
        const foundPos = step['found_pos'] !== undefined ? step['found_pos'] : step['match_start_pos'];
        const tIdx = step['text_idx'] !== undefined ? step['text_idx'] : step['text_index'];
        const pIdx = step['pattern_idx'] !== undefined ? step['pattern_idx'] : step['pattern_index'];

        if (isFound) {
            // Если найдено, приоритет отдается сообщению об успехе
            msg = `✅ Индекс первого совпадения: ${foundPos}`;
        } else if (tIdx >= 0 && pIdx >= 0) {
            const tChar = text[tIdx] || '?';
            const pChar = pattern[pIdx] || '?';
            msg += ` | T[${tIdx}]='${tChar}' vs P[${pIdx}]='${pChar}'`;
            msg += step['is_match'] ? " (совпали)" : " (не совпали)";
        } else if (current === total && !isFound) {
             // Если шаги кончились, а совпадения нет
             msg = "❌ Совпадений не найдено";
        }
    }
    
    return msg;
}