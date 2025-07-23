import { systemPrompts } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
    // --- State and Data ---
    let langData = {};
    let lastSuccessfulOptions = [];
    let conversationHistory = [];
    let isWaitingForResponse = false;
    let characterImage = null;
    let lastUserActionAttempt = '';

    // --- Element Selectors ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const langSwitcher = document.getElementById('lang-switcher');
    const creditsBtn = document.getElementById('credits-btn');
    const colorPickerWrapper = document.querySelector('.color-picker-wrapper');
    const themeColorButton = document.getElementById('theme-color-button');
    const themeColorPreview = document.getElementById('theme-color-preview');
    const colorPalettePopup = document.getElementById('color-palette-popup');
    const colorPalette = document.getElementById('color-palette');
    const apiKeyInput = document.getElementById('api-key');
    const modelSelect = document.getElementById('model-select');
    const imageUploader = document.getElementById('image-uploader');
    const imageUploaderText = imageUploader.querySelector('p');
    const charNameInput = document.getElementById('char-name');
    const charAgeInput = document.getElementById('char-age');
    const genderSelect = document.getElementById('char-gender');
    const personalityInput = document.getElementById('char-personality');
    const personalityDice = document.getElementById('personality-dice');
    const scenarioInput = document.getElementById('char-scenario');
    const scenarioDice = document.getElementById('scenario-dice');
    const startBtn = document.getElementById('start-btn');
    const setupSection = document.getElementById('setup-section');
    const interactionSection = document.getElementById('interaction-section');
    const responseBox = document.getElementById('response-box');
    const optionsContainer = document.getElementById('options-container');
    const customOptionInput = document.getElementById('custom-option-input');
    const submitCustomOption = document.getElementById('submit-custom-option');
    const backToSetupBtn = document.getElementById('back-to-setup-btn');
    const retryBtn = document.getElementById('retry-btn');
    const gameCharDisplay = document.getElementById('game-char-display');
    const gameCharImage = document.getElementById('game-char-image');

    // --- Constants ---
    const themeColors = [
        // Blue
        ['#1976d2', '#1e88e5'],
        // Pink
        ['#E64A6F', '#FF8DA1'],
        // Red
        ['#d32f2f', '#e53935'],
        // Deep Orange
        ['#e64a19', '#ff5722'],
        // Amber
        ['#ffa000', '#ffb300'],
        // Green
        ['#388e3c', '#43a047'],
        // Teal
        ['#00796b', '#00897b'],
        // Cyan
        ['#0097a7', '#00acc1'],
        // Indigo
        ['#303f9f', '#3949ab'],
        // Deep Purple
        ['#512da8', '#5e35b1'],
        // Brown
        ['#5d4037', '#6d4c41'],
        // Blue Grey
        ['#455a64', '#546e7a']
    ];
    // --- Initialization ---
    async function initializeApp() {
        try {
            loadTheme();
            setupColorPicker();
            loadAccentColor();
            const savedLang = localStorage.getItem('currentLang') || 'en';
            await loadLanguage(savedLang);
            setupEventListeners();
        } catch (error) {
            console.error("Initialization Failed:", error);
            document.body.innerHTML = `Error: Could not load lang.json. Details: ${error.message}`;
        }
    }

    // --- Language and UI Text ---
    async function loadLanguage(lang) {
        try {
            const response = await fetch('lang.json');
            if (!response.ok) throw new Error('Failed to load lang.json');
            const allLangs = await response.json();
            langData = allLangs[lang];
            document.documentElement.lang = lang;
            document.querySelectorAll('[data-lang]').forEach(el => el.textContent = langData[el.getAttribute('data-lang')] || '');
            document.querySelectorAll('[data-lang-placeholder]').forEach(el => el.placeholder = langData[el.getAttribute('data-lang-placeholder')] || '');
            genderSelect.innerHTML = langData.genders.map(g => `<option value="${g}">${g}</option>`).join('');
            modelSelect.innerHTML = langData.models.map(m => `<option value="${m.value}">${m.text}</option>`).join('');
            document.querySelectorAll('#lang-switcher button').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang-code') === lang));
            localStorage.setItem('currentLang', lang);
        } catch (error) {
            console.error(`Failed to load language "${lang}":`, error);
        }
    }

    // --- Theme and Color ---
    function loadTheme() { const isDarkMode = localStorage.getItem('darkMode') === 'true'; document.body.classList.toggle('dark-mode', isDarkMode); themeSwitcher.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }
    function toggleTheme() { const isDarkMode = document.body.classList.toggle('dark-mode'); localStorage.setItem('darkMode', isDarkMode); themeSwitcher.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>'; }

    function setupColorPicker() {
        colorPalette.innerHTML = '';
        themeColors.forEach(([baseColor, hoverColor]) => {
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
        const savedBase = localStorage.getItem('accentColor') || themeColors[0][0];
        const savedHover = localStorage.getItem('accentHoverColor') || themeColors[0][1];
        selectAccentColor(savedBase, savedHover);
    }

    // --- Image Uploader ---
    function handleImageFile(file) { if (file && file.type.startsWith('image/')) { const reader = new FileReader(); reader.onload = (e) => { imageUploader.style.backgroundImage = `url('${e.target.result}')`; imageUploader.classList.add('has-image'); if (imageUploaderText) imageUploaderText.style.display = 'none'; characterImage = { mimeType: file.type, data: e.target.result.split(',')[1] }; }; reader.readAsDataURL(file); } }

    // --- Game Start ---
    async function startGame() {
        const characterData = validateAndGetData();
        if (!characterData) return;

        setupSection.classList.add('hidden');
        interactionSection.classList.remove('hidden');

        if (characterImage) {
            gameCharImage.src = `data:${characterImage.mimeType};base64,${characterImage.data}`;
            gameCharDisplay.classList.remove('hidden');
        } else {
            gameCharDisplay.classList.add('hidden');
        }

        conversationHistory = [];
        retryBtn.classList.add('hidden');

        const currentLang = localStorage.getItem('currentLang') || 'en';
        const systemPrompt = systemPrompts[currentLang]?.system;
        if (!systemPrompt || systemPrompt.trim().toLowerCase() === 'empty here') {
            const errorMsg = currentLang === 'en' ? "System prompt is missing." : `System prompt for (${currentLang}) is missing. Please select English.`;
            responseBox.textContent = "Error: " + errorMsg;
            setupSection.classList.remove('hidden');
            interactionSection.classList.add('hidden');
            return;
        }

        const textPrompt = systemPrompt + "\n\nHere is the character and scenario setup:\n" + JSON.stringify(characterData, null, 2);
        const initialTurn = { role: 'user', parts: [{ text: textPrompt }, { inlineData: { mimeType: characterImage.mimeType, data: characterImage.data } }] };
        conversationHistory.push(initialTurn);

        await callGeminiAPI();
    }

    // --- Validation ---
    function validateAndGetData() {
        let isValid = true;
        [apiKeyInput, charNameInput, personalityInput].forEach(input => { if (input.value.trim() === '') { input.style.borderColor = 'var(--error-color)'; if (isValid) input.focus(); isValid = false; } });
        if (isNaN(parseInt(charAgeInput.value)) || parseInt(charAgeInput.value) < 18) { charAgeInput.style.borderColor = 'var(--error-color)'; if (isValid) charAgeInput.focus(); isValid = false; }
        if (!characterImage) { imageUploader.style.borderColor = 'var(--error-color)'; isValid = false; }
        if (!isValid) return null;
        return { name: charNameInput.value.trim(), age: parseInt(charAgeInput.value), gender: genderSelect.value, personality: personalityInput.value.trim(), scenario: scenarioInput.value.trim() || null };
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        themeSwitcher.addEventListener('click', toggleTheme);
        langSwitcher.addEventListener('click', (e) => { if (e.target.tagName === 'BUTTON') { const langCode = e.target.getAttribute('data-lang-code'); if (langCode) loadLanguage(langCode); } });

        //Credits button listener
        creditsBtn.addEventListener('click', () => {
            alert('Sex Sim AI v1.1\n\n© 2025 Joshua Z. All Rights Reserved.\n\nDeveloped for entertainment purposes only. \nPlease refrain from using real individuals in any scenario.');
        });

        themeColorButton.addEventListener('click', (e) => { e.stopPropagation(); colorPalettePopup.classList.toggle('hidden'); });
        document.addEventListener('click', (e) => { if (!colorPickerWrapper.contains(e.target)) colorPalettePopup.classList.add('hidden'); });

        [apiKeyInput, charNameInput, personalityInput, charAgeInput].forEach(input => input.addEventListener('input', () => input.style.borderColor = ''));
        imageUploader.addEventListener('click', () => imageUploader.style.borderColor = '');
        imageUploader.addEventListener('dragover', e => { e.preventDefault(); imageUploader.classList.add('dragover'); });
        imageUploader.addEventListener('dragleave', () => imageUploader.classList.remove('dragover'));
        imageUploader.addEventListener('drop', e => { e.preventDefault(); imageUploader.classList.remove('dragover'); handleImageFile(e.dataTransfer.files[0]); });
        document.addEventListener('paste', e => { if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return; const file = Array.from(e.clipboardData.items).find(item => item.type.includes('image'))?.getAsFile(); if (file) handleImageFile(file); });

        personalityDice.addEventListener('click', () => { if (langData.personalities?.length) { personalityInput.value = langData.personalities[Math.floor(Math.random() * langData.personalities.length)]; } });
        scenarioDice.addEventListener('click', () => { if (langData.scenarios?.length) { scenarioInput.value = langData.scenarios[Math.floor(Math.random() * langData.scenarios.length)]; } });

        startBtn.addEventListener('click', startGame);

        backToSetupBtn.addEventListener('click', () => {
            interactionSection.classList.add('hidden');
            setupSection.classList.remove('hidden');
            conversationHistory = [];
            isWaitingForResponse = false;
            retryBtn.classList.add('hidden');
        });

        retryBtn.addEventListener('click', () => {
            if (lastUserActionAttempt) {
                handleInteraction(true); // Pass a flag to indicate it's a retry
            }
        });

        optionsContainer.addEventListener('click', e => {
            if (e.target.classList.contains('option-btn')) {
                customOptionInput.value = e.target.textContent;
                customOptionInput.focus();
            }
        });

        submitCustomOption.addEventListener('click', () => handleInteraction(false));
        customOptionInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleInteraction(false); });
    }

    // --- Core Interaction & API Logic ---
    async function handleInteraction(isRetry = false) {
        const choice = isRetry ? lastUserActionAttempt : customOptionInput.value;
        if (!choice || isWaitingForResponse) return;

        lastUserActionAttempt = choice.trim();
        if (!isRetry) customOptionInput.value = '';

        conversationHistory.push({ role: 'user', parts: [{ text: lastUserActionAttempt }] });
        await callGeminiAPI();
    }

    async function updateInteractionUI(apiResponse) {
        let displayText = apiResponse.mainText;
        if (!displayText.startsWith('🔓')) { displayText = '🔓 ' + displayText; }
        responseBox.innerHTML = '';
        responseBox.style.justifyContent = 'flex-start';
        responseBox.textContent = displayText;
        const newOptions = Object.values(apiResponse.options);
        optionsContainer.innerHTML = newOptions.map(opt => `<button class="option-btn">${opt}</button>`).join('');
        lastSuccessfulOptions = newOptions;
    }

    function setLoadingState(isLoading) {
        isWaitingForResponse = isLoading;
        responseBox.classList.toggle('loading', isLoading);
        optionsContainer.classList.toggle('loading', isLoading);
        if (isLoading) {
            retryBtn.classList.add('hidden');
            optionsContainer.innerHTML = '';
            responseBox.style.justifyContent = 'center';
            responseBox.innerHTML = '<i class="fas fa-spinner spinner"></i>';
        }
    }

    function parseApiResponse(text) { try { return JSON.parse(text); } catch (e) { } const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/); if (jsonMatch && jsonMatch[1]) { try { return JSON.parse(jsonMatch[1]); } catch (e) { } } const rawJsonMatch = text.match(/(\{[\s\S]*\})/); if (rawJsonMatch && rawJsonMatch[1]) { try { return JSON.parse(rawJsonMatch[1]); } catch (e) { } } const lines = text.split('\n').filter(line => line.trim() !== ''); const options = []; const mainTextLines = []; const optionRegex = /^\s*\*?\s*[1-3][\.\)]\s*\*?\s*(.*)/; for (const line of lines) { const match = line.match(optionRegex); if (match && match[1]) { options.push(match[1].trim()); } else { mainTextLines.push(line); } } if (options.length >= 3) { console.log("Heuristic parse successful."); return { mainText: mainTextLines.join('\n').trim(), options: { option1: options[0], option2: options[1], option3: options[2] } }; } throw new Error("API response is not valid JSON and could not be parsed as plain text."); }

    async function callGeminiAPI() {
        setLoadingState(true);
        const apiKey = apiKeyInput.value;
        const model = modelSelect.value;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: conversationHistory }) });
            if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error.message || `HTTP error! status: ${response.status}`); }

            const data = await response.json();
            if (!data.candidates || data.candidates.length === 0) { throw new Error("API returned no response candidates. The prompt may have been blocked."); }

            const responseText = data.candidates[0].content.parts[0].text;
            const parsedResponse = parseApiResponse(responseText);
            conversationHistory.push({ role: 'model', parts: [{ text: JSON.stringify(parsedResponse) }] });
            await updateInteractionUI(parsedResponse);
        } catch (error) {
            console.error("API or Parsing Error:", error);
            conversationHistory.pop(); // Remove the failed user action
            responseBox.innerHTML = '';
            responseBox.style.justifyContent = 'flex-start';
            responseBox.textContent = `An error occurred: ${error.message}\n\nYou can edit your action and try again, or press Retry.`;

            retryBtn.classList.remove('hidden');
            customOptionInput.value = lastUserActionAttempt; // Restore failed action for editing

            if (lastSuccessfulOptions?.length > 0) {
                optionsContainer.innerHTML = lastSuccessfulOptions.map(opt => `<button class="option-btn">${opt}</button>`).join('');
            } else {
                optionsContainer.innerHTML = '<p>Cannot restore options.</p>';
            }
        } finally {
            setLoadingState(false);
        }
    }

    // --- Run Application ---
    initializeApp();
});