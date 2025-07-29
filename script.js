import { systemPrompts } from './config.js';
// The default parser is no longer statically imported here.
// We will import the correct one dynamically.
import { saveCharacterCard, loadCharacterCard } from './cardManager.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- State and Data ---
    let allLangData = {}; // Holds all languages for gender mapping
    let langData = {};
    let conversationHistory = [];
    let isWaitingForResponse = false;
    let gameSessionData = {};
    let isEditing = false;
    let editIndex = null;

    // --- Constants ---
    const THEME_COLORS = [
        ['#1976d2', '#1e88e5'], ['#E64A6F', '#FF8DA1'], ['#d32f2f', '#e53935'],
        ['#e64a19', '#ff5722'], ['#ffa000', '#ffb300'], ['#388e3c', '#43a047'],
        ['#00796b', '#00897b'], ['#0097a7', '#00acc1'], ['#303f9f', '#3949ab'],
        ['#512da8', '#5e35b1'], ['#5d4037', '#6d4c41'], ['#455a64', '#546e7a']
    ];
    const SESSION_STORAGE_KEY = 'gameSessionData';
    const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    // --- Element Selectors (Shared) ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const langSwitcher = document.getElementById('lang-switcher');
    const creditsBtn = document.getElementById('credits-btn');
    const colorPickerWrapper = document.querySelector('.color-picker-wrapper');
    const themeColorButton = document.getElementById('theme-color-button');
    const themeColorPreview = document.getElementById('theme-color-preview');
    const colorPalettePopup = document.getElementById('color-palette-popup');
    const colorPalette = document.getElementById('color-palette');

    // --- Initialization ---
    async function initializeApp() {
        try {
            // Shared setup for both pages
            loadTheme();
            setupColorPicker();
            loadAccentColor();
            const savedLang = localStorage.getItem('currentLang') || 'en';
            await loadLanguage(savedLang);
            setupSharedEventListeners();

            // Page-specific setup
            if (document.getElementById('setup-section')) {
                setupPageLogic();
            } else if (document.getElementById('interaction-section')) {
                await gamePageLogic();
            }
        } catch (error) {
            console.error("Initialization Failed:", error);
            document.body.innerHTML = `Error: Could not load lang.json. Details: ${error.message}`;
        }
    }

    // --- Language and UI Text ---
    async function loadLanguage(lang) {
        try {
            if (Object.keys(allLangData).length === 0) {
                const response = await fetch('lang.json');
                if (!response.ok) throw new Error('Failed to load lang.json');
                allLangData = await response.json();
            }
            langData = allLangData[lang];
            document.documentElement.lang = lang;
            document.querySelectorAll('[data-lang]').forEach(el => {
                const key = el.getAttribute('data-lang');
                if (langData[key]) el.textContent = langData[key];
            });
            document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
                const key = el.getAttribute('data-lang-placeholder');
                if (langData[key]) el.placeholder = langData[key];
            });

            const modelSelect = document.getElementById('model-select');
            if (modelSelect) {
                modelSelect.innerHTML = langData.models.map(m => `<option value="${m.value}">${m.text}</option>`).join('');
            }

            // --- GENDER FIX ---
            const genderSelect = document.getElementById('char-gender');
            if (genderSelect) {
                const englishGenders = allLangData['en'].genders; // Canonical values
                const translatedGenders = langData.genders; // Display text
                genderSelect.innerHTML = englishGenders.map((engGender, index) =>
                    `<option value="${engGender}">${translatedGenders[index] || engGender}</option>`
                ).join('');
            }

            document.querySelectorAll('#lang-switcher button').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang-code') === lang));
            localStorage.setItem('currentLang', lang);
        } catch (error) {
            console.error(`Failed to load language "${lang}":`, error);
        }
    }

    // --- Theme and Color (Shared) ---
    function loadTheme() { const isDarkMode = localStorage.getItem('darkMode') === 'true'; document.body.classList.toggle('dark-mode', isDarkMode); themeSwitcher.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }
    function toggleTheme() { const isDarkMode = document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode', isDarkMode); themeSwitcher.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }
    function setupColorPicker() {
        colorPalette.innerHTML = '';
        THEME_COLORS.forEach(([baseColor, hoverColor]) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = baseColor;
            swatch.dataset.baseColor = baseColor;
            swatch.addEventListener('click', () => {
                selectAccentColor(baseColor, hoverColor);
                colorPalettePopup.classList.add('hidden');
            });
            colorPalette.appendChild(swatch);
        });
    }
    function selectAccentColor(baseColor, hoverColor) {
        applyAccentColor(baseColor, hoverColor);
        localStorage.setItem('accentColor', baseColor);
        localStorage.setItem('accentHoverColor', hoverColor);
        document.querySelector('.color-swatch.active')?.classList.remove('active');
        const newActiveSwatch = document.querySelector(`.color-swatch[data-base-color="${baseColor}"]`);
        if (newActiveSwatch) newActiveSwatch.classList.add('active');
    }
    function applyAccentColor(baseColor, hoverColor) {
        document.documentElement.style.setProperty('--accent-color', baseColor);
        document.documentElement.style.setProperty('--accent-hover', hoverColor);
        themeColorPreview.style.backgroundColor = baseColor;
    }
    function loadAccentColor() {
        const savedBase = localStorage.getItem('accentColor') || THEME_COLORS[1][0];
        const savedHover = localStorage.getItem('accentHoverColor') || THEME_COLORS[1][1];
        selectAccentColor(savedBase, savedHover);
    }

    // --- Shared Event Listeners ---
    function setupSharedEventListeners() {
        themeSwitcher.addEventListener('click', toggleTheme);
        langSwitcher.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') { const langCode = e.target.getAttribute('data-lang-code'); if (langCode) loadLanguage(langCode); } });
        creditsBtn.addEventListener('click', () => alert('Sex Sim AI v2.5\n\n© 2025 Joshua Z. All Rights Reserved.\n\nDeveloped for entertainment purposes only. \nPlease refrain from using real individuals in any scenario.'));
        themeColorButton.addEventListener('click', (e) => { e.stopPropagation(); colorPalettePopup.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!colorPickerWrapper.contains(e.target)) colorPalettePopup.classList.add('hidden'); });
    }

    // =================================================================
    // SETUP PAGE LOGIC (index.html)
    // =================================================================
    function setupPageLogic() {
        // ... (selectors remain the same)
        const apiKeyInput = document.getElementById('api-key');
        const modelSelect = document.getElementById('model-select');
        const imageUploader = document.getElementById('image-uploader');
        const imageFileInput = document.getElementById('image-file-input');
        const imageUploaderText = imageUploader.querySelector('p');
        const charNameInput = document.getElementById('char-name');
        const charAgeInput = document.getElementById('char-age');
        const genderSelect = document.getElementById('char-gender');
        const personalityInput = document.getElementById('char-personality');
        const personalityDice = document.getElementById('personality-dice');
        const scenarioInput = document.getElementById('char-scenario');
        const scenarioDice = document.getElementById('scenario-dice');
        const startBtn = document.getElementById('start-btn');
        const modeSwitcher = document.getElementById('mode-switcher');
        const advancedOptions = document.getElementById('advanced-options');
        const advancedOptionsToggle = document.getElementById('advanced-options-toggle');
        const advancedOptionsContent = document.getElementById('advanced-options-content');
        const showStatsToggle = document.getElementById('show-stats-toggle');
        const showReasoningToggle = document.getElementById('show-reasoning-toggle');
        const saveCardBtn = document.getElementById('save-card-btn');
        const loadCardBtn = document.getElementById('load-card-btn');
        const loadCardInput = document.getElementById('load-card-input');

        let characterImage = null;
        let currentMode = 'classic';

        // ... (functions handleImageFile, validateAndGetData, startGame, populateFormFromSession are unchanged)
        function handleImageFile(file) {
            if (file && file.type.startsWith('image/')) {
                if (file.size > MAX_IMAGE_SIZE_BYTES) {
                    alert(`Image is too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Please choose an image under 5 MB.`);
                    return;
                }
                const reader = new FileReader();
                reader.onload = (e) => {
                    imageUploader.style.backgroundImage = `url('${e.target.result}')`;
                    imageUploader.classList.add('has-image');
                    if (imageUploaderText) imageUploaderText.style.display = 'none';
                    characterImage = { mimeType: file.type, data: e.target.result.split(',')[1] };
                };
                reader.readAsDataURL(file);
            }
        }
        function validateAndGetData(elements, state) {
            let isValid = true;
            [elements.apiKeyInput, elements.charNameInput, elements.personalityInput, elements.charAgeInput, elements.imageUploader]
                .forEach(el => el.style.borderColor = '');
            [elements.apiKeyInput, elements.charNameInput, elements.personalityInput].forEach(input => {
                if (input.value.trim() === '') {
                    input.style.borderColor = 'var(--error-color)';
                    if (isValid) input.focus();
                    isValid = false;
                }
            });
            if (isNaN(parseInt(elements.charAgeInput.value)) || parseInt(elements.charAgeInput.value) < 18) {
                elements.charAgeInput.style.borderColor = 'var(--error-color)';
                if (isValid) elements.charAgeInput.focus();
                isValid = false;
            }
            if (!state.characterImage) {
                elements.imageUploader.style.borderColor = 'var(--error-color)';
                isValid = false;
            }
            if (!isValid) return null;
            return {
                apiKey: elements.apiKeyInput.value.trim(),
                model: elements.modelSelect.value,
                mode: state.currentMode,
                name: elements.charNameInput.value.trim(),
                age: parseInt(elements.charAgeInput.value),
                gender: elements.genderSelect.value,
                personality: elements.personalityInput.value.trim(),
                scenario: elements.scenarioInput.value.trim() || null,
                showStats: elements.showStatsToggle.checked,
                showReasoning: elements.showReasoningToggle.checked,
                characterImage: state.characterImage
            };
        }
        function startGame() {
            const data = validateAndGetData(
                { apiKeyInput, modelSelect, charNameInput, charAgeInput, genderSelect, personalityInput, scenarioInput, imageUploader, showStatsToggle, showReasoningToggle },
                { currentMode, characterImage }
            );
            if (!data) return;
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
            window.location.href = 'game.html';
        }
        function populateFormFromSession() {
            const savedDataJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (!savedDataJSON) return;
            const savedData = JSON.parse(savedDataJSON);
            apiKeyInput.value = savedData.apiKey || '';
            modelSelect.value = savedData.model || '';
            charNameInput.value = savedData.name || '';
            charAgeInput.value = savedData.age || 18;
            genderSelect.value = savedData.gender || 'Female';
            personalityInput.value = savedData.personality || '';
            scenarioInput.value = savedData.scenario || '';
            currentMode = savedData.mode || 'classic';
            document.querySelector('.mode-option.active')?.classList.remove('active');
            document.querySelector(`.mode-option[data-mode="${currentMode}"]`)?.classList.add('active');
            modeSwitcher.classList.toggle('realistic-active', currentMode === 'realistic');
            advancedOptions.classList.toggle('hidden', currentMode !== 'realistic');
            showStatsToggle.checked = savedData.showStats || false;
            showReasoningToggle.checked = savedData.showReasoning || false;
            if (savedData.characterImage) {
                characterImage = savedData.characterImage;
                imageUploader.style.backgroundImage = `url('data:${characterImage.mimeType};base64,${characterImage.data}')`;
                imageUploader.classList.add('has-image');
                if (imageUploaderText) imageUploaderText.style.display = 'none';
            }
        }
        async function handleSaveCard() {
            const name = charNameInput.value.trim();
            const age = parseInt(charAgeInput.value);
            const gender = genderSelect.value;
            const personality = personalityInput.value.trim();
            const scenario = scenarioInput.value.trim();

            if (!characterImage || !name || isNaN(age) || !gender || !personality) {
                alert("Please provide an Image, Name, Age, Gender, and Personality before saving a card.");
                return;
            }

            const characterData = { name, age, gender, personality };
            if (scenario) {
                characterData.scenario = scenario;
            }

            try {
                const cardBlob = await saveCharacterCard(characterImage, characterData);
                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(cardBlob);
                downloadLink.download = `[Card] ${name}.png`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                URL.revokeObjectURL(downloadLink.href);
            } catch (error) {
                console.error("Error saving card:", error);
                alert(`Could not save card: ${error.message}`);
            }
        }

        function handleLoadCard(event) {
            const file = event.target.files[0];
            if (!file) return;

            loadCharacterCard(file)
                .then(cardData => {
                    charNameInput.value = cardData.characterData.name || '';
                    charAgeInput.value = cardData.characterData.age || 18;
                    // The value is now always English, so this works across languages
                    genderSelect.value = cardData.characterData.gender || 'Female';
                    personalityInput.value = cardData.characterData.personality || '';
                    scenarioInput.value = cardData.characterData.scenario || '';

                    characterImage = cardData.image;
                    imageUploader.style.backgroundImage = `url('data:${characterImage.mimeType};base64,${characterImage.data}')`;
                    imageUploader.classList.add('has-image');
                    if (imageUploaderText) imageUploaderText.style.display = 'none';
                })
                .catch(error => {
                    console.error("Error loading card:", error);
                    alert(`Could not load card: ${error.message}`);
                })
                .finally(() => {
                    event.target.value = null;
                });
        }

        // ... (Event listeners are unchanged)
        [apiKeyInput, charNameInput, personalityInput, charAgeInput].forEach(input => input.addEventListener('input', () => input.style.borderColor = ''));
        modeSwitcher.addEventListener('click', (e) => {
            const selectedOption = e.target.closest('.mode-option');
            if (!selectedOption || selectedOption.dataset.mode === currentMode) return;
            currentMode = selectedOption.dataset.mode;
            modeSwitcher.querySelector('.active').classList.remove('active');
            selectedOption.classList.add('active');
            modeSwitcher.classList.toggle('realistic-active', currentMode === 'realistic');
            advancedOptions.classList.toggle('hidden', currentMode !== 'realistic');
            if (currentMode !== 'realistic') {
                advancedOptionsToggle.classList.remove('open');
                advancedOptionsContent.classList.add('hidden');
            }
        });
        advancedOptionsToggle.addEventListener('click', () => {
            advancedOptionsToggle.classList.toggle('open');
            advancedOptionsContent.classList.toggle('hidden');
        });
        imageUploader.addEventListener('click', () => imageUploader.style.borderColor = '');
        imageFileInput.addEventListener('change', e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); });
        imageUploader.addEventListener('dragover', e => { e.preventDefault(); imageUploader.classList.add('dragover'); });
        imageUploader.addEventListener('dragleave', () => imageUploader.classList.remove('dragover'));
        imageUploader.addEventListener('drop', e => { e.preventDefault(); imageUploader.classList.remove('dragover'); handleImageFile(e.dataTransfer.files[0]); });
        document.addEventListener('paste', e => { if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return; const file = Array.from(e.clipboardData.items).find(item => item.type.includes('image'))?.getAsFile(); if (file) handleImageFile(file); });
        personalityDice.addEventListener('click', () => { if (langData.personalities?.length) { personalityInput.value = langData.personalities[Math.floor(Math.random() * langData.personalities.length)]; } });
        scenarioDice.addEventListener('click', () => { if (langData.scenarios?.length) { scenarioInput.value = langData.scenarios[Math.floor(Math.random() * langData.scenarios.length)]; } });
        startBtn.addEventListener('click', startGame);
        saveCardBtn.addEventListener('click', handleSaveCard);
        loadCardBtn.addEventListener('click', () => loadCardInput.click());
        loadCardInput.addEventListener('change', handleLoadCard);

        populateFormFromSession();
    }


    // =================================================================
    // GAME PAGE LOGIC (game.html)
    // =================================================================
    async function gamePageLogic() {
        // --- DYNAMIC PARSER LOADING ---
        const currentLang = localStorage.getItem('currentLang') || 'en';
        let parserModule;
        switch (currentLang) {
            case 'cn':
                parserModule = await import('./CN_Parser.js');
                break;
            case 'ja':
                parserModule = await import('./JP_Parser.js');
                break;
            default:
                parserModule = await import('./parser.js');
                break;
        }
        const { parseAdvancedJSON } = parserModule;

        // ... (selectors remain the same)
        const backToSetupBtn = document.getElementById('back-to-setup-btn');
        const gameCharDisplay = document.getElementById('game-char-display');
        const gameCharImage = document.getElementById('game-char-image');
        const dialogueHistoryContainer = document.getElementById('dialogue-history-container');
        const suggestedOptionsContainer = document.getElementById('suggested-options-container');
        const userActionTextarea = document.getElementById('user-action-textarea');
        const sendActionBtn = document.getElementById('send-action-btn');
        const editLastActionBtn = document.getElementById('edit-last-action-btn');

        const savedDataJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (!savedDataJSON) {
            window.location.href = 'index.html';
            return;
        }
        gameSessionData = JSON.parse(savedDataJSON);

        // ... (All other functions in gamePageLogic remain unchanged from the previous correct version)
        function setupGameUI() {
            if (gameSessionData.characterImage) {
                gameCharImage.src = `data:${gameSessionData.characterImage.mimeType};base64,${gameSessionData.characterImage.data}`;
                gameCharDisplay.classList.remove('hidden');
            }
        }
        async function startInitialAPICall() {
            const currentLang = localStorage.getItem('currentLang') || 'en';
            const systemPrompt = systemPrompts[currentLang]?.[gameSessionData.mode]?.system;

            if (!systemPrompt || systemPrompt.trim().toLowerCase() === 'insert prompt here' || systemPrompt.trim().toLowerCase() === 'empty here') {
                const errorMsg = currentLang === 'en'
                    ? `System prompt for "${gameSessionData.mode}" mode is missing or not yet implemented.`
                    : `System prompt for "${gameSessionData.mode}" mode (${currentLang}) is missing. Please select another mode.`;
                appendMessage(errorMsg, 'system-error');
                return;
            }
            const characterSetupForPrompt = { ...gameSessionData };
            delete characterSetupForPrompt.characterImage;
            delete characterSetupForPrompt.apiKey;
            const textPrompt = systemPrompt + "\n\nHere is the character and scenario setup:\n" + JSON.stringify(characterSetupForPrompt, null, 2);
            const initialTurn = { role: 'user', parts: [{ text: textPrompt }, { inlineData: gameSessionData.characterImage }] };
            conversationHistory.push(initialTurn);
            await callGeminiAPI();
        }
        async function handleInteraction() {
            const choice = userActionTextarea.value.trim();
            if (!choice || isWaitingForResponse) return;

            if (isEditing) {
                conversationHistory = conversationHistory.slice(0, editIndex + 1);
                conversationHistory[editIndex].parts[0].text = choice;
                const allTurns = Array.from(dialogueHistoryContainer.children);
                const turnsToRemove = allTurns.filter(turn => parseInt(turn.dataset.historyIndex, 10) > editIndex);
                turnsToRemove.forEach(turn => turn.remove());
                const turnToUpdate = dialogueHistoryContainer.querySelector(`.dialogue-turn[data-history-index="${editIndex}"] .message-bubble`);
                if (turnToUpdate) {
                    turnToUpdate.textContent = choice;
                }
            } else {
                appendMessage(choice, 'user-action');
                conversationHistory.push({ role: 'user', parts: [{ text: choice }] });
            }

            userActionTextarea.value = '';
            if (isEditing) {
                exitEditMode();
            }

            await callGeminiAPI();
        }
        function enterEditMode() {
            if (isWaitingForResponse) return;
            let lastUserHistoryIndex = -1;
            for (let i = conversationHistory.length - 1; i > 0; i--) {
                if (conversationHistory[i].role === 'user') {
                    lastUserHistoryIndex = i;
                    break;
                }
            }
            if (lastUserHistoryIndex <= 0) return;

            isEditing = true;
            editIndex = lastUserHistoryIndex;

            const lastUserActionText = conversationHistory[lastUserHistoryIndex].parts[0].text;
            userActionTextarea.value = lastUserActionText;
            userActionTextarea.focus();
            userActionTextarea.classList.add('edit-mode');

            editLastActionBtn.innerHTML = '<i class="fas fa-times"></i>';
            editLastActionBtn.title = 'Cancel Edit';
        }
        function exitEditMode() {
            isEditing = false;
            editIndex = null;
            userActionTextarea.value = '';
            userActionTextarea.classList.remove('edit-mode');
            editLastActionBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
            editLastActionBtn.title = 'Edit Last Action';
        }
        function handleEditToggle() {
            if (isEditing) {
                exitEditMode();
            } else {
                enterEditMode();
            }
        }
        function setLoadingState(isLoading) {
            isWaitingForResponse = isLoading;
            sendActionBtn.disabled = isLoading;
            userActionTextarea.disabled = isLoading;

            const canEdit = !isLoading && conversationHistory.some((turn, index) => turn.role === 'user' && index > 0);
            editLastActionBtn.disabled = !canEdit;

            const existingSpinner = dialogueHistoryContainer.querySelector('.spinner-turn');
            if (existingSpinner) existingSpinner.remove();

            if (isLoading) {
                appendMessage('<i class="fas fa-spinner spinner"></i>', 'spinner');
            }
        }
        function appendMessage(content, type, data = null) {
            const turnDiv = document.createElement('div');
            turnDiv.className = 'dialogue-turn';
            turnDiv.dataset.historyIndex = conversationHistory.length;

            if (type === 'ai-response') { turnDiv.classList.add('ai-turn'); }
            else if (type === 'user-action') { turnDiv.classList.add('user-turn'); }

            const bubbleDiv = document.createElement('div');
            bubbleDiv.className = `message-bubble ${type}`;

            if (type === 'ai-response') {
                const textNode = document.createTextNode(content);
                bubbleDiv.appendChild(textNode);
                if (data && data.coreState) {
                    const statsContainer = createStatsDisplay(data.coreState);
                    if (statsContainer) bubbleDiv.appendChild(statsContainer);
                }
            } else if (type === 'spinner') {
                bubbleDiv.innerHTML = content;
                turnDiv.classList.add('spinner-turn');
            } else {
                bubbleDiv.textContent = content;
            }

            turnDiv.appendChild(bubbleDiv);
            dialogueHistoryContainer.appendChild(turnDiv);
            dialogueHistoryContainer.scrollTop = dialogueHistoryContainer.scrollHeight;
        }
        function createStatsDisplay(coreState) {
            const container = document.createElement('div');
            container.id = 'stats-display-container';
            let contentGenerated = false;
            if (gameSessionData.mode === 'realistic') {
                if (gameSessionData.showStats) {
                    const stateKeys = Object.keys(coreState).filter(k => k !== 'reasoning');
                    if (stateKeys.length > 0) {
                        const metersGrid = document.createElement('div');
                        metersGrid.className = 'stats-meters-grid';
                        for (const key of stateKeys) {
                            const value = coreState[key];
                            const statItem = document.createElement('div');
                            statItem.className = 'stat-item';
                            const normalizedValue = (value + 100) / 2;
                            statItem.innerHTML = `<span class="stat-label">${key}</span><div class="stat-bar"><div class="stat-bar-fill" style="width: ${Math.max(0, Math.min(100, normalizedValue))}%"></div></div><span class="stat-value">${value}</span>`;
                            metersGrid.appendChild(statItem);
                        }
                        container.appendChild(metersGrid);
                        contentGenerated = true;
                    }
                }
                if (gameSessionData.showReasoning && coreState.reasoning) {
                    const reasoningBox = document.createElement('div');
                    reasoningBox.className = 'stats-reasoning-box';
                    reasoningBox.innerHTML = `<h5>${langData.showReasoningLabel || 'Reasoning'}</h5><p>${coreState.reasoning}</p>`;
                    container.appendChild(reasoningBox);
                    contentGenerated = true;
                }
            }
            return contentGenerated ? container : null;
        }
        function updateSuggestedOptions(options) {
            suggestedOptionsContainer.innerHTML = '';
            if (!options || Object.keys(options).length === 0) return;
            Object.values(options).forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'suggested-option-btn';
                btn.textContent = opt;
                suggestedOptionsContainer.appendChild(btn);
            });
        }
        async function callGeminiAPI() {
            setLoadingState(true);
            updateSuggestedOptions({});
            const apiKey = gameSessionData.apiKey;
            const model = gameSessionData.model;
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const payload = {
                contents: conversationHistory,
                safetySettings: [
                    { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE" },
                    { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE" },
                    { "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE" },
                    { "category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE" }
                ]
            };
            try {
                const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (!response.ok) {
                    const errorData = await response.json();
                    let msg = errorData.error?.message || `HTTP error! status: ${response.status}`;
                    if (msg.includes("API key not valid")) { throw new Error("API key not valid. Please check it and return to the setup page."); }
                    if (msg.toLowerCase().includes("request payload size")) { throw new Error("Image size error: The uploaded image is too large for the API to process. Please start over with a smaller image."); }
                    throw new Error(msg);
                }
                const data = await response.json();
                if (!data.candidates || data.candidates.length === 0) {
                    const blockReason = data.promptFeedback?.blockReason;
                    const safetyRatings = data.promptFeedback?.safetyRatings;
                    let errorDetails = "API returned no response candidates. The prompt may have been blocked.";
                    if (blockReason) { errorDetails += ` Reason: ${blockReason}.`; }
                    if (safetyRatings) { errorDetails += ` Ratings: ${JSON.stringify(safetyRatings)}`; }
                    throw new Error(errorDetails);
                }
                const responseText = data.candidates[0].content.parts[0].text;
                const parsedResponse = parseAdvancedJSON(responseText, gameSessionData.mode);
                let displayText = parsedResponse.mainText || '';
                if (!displayText.startsWith('🔓')) { displayText = '🔓 ' + displayText; }

                appendMessage(displayText, 'ai-response', parsedResponse);
                conversationHistory.push({ role: 'model', parts: [{ text: responseText }] });

                const existingSpinner = dialogueHistoryContainer.querySelector('.spinner-turn');
                if (existingSpinner) existingSpinner.remove();

                updateSuggestedOptions(parsedResponse.options);
            } catch (error) {
                console.error("API or Parsing Error:", error);
                const existingSpinner = dialogueHistoryContainer.querySelector('.spinner-turn');
                if (existingSpinner) existingSpinner.remove();
                appendMessage(`${error.message}\n\nPlease edit your last action and try again, or return to setup.`, 'system-error');
            } finally {
                setLoadingState(false);
            }
        }

        backToSetupBtn.addEventListener('click', () => { window.location.href = 'index.html'; });
        suggestedOptionsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('suggested-option-btn')) {
                userActionTextarea.value = e.target.textContent;
                userActionTextarea.focus();
            }
        });
        sendActionBtn.addEventListener('click', handleInteraction);
        userActionTextarea.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleInteraction(); }
        });
        editLastActionBtn.addEventListener('click', handleEditToggle);

        setupGameUI();
        await startInitialAPICall();
    }

    initializeApp();
});
