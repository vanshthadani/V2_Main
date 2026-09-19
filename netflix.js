
const nfbutton = document.createElement("button");
nfbutton.className = "nf-button";
nfbutton.innerText = "▶";
nfbutton.style.background = "red";
document.body.appendChild(nfbutton);

const nfpopup = document.createElement("div");
nfpopup.className = "nf-popup";
nfpopup.style.display = "none";
document.body.appendChild(nfpopup);

let videoWasPlaying = false;
let nfLastRenderedSubtitle;

function getVideoElement() {
    return document.querySelector("video");
}

function pauseVideoForHighlight() {
    const video = getVideoElement();
    if (video && !video.paused) {
        video.pause();
        videoWasPlaying = true;
    }
}

function resumeVideoIfNeeded() {
    const video = getVideoElement();
    if (video && videoWasPlaying) {
        video.play();
        videoWasPlaying = false;
    }
}

async function updateNFButton() {
    const enabled = await isExtensionEnabled();
    nfbutton.style.display = enabled ? "block" : "none";
}
updateNFButton();

document.addEventListener("mousedown", (event) => {
    if (!event.target.closest("#tooltip") && !event.target.closest(".nf-popup")) {
        resumeVideoIfNeeded();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        resumeVideoIfNeeded();
    }
});

nfbutton.addEventListener("click", () => {
    if (nfpopup.style.display === "none") {
        nfpopup.style.display = "block";
        pauseVideoForHighlight();
    } else {
        nfpopup.style.display = "none";
        resumeVideoIfNeeded();
    }
});

setInterval(() => {
    const nfSubtitleContainer = document.querySelector(".player-timedtext");
    if (!nfSubtitleContainer) return;

    const nfCurrentSubtitle = nfSubtitleContainer.innerText.trim();
    if (nfLastRenderedSubtitle !== nfCurrentSubtitle) {
        nfLastRenderedSubtitle = nfCurrentSubtitle;
        displaySentence(nfCurrentSubtitle);
    }
}, 1000);

function displaySentence(subtitles) {
    if (!subtitles) {
        nfpopup.innerHTML = `<span class="nf-subtitle">No Subtitles Yet!</span>`;
        return;
    }

    const words = subtitles.split(" ");
    nfpopup.innerHTML = `<div class="nf-subtitle">${
        words.map(word => `<span class="nf-word">${word}</span>`).join(" ")
    }</div>`;
}

nfpopup.addEventListener("click", (event) => {
    if (!event.target.classList.contains("nf-word")) return;

    const word = event.target.innerText.trim();
    const sentence = document.querySelector(".nf-subtitle").innerText.trim();
    const isPhrase = word.split(/\s+/).length > 1;

    showLoader(event.target);

    chrome.runtime.sendMessage(
        {
            word: word,
            context: sentence,
            isPhrase: isPhrase
        },
        (response) => {
            hideLoader();

            if (!response.explanation.success) {
                showToolTip(
                    "AI explanation is currently unavailable.",
                    undefined,
                    undefined,
                    event.target
                );
                return;
            }

            showToolTip(
                word,
                response.data.success ? response.data.data : undefined,
                response.explanation.data,
                event.target
            );
        }
    );
});