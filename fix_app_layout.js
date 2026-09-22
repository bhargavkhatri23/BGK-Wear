const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Update App layout structure
content = content.replace(
  /<div className="min-h-screen w-full max-w-\[100vw\] overflow-x-hidden bg-\[#F8FAFC\] text-slate-900 flex flex-col selection:bg-\[#9f2089\] selection:text-slate-900">[\s\S]*?{modal/g,
  `<div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC] text-slate-900 overflow-hidden selection:bg-[#9f2089] selection:text-slate-900">
      {/* Mobile-first Bottom Navigation / Desktop Sidebar */}
      <BottomNav />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto md:ml-24 lg:ml-64">
        {/* Top Navigation */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 w-full pb-20 md:pb-6">
          {activeTab === 'home' && <HomeFeed />}
          {activeTab === 'explore' && <ExploreView />}
          {activeTab === 'sell' && <SellerStudioView />}
          {activeTab === 'wishlist' && <WishlistView />}
          {activeTab === 'profile' && <UserProfileView />}
          {activeTab === 'admin' && <AdminPanel />}
          {activeTab === 'orders' && <OrdersView />}
        </main>
      </div>

      {/* All Application Modals */}
      {modal`
);

// We need a specific regex that won't miss or break other things. Let's do it with sed or edit_file.
