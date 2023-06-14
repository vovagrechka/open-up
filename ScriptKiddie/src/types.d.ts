type Msg =
    | {action: "contentScriptLog", data: any}
    | {action: "reloadExtension"}
    | {action: "menuItem_copyAttachmentLink"}
