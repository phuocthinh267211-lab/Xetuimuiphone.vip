import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/const PORT = 3000;/, 'const PORT = 3005;');
fs.writeFileSync('server.test.ts', code);
