import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, "..");

/** Encoded in generated QR when no image file is configured (neutral checkout URL). */
const FALLBACK_QR_PAYLOAD = "https://warungagent.fun/pay";

/**
 * Resolves a QRIS-style image for Telegram: static file (same idea as landing `qris.webp`)
 * or a generated QR PNG if no file exists.
 */
export async function loadQrisDemoImage(): Promise<{ buffer: Buffer; filename: string } | null> {
  const envPath = process.env.TELEGRAM_QRIS_IMAGE_PATH?.trim();
  const candidates = [
    envPath && path.isAbsolute(envPath) ? envPath : envPath ? path.resolve(process.cwd(), envPath) : "",
    path.join(PACKAGE_ROOT, "assets", "qris.webp"),
    path.join(PACKAGE_ROOT, "assets", "qris.png"),
    path.join(PACKAGE_ROOT, "assets", "qris.jpg"),
    path.join(PACKAGE_ROOT, "..", "landing", "public", "images", "qris.webp"),
  ].filter(Boolean);

  for (const filePath of candidates) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        const buffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();
        const filename =
          ext === ".webp" ? "qris.webp" : ext === ".jpg" || ext === ".jpeg" ? "qris.jpg" : "qris.png";
        return { buffer, filename };
      }
    } catch {
      /* try next */
    }
  }

  try {
    const QRCode = (await import("qrcode")).default;
    const buffer = await QRCode.toBuffer(FALLBACK_QR_PAYLOAD, {
      type: "png",
      width: 512,
      margin: 2,
      errorCorrectionLevel: "M",
    });
    return { buffer, filename: "qris.png" };
  } catch {
    return null;
  }
}

let cached: Promise<{ buffer: Buffer; filename: string } | null> | undefined;

/** Single load per process (file or generated QR). */
export function getQrisDemoImageCached(): Promise<{ buffer: Buffer; filename: string } | null> {
  if (!cached) cached = loadQrisDemoImage();
  return cached;
}
