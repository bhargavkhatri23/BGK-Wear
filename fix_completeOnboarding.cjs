const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `  const completeOnboarding = async (profileData: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    state: string;
    district: string;
    pincode: string;
  }) => {
    const newUserProfile: UserProfile = {
      id: user.id || 'usr-' + Date.now(),
      name: profileData.name.trim(),`;

const replacement = `  const completeOnboarding = async (profileData: {
    name: string;
    phone: string;
    whatsapp: string;
    email: string;
    state: string;
    district: string;
    pincode: string;
  }) => {
    let currentId = user.id;
    if (!currentId || currentId.startsWith('usr-')) {
      try {
        const { loginAnonymously } = require('../services/authService');
        const fbUser = await loginAnonymously();
        currentId = fbUser.uid;
      } catch (err) {
        console.warn('Anon auth failed during onboarding', err);
        currentId = 'usr-' + Date.now();
      }
    }

    const newUserProfile: UserProfile = {
      id: currentId,
      name: profileData.name.trim(),`;

code = code.replace(target, replacement);
fs.writeFileSync('src/context/AppContext.tsx', code);
