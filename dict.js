export async function getMeaning(word) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const url = `https://v2-backend-lg7i.onrender.com/define/${encodeURIComponent(word)}`;
        const response = await fetch(url, {
            headers: {
                "x-extension-secret": "32dc373254f91fd75ac89f857eb2eef3"
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        const result = await response.json();
        return result;

    } catch (error) {
        clearTimeout(timeout);
        console.error("Dictionary API Error:", error);
        return { success: false, error: error.message };
    }
}