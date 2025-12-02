export const fileNameCheck = (fileName: string) => {

  // Disallow invalid characters: /, \, :, *, ?, ", <, >, |, and control chars
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(fileName)) {
    return false;
  }

  // Disallow any dot so we control the extension ourselves
  if (fileName.includes('.')) {
    return false;
  }

  // Name must not be empty (after trimming)
  if (fileName.trim().length === 0) {
    return false;
  }

  return true;
};