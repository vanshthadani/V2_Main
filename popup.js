const wordInput = document.getElementById("wordinput");
const searchButton = document.getElementById("searchButton");
const result = document.getElementById("result");
const settingsPage = document.getElementById("settings-page");
const savedWordsPage = document.getElementById("saved-words-page");
const savedWordsButton = document.getElementById("saved-words");
const searchPage = document.getElementById("search-page");
const settingsButton = document.getElementById("settings");
const languageSelect = document.getElementById("languageSelect");
const masterSwitch = document.getElementById("master-switch");
const darkModeToggle = document.getElementById("darkModeToggle");
const backSettings = document.getElementById("back-settings");
const backSaved = document.getElementById("back-saved");
const savedList = document.getElementById("saved-words-list");
const deleteAll = document.getElementById("delete-all");

settingsPage.style.display = "none";
savedWordsPage.style.display = "none";

const NO_CONTEXT = "No Context Here, User Manually Searched for the word/phrase";

function showPage(page) {
    searchPage.style.display = "none";
    settingsPage.style.display = "none";
    savedWordsPage.style.display = "none";
    page.style.display = "block";
}


languageSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({
        explanationLanguage: languageSelect.value
    });
});

const lengthSelect = document.getElementById("lengthSelect");

lengthSelect.addEventListener("change", async () => {
    await chrome.storage.local.set({
        explanationLength: lengthSelect.value
    });
});


masterSwitch.addEventListener("change", async () => {
    await chrome.storage.local.set({
        master: masterSwitch.checked
    });
});

async function loadMasterSwitch() {
    const settings = await chrome.storage.local.get({ master: true });
    masterSwitch.checked = settings.master;
}

// ---- Settings: dark mode ----
darkModeToggle.addEventListener("change", async () => {
    const isDark = darkModeToggle.checked;
    document.body.classList.toggle("dark-mode", isDark);
    await chrome.storage.local.set({ darkMode: isDark });
});

async function loadSettings() {
    const settings = await chrome.storage.local.get(["darkMode", "explanationLanguage", "explanationLength"]);

    const isDark = settings.darkMode ?? false;
    darkModeToggle.checked = isDark;
    document.body.classList.toggle("dark-mode", isDark);

    languageSelect.value = settings.explanationLanguage ?? "en";
    lengthSelect.value = settings.explanationLength ?? "medium";
}

loadMasterSwitch();
loadSettings();

// ---- Search ----
wordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
});

searchButton.addEventListener("click", () => {
    const searchWord = wordInput.value.trim();

    if (!searchWord) {
        result.innerText = "Please Enter a Word / Phrase";
        return;
    }

    result.innerText = "Searching.....";

    chrome.runtime.sendMessage(
        {
            type: "Popup_search",
            word: searchWord,
            context: NO_CONTEXT,
            isPhrase: false
        },
        async (response) => {
            const data = response.data;
            const ai = response.explanation.data;

            result.innerHTML = await renderResult(searchWord, data, ai);

            const saveButton = document.getElementById("save-word");
            saveButton.addEventListener("click", async () => {
                const saved = await saveWord(searchWord, data, ai);
                if (saved === "saved") {
                    saveButton.innerText = "Saved";
                } else if (saved === "exists") {
                    saveButton.innerText = "Already Saved";
                }
            });
        }
    );
});

// ---- Navigation ----
settingsButton.addEventListener("click", () => showPage(settingsPage));
savedWordsButton.addEventListener("click", () => {
    showPage(savedWordsPage);
    getSavedWords();
});
backSettings.addEventListener("click", () => showPage(searchPage));
backSaved.addEventListener("click", () => showPage(settingsPage));

// ---- Saved words ----
async function getSavedWords() {
    const storage = await chrome.storage.local.get("savedWords");
    const savedWords = storage.savedWords || [];
    savedList.innerHTML = "";

    if (savedWords.length === 0) {
        savedList.innerHTML = `<p>No Saved Words Yet!</p>`;
        return;
    }

    for (const item of savedWords) {
        const card = document.createElement("div");
        card.innerHTML = `<h2>${item.word.toUpperCase()}</h2>
            <p>${item.explaination.simpleExplanation}</p>
            <p>Saved on: ${new Date(item.savedAt).toLocaleString()}</p>
            <button class="delete-word" data-word="${item.word}">Delete</button>`;

        savedList.appendChild(card);

        card.querySelector(".delete-word").addEventListener("click", () => {
            deleteWord(item.word);
        });
    }
}

async function deleteWord(word) {
    const storage = await chrome.storage.local.get("savedWords");
    let savedWords = storage.savedWords || [];

    savedWords = savedWords.filter(item => item.word !== word);

    await chrome.storage.local.set({ savedWords: savedWords });
    getSavedWords();
}

deleteAll.addEventListener("click", () => {
    const confirmation = confirm("Are you sure?");
    if (confirmation) {
        chrome.storage.local.set({ savedWords: [] });
        getSavedWords();
    }
});

// ---- Render result HTML ----
async function renderResult(word, dataset, explanation) {
    const storage = await chrome.storage.local.get("savedWords");
    const savedWords = storage.savedWords || [];
    const alreadySaved = savedWords.some(
        item => item.word.toLowerCase() === word.toLowerCase()
    );

    let html = "";
    html += `<div class="word">${word.toUpperCase()}</div><br>`;
    html += `<button id="save-word">${alreadySaved ? "Saved" : "Save"}</button>`;
    html += `<div class="ai-card">
        <div class="ai-title">Simple Explanation</div>
        <div class="ai-content">${explanation.simpleExplanation}</div>
    </div>`;
    html += `<div class="ai-card">
        <div class="ai-title"><span class="ai-icon">?</span>Why it's used here</div>
        <div class="ai-content">${explanation.contextExplanation}</div>
    </div>`;
    html += `<div class="ai-card">
        <div class="ai-title"><span class="ai-icon">!</span>Memory Tip</div>
        <div class="ai-content">${explanation.memoryTip}</div>
    </div>`;
    html += `<div class="ai-card">
        <div class="ai-title">Example</div>
        <div class="ai-content">${explanation.example}</div>
    </div>`;

   if (dataset && dataset.length > 0) {
    const grouped = {};

    for (const entry of dataset) {
        const pos = entry.partOfSpeech || "unknown";
        if (!grouped[pos]) {
            grouped[pos] = [];
        }
        grouped[pos].push(...entry.definitions);
    }

    for (const pos in grouped) {
        html += `<div class="partOfSpeech">PART OF SPEECH:<br>${pos.toUpperCase()}</div><br>`;

        grouped[pos].forEach((definition, i) => {
            html += `<div class="meaning">Definition ${i + 1}<br>${definition}</div><br>`;
        });
    }
}

    return html;
}

async function saveWord(word, dataset, explaination) {
    const storage = await chrome.storage.local.get("savedWords");
    let savedWords = storage.savedWords || [];

    const exists = savedWords.some(
        item => item.word.toLowerCase() === word.toLowerCase()
    );
    if (exists) {
        return "exists";
    }

    savedWords.push({
        word,
        dataset,
        explaination,
        savedAt: new Date().toISOString()
    });

    await chrome.storage.local.set({ savedWords: savedWords });
    return "saved";
}