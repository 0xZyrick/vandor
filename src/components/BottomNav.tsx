import { useLocation, Link } from 'react-router-dom';
import { LayoutGrid, BarChart3, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const tabs = [
    { name: 'Markets', path: '/markets', icon: <LayoutGrid className="w-4 h-4" /> },
    { name: 'Trade', path: '/solusdc', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'Account', path: '/account', icon: <User className="w-4 h-4" /> },
  ];
  const getActiveState = (path: string) => {
    const current = location.pathname;
    
    if (path === '/markets') {
      return current === '/' || current === '/markets';
    }
    
    if (path === '/solusdc') {
      const navPaths = ['/markets', '/', '/dashboard', '/account'];
      return !navPaths.includes(current);
    }
    return current === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-gray-900 z-100 xl:hidden pb-safe">
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
              {/* Icon Container */}
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