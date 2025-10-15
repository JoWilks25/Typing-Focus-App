User Stories:

1. On Application Load
In Navbar
- New Session Form appears first
- Editor View is not selectable

2. Session Setup
New File:
- Changing filename
    - can be changed, must be valid name with .txt otherwise can't proceed
- Changing save location
    - correctly outputs file to selected location
- Changing word count
    - min 100 words max 10,000
    - shows error if outside of range
- Start Writing button
    - Selectable when inputs correctly filled, otherwise disabled
    - on select starts session if inputs correctly filled

Load Existing:
- Shows recent files
    - On select of a recent file
        - loads the correct file and shows success message including word count and full path
- On Choose File select
    - Opens file selector modal
    - Allows user to select valid .txt file
    - On selection of file shows
        - success message including word count, full path

3. Editor View
For New Session + word count goal:
- Editor view appears
    - Session Stats component
        - state starts at 0 words
        - Total Duration starts at 00:00 and starts incrementing every second straight away
        - Goal set in previous screen appears correctly
    - Tree Animation Component
        - Starts off with no trees visible
- As the user types
    - Session Stats component
        - the word count is incremented correctly
        - the percentage of goal is incremented correctly and the green bar fills correctly
    - Tree Animation Component
        - the tree animation progresses in line with the percentage of word count goal filled
- When user hits the word count goal
    - Success Modal Appears
    - Tree Animation Component
        - all trees are grown and animation is complete

Success Modal
- Only displays the first time the user hits the word count goal
- Displays:
    - Word count from session
    - Keep writing button that on press closes the modal and lets the user keep writing until they manually end the session
    - End Session button that finishes the session and switches the user to the Session Summary view

Inactivity Modal
- If the user stops writing and doesn't interact with the application on the computer for 1 minute then the inactivity modal shows.
- If the user presses the return to writing button, it goes back to the editor screen.
- If the user presses the end session button the session ends as incomplete and shows the incomplete session page.

Distraction Modal
- If the user navigates away from the editor i.e. alt tab or opens a different screen, then the distraction modal appears.
- The modal has a countdown timer of 10 seconds, if the user doesn't press the return to session button or click on the main editor screen within that time, then the session ends as incomplete and shows the incomplete session page.
- If the distraction modal is triggered and the user presses end session, then the session ends and it shows the incomplete session page.

Load Existing
Same as New Session except:
- Word count starts at 0, but in grey alongside shows existing word count from loaded file
