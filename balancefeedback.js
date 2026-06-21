const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

// remove debug fields
c = c.replace(
  "      const match = cleaned.match(/\\{[\\s\\S]*\\}/)\n      if (match) {\n        try {\n          parsed = JSON.parse(match[0])\n        } catch (e2: any) {\n          return NextResponse.json({ error: 'Failed to parse review. Please try again.', rawResponse: responseText }, { status: 500 })\n        }\n      } else {\n        return NextResponse.json({ error: 'Failed to parse review. Please try again.', rawResponse: responseText }, { status: 500 })\n      }",
  "      const match = cleaned.match(/\\{[\\s\\S]*\\}/)\n      if (match) {\n        try {\n          parsed = JSON.parse(match[0])\n        } catch (e2: any) {\n          console.error('JSON parse failed, raw response:', responseText)\n          return NextResponse.json({ error: 'Failed to parse review. Please try again.' }, { status: 500 })\n        }\n      } else {\n        console.error('No JSON found, raw response:', responseText)\n        return NextResponse.json({ error: 'Failed to parse review. Please try again.' }, { status: 500 })\n      }"
);

c = c.replace(
  "    return NextResponse.json(\n      { error: err.message || 'Something went wrong processing your CV.', stack: err.stack, name: err.name },\n      { status: 500 }\n    )",
  "    return NextResponse.json(\n      { error: err.message || 'Something went wrong processing your CV.' },\n      { status: 500 }\n    )"
);

// add balanced feedback instruction to system prompt
c = c.replace(
  "Be honest about real weaknesses, this is not a pep talk, but always explain why something matters and never sound robotic or templated.",
  "Be honest about real weaknesses, this is not a pep talk, but you must also be equally honest when something is genuinely well done as is. Do not manufacture criticism to fill a quota. If a section, a bullet point, or the CV as a whole is already strong, say so plainly and explain why it works, the same way you would explain a weakness. The number of weaknesses and rewrites you provide should reflect what is actually wrong, not a fixed target, some CVs may only need two or three real fixes while others need more. Never invent a problem just to have something to say. Always explain why something matters and never sound robotic or templated."
);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');