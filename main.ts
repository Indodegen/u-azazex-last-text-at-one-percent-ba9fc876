import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = dirname(fileURLToPath(import.meta.url));
const entryPath = join(dir, "entry.txt");
const text = readFileSync(entryPath, "utf-8");

if (!text || !text.trim() || text.length > 200) {
  console.error(
    "entry.txt must be non-empty, non-whitespace, and at most 200 characters.",
  );
  process.exit(1);
}

// Reject invisible control characters: C0 except newline, DEL, and
// zero-width / BOM characters, which could smuggle hidden content.
for (const ch of text) {
  const code = ch.codePointAt(0) ?? -1;
  const invisible =
    (code >= 0x00 && code < 0x20 && ch !== "\n") ||
    code === 0x7f ||
    code === 0x200b ||
    code === 0x200c ||
    code === 0x200d ||
    code === 0xfeff;
  if (invisible) {
    console.error(
      `entry.txt contains an invisible character: U+${code
        .toString(16)
        .toUpperCase()
        .padStart(4, "0")} (code ${code}).`,
    );
    process.exit(1);
  }
}

const outputDir = process.env.MAKEFUN_OUTPUT_DIR || "/output";
mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "entry.txt"), text);
