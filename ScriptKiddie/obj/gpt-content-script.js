"use strict";
initIdTrackingOrAssigningContextMenu();
addMenuItemHandler("GPT: Copy quoted paragraph", () => {
    const elTarget = getContextMenuTargetElement();
    let p;
    for (const el of selfAndParentElements(elTarget)) {
        if (el.tagName === "P") {
            p = el;
            break;
        }
    }
    if (!p)
        throw Error("Expecting <p> tag");
    let text = "";
    for (const node of p.childNodes) {
        if (node.nodeType === Node.TEXT_NODE)
            text += node.textContent;
        else if (node instanceof HTMLElement) {
            if (node.tagName === "CODE")
                text += "`" + node.innerText + "`";
        }
    }
    if (text.startsWith('"') && text.endsWith('"'))
        text = text.substring(1, text.length - 1);
    copyStuffToClipboard(text);
});
//# sourceMappingURL=gpt-content-script.js.map