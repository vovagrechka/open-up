const G = new class {
  elConsole!: HTMLElement
  domidCounter = 1
  contextMenuTargetDomid?: string
  imageWidthDividedByHeight?: number
}

initContentScript()


function nextDomid(): string {
  return "___domid_" + (G.domidCounter++)
}

function initIdTrackingOrAssigningContextMenu() {
  window.addEventListener("contextmenu", e => {
    G.contextMenuTargetDomid = undefined

    if (e.target instanceof HTMLElement) {
      if (!e.target.id)
        e.target.id = nextDomid()

      G.contextMenuTargetDomid = e.target.id
    }
  }, true)
}

function initContentScript() {
  window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.altKey && e.key === "q") {
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

function addMenuItemHandler(what: MenuItem, f: () => void) {
  addMsgHandler(msg => {
    if (msg.action === "menuItem" && msg.what === what) {
      try {
        f()
      }
      catch (e: any) {
        console.error(e)
        alert("[ERROR] " + e.message)
      }
    }
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

function showToast(kind: "green" | "orange" | "red", msg: string) {
  const back =
      kind === "green" ? "#0d0" :
          kind === "orange" ? "orange" :
              kind === "red" ? "#f66" :
                  "#ccc"

  const elToast = document.createElement("div")
  elToast.setAttribute("style", "position: fixed; left: 10px; top: 10px; right: 10px; font-family: sans-serif; " +
      "font-size: 24px; z-index: 2147483647; background: " + back + "; border: 3px solid black; padding: 5px; font-weight: bold;")
  elToast.innerText = msg
  document.body.append(elToast)
  window.setTimeout(() => elToast.remove(), 1500)
}


function run<T>(f: () => T): T {
  return f()
}

async function copyStuffToClipboard(value: string) {
  await navigator.clipboard.writeText(value)
  showToast("green", "Copied stuff to clipboard")
}

function getContextMenuTargetElement(): HTMLElement {
  if (!G.contextMenuTargetDomid)
    throw Error("No G.contextMenuTargetDomid")

  const elTarget = document.getElementById(G.contextMenuTargetDomid)
  if (!(elTarget instanceof HTMLElement))
    throw Error("Target is not HTMLElement")

  return elTarget
}
