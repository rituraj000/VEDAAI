/**
 * Converts a PDF buffer into real rendered page images for Vision AI extraction.
 * Uses unpdf's serverless-safe PDF.js build (no worker thread required) combined
 * with @napi-rs/canvas for rasterization — both work reliably in Vercel/Lambda.
 */

import { getDocumentProxy, renderPageAsImage } from "unpdf";

export async function pdfBufferToPageImages(pdfBuffer: Buffer): Promise<string[]> {
  if (!pdfBuffer || pdfBuffer.length < 10) {
    throw new Error("PDF buffer is empty or invalid.");
  }

  const data = new Uint8Array(pdfBuffer);

  let pdf;
  try {
    pdf = await getDocumentProxy(data);
  } catch (err: any) {
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }

  if (!pdf || pdf.numPages === 0) {
    throw new Error("PDF contains no pages.");
  }

  const pageImages: string[] = [];
  // scale 2 = ~144 DPI equivalent; bump to 2.5-3 if Vision AI misses small handwriting
  const scale = 2;

  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      // Pass the already-parsed document proxy, not the raw buffer again —
      // reusing the raw buffer across calls hits a structured-clone/transfer
      // bug in PDF.js's fake-worker message layer in Node.
      const imageBuffer = await renderPageAsImage(pdf, i, {
        canvasImport: () => import("@napi-rs/canvas") as any,
        scale,
      });

      const base64 = Buffer.from(imageBuffer).toString("base64");
      pageImages.push(`data:image/png;base64,${base64}`);
    } catch (err: any) {
      console.error(`Failed to render page ${i}:`, err.message);

      const { createCanvas } = await import("@napi-rs/canvas");
      const errCanvas = createCanvas(800, 200);
      const ctx = errCanvas.getContext("2d");
      ctx.fillStyle = "#FEF2F2";
      ctx.fillRect(0, 0, 800, 200);
      ctx.fillStyle = "#B91C1C";
      ctx.font = "20px sans-serif";
      ctx.fillText(`Page ${i} failed to render: ${err.message}`, 20, 100);
      pageImages.push(
        `data:image/png;base64,${errCanvas.toBuffer("image/png").toString("base64")}`
      );
    }
  }

  return pageImages;
}