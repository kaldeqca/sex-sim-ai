/**
 * A definitive, multi-stage parser for CHINESE (CN) to reliably extract
 * and validate JSON from a raw LLM output string.
 * This version uses CHARACTER COUNT for content validation.
 */

export function parseAdvancedJSON(text, mode) {
    if (!text || typeof text !== 'string') {
        throw new Error("无效输入：文本必须是非空字符串。");
    }

    // Step 1: Extract the JSON string and surrounding narrative.
    const { jsonStr, narrativeStr } = extractJsonAndNarrative(text);

    if (!jsonStr) {
        return createDefaultResult(narrativeStr);
    }

    // Step 2: Parse and repair the extracted JSON string.
    const parsedJson = salvageJson(jsonStr);

    // Step 3: Combine the parts into a potential final object.
    const finalResult = {
        mainText: parsedJson.mainText || narrativeStr || "[未找到 mainText]",
        options: parsedJson.options || {},
        coreState: parsedJson.coreState || {}
    };

    // Step 4: Perform application-specific content validation.
    validateContent(finalResult, mode);

    return finalResult;
}

/**
 * Validates the content of the parsed object based on character length.
 * @param {object} parsedObject - The successfully parsed object.
 * @param {string} mode - The current game mode ('classic' or 'realistic').
 */
function validateContent(parsedObject, mode) {
    // For CJK languages, character count is a better metric than word count.
    const countChars = (str) => (!str || typeof str !== 'string') ? 0 : str.trim().length;

    if (mode === 'classic') {
        const option3 = parsedObject.options?.option3;
        if (option3 && countChars(option3) < 5) {
            throw new Error("解析失败：内容损坏。经典模式 'option3' 字符少于5个。");
        }
    } else if (mode === 'realistic') {
        const reasoning = parsedObject.coreState?.reasoning;
        if (reasoning && countChars(reasoning) < 5) {
            throw new Error("解析失败：内容损坏。现实模式 'reasoning' 字符少于5个。");
        }
    }
}


/**
 * Extracts the most likely JSON block and surrounding narrative from raw text.
 * @param {string} text - The raw text from the LLM.
 * @returns {{jsonStr: string|null, narrativeStr: string}}
 */
function extractJsonAndNarrative(text) {
    const markdownMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
        return {
            jsonStr: markdownMatch[1],
            narrativeStr: text.replace(markdownMatch[0], '').trim()
        };
    }
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