/* --- Root Variables & Base Styles --- */
:root {
    --primary-bg: #f4f4f9;
    --secondary-bg: #ffffff;
    --primary-text: #333;
    --secondary-text: #666;
    --placeholder-text: #aaa;
    --accent-color: #5d3a9b;
    --accent-hover: #7e57c2;
    --error-color: #d9534f;
    --border-color: #ddd;
    --shadow-color: rgba(0, 0, 0, 0.1);
    --header-shadow: rgba(0, 0, 0, 0.2);
}

body.dark-mode {
    --primary-bg: #121212;
    --secondary-bg: #1e1e1e;
    --primary-text: #e0e0e0;
    --secondary-text: #a0a0a0;
    --placeholder-text: #666;
    --error-color: #e57373;
    --border-color: #444;
    --shadow-color: rgba(255, 255, 255, 0.05);
    --header-shadow: rgba(0, 0, 0, 0.5);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
    font-family: 'Roboto', sans-serif;
    background-color: var(--primary-bg);
    color: var(--primary-text);
    line-height: 1.6;
    transition: background-color 0.3s, color 0.3s;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 2rem;
    min-height: 100vh;
}

.container {
    width: 100%;
    max-width: 800px;
    background-color: var(--secondary-bg);
    border-radius: 12px;
    box-shadow: 0 4px 20px var(--shadow-color);
    padding: 2.5rem;
    transition: background-color 0.3s;
    position: relative; /* Added for back button positioning */
}

.hidden { display: none !important; }

/* --- NEW: Top Left Controls --- */
.top-left-controls {
    position: fixed;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
    z-index: 1001;
}

/* --- Language Switcher --- */
#lang-switcher {
    display: flex;
    gap: 5px;
    background-color: var(--secondary-bg);
    padding: 5px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 5px var(--shadow-color);
}
#lang-switcher button { background: none; border: none; color: var(--secondary-text); padding: 5px 10px; cursor: pointer; border-radius: 5px; font-weight: bold; transition: background-color 0.2s, color 0.2s; }
#lang-switcher button:hover { background-color: var(--primary-bg); color: var(--primary-text); }
#lang-switcher button.active { background-color: var(--accent-color); color: white; }

/* --- Credits Button --- */
#credits-btn {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    color: var(--primary-text);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
    box-shadow: 0 2px 5px var(--shadow-color);
}
#credits-btn:hover {
    background-color: var(--primary-bg);
    transform: scale(1.1);
}


/* --- Top Right Controls --- */
.top-right-controls {
    position: fixed;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 15px;
    z-index: 1001;
}

#theme-switcher {
    background: var(--secondary-bg);
    border: 1px solid var(--border-color);
    color: var(--primary-text);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s;
}
#theme-switcher:hover { background-color: var(--primary-bg); transform: scale(1.1); }

/* --- Color Picker --- */
#color-picker-container {
    display: flex;
    align-items: center;
    gap: 10px;
    background-color: var(--secondary-bg);
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 5px var(--shadow-color);
}
#color-picker-container label {
    font-weight: 400;
    color: var(--secondary-text);
    white-space: nowrap;
}
.color-picker-wrapper { position: relative; }
#theme-color-button { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background-color: var(--primary-bg); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; font-family: 'Roboto', sans-serif; font-size: 1rem; color: var(--primary-text); transition: border-color 0.2s, background-color 0.2s; }
#theme-color-button:hover { border-color: var(--accent-color); }
#theme-color-preview { width: 20px; height: 20px; border-radius: 50%; background-color: var(--accent-color); border: 1px solid var(--border-color); }
#theme-color-button .fa-caret-down { font-size: 0.8em; }

#color-palette-popup {
    position: absolute;
    top: 50%;
    right: calc(100% + 10px); /* Position to the left of the wrapper */
    transform: translateY(-50%); /* Center vertically */
    background-color: var(--secondary-bg);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 4px 15px var(--shadow-color);
    padding: 1rem;
    z-index: 1000;
    animation: fadeIn 0.2s ease-out;
}
#color-palette { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
.color-swatch { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 2px solid transparent; transition: transform 0.2s, border-color 0.2s; }
.color-swatch:hover { transform: scale(1.2); }
.color-swatch.active { border-color: var(--primary-text); box-shadow: 0 0 5px var(--primary-text); transform: scale(1.1); }


/* --- Header --- */
header { text-align: center; margin-bottom: 2.5rem; position: relative; padding-bottom: 1rem; }
header h1 { font-family: 'Cinzel Decorative', serif; font-weight: 700; font-size: 3rem; color: var(--accent-color); letter-spacing: 3px; text-shadow: 2px 2px 4px var(--header-shadow); transition: color 0.3s; margin: 0; }
header::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 2px; background: linear-gradient(90deg, transparent, var(--accent-color), transparent); opacity: 0.8; }


/* --- Setup Section --- */
.api-settings { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; padding: 1.5rem; margin-top: 1.5rem; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--primary-bg); }
#image-uploader { width: 100%; height: 400px; border: 3px dashed var(--border-color); border-radius: 8px; margin: 2rem auto 2.5rem auto; display: flex; justify-content: center; align-items: center; text-align: center; color: var(--secondary-text); cursor: pointer; background-size: contain; background-position: center; background-repeat: no-repeat; background-color: var(--primary-bg); transition: border-color 0.3s, background-color 0.3s; }
#image-uploader.has-image { border-color: var(--accent-color); }
#image-uploader.dragover { border-color: var(--accent-color); background-color: color-mix(in srgb, var(--accent-color) 10%, var(--primary-bg)); }
#image-uploader p { padding: 1rem; pointer-events: none; }
.character-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
.input-group { display: flex; flex-direction: column; }
.scenario-group, .personality-group { grid-column: 1 / -1; } /* MODIFIED: Added personality-group */
.input-group label { font-weight: 400; margin-bottom: 0.5rem; color: var(--secondary-text); }
input, select, textarea { width: 100%; padding: 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background-color: var(--primary-bg); color: var(--primary-text); font-family: 'Roboto', sans-serif; font-size: 1rem; transition: border-color 0.3s, box-shadow 0.3s; }
/* MODIFIED: Changed background-color to --primary-bg for better contrast in dark mode */
body.dark-mode input, body.dark-mode select, body.dark-mode textarea { background-color: var(--primary-bg); }
input:focus, select:focus, textarea:focus { outline: none; border-color: var(--accent-color); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent-color) 25%, transparent); }
input::placeholder, textarea::placeholder { color: var(--placeholder-text); opacity: 1; }
.input-with-icon { position: relative; display: flex; align-items: center; }
.input-with-icon input, .input-with-icon textarea { padding-right: 3rem; }
.dice-btn { position: absolute; right: 1px; top: 1px; bottom: 1px; width: 2.8rem; border: none; background: none; font-size: 1.5rem; cursor: pointer; color: var(--secondary-text); transition: transform 0.2s, color 0.2s; border-radius: 0 6px 6px 0; display: flex; align-items: center; justify-content: center; }
.dice-btn:hover { color: var(--accent-color); transform: rotate(20deg) scale(1.1); }
#start-btn { display: block; width: 100%; padding: 1rem; font-size: 1.2rem; font-weight: bold; color: white; background-color: var(--accent-color); border: none; border-radius: 8px; cursor: pointer; transition: background-color 0.3s; }
#start-btn:hover { background-color: var(--accent-hover); }

/* --- Interaction Section --- */
#interaction-section { animation: fadeIn 0.5s ease-in-out forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

#back-to-setup-btn { position: absolute; top: 2.5rem; left: 2.5rem; background: var(--primary-bg); border: 1px solid var(--border-color); color: var(--primary-text); border-radius: 50%; width: 40px; height: 40px; font-size: 1.1rem; cursor: pointer; display: flex; justify-content: center; align-items: center; transition: all 0.3s; z-index: 10; }
#back-to-setup-btn:hover { background-color: var(--accent-color); color: white; transform: scale(1.1); }

/* Character Display centered */
#game-char-display { display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 2rem; }
#game-char-display h3 { text-align: center; color: var(--secondary-text); font-weight: 400; font-size: 1.1rem; }
#game-char-image { max-width: 450px; max-height: 50vh; width: auto; height: auto; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 10px var(--shadow-color); border: 2px solid var(--border-color); }

/* Response container takes full width */
#response-container { display: flex; flex-direction: column; gap: 1.5rem; }
#response-box, #options-container { opacity: 1; transition: opacity 0.4s ease-in-out; }
#response-box.loading, #options-container.loading { opacity: 0.3; }
#response-box { background-color: var(--primary-bg); padding: 1.5rem; border-radius: 8px; min-height: 150px; white-space: pre-wrap; line-height: 1.7; display: flex; align-items: center; justify-content: center; }

#retry-btn { padding: 0.75rem 1.5rem; background-color: var(--error-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background-color 0.3s; margin: 0 auto; width: fit-content; }
#retry-btn:hover { background-color: color-mix(in srgb, var(--error-color) 80%, black); }

#options-container { display: grid; grid-template-columns: 1fr; gap: 0.75rem; }
.option-btn { width: 100%; padding: 1rem; text-align: left; background-color: var(--secondary-bg); border: 1px solid var(--border-color); border-radius: 6px; cursor: pointer; color: var(--primary-text); font-size: 1rem; transition: all 0.2s; }
.option-btn:hover { border-color: var(--accent-color); background-color: color-mix(in srgb, var(--accent-color) 8%, var(--secondary-bg)); }

#custom-input-container { display: flex; gap: 0.5rem; }
#custom-option-input { flex-grow: 1; }
#submit-custom-option { padding: 0.75rem 1.5rem; background-color: var(--accent-color); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; transition: background-color 0.3s; }
#submit-custom-option:hover { background-color: var(--accent-hover); }

/* --- Loading Spinner Style --- */
.spinner { font-size: 2rem; color: var(--accent-color); animation: fa-spin 1.5s infinite linear; }
@keyframes fa-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* --- Responsive Styles for Mobile & Tablets --- */
@media screen and (max-width: 850px) {
    body {
        /* Reduce body padding and align content to the top */
        padding: 1rem;
        align-items: stretch;
        justify-content: flex-start;
        flex-direction: column;
    }

    .container {
        /* Reduce padding and remove top margin for a tighter fit */
        padding: 1.5rem;
        margin-top: 1rem;
    }

    /* --- Reposition Corner Controls --- */
    .top-left-controls, .top-right-controls {
        /* Change from 'fixed' to 'static' to place them in the document flow */
        position: static; 
        /* Arrange items in a row and allow wrapping */
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        width: 100%;
    }

    .top-left-controls {
        /* Center the left controls and add space below */
        justify-content: center;
        margin-bottom: 1rem;
    }

    .top-right-controls {
        /* Center the right controls */
        justify-content: center;
    }

    #color-palette-popup {
        /* Reposition popup to open downwards and to the right */
        top: calc(100% + 10px);
        right: 0;
        left: auto;
        transform: translateY(0);
    }
    
    /* --- Adjust Typography and Spacing --- */
    header h1 {
        font-size: 2.2rem;
        letter-spacing: 1px;
    }

    header {
        margin-bottom: 2rem;
    }

    /* --- Adjust Form Elements --- */
    #image-uploader {
        height: 300px; /* Reduce height for smaller screens */
        margin-top: 1.5rem;
        margin-bottom: 2rem;
    }

    .character-inputs, .api-settings {
        gap: 1rem; /* Reduce gap between inputs */
    }

    /* --- Adjust Interaction Section Elements --- */
    #back-to-setup-btn {
        /* Reposition button to match new container padding */
        top: 1.5rem;
        left: 1.5rem;
    }

    #game-char-image {
        max-height: 40vh; /* Ensure image doesn't take up too much vertical space */
    }
}

@media screen and (max-width: 480px) {
    .container {
        padding: 1rem; /* Further reduce padding on very small screens */
    }
    #back-to-setup-btn {
        top: 1rem;
        left: 1rem;
        width: 35px;
        height: 35px;
        font-size: 1rem;
    }
    header h1 {
        font-size: 1.8rem;
    }
    #custom-input-container {
        flex-direction: column; /* Stack custom input and button vertically */
    }
    #submit-custom-option {
        width: 100%;
    }
}
