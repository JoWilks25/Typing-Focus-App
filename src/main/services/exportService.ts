import HTMLtoDOCX from 'html-to-docx';

/**
 * Convert HTML to DOCX Buffer
 * This should be called from main process after receiving HTML from renderer
 */
export async function convertHtmlToDocx(html: string): Promise<Buffer> {
  // Wrap HTML in a proper document structure
  const fullHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  // html-to-docx returns a Buffer
  const buffer = await HTMLtoDOCX(fullHtml, null, {
    table: { row: { cantSplit: true } },
    footer: true,
    pageNumber: true,
  });

  return Buffer.from(buffer);
}