"use strict";
initIdTrackingOrAssigningContextMenu();
addMenuItemHandler("GPT: Copy quoted paragraph", () => {
    if (!G.contextMenuTargetDomid)
        return;
    console.log("PARA", G.contextMenuTargetDomid);
});
//# sourceMappingURL=gpt-content-script.js.map