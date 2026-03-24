import React, { useState } from 'react';
import { Shirt, Truck, Clock, Crown, Check, Layers } from 'lucide-react';
import { motion } from 'motion/react';

export const LaundryService: React.FC = () => {
  const [activeTab, setActiveTab] = useState('new');
  
  const services = [
    {
      id: 'wash-fold',
      title: 'Wash & Fold',
      price: '₹25 / pair',
      desc: 'Everyday clothes',
      icon: Shirt,
      color: 'bg-purple-100 text-purple-600'
    },
    {
        id: 'extra',
        title: 'Extra Items',
        price: '',
        desc: 'Bedsheet, Blanket, etc.',
        icon: Layers,
        color: 'bg-slate-100 text-slate-600'
    },
    {
      id: 'dry-clean',
      title: 'Dry Cleaning',
      price: '₹120 / item',
      desc: 'Suits, dresses, delicate fabrics',
      icon: Truck, 
      color: 'bg-gray-100 text-gray-800'
    },
  ];

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-purple-800 to-slate-800 p-6 pb-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">Laundry Service</h1>
          <p className="text-purple-200 text-sm">We pick up, wash, and deliver.</p>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-600/30 rounded-full -ml-10 -mb-10 blur-xl"></div>
      </header>

      <div className="-mt-6 px-4 relative z-20">
        <div className="bg-white rounded-xl shadow-md p-1 flex mb-6 border border-gray-200">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'new' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            New Order
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'active' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'plans' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Crown size={14} className={activeTab === 'plans' ? 'fill-purple-700' : ''} />
            Plans
          </button>
        </div>

        {activeTab === 'new' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <h3 className="font-semibold text-gray-700 ml-1">Select Service</h3>
            <div className="grid gap-4">
              {services.map((service) => (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={service.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4 text-left hover:border-purple-300 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${service.color}`}>
                    <service.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{service.title}</h4>
                    <p className="text-xs text-gray-500">{service.desc}</p>
                  </div>
                  <span className="font-semibold text-purple-700 text-sm">{service.price}</span>
                </motion.button>
              ))}
            </div>

            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-4 rounded-xl mt-6 border border-slate-600 text-white shadow-lg">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500 p-2 rounded-full shadow-sm text-white">
                  <Clock size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Schedule Pickup</h4>
                  <p className="text-xs text-gray-300 mt-1">Next available slot: Today, 2:00 PM</p>
                  <button className="mt-3 text-xs font-bold bg-purple-500 text-white px-3 py-1.5 rounded-md hover:bg-purple-400 transition-colors shadow-sm">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'active' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-gray-400">ORDER #4921</span>
                <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">In Progress</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-8 bg-green-200"></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">Picked Up</h5>
                    <p className="text-xs text-gray-500">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                    <div className="w-0.5 h-8 bg-gray-100"></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-800">Washing</h5>
                    <p className="text-xs text-gray-500">Currently washing...</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-gray-400">Delivery</h5>
                    <p className="text-xs text-gray-400">Estimated: Tomorrow, 9:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
              <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500 opacity-20 rounded-full -mr-10 -mt-10 blur-xl"></div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">Most Popular</span>
                  <h3 className="text-2xl font-bold mt-2 text-white">Student Saver</h3>
                  <p className="text-gray-300 text-sm">Monthly Laundry Subscription</p>
                </div>
                <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm border border-white/10">
                    <Crown size={28} className="text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              
              <div className="mb-6 relative z-10">
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">₹249</span>
                    <span className="text-gray-300 text-sm font-medium">/ month</span>
                </div>
              </div>
              
              <div className="space-y-3 mb-8 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><Check size={12} className="text-green-400" /></div>
                  <span className="text-sm font-medium text-gray-200">12 Pairs of clothes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><Check size={12} className="text-green-400" /></div>
                  <span className="text-sm font-medium text-gray-200">Wash & Fold Service</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><Check size={12} className="text-green-400" /></div>
                  <span className="text-sm font-medium text-gray-200">Schedule pickups anytime</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-1 rounded-full"><Check size={12} className="text-green-400" /></div>
                  <span className="text-sm font-medium text-gray-200">Premium detergent</span>
                </div>
              </div>
              
              <button className="w-full bg-white text-purple-900 font-bold py-3.5 rounded-xl hover:bg-gray-100 transition-colors shadow-lg relative z-10">
                Subscribe Now
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 text-sm mb-2">How it works</h4>
                <div className="flex gap-3 text-xs text-gray-600">
                    <div className="flex-1 text-center">
                        <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600 font-bold border border-slate-200">1</div>
                        Subscribe
                    </div>
                    <div className="flex-1 text-center">
                        <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600 font-bold border border-slate-200">2</div>
                        Schedule
                    </div>
                    <div className="flex-1 text-center">
                        <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-600 font-bold border border-slate-200">3</div>
                        Relax
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
