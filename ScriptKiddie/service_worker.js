const id_jira_copyAttachmentLink = "925AA4E5-82FE-49D5-AEDE-0F1E378757C8"

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: id_jira_copyAttachmentLink,
        title: "Jira: Copy attachment link",
        contexts: ["image"],
        documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"]
    })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === id_jira_copyAttachmentLink) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            args: [info],

            /**
             * @param info {chrome.contextMenus.OnClickData}
             */
            func: function(info) {
                console.log("=== info", info)
                try {
                    const elImg = document.querySelector("img[src='" + info.srcUrl + "']")
                    if (!elImg)
                        throw Error("Image element not found by srcUrl")

                    const mediaName = elImg.parentElement.getAttribute("data-test-media-name")
                    if (!mediaName)
                        throw Error("Can't extract media name from image parent")
                    
                    let url = ""
                    
                    for (const el of document.querySelectorAll("div[data-test-media-name='" + mediaName + "']")) {
                        const p = el.parentElement?.parentElement
                        if (p) {
                            const d = p.getAttribute("data-testid")
                            if (d) {
                                const m = d.match(/\.attachment-id\.(\d+)$/)
                                if (m) {
                                    const attachmentId = m[1]
                                    url = "https://bydeluxe.atlassian.net/secure/attachment/" + attachmentId + "/" + mediaName
                                    break
                                }
                            }
                        }
                    }
                    
                    if (!url)
                        throw Error("Can't guess attachment ID")

                    navigator.clipboard.writeText(url)

                    const elToast = document.createElement("div")
                    elToast.setAttribute("style", "position: fixed; left: 10px; top: 10px; right: 10px; font-family: sans-serif; " +
                        "font-size: 24px; z-index: 2147483647; background: #0d0; border: 3px solid black; padding: 5px; font-weight: bold;")
                    elToast.innerText = "Copied URL to clipboard"
                    document.body.append(elToast)
                    window.setTimeout(() => elToast.remove(), 1500)
                }
                catch (e) {
                    console.error(e)
                    alert("[ERROR] " + e.message)
                }
            }
        })
    }
})


