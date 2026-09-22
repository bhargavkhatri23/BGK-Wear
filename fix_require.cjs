const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');
code = code.replace("const { loginAnonymously } = require('../services/authService');", "");
fs.writeFileSync('src/context/AppContext.tsx', code);
