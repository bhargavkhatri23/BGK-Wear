const fs = require('fs');
let code = fs.readFileSync('src/components/UserProfileView.tsx', 'utf8');

code = code.replace(
  "resetOnboarding,",
  "signOut,"
);

fs.writeFileSync('src/components/UserProfileView.tsx', code);
