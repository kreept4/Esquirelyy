const fs = require('fs');
let c = fs.readFileSync('src/components/features/FirmCard.tsx', 'utf8');
c = c.replace("'use client'", "'use client'\nimport { useState } from 'react'");
fs.writeFileSync('src/components/features/FirmCard.tsx', c);
console.log('done');
