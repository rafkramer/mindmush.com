import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { VENTURE_STATES, type VentureState, type VentureType } from '../../../utils/platform/constants';
import { getUsers } from '../../../utils/platform/storage';
import type { Venture, User, VenturePartner } from '../../../utils/platform/types';

interface EditVentureModalProps {
  isOpen: boolean;
  onClose: () => void;
  venture: Venture | null;
  onSave: (updates: Partial<Venture>) => void;
  onDelete: () => void;
}

export function EditVentureModal({ isOpen, onClose, venture, onSave, onDelete }: EditVentureModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<VentureType>('app');
  const [state, setState] = useState<VentureState>('building');
  const [revenue, setRevenue] = useState('0');
  const [studioEquity, setStudioEquity] = useState('100');
  const [bundleId, setBundleId] = useState('');
  const [superwallKey, setSuperwallKey] = useState('');
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [partnerAssignments, setPartnerAssignments] = useState<Record<number, { assigned: boolean; equity: number }>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const users = getUsers().filter(u => u.role === 'partner');

  useEffect(() => {
    if (venture) {
      setName(venture.name);
      setType(venture.type);
      setState(venture.state);
      setRevenue(String(venture.revenue || 0));
      setStudioEquity(String(venture.studioEquity || 100));
      setBundleId(venture.bundleId || '');
      setSuperwallKey(venture.superwallKey || '');
      setIconPreview(venture.icon || null);

      // Set partner assignments
      const assignments: Record<number, { assigned: boolean; equity: number }> = {};
      users.forEach(user => {
        const partner = venture.partners?.find(p => p.userId === user.id);
        assignments[user.id] = {
          assigned: !!partner,
          equity: partner?.equity || 0,
        };
      });
      setPartnerAssignments(assignments);
    }
  }, [venture]);

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

    const partners: VenturePartner[] = Object.entries(partnerAssignments)
      .filter(([_, data]) => data.assigned)
      .map(([userId, data]) => ({
        userId: parseInt(userId),
        equity: data.equity,
      }));

    onSave({
      name: name.trim(),
      type,
      state,
      revenue: parseFloat(revenue) || 0,
      studioEquity: Math.min(100, Math.max(0, parseFloat(studioEquity) || 100)),
      bundleId: type === 'game' ? bundleId : '',
      superwallKey: type === 'app' ? superwallKey : '',
      icon: iconPreview,
      partners,
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this venture?')) {
      onDelete();
      onClose();
    }
  };

  if (!venture) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Venture" size="lg">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159" />
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

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            value={type}
            onChange={(e) => setType(e.target.value as VentureType)}
            options={[
              { value: 'app', label: 'Consumer App' },
              { value: 'game', label: 'Mobile Game' },
            ]}
          />
          <Select
            label="State"
            value={state}
            onChange={(e) => setState(e.target.value as VentureState)}
            options={VENTURE_STATES.map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Revenue"
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
            type="password"
            value={superwallKey}
            onChange={(e) => setSuperwallKey(e.target.value)}
            placeholder="Enter Superwall API key"
          />
        )}

        {/* Partner Assignment */}
        {users.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-white/70">Partner Equity</label>
            <div className="space-y-2 p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
              {users.map(user => (
                <div key={user.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={partnerAssignments[user.id]?.assigned || false}
                    onChange={(e) => setPartnerAssignments(prev => ({
                      ...prev,
                      [user.id]: { ...prev[user.id], assigned: e.target.checked },
                    }))}
                    className="w-4 h-4 rounded bg-white/[0.05] border-white/[0.2]"
                  />
                  <span className="flex-1 text-sm text-white">{user.username}</span>
                  <input
                    type="number"
                    value={partnerAssignments[user.id]?.equity || 0}
                    onChange={(e) => setPartnerAssignments(prev => ({
                      ...prev,
                      [user.id]: { ...prev[user.id], equity: parseFloat(e.target.value) || 0 },
                    }))}
                    min="0"
                    max="100"
                    className="w-20 px-3 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-lg text-sm text-white text-right"
                    disabled={!partnerAssignments[user.id]?.assigned}
                  />
                  <span className="text-sm text-white/40">%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
          <div className="flex-1" />
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
