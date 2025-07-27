/**
 * A sophisticated, multi-layered parser to reliably extract and validate JSON
 * from a raw LLM output string, even if it's malformed or incomplete.
 */

// --- Main Exported Function ---
export function parseAdvancedJSON(text) {
    if (!text || typeof text !== 'string') {
        throw new Error("Invalid input: Text must be a non-empty string.");
    }

    // Attempt 1: Find a clean JSON object within markdown ```json ... ```
    try {
        const fromMarkdown = parseFromMarkdown(text);
        if (fromMarkdown) return fromMarkdown;
    } catch (e) {
        console.warn("Parser(Markdown): Failed, but continuing.", e.message);
    }

    // Attempt 2: Find the first and largest valid JSON object in the text.
    // This is great for handling trailing garbage text.
    try {
        const fromBraceSearch = findLargestValidJSON(text);
        if (fromBraceSearch) return fromBraceSearch;
    } catch (e) {
        console.warn("Parser(BraceSearch): Failed, but continuing.", e.message);
    }

    // Attempt 3: Salvage a truncated/incomplete JSON object.
    // This is the most powerful step, attempting to repair the JSON.
    try {
        const fromSalvage = salvageIncompleteJSON(text);
        if (fromSalvage) return fromSalvage;
    } catch (e) {
        console.warn("Parser(Salvage): Failed, but continuing.", e.message);
    }

    // If all JSON parsing fails, throw an error.
    // The old heuristic fallback is removed as it's not suitable for this complex JSON structure.
    throw new Error("Failed to parse JSON from the response after all attempts. The data is too malformed.");
}


// --- Parsing Strategies ---

/**
 * ATTEMPT 1: Extracts JSON from a ```json ... ``` markdown block.
 */
function parseFromMarkdown(text) {
    const match = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
        try {
            return JSON.parse(match[1]);
        } catch (e) {
            // If parsing fails, it might be an incomplete block,
            // so we let the other functions try to salvage it.
            console.warn("Parser(Markdown): Found a JSON block, but it was invalid. Trying other methods.");
            throw e; // Re-throw to be caught by the main function's try/catch
        }
    }
    return null;
}

/**
 * ATTEMPT 2: Finds the largest, most complete, parsable JSON object in the string.
 * It does this by tracking brace counts, ignoring braces inside strings.
 */
function findLargestValidJSON(text) {
    let bestCandidate = null;
    let startIndex = text.indexOf('{');

    while (startIndex !== -1) {
        let braceCount = 1;
        let inString = false;

        for (let i = startIndex + 1; i < text.length; i++) {
            const char = text[i];
            const prevChar = text[i - 1];

            if (char === '"' && prevChar !== '\\') {
                inString = !inString;
            }

            if (!inString) {
                if (char === '{') braceCount++;
                else if (char === '}') braceCount--;
            }

            if (braceCount === 0) {
                const candidateStr = text.substring(startIndex, i + 1);
                try {
                    const parsed = JSON.parse(candidateStr);
                    // If we found a valid JSON, store it and keep looking for a bigger one
                    // (though usually the first complete one is what we want).
                    bestCandidate = parsed;
                    // For our use case, the first complete object is sufficient.
                    return bestCandidate;
                } catch (e) {
                    // It looked complete but wasn't. Continue searching.
                }
            }
        }
        // Find the next potential start, in case the first one was a false positive
        startIndex = text.indexOf('{', startIndex + 1);
    }
    return bestCandidate;
}

/**
 * ATTEMPT 3: Attempts to repair a truncated JSON string by closing open structures.
 */
function salvageIncompleteJSON(text) {
    let startIndex = text.indexOf('{');
    if (startIndex === -1) return null;

    let jsonStr = text.substring(startIndex);

    // Clean up common trailing garbage that breaks parsing
    jsonStr = jsonStr.replace(/,\s*$/, ''); // Remove trailing comma

    const stack = [];
    let inString = false;

    for (let i = 0; i < jsonStr.length; i++) {
        const char = jsonStr[i];

        if (char === '"' && (i === 0 || jsonStr[i - 1] !== '\\')) {
            inString = !inString;
            continue;
        }

        if (inString) continue;

        switch (char) {
            case '{':
            case '[':
                stack.push(char);
                break;
            case '}':
                if (stack.length > 0 && stack[stack.length - 1] === '{') {
                    stack.pop();
                }
                break;
            case ']':
                if (stack.length > 0 && stack[stack.length - 1] === '[') {
                    stack.pop();
                }
                break;
        }
    }

    // Close any remaining open structures
    while (stack.length > 0) {
        const openChar = stack.pop();
        if (openChar === '{') jsonStr += '}';
        else if (openChar === '[') jsonStr += ']';
    }

    // Final check: If it still ends with an unclosed string, add a quote.
    if ((jsonStr.match(/"/g) || []).length % 2 !== 0) {
        jsonStr += '"';
    }
    // If the last non-whitespace char is a comma inside an object, close the object.
    if (jsonStr.trim().endsWith(',')) {
        jsonStr = jsonStr.trim().slice(0, -1) + '}';
    }


    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Parser(Salvage): Final attempt to repair and parse failed.", e);
        return null; // Salvage failed
    }
}