const id = {
  copyAttachmentLink: "925AA4E5-82FE-49D5-AEDE-0F1E378757C8",
  copyDocImgTag: "ACE35220-6D03-4B08-82DF-010E0618AA7D",
}

async function sendMsgToActiveTab(msg: Msg) {
  const [tab] = await chrome.tabs.query({active: true, lastFocusedWindow: true})
  if (!tab?.id) {
    console.log("[ERROR] No active tab ID")
    return
  }

  await chrome.tabs.sendMessage<Msg>(tab.id, msg)
}

chrome.runtime.onMessage.addListener(async _msg => {
  const msg = _msg as Msg
  if (msg.action === "reloadExtension") {
    chrome.runtime.reload()
  }
})

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: id.copyAttachmentLink,
    title: "Jira: Copy attachment link",
    contexts: ["all"],
    documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"]
  })

  chrome.contextMenus.create({
    id: id.copyDocImgTag,
    title: "Jira: Copy <DocImg> tag",
    contexts: ["image"],
    documentUrlPatterns: ["https://bydeluxe.atlassian.net/*"]
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === id.copyAttachmentLink)
    sendMsgToActiveTab({action: "menuItem_copyAttachmentLink"})
  else if (info.menuItemId === id.copyDocImgTag)
    sendMsgToActiveTab({action: "menuItem_copyDocImgTag"})
})

