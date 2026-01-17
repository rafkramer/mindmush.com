import { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { VENTURE_STATES, type VentureState, type VentureType } from '../../../utils/platform/constants';

interface AddVentureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (venture: {
    name: string;
    type: VentureType;
    state: VentureState;
    revenue: number;
    studioEquity: number;
    bundleId?: string;
    superwallKey?: string;
    icon?: string | null;
  }) => void;
}

export function AddVentureModal({ isOpen, onClose, onAdd }: AddVentureModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<VentureType>('app');
  const [state, setState] = useState<VentureState>('building');
  const [revenue, setRevenue] = useState('0');
  const [studioEquity, setStudioEquity] = useState('100');
  const [bundleId, setBundleId] = useState('');
  const [superwallKey, setSuperwallKey] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      type,
      state,
      revenue: parseFloat(revenue) || 0,
      studioEquity: Math.min(100, Math.max(0, parseFloat(studioEquity) || 100)),
      bundleId: type === 'game' ? bundleId : undefined,
      superwallKey: type === 'app' ? superwallKey : undefined,
      icon: iconPreview,
    });

    // Reset form
    setName('');
    setType('app');
    setState('building');
    setRevenue('0');
    setStudioEquity('100');
    setBundleId('');
    setSuperwallKey('');
    setIconPreview(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Venture" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Icon Upload */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-20 h-20 rounded-2xl border-2 border-dashed border-white/[0.1] hover:border-white/[0.2] transition-colors flex items-center justify-center overflow-hidden ${
              iconPreview ? 'border-solid' : ''
            }`}
          >
            {iconPreview ? (
              <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleIconChange}
            className="hidden"
          />
        </div>

        <Input
          label="Venture Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter venture name"
          required
        />

        {/* Type Selection */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-white/70">Type</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType('app')}
              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                type === 'app'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15]'
              }`}
            >
              Consumer App
            </button>
            <button
              type="button"
              onClick={() => setType('game')}
              className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                type === 'game'
                  ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                  : 'bg-white/[0.02] border-white/[0.08] text-white/50 hover:text-white hover:border-white/[0.15]'
              }`}
            >
              Mobile Game
            </button>
          </div>
        </div>

        <Select
          label="State"
          value={state}
          onChange={(e) => setState(e.target.value as VentureState)}
          options={VENTURE_STATES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Initial Revenue"
            type="number"
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
            placeholder="0"
          />
          <Input
            label="Studio Equity %"
            type="number"
            value={studioEquity}
            onChange={(e) => setStudioEquity(e.target.value)}
            placeholder="100"
          />
        </div>

        {/* API Key Fields */}
        {type === 'game' ? (
          <Input
            label="Bundle ID (AppLovin)"
            value={bundleId}
            onChange={(e) => setBundleId(e.target.value)}
            placeholder="com.example.game"
          />
        ) : (
          <Input
            label="Superwall API Key"
            value={superwallKey}
            onChange={(e) => setSuperwallKey(e.target.value)}
            placeholder="Enter Superwall API key"
          />
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Add Venture
          </Button>
        </div>
      </form>
    </Modal>
  );
}
