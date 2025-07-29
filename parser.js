/**
 * A definitive, multi-stage parser to reliably extract and validate JSON
 * from a raw LLM output string. This version includes both structural
 * validation (is it valid JSON?) and application-specific content
 * validation (does the content meet minimum requirements?).
 */

export function parseAdvancedJSON(text, mode) {
    if (!text || typeof text !== 'string') {
        // FIXED: The error message was contradictory to the check.
        // It now correctly states the requirement.
        throw new Error("Invalid input: Text must be a non-empty string.");
    }

    // Step 1: Extract the JSON string and surrounding narrative.
    const { jsonStr, narrativeStr } = extractJsonAndNarrative(text);

    if (!jsonStr) {
        // If no JSON is found, we can't do content validation, so we return early.
        return createDefaultResult(narrativeStr);
    }

    // Step 2: Parse and repair the extracted JSON string.
    const parsedJson = salvageJson(jsonStr);

    // Step 3: Combine the parts into a potential final object.
    const finalResult = {
        mainText: parsedJson.mainText || narrativeStr || "[No mainText found]",
        options: parsedJson.options || {},
        coreState: parsedJson.coreState || {}
    };

    // Step 4: Perform application-specific content validation.
    // This will throw an error if the content is "too damaged".
    validateContent(finalResult, mode);

    // If validation passes, return the final object.
    return finalResult;
}


/**
 * NEW: Validates the content of the parsed object based on the game mode.
 * Throws an error if the validation fails.
 * @param {object} parsedObject - The successfully parsed object.
 * @param {string} mode - The current game mode ('classic' or 'realistic').
 */
function validateContent(parsedObject, mode) {
    const countWords = (str) => (!str || typeof str !== 'string') ? 0 : str.trim().split(/\s+/).length;

    if (mode === 'classic') {
        // In Classic mode, if option3 exists, it must be meaningful.
        const option3 = parsedObject.options?.option3;
        if (option3 && countWords(option3) < 3) {
            throw new Error("Parse Failed: Content is too damaged. Classic mode 'option3' is shorter than 3 words.");
        }
    } else if (mode === 'realistic') {
        // In Realistic mode, if reasoning exists, it must be meaningful.
        const reasoning = parsedObject.coreState?.reasoning;
        if (reasoning && countWords(reasoning) < 3) {
            throw new Error("Parse Failed: Content is too damaged. Realistic mode 'reasoning' is shorter than 3 words.");
        }
    }
}


/**
 * Extracts the most likely JSON block and surrounding narrative from raw text.
 * @param {string} text - The raw text from the LLM.
 * @returns {{jsonStr: string|null, narrativeStr: string}}
 */
function extractJsonAndNarrative(text) {
    // Priority 1: Check for a markdown ```json block.
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
        return {
            jsonStr: markdownMatch[1],
            narrativeStr: text.replace(markdownMatch[0], '').trim()
        };
    }

    // Priority 2: Find the first complete, balanced { ... } block.
    const startIndex = text.indexOf('{');
    if (startIndex === -1) {
        return { jsonStr: null, narrativeStr: text };
    }

    let braceCount = 1, inString = false, endIndex = -1;
    for (let i = startIndex + 1; i < text.length; i++) {
        const char = text[i];
        if (char === '"' && text[i - 1] !== '\\') inString = !inString;
        if (!inString) {
            if (char === '{') braceCount++;
            if (char === '}') braceCount--;
        }
        if (braceCount === 0) {
            endIndex = i;
            break;
        }
    }

    if (endIndex !== -1) {
        const jsonBlock = text.substring(startIndex, endIndex + 1);
        const narrativeBefore = text.substring(0, startIndex);
        const narrativeAfter = text.substring(endIndex + 1);
        return {
            jsonStr: jsonBlock,
            narrativeStr: (narrativeBefore + " " + narrativeAfter).trim()
        };
    } else {
        return {
            jsonStr: text.substring(startIndex),
            narrativeStr: text.substring(0, startIndex).trim()
        };
    }
}


/**
 * A robust function to parse a string that is supposed to be JSON, repairing common errors.
 * @param {string} str - The string to parse.
 * @returns {object} A parsed JavaScript object, or an empty object on failure.
 */
function salvageJson(str) {
    let repairedStr = str.trim();

    // Fix a dangling key at the end (e.g., ..., "coreState":)
    repairedStr = repairedStr.replace(/,\s*("[^"]*"\s*:\s*)$/, '');
    if (!repairedStr.endsWith('}')) {
       repairedStr = repairedStr.replace(/("[^"]*"\s*:\s*)$/, '');
    }

    const stack = [];
    let inString = false;
    for (let i = 0; i < repairedStr.length; i++) {
        const char = repairedStr[i];
        if (char === '"' && (i === 0 || repairedStr[i - 1] !== '\\')) inString = !inString;
        if (inString) continue;
        
        switch (char) {
            case '{': case '[': stack.push(char); break;
            case '}': if (stack.length > 0 && stack[stack.length - 1] === '{') stack.pop(); break;
            case ']': if (stack.length > 0 && stack[stack.length - 1] === '[') stack.pop(); break;
        }
    }

    if (inString) repairedStr += '"';
    while (stack.length > 0) {
        const openChar = stack.pop();
        repairedStr = repairedStr.trim();
        if (repairedStr.endsWith(',')) repairedStr = repairedStr.slice(0, -1);
        if (openChar === '{') repairedStr += '}';
        else if (openChar === '[') repairedStr += ']';
    }

    try {
        return JSON.parse(repairedStr);
    } catch (e) {
        console.error("Final salvage attempt failed. Returning empty object.", { original: str, repaired: repairedStr, error: e });
        return {};
    }
}


/**
 * Helper function to create a default result object for clarity.
 * @param {string} mainText - The text to display as the main content.
 * @returns {object} A structured object with default values.
 */
function createDefaultResult(mainText) {
    return {
        mainText: mainText,
        options: {},
        coreState: {}
    };
}
