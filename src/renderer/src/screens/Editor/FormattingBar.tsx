import { Editor } from '@tiptap/core';
import {
  FaHeading,
  FaBold,
  FaItalic,
  FaStrikethrough,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaParagraph
} from 'react-icons/fa';
import {
  ControlGroup,
  ButtonGroup,
  EditorToolbarButton,
  HeadingNumber,
  EndSessionButton,
} from './FormattingBar.styles';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useAppStore } from '@renderer/stores/AppStore';
import { useEditorStore } from '@renderer/stores/EditorStore';

interface FormattingBarProps {
  editor: Editor;
  disabled?: boolean;
  clearAndCloseEditor: () => void;
}

export const FormattingBar = ({ editor, disabled, clearAndCloseEditor }: FormattingBarProps) => {
  const sessionActive = useSessionStore(state => state.sessionActive);
  const endSession = useSessionStore(state => state.endSession);
  const resetEditor = useEditorStore(state => state.resetEditor);
  const setView = useAppStore((state) => state.setView);

  const handleEndSession = () => {
    endSession();
    clearAndCloseEditor();
    resetEditor();
    setView('session-summary');
  }

  return (
    <ControlGroup $disabled={disabled}>
      <ButtonGroup>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Heading 1"
          disabled={disabled}
        >
          <FaHeading /> <HeadingNumber>1</HeadingNumber>
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Heading 2"
          disabled={disabled}
        >
          <FaHeading /> <HeadingNumber>2</HeadingNumber>
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Heading 3"
          disabled={disabled}
        >
          <FaHeading /> <HeadingNumber>3</HeadingNumber>
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
          title="Paragraph"
          disabled={disabled}
        >
          <FaParagraph />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
          disabled={disabled}
        >
          <FaBold />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
          disabled={disabled}
        >
          <FaItalic />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Strikethrough"
          disabled={disabled}
        >
          <FaStrikethrough />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Align Left"
          disabled={disabled}
        >
          <FaAlignLeft />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Align Center"
          disabled={disabled}
        >
          <FaAlignCenter />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Align Right"
          disabled={disabled}
        >
          <FaAlignRight />
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
          title="Justify"
          disabled={disabled}
        >
          <FaAlignJustify />
        </EditorToolbarButton>
      </ButtonGroup>
      {sessionActive && <EndSessionButton
        onClick={handleEndSession}
        title="End Session"
      >
        End Session
      </EndSessionButton>}
    </ControlGroup>
  );
};