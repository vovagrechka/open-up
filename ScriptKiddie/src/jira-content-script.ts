initIdTrackingOrAssigningContextMenu()

addMenuItemHandler("Jira: Copy attachment link", () =>
    handle_menuItem_copyAttachmentSomething(_ => _))

addMenuItemHandler("Jira: Copy <DocImg> tag", () => {
  handle_menuItem_copyAttachmentSomething(url => {
    let tag = "DocImg"
    if (url.endsWith(".avi") || url.endsWith(".mp4") || url.endsWith(".webm"))
      tag = "DocVideo"

    let res = '<' + tag + ' src="' + url + '" width={700}'
    if (G.imageWidthDividedByHeight)
      res += " widthDividedByHeight={" + G.imageWidthDividedByHeight + "}"
    res += "/>"
    return res
  })
})

async function handle_menuItem_copyAttachmentSomething(processLink: (_: string) => string) {
  G.imageWidthDividedByHeight = undefined

  const fileName = run<string | undefined>(() => {
    const elTarget = getContextMenuTargetElement()

    for (const el of selfAndParentElements(elTarget)) {
      if (el instanceof HTMLImageElement) {
        const s = el.parentElement?.getAttribute("data-test-media-name")
        if (s) {
          G.imageWidthDividedByHeight = el.naturalWidth / el.naturalHeight
          return s
        }
      }

      else if (el.getAttribute("data-type") === "file" && el.getAttribute("data-node-type") === "media") {
        const mime = el.getAttribute("data-file-mime-type")
        if (mime === "video/x-msvideo" || mime === "video/mp4" || mime === "video/mpeg" || mime === "video/webm") {
          const s = el.getAttribute("data-file-name")
          if (s)
            return s
        }
      }
    }
  })

  if (!fileName)
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

  const att = json.fields.attachment.find((_: any) => _.filename === fileName)
  if (!att)
    throw Error("Can't find attachment object for file " + fileName)

  const attachmentId = att.id
  const url = "https://bydeluxe.atlassian.net/secure/attachment/" + attachmentId + "/" + fileName

  await copyStuffToClipboard(processLink(url))
}


