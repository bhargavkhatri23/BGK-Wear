const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const target = `  // Real-time Products Firestore Listener
  useEffect(() => {
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
      } else {
        setProducts([]);
      }
    });
    return () => unsubProducts();
  }, [user.id]);`;

const replacement = `  // Real-time Products Firestore Listener
  useEffect(() => {
    if (!user.id) {
      setProducts([]);
      return;
    }
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
      } else {
        setProducts([]);
      }
    }, user.id);
    return () => unsubProducts();
  }, [user.id]);`;

code = code.replace(target, replacement);

const logoutTarget = `  const signOut = async () => {
    await logoutUser();
    setUser(INITIAL_USER);
    showToast('Signed out successfully', 'info');
  };`;

const logoutReplacement = `  const signOut = async () => {
    await logoutUser();
    setUser(INITIAL_USER);
    setProducts([]);
    setWishlist([]);
    setRentalBookings([]);
    setPurchaseOrders([]);
    setNotifications([]);
    try {
      localStorage.removeItem('bgk_wear_user_profile');
    } catch {}
    setIsOnboarded(false);
    showToast('Signed out successfully', 'info');
  };`;

code = code.replace(logoutTarget, logoutReplacement);

// Also we need to check if \`resetOnboarding\` has any conflict or just update handleLogout in UserProfileView to use \`signOut\`.
fs.writeFileSync('src/context/AppContext.tsx', code);
