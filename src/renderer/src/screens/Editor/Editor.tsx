import { useEffect, useState } from 'react';
import {
  EditorContainer,
  EditorMain,
  EditorContentDiv,
  DisabledMessage,
  StartSessionButton,
  TipTapEditor,
  DisabledOverlay,
  EditorTitle,
  EditorTitleText,
  AnimationSidebar,
} from './Editor.styles';
import { useEditor, EditorContent, Editor as ttEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import CharacterCount from '@tiptap/extension-character-count'
import { FormattingBar } from './FormattingBar';
import { SessionStats } from './SessionStats';
import { useEditorStore } from '@renderer/stores/EditorStore';
import { Modal } from '@renderer/components/Modal/Modal';
import { SessionSetup } from '../SessionSetup/SessionSetup';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { TreeAnimation } from '@renderer/components/Animation/TreeAnimation';
import { DraggableModal } from '@renderer/components/DraggableModal/DraggableModal';
import { CompletionModal } from '../SessionModals/CompletionModal';

export const Editor = () => {
  const [showSessionSetupModal, setShowSessionSetupModal] = useState(false);
  const [isAnimationPoppedOut, setIsAnimationPoppedOut] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const activeSession = useSessionStore(state => state.sessionActive);
  const displayTitle = useSessionStore(state => state.fileName);
  const setSessionActive = useSessionStore(state => state.setSessionActive);
  const updateContent = useEditorStore(state => state.updateContent);
  const goalAchieved = useEditorStore(state => state.goalAchieved);


  const handleOnUpdate = ({ editor }: { editor: ttEditor }) => {
    const content = editor.getHTML();
    const text = editor.getText();
    const wordCount = editor.storage.characterCount.words();
    updateContent(content, text, wordCount)
  }

  // Initialize Tiptap editor with basic extensions (always required for schema)
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      CharacterCount.configure({
        wordCounter: (text) => text.trim().split(/\s+/).filter(Boolean).length
      }),
    ], // define your extension array
    content: '',
    editable: activeSession,
    onUpdate: handleOnUpdate,
  })

  useEffect(() => {
    if (activeSession) {
      editor.setEditable(true);
    } else {
      editor.setEditable(false);
    }
  }, [activeSession, editor])

  const clearAndCloseEditor = () => {
    editor.commands.clearContent();
    editor.setEditable(false);
  }

  useEffect(() => {
    if (goalAchieved) {
      setShowCompleteModal(true)
      setSessionActive(false);
    }
  }, [goalAchieved])

  const handleSave = async () => {
    const filePath = useSessionStore.getState().filePath;
    const content = useEditorStore.getState().formattedContent;

    if (!filePath) {
      // Show error or save dialog
      return;
    }

    try {
      await window.api?.file?.write(filePath, content);
      // Show success notification
    } catch (error) {
      // Show error notification
      console.error('Failed to save:', error);
    }
  };

  return (
    <EditorContainer>
      <EditorTitle>
        <EditorTitleText>
          {displayTitle}
        </EditorTitleText>
        <button onClick={handleSave}>Save Content</button>
        <SessionStats />
      </EditorTitle>

      <EditorMain>
        <EditorContentDiv>
          <FormattingBar editor={editor} disabled={!activeSession} clearAndCloseEditor={clearAndCloseEditor} />
          <TipTapEditor>
            <EditorContent editor={editor} />
          </TipTapEditor>
          {!activeSession && (
            <DisabledOverlay>
              <DisabledMessage>
                <h2>Ready to Start Writing?</h2>
                <p>Begin your writing journey by starting a new session.</p>
              </DisabledMessage>
              <StartSessionButton onClick={() => setShowSessionSetupModal(true)}>
                Start New Writing Session
              </StartSessionButton>
            </DisabledOverlay>
          )}
        </EditorContentDiv>

        {!isAnimationPoppedOut && (
          <AnimationSidebar>
            <TreeAnimation
              isPoppedOut={false}
              onPopOut={() => setIsAnimationPoppedOut(true)}
            />
          </AnimationSidebar>
        )}
      </EditorMain>

      {isAnimationPoppedOut && (
        <DraggableModal
          title="Tree Growth"
          isVisible={isAnimationPoppedOut}
          onClose={() => setIsAnimationPoppedOut(false)}
          initialPosition={{ x: 100, y: 100 }}
          initialSize={{ width: 250, height: 400 }}
          sizeConstraints={{
            minWidth: 120,
            maxWidth: 800,
            minHeight: 200,
            maxHeight: 600,
          }}
          resizable={true}
        >
          <TreeAnimation
            isPoppedOut={true}
            onPopOut={() => { }}
          />
        </DraggableModal>
      )}

      <Modal
        title="Session Complete"
        isVisible={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        width={300}
        height="auto"
      >
        <CompletionModal showModal={setShowCompleteModal} clearAndCloseEditor={clearAndCloseEditor} />
      </Modal>

      <Modal
        title="Session Setup"
        isVisible={showSessionSetupModal}
        onClose={() => setShowSessionSetupModal(false)}
        width={600}
        height="auto"
      >
        <SessionSetup closeModal={() => setShowSessionSetupModal(false)} />
      </Modal>


    </EditorContainer >
  );
};