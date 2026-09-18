import { getMeaning } from "./dict.js"

console.log("BG Service Worker Loaded!")

chrome.runtime.onMessage.addListener(async function (message,sender, sendResponse) {
    const word = message.word;
    const sentence = message.context;
    const isPhrase = message.isPhrase;
    const langSetting = await chrome.storage.local.get("explanationLanguage");
    const language = langSetting.explanationLanguage || "en";
    console.log("Word Recieved :", word)
    console.log ("Phrase", isPhrase)

        const data = await getMeaning(word);
        console.log(" Sending request to Render...");
        console.log("Language being sent:", language);
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
            language : language
        })
    }
);

console.log("✅ Response received:", explanationResponse.status);

const explanation = await explanationResponse.json();
        if ( !explanation.success) {
                sendResponse({
                    data: data,
                    explanation: explanation
                });

                return;
            }
        console.log(explanation);
    
        const raw = explanation.data.choices[0].message.content;
        const clean = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
        const ai = JSON.parse(clean)
        if (message.type === "Popup_search") {

                sendResponse({
                    data: data,
                    explanation: {
                        success: true,
                        data: ai
                    }
                });

                return;
            }
else{

   sendResponse({
    data: data,
    explanation: {
        success: true,
        data: ai
    }
});

}
        return true
})