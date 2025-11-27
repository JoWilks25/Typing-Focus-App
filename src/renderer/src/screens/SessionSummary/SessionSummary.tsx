import React from 'react';
import dayjs from 'dayjs';
import {
  SummaryContainer,
  Header,
  Title,
  Subtitle,
  ContentLayout,
  TreeSection,
  TreeContainer,
  StatsSection,
  StatsGrid,
  StatCard,
  StatLabel,
  StatValue,
  FileInfo,
  FilePath,
  Actions,
  ActionButton,
  ProgressSection,
  ProgressTitle,
  ProgressBar,
  ProgressFill,
  ProgressText,
} from './SessionSummary.styles';
import { useEditorStore } from '@renderer/stores/EditorStore';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { TreeAnimation } from '@renderer/components/Animation/TreeAnimation';
import { useAppStore } from '@renderer/stores/AppStore';

export function SessionSummary(): React.JSX.Element {
  const sessionStats = useSessionStore(state => state.sessionStats);
  const lastSession = sessionStats[sessionStats.length - 1];

  // const goalAchieved = useEditorStore(state => state.goalAchieved);
  // const goalProgress = useEditorStore(state => state.goalProgress);
  // const timeProgress = useEditorStore(state => state.timeProgress);
  // const wordCount = useEditorStore(state => state.wordCount);
  // const goalType = useSessionStore(state => state.goalType);
  // const elapsedSeconds = useSessionStore(state => state.elapsedSeconds);
  // const filePath = useSessionStore(state => state.filePath);
  const setView = useAppStore(state => state.setView);

  const progressAmount = lastSession.goalType === 'wordcount' ? lastSession.goalProgress : lastSession.timeProgress;

  // Calculate formatted values
  const hours = Math.floor(lastSession.duration / 3600);
  const minutes = Math.floor((lastSession.duration % 3600) / 60);
  const seconds = lastSession.duration % 60;

  const formattedTime = dayjs.duration({ hours, minutes, seconds }).format('HH:mm:ss');

  const handleReturnToEditor = () => {
    setView('editor');
  }

  const handleOpenFolder = () => {

  }

  return (
    <SummaryContainer>
      {/* Header */}
      <Header>
        <Title>
          {lastSession.goalAchieved ? '🎉 Goal Achieved!' : 'Session Incomplete'}
        </Title>
        <Subtitle>
          {lastSession.goalAchieved
            ? 'Congratulations on reaching your writing goal!'
            : 'You didn\'t complete the goal. Keep going next time!'
          }
        </Subtitle>
      </Header>
      {/* Progress Bar */}
      <ProgressSection>
        <ProgressTitle>Progress</ProgressTitle>
        <ProgressBar>
          <ProgressFill $width={progressAmount} />
        </ProgressBar>
        <ProgressText>{progressAmount}%</ProgressText>
      </ProgressSection>

      {/* Content Layout - Tree Animation and Stats */}
      <ContentLayout>
        {/* Tree Animation */}
        <TreeSection>
          <TreeContainer>
            <TreeAnimation
              isPoppedOut={false}
              onPopOut={() => { }}
            />
          </TreeContainer>
        </TreeSection>

        {/* Statistics */}
        <StatsSection>
          <StatsGrid>
            <StatCard>
              <StatLabel>Goal Progress</StatLabel>
              <StatValue>{progressAmount}%</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Words Written</StatLabel>
              <StatValue>{lastSession.wordCount}</StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Time Elapsed</StatLabel>
              <StatValue>
                {formattedTime}
              </StatValue>
            </StatCard>
            <StatCard>
              <StatLabel>Words/Min</StatLabel>
              <StatValue>
                {Math.round((lastSession.wordCount / (lastSession.duration / 60)))}
              </StatValue>
            </StatCard>
          </StatsGrid>
        </StatsSection>
      </ContentLayout>

      {/* File Information */}
      {lastSession.filePath && (
        <FileInfo>
          <h3>Saved Location</h3>
          <FilePath>{lastSession.filePath}</FilePath>
        </FileInfo>
      )}

      {/* Action Buttons */}
      <Actions>
        <ActionButton
          onClick={handleReturnToEditor}
          $variant="primary"
        >
          Return to Editor
        </ActionButton>
        {lastSession.filePath && (
          <ActionButton
            onClick={handleOpenFolder}
            $variant="secondary"
          >
            Open Folder
          </ActionButton>
        )}
        {/* <ActionButton
          // onClick={handleViewDashboard}
          $variant="secondary"
        >
          View Dashboard
        </ActionButton> */}
      </Actions>
    </SummaryContainer>
  );
}