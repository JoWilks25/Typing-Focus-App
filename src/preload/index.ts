import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  onshowDistractionWarning(callback: () => void) {
    ipcRenderer.on('show-distraction-warning', () => callback());
  },
  ondismissDistractionWarning(callback: () => void) {
    ipcRenderer.on('dismiss-distraction-warning', () => callback());
  },
  onupdateCountdown(callback: (seconds: number) => void) {
    ipcRenderer.on('update-countdown', (_event, seconds: number) => {
      callback(seconds);
    });
  },
  returnToSession() {
    ipcRenderer.send('distraction:return');
  },
  // Add handler for main process to query if distraction warning should show
  onShouldShowDistractionWarning(callback: (respond: (shouldShow: boolean) => void) => void) {
    ipcRenderer.on('distraction:should-show', (_event, responseChannel: string) => {
      callback((shouldShow: boolean) => {
        ipcRenderer.send(responseChannel, shouldShow);
      });
    });
  },
  session: {
    end: () => ipcRenderer.invoke('session:end'),
  },
});
