const fs = require('fs');

const filesToUpdate = [
  'src/components/ProductDetailModal.tsx',
  'src/components/AuthModal.tsx',
  'src/components/FiltersModal.tsx',
  'src/components/BuyCheckoutModal.tsx',
  'src/components/UploadListingModal.tsx',
  'src/components/RentalCheckoutModal.tsx',
  'src/components/UserProfileView.tsx',
  'src/components/CallSellerModal.tsx',
  'src/components/DeleteOutfitConfirmModal.tsx',
  'src/components/MandatoryProfileModal.tsx'
];

filesToUpdate.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Patterns to replace
    content = content.replace(/bg-slate-900\/60 backdrop-blur-md/g, 'bg-slate-50');
    content = content.replace(/bg-slate-900\/60 backdrop-blur-sm/g, 'bg-slate-50');
    content = content.replace(/bg-black\/80 backdrop-blur-md/g, 'bg-slate-50');
    content = content.replace(/bg-black\/40 backdrop-blur-xl/g, 'bg-slate-50');
    content = content.replace(/bg-black\/40 backdrop-blur-xs/g, 'bg-slate-50');
    content = content.replace(/bg-black\/80 backdrop-blur-sm/g, 'bg-slate-50');
    content = content.replace(/bg-slate-900\/80 backdrop-blur-md/g, 'bg-slate-50');
    
    // Also check for sm:bg-black/60 sm:backdrop-blur-md in ProductDetailModal (for all reviews overlay)
    content = content.replace(/bg-white sm:bg-black\/60 sm:backdrop-blur-md/g, 'bg-slate-50');
    
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
