import React, { useState } from 'react';
import { Droplets, ThermometerSnowflake, ThermometerSun, ShoppingCart, Calendar, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const WaterService: React.FC = () => {
  const [activeTab, setActiveTab] = useState('order');
  const [cart, setCart] = useState<{id: string, qty: number}[]>([]);

  const products = [
    {
      id: 'chilled-can',
      name: 'Chilled Water Container',
      size: '20 Liters',
      temp: 'Chilled (5°C)',
      price: 80,
      image: 'https://images.unsplash.com/photo-1624392294437-8fc9f876f4d3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGNvb2xlciUyMGRlbGl2ZXJ5JTIwYm90dGxlfGVufDF8fHx8MTc3MDM1ODYwNnww&ixlib=rb-4.1.0&q=80&w=1080',
      icon: ThermometerSnowflake,
      color: 'text-blue-500'
    },
    {
      id: 'normal-can',
      name: 'Regular Water Container',
      size: '20 Liters',
      temp: 'Room Temp',
      price: 40,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMGJvdHRsZXxlbnwwfHx8fDE3NzUzNTg2MDY&ixlib=rb-4.1.0&q=80&w=1080',
      icon: Droplets,
      color: 'text-teal-500'
    },
    {
      id: 'hot-flask',
      name: 'Insulated Hot Water',
      size: '5 Liters',
      temp: 'Hot (80°C)',
      price: 130,
      image: 'https://images.unsplash.com/photo-1596788069502-3c824c96e6d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVybW9zfGVufDB8fHx8MTc3NTM1ODYwNg&ixlib=rb-4.1.0&q=80&w=1080',
      icon: ThermometerSun,
      color: 'text-orange-500'
    }
  ];

  const frequencies = [
    { id: 'daily', label: 'Daily', discount: '10%' },
    { id: 'alternate', label: 'Every 2 Days', discount: '5%' },
    { id: 'weekly', label: 'Weekly', discount: '0%' },
  ];

  const addToCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { id, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === id);
      if (existing && existing.qty > 1) {
        return prev.map(item => item.id === id ? { ...item, qty: item.qty - 1 } : item);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const getQty = (id: string) => cart.find(item => item.id === id)?.qty || 0;
  const total = cart.reduce((sum, item) => {
    const product = products.find(p => p.id === item.id);
    return sum + (product ? product.price * item.qty : 0);
  }, 0);

  return (
    <div className="pb-28 bg-gray-50 min-h-screen">
      <header className="bg-gradient-to-r from-purple-800 to-slate-800 p-6 pb-12 text-white sticky top-0 z-10 shadow-md">
        <h1 className="text-2xl font-bold">Water Supply</h1>
        <p className="text-purple-200 text-sm">Hydration delivered to your door.</p>
      </header>

      <div className="-mt-6 px-4 relative z-20">
        <div className="bg-white rounded-xl shadow-md p-1 flex mb-6 border border-gray-200">
          <button
            onClick={() => setActiveTab('order')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === 'order' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            One-time Order
          </button>
          <button
            onClick={() => setActiveTab('subscribe')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'subscribe' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar size={14} />
            Subscriptions
          </button>
        </div>

        {activeTab === 'order' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 flex gap-4">
                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                   <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 leading-tight">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <product.icon size={14} className={product.color} />
                      <span className="text-xs text-gray-500">{product.temp}</span>
                    </div>
                    <span className="text-xs text-gray-400 block mt-0.5">{product.size}</span>
                  </div>
                  
                  <div className="flex justify-between items-end mt-2">
                    <span className="font-bold text-lg text-purple-700">₹{product.price}</span>
                    
                    {getQty(product.id) === 0 ? (
                      <button
                        onClick={() => addToCart(product.id)}
                        className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700 transition-colors shadow-sm"
                      >
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1 border border-gray-200">
                        <button onClick={() => removeFromCart(product.id)} className="text-gray-500 font-bold px-1 hover:text-gray-700">-</button>
                        <span className="font-bold text-sm w-4 text-center">{getQty(product.id)}</span>
                        <button onClick={() => addToCart(product.id)} className="text-purple-700 font-bold px-1 hover:text-purple-800">+</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subscribe' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-slate-100 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-2">Why Subscribe?</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Never run out of water</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Flexible delivery schedule</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-green-500" />
                  <span>Pay monthly, cancel anytime</span>
                </div>
              </div>
            </div>

            <h3 className="font-bold text-gray-800">Choose a Plan</h3>
            
            {products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
              >
                <div className="h-32 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-4">
                    <h3 className="text-white font-bold">{product.name}</h3>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {frequencies.map((freq) => (
                      <button 
                        key={freq.id}
                        className="border border-gray-200 rounded-lg p-2 text-center hover:border-purple-500 hover:bg-purple-50 transition-colors group bg-gray-50"
                      >
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide group-hover:text-purple-600 font-medium">{freq.label}</div>
                      </button>
                    ))}
                  </div>
                  <button className="w-full bg-purple-600 text-white py-2.5 rounded-lg font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                    Subscribe
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {activeTab === 'order' && total > 0 && (
        <div className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center z-40 animate-in slide-in-from-bottom-4 border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2 rounded-full shadow-lg shadow-purple-900/50">
              <ShoppingCart size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total</p>
              <p className="font-bold text-lg">₹{total}</p>
            </div>
          </div>
          <button className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/50">
            Checkout
          </button>
        </div>
      )}
    </div>
  );
};
