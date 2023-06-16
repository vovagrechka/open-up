"use strict";
const g = new class {
};
initContentScript();
addMsgHandler(msg => {
    if (msg.action === "menuItem_copyAttachmentLink")
        handle_menuItem_copyAttachmentSomething(_ => _);
    else if (msg.action === "menuItem_copyDocImgTag") {
        handle_menuItem_copyAttachmentSomething(url => {
            let tag = "DocImg";
            if (url.endsWith(".avi") || url.endsWith(".mp4") || url.endsWith(".webm"))
                tag = "DocVideo";
            return '<' + tag + ' src="' + url + '" width={700}/>';
        });
    }
});
async function handle_menuItem_copyAttachmentSomething(processLink) {
    try {
        if (!g.fileNameForContextMenu)
            throw Error("Unable to guess file name for context menu");
        const m = window.location.pathname.match(/\/browse\/(.*)$/);
        if (!m)
            throw Error("Unexpected Jira ticket page URL");
        const ticketId = m[1];
        const res = await fetch("https://bydeluxe.atlassian.net/rest/api/3/issue/" + ticketId);
        if (!res.ok)
            throw Error("Failed to get Jira ticket via API");
        const json = await res.json();
        if (!Array.isArray(json.fields.attachment))
            throw Error("No suitable `attachment` field in API response");
        const att = json.fields.attachment.find((_) => _.filename === g.fileNameForContextMenu);
        if (!att)
            throw Error("Can't find attachment object for file " + g.fileNameForContextMenu);
        const attachmentId = att.id;
        const url = "https://bydeluxe.atlassian.net/secure/attachment/" + attachmentId + "/" + g.fileNameForContextMenu;
        await navigator.clipboard.writeText(processLink(url));
        showSuccessToast("Copied stuff to clipboard");
    }
    catch (e) {
        console.error(e);
        alert("[ERROR] " + e.message);
    }
}
window.addEventListener("contextmenu", e => {
    g.fileNameForContextMenu = undefined;
    if (e.target instanceof HTMLElement) {
        for (const el of selfAndParentElements(e.target)) {
            if (el instanceof HTMLImageElement) {
                const s = el.parentElement?.getAttribute("data-test-media-name");
                if (s) {
                    g.fileNameForContextMenu = s;
                    return;
                }
            }
            else if (el.getAttribute("data-type") === "file" && el.getAttribute("data-node-type") === "media") {
                const mime = el.getAttribute("data-file-mime-type");
                if (mime === "video/x-msvideo" || mime === "video/mp4" || mime === "video/mpeg" || mime === "video/webm") {
                    const s = el.getAttribute("data-file-name");
                    if (s) {
                        g.fileNameForContextMenu = s;
                        return;
                    }
                }
            }
        }
    }
}, true);
//# sourceMappingURL=jira-content-script.js.map