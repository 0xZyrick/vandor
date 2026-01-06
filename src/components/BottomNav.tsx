import { useLocation, Link } from 'react-router-dom';
import { LayoutGrid, BarChart3, Briefcase, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { name: 'Markets', path: '/markets', icon: <LayoutGrid className="w-6 h-6" /> },
    { name: 'Trade', path: '/solusdc', icon: <BarChart3 className="w-6 h-6" /> },
    { name: 'Positions', path: '/dashboard', icon: <Briefcase className="w-6 h-6" /> },
    { name: 'Account', path: '/account', icon: <User className="w-6 h-6" /> },
  ];

  // Logic to determine if a tab is active
  const getActiveState = (path: string) => {
    const current = location.pathname;
    
    if (path === '/markets') {
      return current === '/' || current === '/markets';
    }
    
    if (path === '/solusdc') {
      // This highlights "Trade" if the user is on ANY trading pair (e.g., /ethusdc)
      // We check if it's NOT markets, dashboard, or account
      const navPaths = ['/markets', '/', '/dashboard', '/account'];
      return !navPaths.includes(current);
    }
    
    return current === path;
  };

  return (
    // md:hidden ensures this disappears exactly when the desktop layout kicks in
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-gray-900 z-100 md:hidden pb-safe">
      <div className="flex justify-around items-center py-3 px-2">
        {tabs.map((tab) => {
          const active = getActiveState(tab.path);
          
          return (
            <Link
              key={tab.name}
              to={tab.path}
              className={`flex flex-col items-center gap-1 transition-all duration-200 flex-1 ${
                active ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {/* Icon Container with subtle glow when active */}
              <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-blue-400/10' : ''}`}>
                {tab.icon}
              </div>
              
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                active ? 'opacity-100' : 'opacity-60'
              }`}>
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}