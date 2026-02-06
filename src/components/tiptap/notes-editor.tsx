import { useMemo } from 'react';
import { EditorContent, EditorContext, useEditor } from '@tiptap/react';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Selection } from '@tiptap/extensions';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap/node/image-upload-node/image-upload-node-extension';
import { HorizontalRule } from '@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/tiptap/node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap/node/code-block-node/code-block-node.scss';
import '@/components/tiptap/node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap/node/list-node/list-node.scss';
import '@/components/tiptap/node/image-node/image-node.scss';
import '@/components/tiptap/node/heading-node/heading-node.scss';
import '@/components/tiptap/node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI Primitives ---
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from '@/components/tiptap/ui-primitive/toolbar';

// --- Tiptap UI ---
import { MarkButton } from '@/components/tiptap/ui/mark-button';
import { HeadingDropdownMenu } from '@/components/tiptap/ui/heading-dropdown-menu';
import { ListDropdownMenu } from '@/components/tiptap/ui/list-dropdown-menu';
import { LinkPopover } from '@/components/tiptap/ui/link-popover';
import { UndoRedoButton } from '@/components/tiptap/ui/undo-redo-button';

// --- Hooks ---
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap/templates/simple/simple-editor.scss';

function NotesToolbar() {
  const isMobile = useIsBreakpoint();

  return (
    <Toolbar className="notes-toolbar">
      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu levels={[1, 2, 3]} portal={isMobile} />
        <ListDropdownMenu
          types={['bulletList', 'orderedList', 'taskList']}
          portal={isMobile}
        />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <LinkPopover />
      </ToolbarGroup>
    </Toolbar>
  );
}

interface NotesEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  placeholder?: string;
}

export function NotesEditor({
  content,
  onUpdate,
  placeholder = 'Start writing...',
}: NotesEditorProps) {
  const extensions = useMemo(
    () => [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      Placeholder.configure({ placeholder }),
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error: Error) => console.error('Upload failed:', error),
      }),
    ],
    [placeholder],
  );

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'Notes editor',
        class: 'simple-editor',
      },
    },
    extensions,
    content,
    onUpdate: ({ editor: e }) => {
      onUpdate(e.getHTML());
    },
  });

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <NotesToolbar />
        <EditorContent
          editor={editor}
          role="presentation"
          className="simple-editor-content"
        />
      </EditorContext.Provider>
    </div>
  );
}
