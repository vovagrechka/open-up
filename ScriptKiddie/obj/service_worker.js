"use strict";
const menuItemIdToAction = new Map();
function defineMenuItem(p) {
    const id = p.title;
    if (menuItemIdToAction.has(id))
        throw Error("Duplicate menu item ID: " + id);
    menuItemIdToAction.set(id, p.act);
    const contexts = p.contexts ?? ["all"];
    chrome.contextMenus.create({
        id,
        title: p.title,
        contexts,
        documentUrlPatterns: p.documentUrlPatterns
    });
}
function defineMessageSendingMenuItem(p) {
    defineMenuItem({
        title: p.title,
        contexts: p.contexts,
        documentUrlPatterns: p.documentUrlPatterns,
        act() {
            sendMsgToActiveTab({ action: "menuItem", what: p.title });
        }
    });
}
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
    defineMessageSendingMenuItem({
        title: "Jira: Copy attachment link",
        contexts: ["all"],
        documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"],
    });
    defineMessageSendingMenuItem({
        title: "Jira: Copy <DocImg> tag",
        contexts: ["all"],
        documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"],
    });
    defineMessageSendingMenuItem({
        title: "GPT: Copy quoted paragraph",
        contexts: ["all"],
        documentUrlPatterns: ["https://chat.openai.com/*"]
    });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (typeof info.menuItemId === "string") {
        const act = menuItemIdToAction.get(info.menuItemId);
        if (!act)
            throw Error("Menu item not defined: " + info.menuItemId);
        act();
    }
});
//# sourceMappingURL=service_worker.js.map