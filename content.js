console.log("Content Script Loaded!")
let word = ""
let sentence = ""

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
document.addEventListener("mouseup", async function (event) {
     console.log("moseup triggered")
     const enabled = await isExtensionEnabled()
     console.log("Extension enabled?", enabled);
     if(!enabled){
          console.log("extension turned off")
          return
     }
     console.log("extension turned on")
           if (event.target.closest("#tooltip")) {
               return;
           }
               const selection = document.getSelection()
               word = selection.toString().trim()
               if (!word){
                    return
               }
               const range = selection.getRangeAt(0);
               showLoader(range)
                    function getContext(node){
                         if(!node){
                              return ""
                         }
                         sentence = node.textContent;
                         return sentence
                    }
                    getContext(selection.anchorNode)
                    const isPhrase = word.trim().split(/\s+/).length > 1;
                    console.log("Word : ", word)


                    chrome.runtime.sendMessage({
                         word : word,
                         context : sentence,
                         isPhrase : word.trim().split(/\s+/).length > 1
                    },
                    
                    (response) => {
                              const status2 = response.explanation.success;

                              if (status2 === false) {
                                             hideLoader();
                                             showToolTip(
                                                  "AI explanation is currently unavailable.",
                                                  undefined,
                                                  undefined,
                                                  range
                                             );
                                             return;
                                             }
                         const recievedword = response.data.success
                         ? response.data.data
                         : undefined;

                         const recievedAi = response.explanation.data;
                         console.log("Word:", word);
                         console.log("Received Word:", recievedword);
                         console.log("Received AI:", recievedAi);
                         setTimeout(() => {
                              hideLoader();

                              showToolTip(
                                   word,
                                   recievedword,
                                   recievedAi,
                                   range
                              );
                              }, 1000);
                         selection.removeAllRanges();
                    })
               })
chrome.runtime.onMessage.addListener((message) => {

    if (message.type !== "SHOW_TOOLTIP")
        return;

    console.log("Popup Search Received");
    hideLoader()
    showToolTip(
        message.word,
        message.data,
        message.ai,
        null,
        true
    );

});


async function isExtensionEnabled() {

    const settings = await chrome.storage.local.get({
        master: true
    });
    console.log("Content script read:", settings);

    return settings.master;
}


chrome.storage.onChanged.addListener((changes, areaName) => {

    if (areaName !== "local")
        return;

    if (!changes.master)
        return;

    const enabled = changes.master.newValue;

    console.log("Master switch changed:", enabled);

    const ytButton = document.querySelector(".yt-button");
    const nfButton = document.querySelector(".nf-button");
    const ytPopup = document.querySelector(".yt-popup");
    const nfPopup = document.querySelector(".nf-popup");

    if (!enabled) {

     
        tooltip.style.display = "none";

        if (ytButton)
            ytButton.style.display = "none";

        if (nfButton)
            nfButton.style.display = "none";

        if (ytPopup)
            ytPopup.style.display = "none";

        if (nfPopup)
            nfPopup.style.display = "none";
    }

    else {

        
        if (ytButton)
            ytButton.style.display = "block";

        if (nfButton)
            nfButton.style.display = "block";
    }
});