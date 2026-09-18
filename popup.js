const word = document.getElementById("wordinput")
const button = document.getElementById("searchButton")
const result = document.getElementById("result")
const settingspage = document.getElementById("settings-page")
const savedwordspage = document.getElementById("saved-words-page")
const savedwordsbutton = document.getElementById("saved-words")
const searchpage = document.getElementById("search-page")
settingspage.style.display = "none"
savedwordspage.style.display = "none"
const settingsbutton = document.getElementById("settings")

const languageSelect = document.getElementById("languageSelect");

languageSelect.addEventListener("change", async () => {

    const selectedLanguage = languageSelect.value;

    await chrome.storage.local.set({
        explanationLanguage: selectedLanguage
    });

    console.log("Explanation language saved:", selectedLanguage);
});


const context = "No Context Here, User Manually Searched for the word/phrase"

const masterswitch = document.getElementById("master-switch")
masterswitch.addEventListener("change", async() =>{

    const isMaster = masterswitch.checked;
    
    chrome.storage.local.set({
        master : isMaster

    })
    console.log("Saved master:", isMaster);

})

async function loadMasterSwitch() {
    const settings = await chrome.storage.local.get({
        master: true
    });

    masterswitch.checked = settings.master;
}

loadMasterSwitch();

// const isPhrase= word.trim().split(/\s+/).length > 1

word.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        button.click();
    }
});

button.addEventListener("click", () =>{
    const searchword = word.value.trim()
    if(!searchword){
        result.innerText = "Please Enter a Word / Phrase"
    }
    result.innerText = "Searching....."
    
    chrome.runtime.sendMessage({
        type : "Popup_search",
        word : searchword,
        context : context,
        isPhrase : false,
    },
    async (response)=>{
    console.log("Popup response:", response);

    const data = response.data;
    const ai = response.explanation.data;
     const html = await renderResult(
        searchword,
        data,
        ai)
    result.innerHTML = html;
    const saveButton = document.getElementById("save-word");

saveButton.addEventListener("click", async () => {

    console.log("save button clicked")

    const saved = await saveWord(
        searchword,
        data,
        ai
    );

    console.log ("saved result", saved)

    if (saved === "saved") {
    saveButton.innerText = "Saved";
}
else if (saved === "exists") {
    saveButton.innerText = "Already Saved";
}
});

    }
)

})

function showpage(page){
    searchpage.style.display = "none"
    settingspage.style.display = "none"
    savedwordspage.style.display = "none"
    page.style.display = "block"
}

settingsbutton.addEventListener("click", ()=>{
    showpage(settingspage)
})
savedwordsbutton.addEventListener("click", ()=>{
    showpage(savedwordspage)
    getSavedWords()
})

const back_settings = document.getElementById("back-settings")
const back_saved = document.getElementById("back-saved")

back_settings.addEventListener("click", ()=>{
    showpage(searchpage)
})

back_saved.addEventListener("click", () =>{
    showpage(settingspage)
})


const savedList = document.getElementById("saved-words-list")
async function getSavedWords(){
    const storage = await chrome.storage.local.get("savedWords")
    const savedWords = storage.savedWords || []
    savedList.innerHTML = ""

    if(savedWords.length == 0){
        savedList.innerHTML = `<p>No Saved Words Yet!</p>`
        return
    }

    for(const item of savedWords){
         const card = document.createElement("div")

         card.innerHTML = `<h2> ${item.word.toUpperCase()} <h2>
                          <p> ${item.explaination.simpleExplanation}</p>
                          <p>
                            Saved on:
                            ${new Date(item.savedAt).toLocaleString()}
                            </p>
                            <button 
                            class="delete-word"
                            data-word="${item.word}">
                            Delete
                            </button>`
        
                            savedList.appendChild(card)
                            const deleteButton = card.querySelector(".delete-word")
                        
                        deleteButton.addEventListener("click", () => {
                            deleteWord(item.word)
                        })
                        }
    }

async function deleteWord(word){

    const storage = await chrome.storage.local.get("savedWords")

    let savedWords = storage.savedWords || []


    savedWords = savedWords.filter(
        item => item.word !== word
    )


    await chrome.storage.local.set({
        savedWords: savedWords
    })


    getSavedWords()
}

const delete_all = document.getElementById("delete-all")
delete_all.addEventListener("click", () =>{
    console.log("delete all clicked")
    const confirmation  = confirm("Are you sure?")
    if(confirmation){
        console.log("User Agreed")
        chrome.storage.local.set({
            savedWords : []
        
        })
     getSavedWords()
    }
})

const darkModeToggle = document.getElementById("darkModeToggle");

console.log("Toggle element:", darkModeToggle);

darkModeToggle.addEventListener("change", async () => {

    const isDark = darkModeToggle.checked;

    document.body.classList.toggle("dark-mode", isDark);

    await chrome.storage.local.set({
        darkMode: isDark
    });

    console.log("Dark mode saved:", isDark);
});


async function loadSettings() {

    const settings = await chrome.storage.local.get(["darkMode", "explanationLanguage"]);

    console.log("Storage returned:", settings);

    const isDark = settings.darkMode ?? false;

    darkModeToggle.checked = isDark;

    document.body.classList.toggle("dark-mode", isDark);

    console.log("Dark mode loaded:", isDark);

    const savedLanguage = settings.explanationLanguage ?? "en";

    languageSelect.value = savedLanguage;

    console.log("Explanation language loaded:", savedLanguage);
}


loadSettings();

async function renderResult(word,dataset,explanation){

    const ai = explanation
    const words = word
    const data = dataset
    
    const storage = await chrome.storage.local.get("savedWords")
    const savedWords = storage.savedWords || []
    const alreadySaved = savedWords.some(
        item => item.word.toLowerCase() === words.toLowerCase()
    )
    console.log("Tooltip received word:", words);
    console.log("Word:", words);
    console.log("Explanation:", ai);
    
    
    let html = ""
    html += `<div class = word>${words.toUpperCase()}</div><br>`
    html += `<button id="save-word">
    ${alreadySaved ? "Saved" : "Save"}
    </button>`
    html += `<div class = ai-card>
    <div class = ai-title> Simple Explaination </div>
    <div class = ai-content>${ai.simpleExplanation}</div>
    </div>`
    html += `<div class = ai-card>
    <div class="ai-title">
    <span class="ai-icon">?</span>
    Why it's used here
    </div>
    <div class = ai-content>${ai.contextExplanation} </div>
    </div>`
    html += `<div class = ai-card>
    <div class="ai-title">
    <span class="ai-icon">!</span>
    Memory Tip
    </div>
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
    return html
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

