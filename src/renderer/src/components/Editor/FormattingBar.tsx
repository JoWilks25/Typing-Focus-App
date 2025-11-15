import { Editor } from '@tiptap/core';
import {
  ControlGroup,
  ButtonGroup,
  EditorToolbarButton,
} from './FormattingBar.styles';

interface FormattingBarProps {
  editor: Editor
}

export const FormattingBar = ({ editor }: FormattingBarProps) => {
  return (
    <ControlGroup>
      <ButtonGroup>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          H1
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          H2
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          H3
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          Paragraph
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          Bold
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          Italic
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          Strike
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
        >
          Left
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
        >
          Center
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
        >
          Right
        </EditorToolbarButton>
        <EditorToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
        >
          Justify
        </EditorToolbarButton>
      </ButtonGroup>
    </ControlGroup>
  );
};
