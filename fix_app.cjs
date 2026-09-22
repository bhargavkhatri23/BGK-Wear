const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  return (
    <div className="min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-[#9f2089] selection:text-slate-900">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pb-20 md:pb-6">
        {activeTab === 'home' && <HomeFeed />}
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'sell' && <SellerStudioView />}
        {activeTab === 'wishlist' && <WishlistView />}
        {activeTab === 'profile' && <UserProfileView />}
        {activeTab === 'admin' && <AdminPanel />}
        {activeTab === 'orders' && <OrdersView />}
      </main>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav />`;

const replacement = `  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 overflow-hidden selection:bg-[#9f2089] selection:text-slate-900">
      
      {/* Mobile Bottom Navigation / Desktop Sidebar */}
      <BottomNav />

      {/* Main App Content - Adjusted for Sidebar on md/lg screens */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto md:ml-24 lg:ml-64 relative">
        
        {/* Top Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-full overflow-x-hidden pb-24 md:pb-8">
          {activeTab === 'home' && <HomeFeed />}
          {activeTab === 'explore' && <ExploreView />}
          {activeTab === 'sell' && <SellerStudioView />}
          {activeTab === 'wishlist' && <WishlistView />}
          {activeTab === 'profile' && <UserProfileView />}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'orders' && <OrdersView />}
        </main>
      </div>`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated');
