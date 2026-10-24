import React, { useState } from 'react';
import { AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function FraudManager() {
  const [alerts] = useState([
    { id: 'FRD-109', user: 'TechFreight SME', type: 'Suspicious IP Login', severity: 'High', status: 'Under Automated Review', date: '2026-10-24' },
    { id: 'FRD-110', user: 'Pacific Blue Shipping', type: 'Payment Discrepancy', severity: 'Medium', status: 'Resolved', date: '2026-10-23' },
    { id: 'FRD-111', user: 'Global Logistics Hub', type: 'Certificate Hash Mismatch', severity: 'Low', status: 'Resolved', date: '2026-10-21' },
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-800 border border-red-200">
              🛡️ AI Risk & Anomaly Sentinel
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Fraud Detection & Monitoring</h1>
          <p className="text-slate-500 mt-1">Supervisory telemetry and audit trails for security alerts, KYC anomalies, and payment verification.</p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-red-600" />
          <span>Audit Only (No Edit/Delete)</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <th className="p-4 pl-6">Alert ID</th>
              <th className="p-4">Entity / User</th>
              <th className="p-4">Anomaly Type</th>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Risk Severity</th>
              <th className="p-4 pr-6 text-right">System Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {alerts.map(a => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6 font-mono font-bold text-slate-900">{a.id}</td>
                <td className="p-4 font-bold text-slate-800">{a.user}</td>
                <td className="p-4 text-slate-600">{a.type}</td>
                <td className="p-4 text-slate-500 text-xs font-mono">{a.date}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold 
                    ${a.severity === 'High' || a.severity === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' : 
                      a.severity === 'Medium' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                    {a.severity}
                  </span>
                </td>
                <td className="p-4 pr-6 text-right">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold 
                    ${a.status === 'Resolved' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                    {a.status === 'Resolved' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    <span>{a.status}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
