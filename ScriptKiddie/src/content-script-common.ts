const G = new class {
  elConsole!: HTMLElement
}

function initContentScript() {
  window.addEventListener("keydown", e => {
    if (e.altKey && e.key === "q") {
      e.preventDefault()
      e.stopPropagation()
      sendMsgToServiceWorker({action: "reloadExtension"}, () => {
        console.log("======= RELOADED EXTENSION ========")
        window.location.reload()
      })
    }
  }, true)
  
  addMsgHandler(msg => {
    if (msg.action === "contentScriptLog")
      console.log("[CSL]", msg.data)
  })

  // G.elConsole = document.createElement("div")
  // G.elConsole.setAttribute("style", "position: fixed; left: 0; top: 0; right: 0; height: 100px; background: #ccc; border: 3px solid black; z-index: 2147483647;")
  // G.elConsole.innerText = "Hi there :)"
  // document.body.append(G.elConsole)
}

function addMsgHandler(f: (msg: Msg) => void) {
  chrome.runtime.onMessage.addListener(_msg => {
    f(_msg as Msg)
  })
}

function* selfAndParentElements(el: HTMLElement): Generator<HTMLElement> {
  yield el
  while ((el = el.parentElement!) != null) {
    yield el
  }
}

function sendMsgToServiceWorker(msg: Msg, cb?: (res: any) => void) {
  cb ??= () => {
  }
  chrome.runtime.sendMessage(msg, cb)
}

function showSuccessToast(msg: string) {
  const elToast = document.createElement("div")
  elToast.setAttribute("style", "position: fixed; left: 10px; top: 10px; right: 10px; font-family: sans-serif; " +
      "font-size: 24px; z-index: 2147483647; background: #0d0; border: 3px solid black; padding: 5px; font-weight: bold;")
  elToast.innerText = msg
  document.body.append(elToast)
  window.setTimeout(() => elToast.remove(), 1500)
}