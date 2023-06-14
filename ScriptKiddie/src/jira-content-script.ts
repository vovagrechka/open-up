console.log("AAAAA 2")

chrome.runtime.onMessage.addListener(_msg => {
  const msg = _msg as Msg
  if (msg.action === "contentScriptLog") {
    console.log("[CSL]", msg.data)
  }
})

;(window as any).scriptKiddie_reloadExtension = () => {
  chrome.runtime.sendMessage<Msg>({action: "reloadExtension"})
}

const observer = new MutationObserver(mutations => {
  for (const mut of mutations) {
    for (const node of mut.addedNodes) {
      if (node instanceof Element) {
        console.log("nnn", node)
        if (node.getAttribute("data-type") === "file"
            && node.getAttribute("data-node-type") === "media"
            && node.getAttribute("data-file-mime-type") === "video/x-msvideo") {
          const file = node.getAttribute("data-file-name")
          console.log("XXX", node)
        }
      }
    }
  }
})

observer.observe(document.documentElement, {childList: true})

function initElement(el: HTMLElement, fileName: string) {
}