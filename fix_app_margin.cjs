const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Change md:ml-24 lg:ml-64 to md:pl-24 lg:pl-64 so it uses padding instead of margin
content = content.replace('md:ml-24 lg:ml-64', 'md:pl-24 lg:pl-64');

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated margin to padding');
