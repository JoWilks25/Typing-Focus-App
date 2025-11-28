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
  session: {
    end: () => ipcRenderer.invoke('session:end'),
  },
});
