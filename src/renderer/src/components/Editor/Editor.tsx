import {
  EditorContainer,
  EditorMain,
  EditorContent,
  AnimationSidebar,
  DisabledMessage,
  StartSessionButton,
  DisabledEditorContent,
} from './Editor.styles';

export const Editor = () => {
  const [activeSession, setActiveSession] = useState(false);
  const handleOpenSessionSetup = () => {
    // TODO: Implement session setup modal
    console.log('Open session setup');
  };

  return (

    <EditorContainer>
      {/* TODO: Add Editor Title */}

      {/* TODO: Add Session Stats */}
      <EditorMain>
        <EditorContent>
          <DisabledEditorContent>
            <DisabledMessage>
              <h2>Ready to Start Writing?</h2>
              <p>Begin your writing journey by starting a new session.</p>
            </DisabledMessage>
            <StartSessionButton onClick={handleOpenSessionSetup}>
              Start New Writing Session
            </StartSessionButton>
          </DisabledEditorContent>
        </EditorContent>

        <AnimationSidebar>
          {/* TODO: Add Tree animation */}
        </AnimationSidebar>
      </EditorMain>

      {/* TODO: Add Session setup modal */}
    </EditorContainer>
  );
};
