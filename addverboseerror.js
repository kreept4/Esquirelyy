const fs = require('fs');
let c = fs.readFileSync('src/app/api/cv-review/route.ts', 'utf8');

c = c.replace(
  "  } catch (err: any) {\n    console.error('CV review error:', err)\n    return NextResponse.json(\n      { error: err.message || 'Something went wrong processing your CV.' },\n      { status: 500 }\n    )\n  }",
  "  } catch (err: any) {\n    console.error('CV review error:', err)\n    return NextResponse.json(\n      { error: err.message || 'Something went wrong processing your CV.', stack: err.stack, name: err.name },\n      { status: 500 }\n    )\n  }"
);

fs.writeFileSync('src/app/api/cv-review/route.ts', c);
console.log('done');