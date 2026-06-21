const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

c = c.replace(
  "      max_tokens: 2000,",
  "      max_tokens: 8192,"
);

const oldParseBlock = "    let parsed: any\n    try {\n      const cleaned = responseText.replace(/```json\\s*|\\s*```/g, '').trim()\n      parsed = JSON.parse(cleaned)\n    } catch (e: any) {\n      return NextResponse.json({ error: 'Failed to parse review. Please try again.', rawResponse: responseText }, { status: 500 })\n    }";

const newParseBlock = "    let parsed: any\n    let cleaned = responseText.trim()\n    cleaned = cleaned.replace(/^```(?:json)?\\s*/i, '').replace(/```\\s*$/, '').trim()\n\n    try {\n      parsed = JSON.parse(cleaned)\n    } catch (e: any) {\n      const match = cleaned.match(/\\{[\\s\\S]*\\}/)\n      if (match) {\n        try {\n          parsed = JSON.parse(match[0])\n        } catch (e2: any) {\n          return NextResponse.json({ error: 'Failed to parse review. Please try again.', rawResponse: responseText }, { status: 500 })\n        }\n      } else {\n        return NextResponse.json({ error: 'Failed to parse review. Please try again.', rawResponse: responseText }, { status: 500 })\n      }\n    }";

c = c.replace(oldParseBlock, newParseBlock);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');