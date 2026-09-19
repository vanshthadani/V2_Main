console.log("Content Script Loaded!");

let sentence = "";

document.addEventListener("mousedown", (event) => {
    if (!event.target.closest("#tooltip")) {
        tooltip.style.display = "none";
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        tooltip.style.display = "none";
    }
});

function getContext(node) {
    if (!node) {
        return "";
    }
    return node.textContent;
}

document.addEventListener("mouseup", async function (event) {

    const enabled = await isExtensionEnabled();
    if (!enabled) {
        return;
    }

    if (event.target.closest("#tooltip")) {
        return;
    }

    const selection = document.getSelection();
    const word = selection.toString().trim();
    if (!word) {
        return;
    }

    const range = selection.getRangeAt(0);
    showLoader(range);

    sentence = getContext(selection.anchorNode);
    const isPhrase = word.split(/\s+/).length > 1;

    chrome.runtime.sendMessage(
        {
            word: word,
            context: sentence,
            isPhrase: isPhrase
        },
        (response) => {

            if (response.explanation.success === false) {
                hideLoader();
                showToolTip(
                    "AI explanation is currently unavailable.",
                    undefined,
                    undefined,
                    range
                );
                return;
            }

            const receivedWord = response.data.success
                ? response.data.data
                : undefined;
            const receivedAi = response.explanation.data;

            setTimeout(() => {
                hideLoader();
                showToolTip(word, receivedWord, receivedAi, range);
            }, 1000);

            selection.removeAllRanges();
        }
    );
});

chrome.runtime.onMessage.addListener((message) => {

    if (message.type !== "SHOW_TOOLTIP") {
        return;
    }

    hideLoader();
    showToolTip(message.word, message.data, message.ai, null, true);
});

async function isExtensionEnabled() {
    const settings = await chrome.storage.local.get({ master: true });
    return settings.master;
}

chrome.storage.onChanged.addListener((changes, areaName) => {

    if (areaName !== "local" || !changes.master) {
        return;
    }

    const enabled = changes.master.newValue;

    const ytButton = document.querySelector(".yt-button");
    const nfButton = document.querySelector(".nf-button");
    const ytPopup = document.querySelector(".yt-popup");
    const nfPopup = document.querySelector(".nf-popup");

    if (!enabled) {
        tooltip.style.display = "none";
        if (ytButton) ytButton.style.display = "none";
        if (nfButton) nfButton.style.display = "none";
        if (ytPopup) ytPopup.style.display = "none";
        if (nfPopup) nfPopup.style.display = "none";
    } else {
        if (ytButton) ytButton.style.display = "block";
        if (nfButton) nfButton.style.display = "block";
    }
});