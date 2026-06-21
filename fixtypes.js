const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

c = c.replace(
  "async function extractText(file) {",
  "async function extractText(file: File): Promise<string> {"
);

c = c.replace(
  "export async function POST(req) {",
  "export async function POST(req: NextRequest) {"
);

c = c.replace(
  "    const file = formData.get('file')",
  "    const file = formData.get('file') as File | null"
);

c = c.replace(
  "    const targetRole = formData.get('targetRole')",
  "    const targetRole = formData.get('targetRole') as string | null"
);

c = c.replace(
  "    const careerStage = formData.get('careerStage')",
  "    const careerStage = formData.get('careerStage') as string | null"
);

c = c.replace(
  "    let parsed",
  "    let parsed: any"
);

c = c.replace(
  "    } catch (e) {",
  "    } catch (e: any) {"
);

c = c.replace(
  "  } catch (err) {",
  "  } catch (err: any) {"
);

c = c.replace(
  "    const responseText = message.content.map(function(block) { return block.type === 'text' ? block.text : '' }).join('')",
  "    const responseText = message.content.map(function(block: any) { return block.type === 'text' ? block.text : '' }).join('')"
);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');