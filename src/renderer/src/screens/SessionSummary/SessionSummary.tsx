import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import Lottie from 'lottie-react';
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
  ExportWrapper,
  ExportMenu,
  ExportMenuItem,
  ExportTrigger,
  ProgressSection,
  ProgressTitle,
  ProgressBar,
  ProgressFill,
  ProgressText,
} from './SessionSummary.styles';
import { useSessionStore } from '@renderer/stores/SessionStore';
import { useAppStore } from '@renderer/stores/AppStore';
import treeGrow7Animation from '@renderer/assets/animations/tree-grow-7.json';
import { TreeAnimation } from '@renderer/components/Animation/TreeAnimation.styles';
import { convertJsonToText, convertJsonToMarkdown, convertJsonToHtml } from '@renderer/utilities/exportUtils';
import type { EditorJson } from '@shared/tiptapTypes';

export function SessionSummary(): React.JSX.Element {
  const sessionStats = useSessionStore(state => state.sessionStats);
  const lastSession = sessionStats[sessionStats.length - 1];
  const setView = useAppStore(state => state.setView);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const progressAmount = lastSession.goalType === 'wordcount' ? lastSession.goalProgress : lastSession.timeProgress;

  // Calculate formatted values
  const hours = Math.floor(lastSession.duration / 3600);
  const minutes = Math.floor((lastSession.duration % 3600) / 60);
  const seconds = lastSession.duration % 60;

  const formattedTime = dayjs.duration({ hours, minutes, seconds }).format('HH:mm:ss');

  const handleReturnToEditor = () => {
    setView('editor');
  }

  const handleOpenFolder = async () => {
    if (lastSession.filePath) {
      try {
        // Derive the directory from the stored base path
        const lastSlash = lastSession.filePath.lastIndexOf('/');
        const folderPath =
          lastSlash === -1 ? lastSession.filePath : lastSession.filePath.slice(0, lastSlash);

        await window.api?.shell?.showItemInFolder(folderPath);
      } catch (error) {
        console.error('Failed to open folder:', error);
        // Optionally show an error message to the user
      }
    }
  };

  const handleExport = async (format: 'txt' | 'md' | 'docx') => {
    setIsExportMenuOpen(false);
    if (!lastSession.filePath) {
      alert('No file path available for export');
      return;
    }

    setIsExporting(true);
    try {
      // Read the JSON file
      const jsonFilePath = lastSession.filePath.endsWith('.dt.json')
        ? lastSession.filePath
        : `${lastSession.filePath}.dt.json`;

      const jsonContent = await window.api?.file?.read(jsonFilePath);
      if (!jsonContent) {
        throw new Error('Failed to read session file');
      }

      const json: EditorJson = JSON.parse(jsonContent);

      // Determine default filename
      const baseName = lastSession.fileName || 'export';
      const extensions = {
        txt: '.txt',
        md: '.md',
        docx: '.docx',
      };
      const defaultPath = `${baseName}${extensions[format]}`;

      // Show save dialog
      const savePath = await window.api?.dialog?.showSaveExport({
        defaultPath,
        filters: [
          { name: format === 'txt' ? 'Text File' : format === 'md' ? 'Markdown File' : 'Word Document', extensions: [format] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!savePath) {
        setIsExporting(false);
        return; // User canceled
      }

      // Convert and save
      if (format === 'txt') {
        const text = await convertJsonToText(json);
        await window.api?.file?.write(savePath, text);
      } else if (format === 'md') {
        const markdown = await convertJsonToMarkdown(json);
        await window.api?.file?.write(savePath, markdown);
      } else if (format === 'docx') {
        // Convert JSON to HTML in renderer, then HTML to DOCX in main
        const html = await convertJsonToHtml(json);
        const docxBuffer = await window.api?.export?.htmlToDocx(html);
        if (!docxBuffer) {
          throw new Error('Failed to convert to DOCX');
        }
        await window.api?.file?.writeBinary(savePath, docxBuffer);
      }

      alert(`Successfully exported to ${savePath}`);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!exportMenuRef.current) return;
      if (event.target instanceof Node && exportMenuRef.current.contains(event.target)) {
        return;
      }
      setIsExportMenuOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

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
        {
          lastSession.goalAchieved ? (
            <TreeSection>
              <TreeContainer>
                <Lottie
                  animationData={treeGrow7Animation}
                  loop={true}
                  autoplay={true}
                />
              </TreeContainer>
            </TreeSection>
          ) : (
            <TreeAnimation>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                fontSize: '200px', // Large emoji size
                textAlign: 'center'
              }}>
                🍂
              </div>
            </TreeAnimation>
          )
        }

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

      {/* ... existing code ... */}

      {/* Action Buttons */}
      <Actions>
        <ActionButton
          onClick={handleReturnToEditor}
          $variant="primary"
        >
          Return
        </ActionButton>
        {lastSession.filePath && (
          <ExportWrapper ref={exportMenuRef}>
            <ActionButton
              onClick={handleOpenFolder}
              $variant="secondary"
            >
              Open folder
            </ActionButton>
            <ExportTrigger
              type="button"
              onClick={() => setIsExportMenuOpen(prev => !prev)}
              aria-haspopup="menu"
              aria-expanded={isExportMenuOpen}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting…' : 'Export'}
              <span aria-hidden="true">▾</span>
            </ExportTrigger>
            {isExportMenuOpen && (
              <ExportMenu role="menu">
                <ExportMenuItem
                  role="menuitem"
                  onClick={() => handleExport('txt')}
                  disabled={isExporting}
                >
                  TXT
                </ExportMenuItem>
                <ExportMenuItem
                  role="menuitem"
                  onClick={() => handleExport('md')}
                  disabled={isExporting}
                >
                  MD
                </ExportMenuItem>
                <ExportMenuItem
                  role="menuitem"
                  onClick={() => handleExport('docx')}
                  disabled={isExporting}
                >
                  DOCX
                </ExportMenuItem>
              </ExportMenu>
            )}
          </ExportWrapper>
        )}
      </Actions>
    </SummaryContainer>
  );
}