/**
 * cardManager.js
 * A module to handle the creation and parsing of character cards.
 * Character data is embedded into the PNG file data itself.
 */

// A unique byte sequence to mark the beginning of our embedded JSON data.
const DATA_MARKER = new TextEncoder().encode("_SEXSIMCARD_");

/**
 * Converts a data URL (base64) string to a Uint8Array.
 * @param {string} dataUrl - The data URL to convert.
 * @returns {Uint8Array}
 */
function dataURLtoU8Array(dataUrl) {
    const base64 = dataUrl.split(',')[1];
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Converts an image to a PNG data URL using a canvas.
 * @param {string} imageUrl - The URL of the image to convert (can be any format browser supports).
 * @returns {Promise<string>} A promise that resolves with the PNG data URL.
 */
function convertImageToPNG(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (err) => reject(new Error("Failed to load image for conversion.", err));
        img.src = imageUrl;
    });
}

/**
 * Creates and saves a character card.
 * @param {{mimeType: string, data: string}} characterImage - The character's image object.
 * @param {object} characterData - The character's metadata (name, age, etc.).
 * @returns {Promise<Blob>} A promise that resolves with the final PNG Blob.
 */
export async function saveCharacterCard(characterImage, characterData) {
    const originalImageUrl = `data:${characterImage.mimeType};base64,${characterImage.data}`;
    let pngDataUrl;

    // Step 1: Ensure the image is in PNG format.
    if (characterImage.mimeType === 'image/png') {
        pngDataUrl = originalImageUrl;
    } else {
        pngDataUrl = await convertImageToPNG(originalImageUrl);
    }

    // Step 2: Get the raw bytes of the PNG image and the character data.
    const imageBytes = dataURLtoU8Array(pngDataUrl);
    const dataBytes = new TextEncoder().encode(JSON.stringify(characterData));

    // Step 3: Combine the image bytes, our marker, and the data bytes into one file.
    const finalFileBytes = new Uint8Array(imageBytes.length + DATA_MARKER.length + dataBytes.length);
    finalFileBytes.set(imageBytes, 0);
    finalFileBytes.set(DATA_MARKER, imageBytes.length);
    finalFileBytes.set(dataBytes, imageBytes.length + DATA_MARKER.length);

    // Step 4: Create a Blob from the combined bytes.
    return new Blob([finalFileBytes], { type: 'image/png' });
}

/**
 * Loads a character card and extracts the embedded data.
 * @param {File} file - The character card file selected by the user.
 * @returns {Promise<{characterData: object, image: {mimeType: string, data: string}}>}
 */
export function loadCharacterCard(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const buffer = new Uint8Array(e.target.result);

                // Search for our data marker from the end of the file.
                let markerIndex = -1;
                for (let i = buffer.length - 1; i >= DATA_MARKER.length; i--) {
                    let found = true;
                    for (let j = 0; j < DATA_MARKER.length; j++) {
                        if (buffer[i - DATA_MARKER.length + j] !== DATA_MARKER[j]) {
                            found = false;
                            break;
                        }
                    }
                    if (found) {
                        markerIndex = i - DATA_MARKER.length;
                        break;
                    }
                }

                if (markerIndex === -1) {
                    return reject(new Error("Not a valid character card: data marker not found."));
                }

                // Split the file back into image and data.
                const imageBytes = buffer.slice(0, markerIndex);
                const dataBytes = buffer.slice(markerIndex + DATA_MARKER.length);

                // Decode the data and parse it as JSON.
                const jsonDataString = new TextDecoder().decode(dataBytes);
                const characterData = JSON.parse(jsonDataString);

                // Convert the image bytes back to a data URL to display.
                const imageBlob = new Blob([imageBytes], { type: 'image/png' });
                const imageReader = new FileReader();
                imageReader.onload = (imgEvent) => {
                    const base64String = imgEvent.target.result.split(',')[1];
                    resolve({
                        characterData,
                        image: {
                            mimeType: 'image/png',
                            data: base64String
                        }
                    });
                };
                imageReader.readAsDataURL(imageBlob);

            } catch (error) {
                console.error("Failed to parse character card:", error);
                reject(new Error("Card file is corrupted or in an invalid format."));
            }
        };

        reader.onerror = () => reject(new Error("Failed to read the selected file."));
        reader.readAsArrayBuffer(file);
    });
}