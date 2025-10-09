import React, { useEffect, useRef, useState } from 'react';
import { useFloatingModal } from '../../hooks/useFloatingModal';
import { useSession } from '../../hooks/useSession';
import { TreeAnimationProps } from '../../types/animation';

export const TreeAnimation: React.FC<TreeAnimationProps> = ({ progress, isWilting = false }) => {
  const { createModal, closeModal, forceCloseModal } = useFloatingModal();
  const [modalId, setModalId] = useState<string | null>(null);
  const modalIdRef = useRef<string | null>(null);
  const previousProgressRef = useRef<number>(0);
  const previousWiltingRef = useRef<boolean>(false);
  const [shouldLoadAnimation, setShouldLoadAnimation] = useState<boolean>(false);
  const previousActiveSessionIdRef = useRef<string | null>(null);

  // Get the active session to detect when a new session starts
  const { activeSession } = useSession();

  // Determine if we should load the animation
  useEffect(() => {
    // Load animation when:
    // 1. A new session becomes active (different from previous active session)
    // 2. OR if there's an active session and we haven't loaded animation yet
    const currentSessionId = activeSession?.id || null;
    const isNewSession = currentSessionId && currentSessionId !== previousActiveSessionIdRef.current;

    if (isNewSession) {
      setShouldLoadAnimation(true);
    }

    previousActiveSessionIdRef.current = currentSessionId;
  }, [activeSession]);

  // Only create modal and load animation when we should
  useEffect(() => {
    if (!shouldLoadAnimation) {
      return;
    }

    const initializeModal = async () => {
      try {
        const id = await createModal({
          width: 400,
          height: 500,
          alwaysOnTop: true,
          resizable: true,
          minimizable: true,
          closable: true,
          title: 'Progress Tree',
          content: `
            <div id="tree-animation-container" style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
              color: #f9fafb;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              padding: 20px;
              box-sizing: border-box;
            ">
              <div id="animation-wrapper" style="
                display: flex;
                align-items: center;
                justify-content: center;
                flex: 1;
                width: 100%;
                max-width: 300px;
                max-height: 300px;
                margin-bottom: 20px;
              ">
                <div id="lottie-container" style="
                  width: 200px;
                  height: 200px;
                "></div>
              </div>
              
              <div id="progress-indicator" style="
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                width: 100%;
                max-width: 250px;
              ">
                <div id="progress-bar" style="
                  width: 100%;
                  height: 8px;
                  background-color: rgba(255, 255, 255, 0.2);
                  border-radius: 4px;
                  overflow: hidden;
                  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
                ">
                  <div id="progress-fill" style="
                    height: 100%;
                    background: linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%);
                    border-radius: 4px;
                    transition: width 0.3s ease-in-out;
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
                    width: 0%;
                  "></div>
                </div>
                <div id="progress-text" style="
                  font-size: 14px;
                  font-weight: 600;
                  text-align: center;
                  color: #f9fafb;
                  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
                ">
                  🌳 0%
                </div>
              </div>
            </div>
            
            <script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>
            <script>
              let animation = null;
              let animationData = null;
              let progressUpdateHandler = null;
              
              // Cleanup function
              function cleanup() {
                if (animation) {
                  animation.destroy();
                  animation = null;
                }
                if (progressUpdateHandler && window.api && window.api.removeListener) {
                  window.api.removeListener('tree-animation:progress', progressUpdateHandler);
                  progressUpdateHandler = null;
                }
              }
              
              // Load the animation data
              async function loadAnimation() {
                try {
                  // Try to load the forest-growing.json file from the main process
                  let forestAnimationData = null;
                  
                  try {
                    // Request the animation data from the main process
                    if (window.api && window.api.treeAnimation) {
                      forestAnimationData = await window.api.treeAnimation.getData();
                      console.log('Loaded forest-growing.json animation data');
                    }
                  } catch (error) {
                    console.log('Could not load forest-growing.json, using simplified animation:', error);
                  }
                  
                  // Use the real forest animation data if available, otherwise fallback to simplified
                  animationData = forestAnimationData || {
                    "v": "5.7.4",
                    "fr": 30,
                    "ip": 0,
                    "op": 48,
                    "w": 400,
                    "h": 400,
                    "nm": "Forest Growing",
                    "ddd": 0,
                    "assets": [],
                    "layers": [
                      {
                        "ddd": 0,
                        "ind": 1,
                        "ty": 4,
                        "nm": "Tree Trunk",
                        "sr": 1,
                        "ks": {
                          "o": {"a": 0, "k": 100},
                          "r": {"a": 0, "k": 0},
                          "p": {"a": 0, "k": [200, 250, 0]},
                          "a": {"a": 0, "k": [0, 0, 0]},
                          "s": {"a": 1, "k": [
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 0, "s": [0, 0, 100]},
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 16, "s": [20, 100, 100]},
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 32, "s": [40, 100, 100]},
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 48, "s": [60, 100, 100]}
                          ]}
                        },
                        "ao": 0,
                        "shapes": [
                          {
                            "ty": "gr",
                            "it": [
                              {
                                "d": 1,
                                "ty": "rc",
                                "s": {"a": 0, "k": [20, 100]},
                                "p": {"a": 0, "k": [0, 0]},
                                "r": {"a": 0, "k": 5},
                                "nm": "Rectangle Path 1",
                                "mn": "ADBE Vector Shape - Rect",
                                "hd": false
                              },
                              {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.4, 0.2, 0.1, 1]},
                                "o": {"a": 0, "k": 100},
                                "r": 1,
                                "bm": 0,
                                "nm": "Fill 1",
                                "mn": "ADBE Vector Graphic - Fill",
                                "hd": false
                              }
                            ],
                            "nm": "Trunk",
                            "np": 2,
                            "cix": 2,
                            "bm": 0,
                            "ix": 1,
                            "mn": "ADBE Vector Group",
                            "hd": false
                          }
                        ],
                        "ip": 0,
                        "op": 48,
                        "st": 0,
                        "bm": 0
                      },
                      {
                        "ddd": 0,
                        "ind": 2,
                        "ty": 4,
                        "nm": "Tree Leaves",
                        "sr": 1,
                        "ks": {
                          "o": {"a": 1, "k": [
                            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 16, "s": [0]},
                            {"i": {"x": [0.667], "y": [1]}, "o": {"x": [0.333], "y": [0]}, "t": 24, "s": [100]}
                          ]},
                          "r": {"a": 0, "k": 0},
                          "p": {"a": 0, "k": [200, 200, 0]},
                          "a": {"a": 0, "k": [0, 0, 0]},
                          "s": {"a": 1, "k": [
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 16, "s": [0, 0, 100]},
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 32, "s": [50, 50, 100]},
                            {"i": {"x": [0.667, 0.667, 0.667], "y": [1, 1, 1]}, "o": {"x": [0.333, 0.333, 0.333], "y": [0, 0, 0]}, "t": 48, "s": [100, 100, 100]}
                          ]}
                        },
                        "ao": 0,
                        "shapes": [
                          {
                            "ty": "gr",
                            "it": [
                              {
                                "d": 1,
                                "ty": "el",
                                "s": {"a": 0, "k": [80, 80]},
                                "p": {"a": 0, "k": [0, 0]},
                                "nm": "Ellipse Path 1",
                                "mn": "ADBE Vector Shape - Ellipse",
                                "hd": false
                              },
                              {
                                "ty": "fl",
                                "c": {"a": 0, "k": [0.2, 0.8, 0.2, 1]},
                                "o": {"a": 0, "k": 100},
                                "r": 1,
                                "bm": 0,
                                "nm": "Fill 1",
                                "mn": "ADBE Vector Graphic - Fill",
                                "hd": false
                              }
                            ],
                            "nm": "Leaves",
                            "np": 2,
                            "cix": 2,
                            "bm": 0,
                            "ix": 1,
                            "mn": "ADBE Vector Group",
                            "hd": false
                          }
                        ],
                        "ip": 16,
                        "op": 48,
                        "st": 16,
                        "bm": 0
                      }
                    ]
                  };
                  
                  // Initialize Lottie animation
                  const container = document.getElementById('lottie-container');
                  if (container && window.lottie) {
                    animation = window.lottie.loadAnimation({
                      container: container,
                      renderer: 'svg',
                      loop: false,
                      autoplay: false,
                      animationData: animationData
                    });
                    
                    console.log('Lottie animation loaded successfully');
                  }
                } catch (error) {
                  console.error('Failed to load animation:', error);
                  // Fallback to emoji
                  const container = document.getElementById('lottie-container');
                  if (container) {
                    container.innerHTML = '<div style="font-size: 48px; text-align: center; line-height: 200px;">🌱</div>';
                  }
                }
              }
              
              // Listen for progress updates
              if (window.api && window.api.on) {
                progressUpdateHandler = (event, progress, isWilting) => {
                  console.log('Tree animation progress update:', progress, isWilting);
                  
                  const progressFill = document.getElementById('progress-fill');
                  const progressText = document.getElementById('progress-text');
                  
                  if (progressFill && progressText) {
                    // Update progress bar
                    progressFill.style.width = progress + '%';
                    
                    // Update text
                    if (isWilting) {
                      progressText.textContent = '🌱 Wilting...';
                      progressFill.style.background = 'linear-gradient(90deg, #ef4444 0%, #f87171 50%, #fca5a5 100%)';
                      progressFill.style.boxShadow = '0 0 8px rgba(239, 68, 68, 0.4)';
                    } else {
                      progressText.textContent = '🌳 ' + Math.round(progress) + '%';
                      progressFill.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)';
                      progressFill.style.boxShadow = '0 0 8px rgba(16, 185, 129, 0.4)';
                    }
                    
                    // Update Lottie animation frame
                    if (animation && animationData) {
                      const totalFrames = animationData.op - animationData.ip;
                      let targetFrame;
                      
                      if (isWilting) {
                        // For wilting, play reverse animation
                        targetFrame = Math.floor((progress / 100) * totalFrames);
                        targetFrame = totalFrames - targetFrame;
                      } else {
                        // Normal growth animation
                        targetFrame = Math.floor((progress / 100) * totalFrames);
                      }
                      
                      // Ensure frame is within bounds
                      targetFrame = Math.max(0, Math.min(targetFrame, totalFrames - 1));
                      
                      // Seek to the calculated frame
                      animation.goToAndStop(targetFrame, true);
                    }
                  }
                };
                window.api.on('tree-animation:progress', progressUpdateHandler);
              }
              
              // Load animation when page loads
              document.addEventListener('DOMContentLoaded', loadAnimation);
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', loadAnimation);
              } else {
                loadAnimation();
              }
              
              // Cleanup when window is about to close
              window.addEventListener('beforeunload', cleanup);
              window.addEventListener('unload', cleanup);
            </script>
          `
        });

        if (id) {
          setModalId(id);
          modalIdRef.current = id;
          console.log('Tree animation modal created with ID:', id);
        }
      } catch (error) {
        console.error('Failed to create tree animation modal:', error);
      }
    };

    initializeModal();

    // Cleanup on unmount
    return () => {
      if (modalIdRef.current) {
        closeModal(modalIdRef.current).catch(error => {
          console.error('Failed to close tree animation modal during cleanup:', error);
          // Try force close as fallback
          forceCloseModal(modalIdRef.current!).catch(forceError => {
            console.error('Failed to force close tree animation modal during cleanup:', forceError);
          });
        });
      }
    };
  }, [createModal, closeModal, forceCloseModal, shouldLoadAnimation]);

  // Send progress updates to the modal
  useEffect(() => {
    if (modalId && (progress !== previousProgressRef.current || isWilting !== previousWiltingRef.current)) {
      try {
        // Send progress update via IPC
        if (window.api && 'send' in window.api) {
          (window.api as { send: (channel: string, ...args: unknown[]) => void }).send('tree-animation:update-progress', modalId, progress, isWilting);
        }

        previousProgressRef.current = progress;
        previousWiltingRef.current = isWilting;

        console.log(`Tree animation progress updated: ${progress}% (wilting: ${isWilting})`);
      } catch (error) {
        console.error('Failed to send tree animation progress update:', error);
      }
    }
  }, [modalId, progress, isWilting]);

  // Handle wilting state changes
  useEffect(() => {
    if (modalId && isWilting) {
      console.log('Tree animation entering wilting state');
    }
  }, [modalId, isWilting]);

  // This component doesn't render anything in the main window
  // It only manages the floating modal
  return null;
};
