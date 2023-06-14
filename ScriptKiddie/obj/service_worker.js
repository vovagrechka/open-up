"use strict";
const id_jira_copyAttachmentLink = "925AA4E5-82FE-49D5-AEDE-0F1E378757C8";
async function sendMsgToActiveTab(msg) {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    if (!tab?.id) {
        console.log("[ERROR] No active tab ID");
        return;
    }
    await chrome.tabs.sendMessage(tab.id, msg);
}
chrome.runtime.onMessage.addListener(async (_msg) => {
    const msg = _msg;
    if (msg.action === "reloadExtension") {
        chrome.runtime.reload();
    }
});
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: id_jira_copyAttachmentLink,
        title: "Jira: Copy attachment link",
        contexts: ["all"],
        documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"]
    });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === id_jira_copyAttachmentLink) {
        sendMsgToActiveTab({ action: "menuItem_copyAttachmentLink" });
    }
});
//# sourceMappingURL=service_worker.js.map