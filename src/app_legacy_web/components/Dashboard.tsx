import React from 'react';
import { Utensils, Shirt, Droplets, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  return (
    <div className="pb-24 p-6 bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Good Morning, <br/> Mate!</h1>
        <p className="text-gray-500 mt-2">Welcome to <span className="text-purple-600 font-bold">B mate</span>. What do you need?</p>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('food')}
          className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden cursor-pointer"
        >
          <div className="relative z-10">
            <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
              <Utensils size={24} />
            </div>
            <h2 className="text-xl font-bold mb-1">Hungry?</h2>
            <p className="text-purple-100 text-sm mb-4">Order meals or manage your diet plan.</p>
            <div className="flex items-center gap-2 text-sm font-medium">
              Browse Menu <ArrowRight size={16} />
            </div>
          </div>
          <Utensils className="absolute -bottom-4 -right-4 text-white opacity-10" size={120} />
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('laundry')}
            className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-5 text-white shadow-xl shadow-slate-200 relative overflow-hidden cursor-pointer"
          >
            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm border border-white/10">
              <Shirt size={20} />
            </div>
            <h3 className="text-lg font-bold">Laundry</h3>
            <p className="text-gray-300 text-xs mt-1">Pickup & Delivery</p>
             <Shirt className="absolute -bottom-2 -right-2 text-white opacity-10" size={80} />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('water')}
            className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 text-white shadow-xl shadow-blue-200 relative overflow-hidden cursor-pointer"
          >
            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm border border-white/10">
              <Droplets size={20} />
            </div>
            <h3 className="text-lg font-bold">Water</h3>
            <p className="text-blue-100 text-xs mt-1">Refills & Cans</p>
            <Droplets className="absolute -bottom-2 -right-2 text-white opacity-10" size={80} />
          </motion.div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                        <Shirt size={18} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">Laundry Pickup</h4>
                        <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">Done</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-200">
                        <Utensils size={18} />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">Today's Basic Meal</h4>
                        <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500">₹60</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
