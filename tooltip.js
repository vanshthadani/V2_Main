
const tooltip = document.createElement("div");
tooltip.id = "tooltip";
tooltip.style.display = "none";
tooltip.style.width = "320px";
tooltip.style.maxWidth = "90vw";
document.body.appendChild(tooltip);

const result = document.createElement("div");
result.className = "result";
tooltip.appendChild(result);

const loader = document.createElement("div");
loader.id = "vd-loader";
tooltip.appendChild(loader);

async function loadTooltipTheme() {
    const settings = await chrome.storage.local.get("darkMode");
    const isDark = settings.darkMode || false;
    tooltip.classList.toggle("dark-mode", isDark);
}

function showLoader(target) {
    loadTooltipTheme();
    tooltip.style.display = "block";
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "999999";

    loader.style.display = "block";
    result.innerHTML = "";

    positionToolTip(target);
}

function hideLoader() {
    loader.style.display = "none";
}

async function showToolTip(word, dataset, explanation, target) {
    await loadTooltipTheme();

    tooltip.style.display = "block";
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "999999";
    result.innerHTML = "";

    if (dataset === undefined && explanation === undefined) {
        result.textContent = word;
        if (target) {
            positionToolTip(target);
        }
        return;
    }

    const storage = await chrome.storage.local.get("savedWords");
    const savedWords = storage.savedWords || [];
    const alreadySaved = savedWords.some(
        item => item.word.toLowerCase() === word.toLowerCase()
    );

    let html = "";
    html += `<div class="word">${word.toUpperCase()}</div><br>`;
    html += `<button id="save-word">${alreadySaved ? "★ Saved" : "☆ Save"}</button>`;
    html += `<div class="ai-card">
        <div class="ai-title">Simple Explanation</div>
        <div class="ai-content">${explanation.simpleExplanation}</div>
    </div>`;
    html += `<div class="ai-card">
        <div class="ai-title">🧠 Why it's used here</div>
        <div class="ai-content">${explanation.contextExplanation}</div>
    </div>`;
    html += `<div class="ai-card">
        <div class="ai-title">💡 Memory Tip</div>
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

    result.innerHTML = html;
    positionToolTip(target);

    const saveButton = document.getElementById("save-word");
    saveButton.addEventListener("click", async () => {
        const saveResult = await saveWord(word, dataset, explanation);
        if (saveResult === "saved") {
            saveButton.innerHTML = "★ Saved";
        } else if (saveResult === "exists") {
            saveButton.innerHTML = "★ Already Saved";
        }
    });
}

async function saveWord(word, dataset, explanation) {
    const storage = await chrome.storage.local.get("savedWords");
    const savedWords = storage.savedWords || [];

    const exists = savedWords.some(
        item => item.word.toLowerCase() === word.toLowerCase()
    );
    if (exists) {
        return "exists";
    }

    savedWords.push({
        word,
        dataset,
        explanation,
        savedAt: new Date().toISOString()
    });

    await chrome.storage.local.set({ savedWords: savedWords });
    return "saved";
}

function positionToolTip(element) {
    if (!element) {
        tooltip.style.top = "100px";
        tooltip.style.left = "50%";
        tooltip.style.transform = "translateX(-50%)";
        return;
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const tooltipHeight = tooltip.offsetHeight;

    let top = rect.bottom + 10;
    let left = rect.left;

    if (top + tooltipHeight > window.innerHeight) {
        top = rect.top - tooltipHeight - 10;
    }
    if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - 10;
    }
    if (left < 10) left = 10;
    if (top < 10) top = 10;

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}