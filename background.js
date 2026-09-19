import { getMeaning } from "./dict.js";

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

    (async () => {
        const word = message.word;
        const sentence = message.context;
        const isPhrase = message.isPhrase;

        try {
            const langSetting = await chrome.storage.local.get("explanationLanguage");
            const language = langSetting.explanationLanguage || "en";

            console.time("dict-api")

            const data = await getMeaning(word);

            console.timeEnd("dict-api")


            console.time("backend-call")
            const explanationResponse = await fetch(
                "https://v2-backend-lg7i.onrender.com/explain",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-extension-secret": "32dc373254f91fd75ac89f857eb2eef3"
                    },
                    body: JSON.stringify({
                        word: word,
                        context: sentence,
                        isPhrase: isPhrase,
                        language: language
                    })
                }
            );
            console.timeEnd("backend-call")

            const explanation = await explanationResponse.json();

            if (!explanation.success) {
                sendResponse({ data: data, explanation: explanation });
                return;
            }

            const raw = explanation.data.choices[0].message.content;
            const clean = raw.replace(/```json/g, "").replace(/```/g, "").trim();
            const ai = JSON.parse(clean);

            sendResponse({
                data: data,
                explanation: { success: true, data: ai }
            });

        } catch (error) {
            console.error("background.js error:", error);
            sendResponse({
                data: { success: false },
                explanation: { success: false, error: "AI explanation failed" }
            });
        }
    })();

    return true;
});