const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

c = c.replace(
  "import { PDFParse } from 'pdf-parse'",
  "import { extractText as extractPdfText, getDocumentProxy } from 'unpdf'"
);

c = c.replace(
  "  if (name.endsWith('.pdf')) {\n    const parser = new PDFParse({ data: buffer })\n    const result = await parser.getText()\n    return result.text\n  }",
  "  if (name.endsWith('.pdf')) {\n    const uint8 = new Uint8Array(buffer)\n    const pdf = await getDocumentProxy(uint8)\n    const { text } = await extractPdfText(pdf, { mergePages: true })\n    return text\n  }"
);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');