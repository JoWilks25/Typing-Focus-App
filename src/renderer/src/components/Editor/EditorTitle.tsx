// src/renderer/src/components/Editor/EditorTitle.tsx
// Purpose: Display the session file title prominently above the editor stats

import styles from './EditorTitle.module.css';

interface EditorTitleProps {
    title?: string;
    name: string;
}

export const EditorTitle = ({ title, name }: EditorTitleProps) => {
    // Display title if available, otherwise fall back to name
    const displayTitle = title || name;

    return (
        <div className={styles['editor-title']}>
            <h1 className={styles['editor-title-text']}>
                {displayTitle}
            </h1>
        </div>
    );
};
