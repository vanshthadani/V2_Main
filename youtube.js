console.log("Youtube Module Loaded");

const button = document.createElement("button");
button.className = "yt-button";
button.innerText = "▶";
button.style.background = "red";
document.body.appendChild(button);

const popup = document.createElement("div");
popup.className = "yt-popup";
popup.style.display = "none";
document.body.appendChild(popup);

let videoWasPlaying = false;
let lastRenderedSubtitle;

function getVideoElement() {
    return document.querySelector("video.html5-main-video") || document.querySelector("video");
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

async function updateYtButton() {
    const enabled = await isExtensionEnabled();
    button.style.display = enabled ? "block" : "none";
}
updateYtButton();

document.addEventListener("mousedown", (event) => {
    if (!event.target.closest("#tooltip") && !event.target.closest(".yt-popup")) {
        resumeVideoIfNeeded();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        resumeVideoIfNeeded();
    }
});

button.addEventListener("click", () => {
    if (popup.style.display === "none") {
        popup.style.display = "block";
        pauseVideoForHighlight();
    } else {
        popup.style.display = "none";
        resumeVideoIfNeeded();
    }
});

setInterval(() => {
    const subtitleContainer = document.querySelector(".ytp-caption-window-container");
    if (!subtitleContainer) return;

    const currentSubtitle = subtitleContainer.innerText.trim();
    if (lastRenderedSubtitle !== currentSubtitle) {
        lastRenderedSubtitle = currentSubtitle;
        displaySentence(currentSubtitle);
    }
}, 1000);

function displaySentence(subtitles) {
    if (!subtitles) {
        popup.innerHTML = `<span class="yt-subtitle">No Subtitles Yet!</span>`;
        return;
    }

    const words = subtitles.split(" ");
    popup.innerHTML = `<div class="yt-subtitle">${
        words.map(word => `<span class="yt-word">${word}</span>`).join(" ")
    }</div>`;
}

popup.addEventListener("click", (event) => {
    if (!event.target.classList.contains("yt-word")) return;

    const word = event.target.innerText.trim();
    const sentence = document.querySelector(".yt-subtitle").innerText.trim();

    showLoader(event.target);

    chrome.runtime.sendMessage(
        {
            word: word,
            context: sentence,
            isPhrase: false
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