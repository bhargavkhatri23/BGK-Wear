const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

code = code.replace(
  "  confirmPhoneOtp,\n  logoutUser\n} from '../services/authService';",
  "  confirmPhoneOtp,\n  logoutUser,\n  loginAnonymously\n} from '../services/authService';"
);

fs.writeFileSync('src/context/AppContext.tsx', code);
