console.log("Netflix Module Loaded")

async function updateNFButton() {
    const enabled = await isExtensionEnabled();

    if (enabled) {
        nfbutton.style.display = "block";
    } else {
        nfbutton.style.display = "none";
    }
}
updateNFButton();
const nfbutton = document.createElement("button")
nfbutton.className = "nf-button"
nfbutton.innerText = "▶"
nfbutton.style.background = "red"
document.body.appendChild(nfbutton)

const nfpopup = document.createElement("div")
nfpopup.className = "nf-popup"

document.body.appendChild(nfpopup)
nfpopup.style.display = "none"

nfbutton.addEventListener("click", () => {
    if(nfpopup.style.display === "none"){
        nfpopup.style.display = "block"
    }
    else{
        nfpopup.style.display = "none"
    }
})
let nflastRenderedSubtitle;

setInterval(() => {

    let nfsubtitlecontainer = document.querySelector(".player-timedtext")
    if(!nfsubtitlecontainer) return;
    let nfcurrentsubtitle = nfsubtitlecontainer.innerText.trim()
    if(nflastRenderedSubtitle !== nfcurrentsubtitle){
        nflastRenderedSubtitle = nfcurrentsubtitle
    displaySentence(nfcurrentsubtitle)
    }
},1000)

function displaySentence(subtitles){

    let words = subtitles.split(" ")
    if (!subtitles){
        nfpopup.innerHTML = `<span class = nf-subtitle> No Subtitles Yet! </span>`
    }
    else{
        nfpopup.innerHTML = `<div class = nf-subtitle> ${
            words.map( word =>
                `<span class = nf-word> ${word} </span>`
            ).join(" ")
            
        }</div>`
    }

}

nfpopup.addEventListener("click", (event) => {
    if (!event.target.classList.contains("nf-word"))
        return;
    console.log("clicked")
    showLoader(event.target)
    
    const word = event.target.innerText.trim()
    console.log("word clicked : ", word)
    const sentence = document.querySelector(".nf-subtitle").innerText.trim()
    const isPhrase = word.trim().split(/\s+/).length > 1

    chrome.runtime.sendMessage({
        word : word,
        context : sentence,
        isPhrase : isPhrase
    },
    (response) => {
    console.log("Netflix Response:", response)

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
