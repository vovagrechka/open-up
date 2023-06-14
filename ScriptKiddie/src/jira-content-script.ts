const g = new class {
  elConsole!: HTMLElement
  fileNameForContextMenu: string | undefined
}

// g.elConsole = document.createElement("div")
// g.elConsole.setAttribute("style", "position: fixed; left: 0; top: 0; right: 0; height: 100px; background: #ccc; border: 3px solid black; z-index: 2147483647;")
// g.elConsole.innerText = "Hi there :)"
// document.body.append(g.elConsole)

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

chrome.runtime.onMessage.addListener(_msg => {
  const msg = _msg as Msg
  if (msg.action === "contentScriptLog") {
    console.log("[CSL]", msg.data)
  }
  else if (msg.action === "menuItem_copyAttachmentLink")
    handle_menuItem_copyAttachmentSomething(_ => _)
  else if (msg.action === "menuItem_copyDocImgTag")
    handle_menuItem_copyAttachmentSomething(_ => '<DocImg src="' + _ + '" width={700}/>')
})

async function handle_menuItem_copyAttachmentSomething(processLink: (_: string) => string) {
  try {
    if (!g.fileNameForContextMenu)
      throw Error("Unable to guess file name for context menu")

    const m = window.location.pathname.match(/\/browse\/(.*)$/)
    if (!m)
      throw Error("Unexpected Jira ticket page URL")

    const ticketId = m[1]
    const res = await fetch("https://bydeluxe.atlassian.net/rest/api/3/issue/" + ticketId)
    if (!res.ok)
      throw Error("Failed to get Jira ticket via API")
    const json = await res.json()

    if (!Array.isArray(json.fields.attachment))
      throw Error("No suitable `attachment` field in API response")

    const att = json.fields.attachment.find((_: any) => _.filename === g.fileNameForContextMenu)
    if (!att)
      throw Error("Can't find attachment object for file " + g.fileNameForContextMenu)

    const attachmentId = att.id
    const url = "https://bydeluxe.atlassian.net/secure/attachment/" + attachmentId + "/" + g.fileNameForContextMenu

    await navigator.clipboard.writeText(processLink(url))
    showSuccessToast("Copied stuff to clipboard")
  }
  catch (e: any) {
    console.error(e)
    alert("[ERROR] " + e.message)
  }
}

window.addEventListener("contextmenu", e => {
  g.fileNameForContextMenu = undefined

  if (e.target instanceof HTMLElement) {
    for (const el of selfAndParentElements(e.target)) {

      if (el instanceof HTMLImageElement) {
        const s = el.parentElement?.getAttribute("data-test-media-name")
        if (s) {
          g.fileNameForContextMenu = s
          return
        }
      }

      else if (el.getAttribute("data-type") === "file" && el.getAttribute("data-node-type") === "media") {
        const mime = el.getAttribute("data-file-mime-type")
        if (mime === "video/x-msvideo" || mime === "video/mp4" || mime === "video/mpeg" || mime === "video/webm") {
          const s = el.getAttribute("data-file-name")
          if (s) {
            g.fileNameForContextMenu = s
            return
          }
        }
      }
    }
  }
}, true)


function* selfAndParentElements(el: HTMLElement): Generator<HTMLElement> {
  yield el
  while ((el = el.parentElement!) != null) {
    yield el
  }
}

function sendMsgToServiceWorker(msg: Msg, cb?: (res: any) => void) {
  cb ??= () => {}
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
