# Sex Sim AI

Sex Sim AI is an immersive, web-based erotic roleplaying simulator powered by Google's Gemini API. It allows users to create a character by uploading an image and defining their personality, then engage in an interactive, AI-driven sexual roleplay. The application is designed to be highly customizable, featuring multi-language support, theme switching, and color personalization.

The application now features two distinct gameplay modes: **Classic Mode** for a pure, unrestrained sandbox experience, and the new **Realistic Mode**, where characters have freewill, a persistent state and memory, and react dynamically to your choices, creating a much deeper, more consequential narrative.

<img src="https://i.imgur.com/0iT32M5.png">

## [🌐 Live Demo](https://sex-sim-ai.onrender.com/)

[**[🚀 Try the Live Demo Now!]**](https://sex-sim-ai.onrender.com/)

Experience the full functionality of Sex Sim AI directly in your browser—no installation required. The application is hosted live for easy access.

## ✨ Features

- **Dual Gameplay Modes**:
    - **Classic Mode**: A pure erotic sandbox—unrestrained, creative, and focused on fulfilling your fantasies without limits.
    - **Realistic Mode**: A dynamic roleplay where the character has their own freewill. Your choices truly matter and can build relationships or face resistance based on their internal state.
- **AI-Powered Narrative**: Utilizes the Google Gemini API to generate dynamic, immersive, and erotic storylines in both modes.
- **Advanced Realistic Options**: In Realistic Mode, you can choose to display the character's internal state meters (Rapport, Control, etc.) and the AI's reasoning for why their feelings changed.
- **Visual Character Creation**: Upload a character image via drag & drop or pasting from the clipboard.
- **Deep Customization**: Define the character's name, age, gender, personality, and an optional starting scenario.
- **Interactive Gameplay**: The AI provides a descriptive narrative and three distinct action choices. Users can also type their own custom actions.
- **Multi-Language Support**: Fully internationalized UI and AI prompts for English (EN), Chinese (中文), and Japanese (日本語).
- **Theming & Personalization**: Instantly switch between Light/Dark modes and choose from 12 accent colors.
- **Randomizers**: Dice buttons to randomly select a personality or scenario from an extensive, pre-defined list.
- **Robust Error Handling**: If an API call fails, the app allows you to retry your last action without losing your place in the story.
- **Responsive Design**: A clean, modern interface that works seamlessly on both desktop and mobile devices.
- **State Persistence**: Your chosen theme, language, and accent color are saved in your browser's `localStorage`.

## 🕹️ Gameplay Modes in Detail

### Classic Mode
This is the original Sex Sim AI experience. It's designed as a straightforward, creative sandbox where the AI's primary goal is to facilitate the user's fantasy. The narrative is always moving forward based on your choices, with a focus on vivid, erotic descriptions and escalating scenarios.

### Realistic Mode: The C.O.R.E. System
The new Realistic Mode introduces the **C.O.R.E. (Contextual Observable Reaction Engine)**, a sophisticated system that gives the character a persistent internal state and freewill.

-   **Consequences Matter**: Actions have lasting effects. Building trust and desire requires careful choices, while aggressive or misaligned actions can lead to resistance, fear, or a complete shift in the narrative.
-   **A.R.C. Meters**: The AI internally tracks the character's state using three key metrics:
    -   **Alignment**: How well your actions fit the established context and "rules" of the scene.
    -   **Rapport**: The character's personal feelings toward you (lust, fear, affection, hatred).
    -   **Control**: A fluid measure of who has the upper hand in the situation.
-   **Dynamic Reactions**: The character's responses—their dialogue, body language, and actions—are directly influenced by these meters. You must *show*, not just tell, them what you want, and they will react accordingly.
-   **Optional Insights**: You can enable "Show State Meters" to see the character's A.R.C. values after each turn, and "Show Reasoning" to get a clinical breakdown from the AI on *why* those values changed based on your last action.

## 🚀 How It Works

The application is built with vanilla HTML, CSS, and modern JavaScript (ES6 Modules).

1.  **Setup**: The user enters their Gemini API Key and fills out the character's details (name, age, personality, etc.) and uploads an image.
2.  **Initialization**: When the "Begin" button is clicked, the `script.js` file gathers all the user input.
3.  **System Prompt**: A detailed system prompt from `config.js` is combined with the character data. This prompt instructs the Gemini model on how to behave, what tone to use, and how to structure its JSON response.
4.  **API Call**: The initial prompt and image are sent to the Google Gemini API.
5.  **UI Update**: The AI's JSON response is parsed. The main narrative text is displayed, and the three action choices are rendered as buttons.
6.  **Interaction Loop**: The user clicks an option or writes a custom action, which is then sent as the next message in the conversation history to the API, continuing the story.

## 🛠️ Setup and Usage

To run this project locally, you will need a Google Gemini API Key.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/sex-sim-ai.git
    cd sex-sim-ai
    ```

2.  **Run a Local Server**
    Because the project uses ES6 modules (`import`/`export`) and fetches `lang.json`, you must run it from a local web server. You cannot simply open `index.html` as a local file. A simple way to do this is with Python:

    ```bash
    # If you have Python 3
    python -m http.server

    # If you have Python 2
    python -m SimpleHTTPServer
    ```
    Or use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension for VS Code.

3.  **Open in Browser**
    Navigate to `http://localhost:8000` (or the port your server is running on).

4.  **Configure the App**
    - Get your **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
    - Paste the key into the "Gemini API Key" field in the app.
    - Fill in all the character details and upload an image.
    - Click "Begin" to start the simulation.

## 📁 File Structure

```
.
├── index.html     # The main HTML structure of the application.
├── style.css      # All CSS styling for both light and dark themes.
├── script.js      # Core application logic, event listeners, and API calls.
├── parser.js      # Advanced JSON parser to handle malformed API responses.
├── config.js      # Contains the detailed system prompts for the AI in all supported languages.
├── lang.json      # All UI text strings for internationalization (i18n).
└── README.md      # You are here.
```


## ⚖️ Disclaimer

This project is developed for entertainment purposes only, demonstrating the capabilities of modern language models.

- The content generated by the AI is fictional and does not represent real individuals or events.
- **Please refrain from using images of real individuals without their explicit consent.**
- The user is solely responsible for the content they generate using this application.
- The developer assumes no liability for the use or misuse of this software.
