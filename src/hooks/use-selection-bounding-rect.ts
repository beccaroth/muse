import { useRef } from "react"
import type { Editor } from "@tiptap/react"
import type { VirtualElement } from "@floating-ui/react"

/**
 * Computes the bounding client rect of the current ProseMirror text selection
 * using view.coordsAtPos(). Returns viewport-relative coordinates.
 */
function getSelectionBoundingRect(editor: Editor): DOMRect {
  const { state, view } = editor
  const { from, to } = state.selection

  if (from === to) {
    const coords = view.coordsAtPos(from)
    return new DOMRect(coords.left, coords.top, 0, coords.bottom - coords.top)
  }

  const fromCoords = view.coordsAtPos(from)
  const toCoords = view.coordsAtPos(to)

  const left = Math.min(fromCoords.left, toCoords.left)
  const top = Math.min(fromCoords.top, toCoords.top)
  const right = Math.max(fromCoords.right, toCoords.right)
  const bottom = Math.max(fromCoords.bottom, toCoords.bottom)

  return new DOMRect(left, top, right - left, bottom - top)
}

/**
 * Returns a VirtualElement ref that @floating-ui/react can use as a reference
 * element. The getBoundingClientRect() function is called lazily by floating-ui's
 * autoUpdate, avoiding unnecessary re-renders on every selection change.
 */
export function useSelectionVirtualElement(
  editor: Editor | null
): React.RefObject<VirtualElement | null> {
  const virtualElementRef = useRef<VirtualElement | null>(null)

  if (editor) {
    virtualElementRef.current = {
      getBoundingClientRect: () => getSelectionBoundingRect(editor),
      contextElement: editor.view.dom,
    }
  } else {
    virtualElementRef.current = null
  }

  return virtualElementRef
}
