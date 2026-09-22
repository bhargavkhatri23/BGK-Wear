const fs = require('fs');

const filesToUpdate = [
  'src/components/AppUpdateModal.tsx',
  'src/components/ChatMessengerView.tsx',
  'src/components/ProductDetailModal.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(/bg-black\/75 backdrop-blur-sm/g, 'bg-slate-50');
    content = content.replace(/bg-black\/80 backdrop-blur-md/g, 'bg-slate-50');
    content = content.replace(/bg-black\/90 backdrop-blur-md/g, 'bg-slate-50');
    content = content.replace(/bg-black\/60 backdrop-blur-md/g, 'bg-slate-50');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
