import { forwardRef, useCallback, useEffect, useState } from "react"
import type { Editor } from "@tiptap/react"
import {
  useFloating,
  offset as offsetMiddleware,
  flip,
  shift,
  FloatingPortal,
  useMergeRefs,
  type Placement,
} from "@floating-ui/react"

import { useTiptapEditor } from "@/hooks/use-tiptap-editor"
import { useSelectionVirtualElement } from "@/hooks/use-selection-bounding-rect"
import { cn } from "@/lib/tiptap-utils"

import "@/components/tiptap/ui-primitive/floating-element/floating-element.scss"

export interface FloatingElementProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** The editor instance (optional, falls back to EditorContext) */
  editor?: Editor | null
  /** Where to place the floating element relative to the selection */
  placement?: Placement
  /** Offset from the reference element in pixels */
  offset?: number
  /** Custom logic to determine whether the element should show */
  shouldShow?: (params: {
    editor: Editor
    from: number
    to: number
    empty: boolean
  }) => boolean
  /** z-index for the floating portal element */
  zIndex?: number
  /** Children to render inside the floating element */
  children: React.ReactNode
}

function defaultShouldShow({
  editor,
  empty,
}: {
  editor: Editor
  from: number
  to: number
  empty: boolean
}): boolean {
  return !empty && editor.isFocused && editor.isEditable
}

export const FloatingElement = forwardRef<HTMLDivElement, FloatingElementProps>(
  (
    {
      editor: providedEditor,
      placement = "top",
      offset = 8,
      shouldShow: customShouldShow,
      zIndex = 30,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const [isVisible, setIsVisible] = useState(false)
    const virtualElementRef = useSelectionVirtualElement(editor)

    const shouldShow = customShouldShow ?? defaultShouldShow

    const { refs, floatingStyles, update } = useFloating({
      placement,
      middleware: [
        offsetMiddleware(offset),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
      ],
    })

    // Sync virtual element to floating-ui reference when visible
    const syncReference = useCallback(() => {
      if (virtualElementRef.current) {
        refs.setReference(virtualElementRef.current)
      }
    }, [virtualElementRef, refs])

    // Listen to editor events to toggle visibility
    useEffect(() => {
      if (!editor) {
        setIsVisible(false)
        return
      }

      const handleUpdate = () => {
        const { from, to, empty } = editor.state.selection
        const show = shouldShow({ editor, from, to, empty })
        setIsVisible(show)

        if (show) {
          syncReference()
          requestAnimationFrame(() => update())
        }
      }

      const handleBlur = ({ event }: { event: FocusEvent }) => {
        const relatedTarget = event.relatedTarget as HTMLElement | null
        if (relatedTarget) {
          // Don't hide if focus moved to the floating element itself
          if (refs.floating.current?.contains(relatedTarget)) return
          // Don't hide if focus moved to a Radix portal (e.g. popover
          // opened from within the floating toolbar)
          if (relatedTarget.closest("[data-radix-popper-content-wrapper]")) return
        }
        setIsVisible(false)
      }

      editor.on("selectionUpdate", handleUpdate)
      editor.on("blur", handleBlur)

      return () => {
        editor.off("selectionUpdate", handleUpdate)
        editor.off("blur", handleBlur)
      }
    }, [editor, shouldShow, syncReference, update, refs.floating])

    // Escape key handler
    useEffect(() => {
      if (!isVisible || !editor) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsVisible(false)
          editor.commands.focus()
        }
      }

      document.addEventListener("keydown", handleKeyDown)
      return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isVisible, editor])

    // Prevent editor blur when clicking non-interactive areas of the
    // floating element, but allow normal mousedown on buttons/inputs
    // so Radix popovers and other interactive elements work correctly.
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest("button, input, [role='button'], [data-radix-collection-item]")) {
        e.preventDefault()
      }
    }, [])

    const mergedRef = useMergeRefs([refs.setFloating, ref])

    if (!isVisible || !editor) return null

    return (
      <FloatingPortal>
        <div
          ref={mergedRef}
          className={cn("tiptap-floating-element", className)}
          style={{
            ...floatingStyles,
            zIndex,
          }}
          onMouseDown={handleMouseDown}
          {...props}
        >
          {children}
        </div>
      </FloatingPortal>
    )
  }
)

FloatingElement.displayName = "FloatingElement"
