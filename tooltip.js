console.log("Tooltip Loaded")
const tooltip = document.createElement("div")
tooltip.id = "tooltip"
document.body.appendChild(tooltip)
tooltip.style.display = "none";
tooltip.style.width = "320px";      
tooltip.style.maxWidth = "90vw";    

const result = document.createElement("div")
result.className = "result"
tooltip.appendChild(result)

const loader = document.createElement("div")
loader.id = "vd-loader"
tooltip.appendChild(loader)

function showLoader(target) {
    loadTooltipTheme()
    tooltip.style.display = "block";
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "999999";

    loader.style.display = "block";
    result.innerHTML = "";

    positionToolTip(target);
}
function hideLoader(word){
    loader.style.display = "none"
    console.log("loader hidden")
}

async function loadTooltipTheme() {
    const settings = await chrome.storage.local.get("darkMode");
    const isDark = settings.darkMode || false;

    tooltip.classList.toggle("dark-mode", isDark);
}

async function showToolTip(word, dataset, explaination,target){
    await loadTooltipTheme()
    
    tooltip.style.display = "block";
    tooltip.style.position = "fixed";
    tooltip.style.zIndex = "999999";
    result.innerHTML = "";
    if (dataset === undefined && explaination === undefined) {
        const errorMessage = word;
        result.textContent = errorMessage;
        if (target) {
            positionToolTip(target);
        }
        return;
    }
    const ai = explaination
    const words = word
    
    const storage = await chrome.storage.local.get("savedWords")
    const savedWords = storage.savedWords || []
    const alreadySaved = savedWords.some(
        item => item.word.toLowerCase() === words.toLowerCase()
    )
    console.log("Tooltip received word:", words);
    const data = dataset
    console.log("Word:", words);
    console.log("Explanation:", ai);
    
    
    let html = ""
    html += `<div class = word>${words.toUpperCase()}</div><br>`
    html += `<button id="save-word">
    ${alreadySaved ? "★ Saved" : "☆ Save"}
    </button>`
    html += `<div class = ai-card>
    <div class = ai-title> Simple Explaination </div>
    <div class = ai-content>${ai.simpleExplanation}</div>
    </div>`
    html += `<div class = ai-card>
    <div class = ai-title> 🧠 Why it's used here</div>
    <div class = ai-content>${ai.contextExplanation} </div>
    </div>`
    html += `<div class = ai-card>
    <div class = ai-title> 💡 Memory Tip </div>
    <div class = ai-content>${ai.memoryTip} </div>
    </div>`
    html += `<div class = ai-card>
    <div class = ai-title> Example </div>
    <div class = ai-content>${ai.example} </div>
    </div>`
    if (data && data.length > 0){
        let meanings = data[0].meanings
        for (const meaning of meanings){
            let i = 1
            html += `<div class = partOfSpeech>PART OF SPEECH  : <br>${(meaning.partOfSpeech).toUpperCase()}</div><br>`
            
            for(const definition of meaning.definitions){
                
                html += `<div class = meaning> Definition ${i} <br>
                ${definition.definition}</div><br>`
                if (!definition.example){
                    html += `<div class = example> Example : <br> No Example Available</div><br>`
                }
                else{
                    html += `<div class = example> Example ${i}<br> ${definition.example}</div><br>`
                }
                i++;
            }
            html+= `<div class = antonyms> Antonyms : <br> </div>`
            if(meaning.antonyms?.length > 0){
                for(const antonym of meaning["antonyms"]){
                    html+= `<div class = antonyms> * ${antonym}</div>`
                }
            }
            else{
                html+= `<div class = antonyms>No Antonyms Available </div>`
            }
        }
    }
    result.innerHTML = html;
    positionToolTip(target)
    const savebutton = document.getElementById("save-word")
savebutton.addEventListener("click", async ()=>{
    const result = await saveWord(words,data,ai)
    if(result === "saved"){
        savebutton.innerHTML = "★ Saved"
    }
    else if(result === "exists"){
        savebutton.innerHTML = "★ Already Saved"
    }
})

}
async function saveWord(word, dataset, explaination){

    const storage = await chrome.storage.local.get("savedWords")
    let savedWords = storage.savedWords || []

    const savedObject = {
        word,
        dataset,
        explaination,
        savedAt: new Date().toISOString()

    }
    const exists = savedWords.some(
    item => item.word.toLowerCase() === word.toLowerCase()
    )

    if(exists){
        console.log("Already saved")
        return "exists"
    }
    savedWords.push(savedObject)
    await chrome.storage.local.set({
        savedWords : savedWords
    })
    console.log("saved")
    return "saved"
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
    if (left < 10) {
        left = 10;
    }

    if (top < 10) {
        top = 10;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
}
