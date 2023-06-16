"use strict";
const G = new class {
    constructor() {
        this.domidCounter = 1;
    }
};
initContentScript();
function nextDomid() {
    return "___domid_" + (G.domidCounter++);
}
function initIdTrackingOrAssigningContextMenu() {
    window.addEventListener("contextmenu", e => {
        G.contextMenuTargetDomid = undefined;
        if (e.target instanceof HTMLElement) {
            if (!e.target.id)
                e.target.id = nextDomid();
            G.contextMenuTargetDomid = e.target.id;
        }
    }, true);
}
function initContentScript() {
    window.addEventListener("keydown", e => {
        if (e.altKey && e.key === "q") {
            e.preventDefault();
            e.stopPropagation();
            sendMsgToServiceWorker({ action: "reloadExtension" }, () => {
                console.log("======= RELOADED EXTENSION ========");
                window.location.reload();
            });
        }
    }, true);
    addMsgHandler(msg => {
        if (msg.action === "contentScriptLog")
            console.log("[CSL]", msg.data);
    });
    // G.elConsole = document.createElement("div")
    // G.elConsole.setAttribute("style", "position: fixed; left: 0; top: 0; right: 0; height: 100px; background: #ccc; border: 3px solid black; z-index: 2147483647;")
    // G.elConsole.innerText = "Hi there :)"
    // document.body.append(G.elConsole)
}
function addMsgHandler(f) {
    chrome.runtime.onMessage.addListener(_msg => {
        f(_msg);
    });
}
function addMenuItemHandler(what, f) {
    addMsgHandler(msg => {
        if (msg.action === "menuItem" && msg.what === what)
            f();
    });
}
function* selfAndParentElements(el) {
    yield el;
    while ((el = el.parentElement) != null) {
        yield el;
    }
}
function sendMsgToServiceWorker(msg, cb) {
    cb ?? (cb = () => {
    });
    chrome.runtime.sendMessage(msg, cb);
}
function showSuccessToast(msg) {
    const elToast = document.createElement("div");
    elToast.setAttribute("style", "position: fixed; left: 10px; top: 10px; right: 10px; font-family: sans-serif; " +
        "font-size: 24px; z-index: 2147483647; background: #0d0; border: 3px solid black; padding: 5px; font-weight: bold;");
    elToast.innerText = msg;
    document.body.append(elToast);
    window.setTimeout(() => elToast.remove(), 1500);
}
function run(f) {
    return f();
}
//# sourceMappingURL=content-script-common.js.map