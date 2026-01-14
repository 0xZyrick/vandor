import { Routes, Route, Navigate } from 'react-router-dom';
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/markets" element={<MarketsPage />} />      
          <Route path="/trade" element={<Navigate to="/trade/btcusdc" replace />} />
          <Route path="/trade/:pairSlug" element={<TradePage />} />
          <Route path="/:pairSlug" element={<TradePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/docs" element={<div className="min-h-screen bg-[#050507] text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Documentation</h1>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          </div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;