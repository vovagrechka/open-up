initIdTrackingOrAssigningContextMenu()

addMenuItemHandler("GPT: Copy quoted paragraph", () => {
  const elTarget = getContextMenuTargetElement()
  
  let p: HTMLElement | undefined
  for (const el of selfAndParentElements(elTarget)) {
    if (el.tagName === "P") {
      p = el
      break
    }
  }
  
  if (!p) 
    throw Error("Expecting <p> tag")
  
  let text = ""
  for (const node of p.childNodes) {
    if (node.nodeType === Node.TEXT_NODE)
      text += node.textContent
    else if (node instanceof HTMLElement) {
      if (node.tagName === "CODE")
        text += "`" + node.innerText + "`"
      else {
        const clone = node.cloneNode(true) as HTMLElement
        clone.removeAttribute("id")
        text += clone.outerHTML
      }
    }
  }
  
  if (text.startsWith('"') && text.endsWith('"'))
    text = text.substring(1, text.length - 1)
  
  copyStuffToClipboard(text)
})




