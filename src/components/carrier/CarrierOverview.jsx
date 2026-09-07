import React, { useState, useEffect } from 'react';
import { Ship, PlusCircle, TrendingUp, Package, Anchor, DollarSign, Activity, Loader2 } from 'lucide-react';

export default function CarrierOverview() {
  const [recentPostings, setRecentPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/spaces');
      const data = await res.json();
      if (data.status === 'success') {
        // Show last 3 spaces
        setRecentPostings(data.data.slice(-3).reverse());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Carrier Dashboard</h1>
          <p className="text-slate-500 mt-2">Overview of your container space and booking requests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[ 
          { label: 'Total Revenue (MTD)', value: '₹124,500', icon: DollarSign, trend: '+14%' },
          { label: 'Active Voyages', value: '8', icon: Anchor, trend: 'Stable' },
          { label: 'Pending Requests', value: '12', icon: Activity, trend: '+2' },
          { label: 'Space Utilization', value: '92%', icon: Package, trend: '+5%' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">{stat.trend}</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      

    </div>
  );
}
