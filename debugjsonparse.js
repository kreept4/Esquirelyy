const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

c = c.replace(
  "    } catch (e: any) {\n      return NextResponse.json({ error: 'Failed to parse review. Please try again.' }, { status: 500 })\n    }",
  "    } catch (e: any) {\n      return NextResponse.json({ error: 'Failed to parse review. Please try again.', rawResponse: responseText }, { status: 500 })\n    }"
);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');