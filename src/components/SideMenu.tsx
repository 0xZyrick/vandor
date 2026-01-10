import { X, LayoutGrid, TrendingUp, Trophy, Wallet,BookText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SideMenu({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const navigate = useNavigate();
  
  const links = [
    { name: 'Markets', icon: LayoutGrid, path: '/markets' },
    { name: 'Trade', icon: TrendingUp, path: '/btcusdc' },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard' },
    { name: 'Portfolio', icon: Wallet, path: '/portfolio' },
    { name: 'Docs', icon: BookText, path: '/docs' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-999 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-80 bg-[#0a0a0f] h-full border-r border-white/5 flex flex-col p-6 animate-in slide-in-from-left duration-300">
        <div className="flex justify-between items-center mb-10">
          <img src="/vandar.svg" alt="Vandor" className="h-8" />
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
        </div>

        <nav className="space-y-2">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => { navigate(link.path); onClose(); }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-blue-600/10 hover:text-blue-400 text-gray-400 transition-all font-medium"
            >
              <link.icon className="w-5 h-5" />
              {link.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto bg-blue-600/5 p-4 rounded-3xl border border-blue-500/10">
          <div className="flex items-center gap-3 mb-3">
             <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-purple-600" />
             <div>
               <p className="text-xs text-gray-400">Builder Account</p>
               <p className="text-sm font-bold">Code: 42069</p>
             </div>
          </div>
          <button className="w-full py-2 bg-blue-600 rounded-xl text-xs font-bold">Account Settings</button>
        </div>
      </div>
    </div>
  );
}