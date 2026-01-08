import { Routes, Route } from 'react-router-dom';
import MarketsPage from './pages/MarketsPage';
import TradePage from './pages/TradePage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import PortfolioPage from "./pages/PortfolioPage"
import LandingPage from "./pages/LandingPage"

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-green-500/30">
      <Header />

      {/* Main Content */}
      <main className="pb-24 lg:pb-0">
            <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      
      {/* Markets Page */}
      <Route path="/markets" element={<MarketsPage />} />
      
      {/* Trade Page - accepts any pair slug */}
      <Route path="/trade" element={<TradePage />} />
      <Route path="/trade/:pairSlug" element={<TradePage />} />
      
      {/* Portfolio Page */}
      <Route path="/portfolio" element={<PortfolioPage />} />
      
      {/* Fallback - redirect to landing */}
      <Route path="*" element={<LandingPage />} />
    </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;