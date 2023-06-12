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
            func: function() {
                console.log("hi there")
            }
        })
    }
})

