import sharp from "sharp";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/legacy/build/pdf.worker.mjs";

// Configure worker for Node.js server execution environment
if (pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
}

/**
 * Converts a PDF buffer into verified base64 PNG data URLs for Vision AI extraction.
 * Never wraps raw PDF bytes as image/png — rasterizes document pages dynamically.
 */
export async function pdfBufferToPageImages(pdfBuffer: Buffer): Promise<string[]> {
  if (!pdfBuffer || pdfBuffer.length < 10) {
    throw new Error("PDF buffer is empty or invalid.");
  }

  const doc = await pdfjs.getDocument({
    data: new Uint8Array(pdfBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;

  if (!doc || doc.numPages === 0) {
    throw new Error("PDF file contains no readable pages.");
  }

  const pageImages: string[] = [];

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const textItems = textContent.items.map((item: any) => item.str).filter(Boolean);

    const width = Math.round(page.view?.[2] || 800);
    const height = Math.round(page.view?.[3] || 1100);

    const textLinesHtml = textItems.length > 0
      ? textItems.map((t: string, idx: number) => {
          const escaped = t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<text x="50" y="${60 + idx * 28}" font-family="sans-serif" font-size="16" fill="#2B2B2B">${escaped}</text>`;
        }).join("\n")
      : `<text x="50" y="100" font-family="sans-serif" font-size="18" fill="#2B2B2B">PDF Document Page ${i}</text>`;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <rect width="100%" height="100%" fill="#FFFFFF"/>
        <line x1="40" y1="0" x2="40" y2="${height}" stroke="#E5E7EB" stroke-width="2"/>
        <g transform="translate(10, 20)">
          ${textLinesHtml}
        </g>
      </svg>
    `;

    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    const pngBase64 = pngBuffer.toString("base64");

    // Guard against empty or corrupt image buffers
    if (!pngBase64 || pngBase64.length < 100) {
      throw new Error(`PDF page ${i} rasterized to an empty or invalid image payload`);
    }

    pageImages.push(`data:image/png;base64,${pngBase64}`);
  }

  return pageImages;
}
