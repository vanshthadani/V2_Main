export async function getMeaning(word) {
    try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                data: data
            };
        } else {
            return {
                success: false,
                status: response.status
            };
        }
    } catch (error) {
        console.log("Dictionary API Error:", error);
        return {
            success: false,
            error: error.message
        };
    }
}