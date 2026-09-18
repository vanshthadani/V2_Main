console.log("Youtube Module Loaded")
const ytenabled = isExtensionEnabled()

// --- add near the top, with your other state variables ---
let videoWasPlaying = false;

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

// --- resume triggers: mirrors content.js's tooltip-close conditions ---
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

async function updateYtButton() {
    const enabled = await isExtensionEnabled();

    if (enabled) {
        button.style.display = "block";
    } else {
        button.style.display = "none";
    }
}
updateYtButton()
const button = document.createElement("button")
button.className = "yt-button"
button.innerText = "▶"
button.style.background = "red"
document.body.appendChild(button)

const popup = document.createElement("div")
popup.className = "yt-popup"
document.body.appendChild(popup)
popup.style.display = "none"

button.addEventListener("click", () => {
    if(popup.style.display === "none"){
        popup.style.display = "block"
        pauseVideoForHighlight()
    }
    else{
        popup.style.display = "none"
        resumeVideoIfNeeded()
    }
})
let lastRenderedSubtitle;

setInterval(() => {

    let subtitlecontainer = document.querySelector(".ytp-caption-window-container")
    if(!subtitlecontainer) return;
    let currentsubtitle = subtitlecontainer.innerText.trim()
    if(lastRenderedSubtitle !== currentsubtitle){
        lastRenderedSubtitle = currentsubtitle
    displaySentence(currentsubtitle)
    }
},1000)

function displaySentence(subtitles){

    let words = subtitles.split(" ")
    if (!subtitles){
        popup.innerHTML = `<span class = yt-subtitle> No Subtitles Yet! </span>`
    }
    else{
        popup.innerHTML = `<div class = yt-subtitle> ${
            words.map( word =>
                `<span class = yt-word> ${word} </span>`
            ).join(" ")
            
        }</div>`
    }

}

popup.addEventListener("click", (event) => {
    if (!event.target.classList.contains("yt-word"))
        return;

    showLoader(event.target)
    const word = event.target.innerText.trim()
    console.log("word clicked : ", word)
    const sentence = document.querySelector(".yt-subtitle").innerText.trim()
    const isPhrase = false

    chrome.runtime.sendMessage({
        word : word,
        context : sentence,
        isPhrase : isPhrase
    },
    (response) => {
        console.log(response)
        hideLoader()
        showToolTip(
    word,
    response.data.success ? response.data.data : undefined,
    response.explanation.data,
    event.target
)
    }
)
})
