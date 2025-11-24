export const fileNameCheck = (fileName: string) => {

  // Must end with .txt
  if (!fileName.endsWith('.txt')) {
    return false;
  }

  // Check for invalid characters: /, \, :, *, ?, ", <, >, |, and control characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1F]/;
  if (invalidChars.test(fileName)) {
    return false;
  }

  // Filename (without extension) must not be empty
  const nameWithoutExt = fileName.slice(0, -4);
  if (nameWithoutExt.trim().length === 0) {
    return false;
  }

  return true;
}