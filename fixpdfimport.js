const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

c = c.replace(
  "import pdfParse from 'pdf-parse'",
  "import { PDFParse } from 'pdf-parse'"
);

c = c.replace(
  "  if (name.endsWith('.pdf')) {\n    const data = await pdfParse(buffer)\n    return data.text\n  }",
  "  if (name.endsWith('.pdf')) {\n    const parser = new PDFParse({ data: buffer })\n    const result = await parser.getText()\n    return result.text\n  }"
);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');