const fs = require('fs');
let code = fs.readFileSync('src/components/UserProfileView.tsx', 'utf8');

const target = `  const handleLogout = () => {
    resetOnboarding();
  };`;

const replacement = `  const handleLogout = async () => {
    await signOut();
  };`;

code = code.replace(target, replacement);

const useAppTarget = `  const { user, updateUserProfile, resetOnboarding, wishlist, products, rentalBookings, purchaseOrders } = useApp();`;
const useAppReplacement = `  const { user, updateUserProfile, signOut, wishlist, products, rentalBookings, purchaseOrders } = useApp();`;

code = code.replace(useAppTarget, useAppReplacement);

fs.writeFileSync('src/components/UserProfileView.tsx', code);
