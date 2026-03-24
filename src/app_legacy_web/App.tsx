import React, { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { FoodService } from './components/FoodService';
import { LaundryService } from './components/LaundryService';
import { WaterService } from './components/WaterService';
import { Dashboard } from './components/Dashboard';
import { User, Settings, CreditCard, HelpCircle, LogOut, Calendar } from 'lucide-react';

const Profile: React.FC = () => (
  <div className="pb-24 bg-gray-50 min-h-screen">
    <header className="relative bg-slate-900 h-48 overflow-hidden">
      <img 
        src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzfGVufDF8fHx8MTc3NTM1ODYwOXww&ixlib=rb-4.1.0&q=80&w=1080" 
        alt="College Campus" 
        className="w-full h-full object-cover opacity-30 grayscale"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <div className="flex items-end gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-xl relative -mb-4 z-10 text-white">
            NK
          </div>
          <div className="mb-1">
            <h1 className="text-2xl font-bold text-white">Nikhil Kapar</h1>
            <p className="text-purple-200 text-xs font-medium uppercase tracking-wide">Bhagalpur College of Engineering</p>
          </div>
        </div>
      </div>
    </header>

    <div className="p-4 space-y-4 mt-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 hover:bg-purple-50 transition-colors cursor-pointer group">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600 group-hover:bg-purple-200 transition-colors">
              <Calendar size={20} />
            </div>
            <span className="flex-1 font-bold text-gray-800">Manage Subscriptions</span>
        </div>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <CreditCard className="text-gray-400" size={20} />
            <span className="flex-1 font-medium text-gray-700">Payment Methods</span>
        </div>
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Settings className="text-gray-400" size={20} />
            <span className="flex-1 font-medium text-gray-700">Preferences</span>
        </div>
        <div className="p-4 flex items-center gap-3">
            <HelpCircle className="text-gray-400" size={20} />
            <span className="flex-1 font-medium text-gray-700">Support</span>
        </div>
      </div>

      <button className="w-full bg-white text-red-500 p-4 rounded-xl shadow-sm border border-red-100 font-medium flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
        <LogOut size={20} />
        Sign Out
      </button>
    </div>
  </div>
);

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'food':
        return <FoodService />;
      case 'laundry':
        return <LaundryService />;
      case 'water':
        return <WaterService />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <main className="max-w-md mx-auto min-h-screen bg-white shadow-2xl overflow-hidden relative border-x border-gray-200">
        {renderContent()}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  );
}

export default App;
