import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/const PORT = parseInt\(process\.env\.PORT \|\| "3000"\);/, 'const PORT = 3000;');
fs.writeFileSync('server.ts', code);
