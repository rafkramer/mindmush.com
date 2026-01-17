import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { StateBadge, TypeBadge } from '../ui/Badge';
import { formatCurrency } from '../../../utils/platform/format';
import { getSettings } from '../../../utils/platform/storage';
import { VENTURE_STATES, type VentureState } from '../../../utils/platform/constants';
import type { Venture } from '../../../utils/platform/types';

interface VenturesPageProps {
  ventures: Venture[];
  onViewVenture: (id: string) => void;
  onAddVenture: () => void;
}

export function VenturesPage({
  ventures,
  onViewVenture,
  onAddVenture,
}: VenturesPageProps) {
  const [stateFilter, setStateFilter] = useState<VentureState | 'all'>('all');
  const settings = getSettings();

  const filteredVentures = stateFilter === 'all'
    ? ventures
    : ventures.filter(v => v.state === stateFilter);

  const getApiStatus = (venture: Venture) => {
    if (venture.state === 'building' || venture.state === 'killed') {
      return { status: 'disabled', text: 'API disabled' };
    }
    if (venture.type === 'game') {
      if (venture.bundleId && settings.applovinApiKey) {
        return { status: 'connected', text: 'AppLovin' };
      }
      return { status: 'disconnected', text: 'Not configured' };
    }
    if (venture.superwallKey) {
      return { status: 'connected', text: 'Superwall' };
    }
    return { status: 'disconnected', text: 'Not configured' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Ventures</h1>
          <p className="text-white/40 text-sm mt-1">Manage your portfolio</p>
        </div>
        <Button variant="primary" onClick={onAddVenture}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Venture
        </Button>
      </div>

      {/* State Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStateFilter('all')}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
            stateFilter === 'all'
              ? 'bg-white text-[#0a0a0b]'
              : 'text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
          }`}
        >
          All
        </button>
        {VENTURE_STATES.map(state => (
          <button
            key={state}
            onClick={() => setStateFilter(state)}
            className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
              stateFilter === state
                ? 'bg-white text-[#0a0a0b]'
                : 'text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
            }`}
          >
            {state.charAt(0).toUpperCase() + state.slice(1)}
          </button>
        ))}
      </div>

      {/* Ventures Grid */}
      {filteredVentures.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-white/40">No ventures found. Add your first venture to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVentures.map((venture, i) => {
            const ventureExpenses = (venture.expenses || [])
              .reduce((sum, e) => sum + e.amount, 0);
            const profit = (venture.revenue || 0) - ventureExpenses;
            const api = getApiStatus(venture);

            return (
              <motion.div
                key={venture.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  hover
                  className="cursor-pointer"
                  onClick={() => onViewVenture(venture.id)}
                  glow={venture.type === 'game' ? 'orange' : 'blue'}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg ${
                      venture.type === 'game' ? 'bg-orange-500/10 shadow-orange-500/10' : 'bg-blue-500/10 shadow-blue-500/10'
                    }`}>
                      {venture.icon ? (
                        <img src={venture.icon} alt={venture.name} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <svg className={`w-7 h-7 ${venture.type === 'game' ? 'text-orange-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959' : 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3'} />
                        </svg>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <StateBadge state={venture.state} />
                      <TypeBadge type={venture.type} />
                    </div>
                  </div>

                  {/* Name & Equity */}
                  <h3 className="text-lg font-semibold text-white mb-0.5">{venture.name}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-white/40">
                      {venture.studioEquity}% studio equity
                    </span>
                    {venture.partners.length > 0 && (
                      <span className="text-xs text-white/30">
                        • {venture.partners.length} partner{venture.partners.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* API Status */}
                  <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium mb-4 ${
                    api.status === 'connected' ? 'bg-green-500/10 text-green-400' :
                    api.status === 'disconnected' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/[0.03] text-white/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      api.status === 'connected' ? 'bg-green-400' :
                      api.status === 'disconnected' ? 'bg-amber-400' : 'bg-white/30'
                    }`} />
                    {api.text}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Revenue</p>
                      <p className="text-xl font-semibold text-white" style={{ fontFamily: 'Space Grotesk, monospace' }}>
                        {formatCurrency(venture.revenue || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Profit</p>
                      <p className={`text-xl font-semibold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'Space Grotesk, monospace' }}>
                        {formatCurrency(profit)}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
