const id_jira_copyAttachmentLink = "925AA4E5-82FE-49D5-AEDE-0F1E378757C8"

chrome.runtime.onMessage.addListener(async _msg => {
    const msg = _msg as Msg
    if (msg.action === "reloadExtension") {
        const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
        if (!tab?.id) {
            console.log("[ERROR] No active tab ID")
            return
        }
        
        chrome.runtime.reload()
        await chrome.tabs.reload()
        
        // await chrome.tabs.sendMessage<Msg>(tab.id, {action: "contentScriptLog", data: "reloading extension"})
    }
})

chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: id_jira_copyAttachmentLink,
        title: "Jira: Copy attachment link",
        contexts: ["all"],
        documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"]
    })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (!tab?.id)
        return
    
    if (info.menuItemId === id_jira_copyAttachmentLink) {
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            args: [info],

            func: function(info: chrome.contextMenus.OnClickData) {
                ;(async () => {
                    console.log("=== info", info)
                    try {
                        const elImg = document.querySelector("img[src='" + info.srcUrl + "']")
                        if (!elImg)
                            throw Error("Image element not found by srcUrl")

                        const mediaName = elImg.parentElement?.getAttribute("data-test-media-name")
                        if (!mediaName)
                            throw Error("Can't extract media name from image parent")

                        const m = window.location.pathname.match(/\/browse\/(.*)$/)
                        if (!m)
                            throw Error("Unexpected Jira ticket page URL")

                        const ticketId = m[1]
                        const res = await fetch("https://bydeluxe.atlassian.net/rest/api/3/issue/" + ticketId)
                        if (!res.ok)
                            throw Error("Failed to get Jira ticket via API")
                        const json = await res.json()
                        
                        if (!Array.isArray(json.fields.attachment))
                            throw Error("No suitable `attachment` field in API response")

                        const att = json.fields.attachment.find((_: any) => _.filename === mediaName)
                        if (!att)
                            throw Error("Can't find attachment object for file " + mediaName)
                        
                        const attachmentId = att.id
                        const url = "https://bydeluxe.atlassian.net/secure/attachment/" + attachmentId + "/" + mediaName
                        

                        navigator.clipboard.writeText(url)

                        const elToast = document.createElement("div")
                        elToast.setAttribute("style", "position: fixed; left: 10px; top: 10px; right: 10px; font-family: sans-serif; " +
                            "font-size: 24px; z-index: 2147483647; background: #0d0; border: 3px solid black; padding: 5px; font-weight: bold;")
                        elToast.innerText = "Copied URL to clipboard"
                        document.body.append(elToast)
                        window.setTimeout(() => elToast.remove(), 1500)
                    }
                    catch (e: any) {
                        console.error(e)
                        alert("[ERROR] " + e.message)
                    }
                })()
            }
        })
    }
})


// for (const el of document.querySelectorAll("div[data-test-media-name='" + mediaName + "']")) {
//     const p = el.parentElement?.parentElement
//     if (p) {
//         const d = p.getAttribute("data-testid")
//         if (d) {
//             const m = d.match(/\.attachment-id\.(\d+)$/)
//             if (m) {
//                 const attachmentId = m[1]
//                 url = "https://bydeluxe.atlassian.net/secure/attachment/" + attachmentId + "/" + mediaName
//                 break
//             }
//         }
//     }
// }

