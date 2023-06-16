type Msg =
    | {action: "contentScriptLog", data: any}
    | {action: "reloadExtension"}
    | {action: "menuItem", what: MenuItem}

type MenuItem =
    | "Jira: Copy attachment link"
    | "Jira: Copy <DocImg> tag"
    | "GPT: Copy quoted paragraph"

