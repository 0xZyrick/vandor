import { Routes, Route } from 'react-router-dom';
import MarketsPage from './pages/MarketsPage';
import TradePage from './pages/TradePage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-green-500/30">
      {/* Desktop Top Nav */}
      <Header />

      {/* Main Content */}
      <main className="pb-24 lg:pb-0">
        <Routes>
          <Route path="/" element={<MarketsPage />} />
          <Route path="/markets" element={<MarketsPage />} />
          <Route path="/:pairSlug" element={<TradePage />} />
        </Routes>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  );
}

export default App;