import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Battery, TrendingUp, Calendar, Clock, Leaf, Zap } from 'lucide-react';
import { useSettings } from '../SettingsContext';
import { subscribeToLiveReadings, fetchLatest, type LiveReading } from '../../utils/liveApi';
import { fetchSummary, fetchHistory } from '../../utils/apiClient';

type EnergyPoint = { date: string; energy: number; renewable: number };

const periodKeyToBackend = (key: string) => {
  switch (key) {
    case 'weekly': return 'week';
    case 'monthly': return 'month';
    case 'yearly': return 'year';
    default: return 'month';
  }
};

export default function EnergyPage() {
  const { translate } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [liveEnergy, setLiveEnergy] = useState<number>(0);
  const [summary, setSummary] = useState<any | null>(null);
  const [energyData, setEnergyData] = useState<EnergyPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch latest live reading for header metric
  useEffect(() => {
    let unsub = () => {};
    fetchLatest().then(r => {
      const reading = (r as any)?.reading as LiveReading | undefined;
      if (reading && typeof reading.energy_kwh === 'number') {
        setLiveEnergy(reading.energy_kwh);
      } else if (reading && typeof reading.total_energy_kwh === 'number') {
        setLiveEnergy(reading.total_energy_kwh);
      }
    }).catch(() => {});
    unsub = subscribeToLiveReadings(lr => {
      if (typeof lr.energy_kwh === 'number') setLiveEnergy(lr.energy_kwh);
      else if (typeof lr.total_energy_kwh === 'number') setLiveEnergy(lr.total_energy_kwh);
    });
    return () => unsub();
  }, []);

  const buildEnergyBuckets = useCallback((history: any[], renewableShare: number): EnergyPoint[] => {
    if (!Array.isArray(history) || !history.length) return [];
    // Determine grouping granularity based on selectedPeriod
    if (selectedPeriod === 'yearly') {
      // Group by month
      const byMonth: Record<string, number> = {};
      history.forEach(p => {
        const ts = Number(p.timestamp);
        if (!ts) return;
        const d = new Date(ts * 1000);
        const key = d.getFullYear() + '-' + d.getMonth();
        byMonth[key] = (byMonth[key] || 0) + (Number(p.energyKwh) || 0);
      });
      return Object.entries(byMonth)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, energy]) => {
          const [, monthIdxStr] = key.split('-');
          const monthIdx = Number(monthIdxStr);
          const dateLabel = new Date(2000, monthIdx, 1).toLocaleDateString('en-US', { month: 'short' });
          return { date: dateLabel, energy: Number(energy.toFixed(3)), renewable: Number((energy * renewableShare / 100).toFixed(3)) };
        });
    }
    // Weekly / Monthly: group by calendar day
    const byDay: Record<string, number> = {};
    history.forEach(p => {
      const ts = Number(p.timestamp);
      if (!ts) return;
      const d = new Date(ts * 1000);
      const key = d.toISOString().split('T')[0];
      byDay[key] = (byDay[key] || 0) + (Number(p.energyKwh) || 0);
    });
    return Object.entries(byDay)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, energy]) => ({
        date: key,
        energy: Number(energy.toFixed(3)),
        renewable: Number((energy * renewableShare / 100).toFixed(3)),
      }));
  }, [selectedPeriod]);

  // Fetch summary + history whenever period changes
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true); setError(null);
      try {
        const backendPeriod = periodKeyToBackend(selectedPeriod);
        const summaryResp = await fetchSummary({ period: backendPeriod });
        const historyResp = await fetchHistory({ period: backendPeriod, interval_seconds: 3600 });
        if (cancelled) return;
        const s = (summaryResp as any).summary;
        setSummary(s);
        const points = (historyResp as any)?.points || [];
        const buckets = buildEnergyBuckets(points, s?.renewableShare ?? 0);
        setEnergyData(buckets);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load energy data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [selectedPeriod, buildEnergyBuckets]);

  const periods = [
    { key: 'weekly', label: 'Weekly', icon: Calendar },
    { key: 'monthly', label: 'Monthly', icon: Calendar },
    { key: 'yearly', label: 'Yearly', icon: Calendar }
  ];

  const totalEnergy = summary?.totals?.energy_kwh ?? 0;
  const offPeakPct = summary?.energySplit?.offPeak ?? 0;
  const renewablePct = summary?.renewableShare ?? 0;
  const dailyPeakEnergy = energyData.length ? Math.max(...energyData.map(d => d.energy)) : 0;

  const stats = [
    {
      label: 'Current Energy',
      value: (liveEnergy || totalEnergy).toFixed(2),
      unit: 'kWh',
      icon: Battery,
      color: 'from-orange-500 to-red-500',
      change: ''
    },
    {
      label: 'Daily Peak',
      value: dailyPeakEnergy.toFixed(2),
      unit: 'kWh',
      icon: TrendingUp,
      color: 'from-red-500 to-pink-500',
      change: ''
    },
    {
      label: 'Off-Peak Usage',
      value: (totalEnergy * offPeakPct / 100).toFixed(2),
      unit: 'kWh',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500',
      change: ''
    },
    {
      label: 'Renewable %',
      value: renewablePct.toFixed(2),
      unit: '%',
      icon: Leaf,
      color: 'from-green-500 to-emerald-500',
      change: ''
    }
  ];

  const efficiencyScore = summary?.efficiencyScore ?? 0;
  const energyEfficiency = {
    current: efficiencyScore,
    target: Math.min(100, efficiencyScore + 10),
    improvement:  Math.max(0, Math.min(100, efficiencyScore + 10) - efficiencyScore)
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <Battery className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-medium text-white">Energy Management</h1>
            <p className="text-gray-400">Period energy: {totalEnergy.toLocaleString(undefined,{maximumFractionDigits:2})} kWh</p>
          </div>
        </div>
        
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 20px rgba(249, 115, 22, 0.3)',
              '0 0 40px rgba(249, 115, 22, 0.6)',
              '0 0 20px rgba(249, 115, 22, 0.3)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="px-4 py-2 bg-orange-500/20 rounded-lg border border-orange-500/30"
        >
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-400" />
            <span className="text-orange-400 font-medium">{(liveEnergy || totalEnergy).toFixed(2)} kWh</span>
          </div>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change.startsWith('+');
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700 relative overflow-hidden"
            >
              {/* Animated Energy Flow */}
              <motion.div
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent"
              />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.label}</h3>
                  <div className="flex items-baseline space-x-2">
                    <motion.span
                      key={stat.value}
                      animate={{ opacity: [1, 0.7, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-2xl font-medium text-white"
                    >
                      {stat.value}
                    </motion.span>
                    <span className="text-gray-400 text-sm">{stat.unit}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Period Controls & Efficiency */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Period Selector */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white text-lg font-medium mb-4">Time Period</h3>
            <div className="space-y-3">
              {periods.map((period) => {
                const Icon = period.icon;
                return (
                  <motion.button
                    key={period.key}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPeriod(period.key)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      selectedPeriod === period.key
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                        : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{period.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Energy Efficiency */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700">
            <h3 className="text-white text-lg font-medium mb-4">Efficiency Score</h3>
            <div className="space-y-4">
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${energyEfficiency.current}%` }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>Current: {energyEfficiency.current}%</span>
                  <span>Target: {energyEfficiency.target}%</span>
                </div>
              </div>
              
              <motion.div
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-center p-3 bg-green-500/20 rounded-lg border border-green-500/30"
              >
                <Leaf className="w-6 h-6 text-green-400 mx-auto mb-1" />
                <p className="text-green-400 text-sm">
                  +{energyEfficiency.improvement}% improvement
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Energy Consumption Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white text-lg font-medium">
              Energy Consumption - {periods.find(p => p.key === selectedPeriod)?.label}
            </h3>
              <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full" />
                <span className="text-gray-400 text-sm">Total Energy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-gray-400 text-sm">Renewable</span>
              </div>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="renewableGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af" 
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="energy"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="url(#energyGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="renewable"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#renewableGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      {loading && (
        <div className="text-center text-sm text-gray-400">Loading energy data...</div>
      )}
      {error && (
        <div className="text-center text-sm text-red-400">{error}</div>
      )}
    </motion.div>
  );
}