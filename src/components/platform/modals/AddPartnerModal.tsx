import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (partner: {
    username: string;
    password: string;
    role: 'admin' | 'partner';
    contract?: string;
  }) => boolean;
}

export function AddPartnerModal({ isOpen, onClose, onAdd }: AddPartnerModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'partner'>('partner');
  const [contract, setContract] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    const success = onAdd({
      username: username.trim(),
      password,
      role,
      contract: contract.trim() || undefined,
    });

    if (success) {
      setUsername('');
      setPassword('');
      setRole('partner');
      setContract('');
      onClose();
    } else {
      setError('Username already exists');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Partner" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          required
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          required
        />

        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'partner')}
          options={[
            { value: 'partner', label: 'Partner' },
            { value: 'admin', label: 'Admin' },
          ]}
        />

        <Textarea
          label="Contract Terms (Optional)"
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          placeholder="Enter any additional contract terms..."
          rows={4}
        />

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Add Partner
          </Button>
        </div>
      </form>
    </Modal>
  );
}
