import type { Editor } from "@tiptap/react"
import { FloatingElement } from "@/components/tiptap/ui-primitive/floating-element"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap/ui-primitive/toolbar"
import { MarkButton } from "@/components/tiptap/ui/mark-button"
import { HeadingDropdownMenu } from "@/components/tiptap/ui/heading-dropdown-menu"
import { ListDropdownMenu } from "@/components/tiptap/ui/list-dropdown-menu"
import { LinkPopover } from "@/components/tiptap/ui/link-popover"
import { UndoRedoButton } from "@/components/tiptap/ui/undo-redo-button"

export interface FloatingToolbarProps {
  editor?: Editor | null
}

export function FloatingToolbar({ editor }: FloatingToolbarProps) {
  return (
    <FloatingElement editor={editor}>
      <Toolbar variant="floating" aria-label="Floating formatting toolbar">
        <ToolbarGroup>
          <HeadingDropdownMenu levels={[1, 2, 3]} />
          <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <MarkButton type="bold" />
          <MarkButton type="italic" />
          <MarkButton type="strike" />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <LinkPopover autoOpenOnLinkActive={false} />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <UndoRedoButton action="undo" />
          <UndoRedoButton action="redo" />
        </ToolbarGroup>
      </Toolbar>
    </FloatingElement>
  )
}
