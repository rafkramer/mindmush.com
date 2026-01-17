import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import type { User } from '../../../utils/platform/types';

interface EditPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updates: Partial<User>) => void;
  onDelete: () => void;
}

export function EditPartnerModal({ isOpen, onClose, user, onSave, onDelete }: EditPartnerModalProps) {
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'partner'>('partner');
  const [contract, setContract] = useState('');

  useEffect(() => {
    if (user) {
      setPassword('');
      setRole(user.role);
      setContract(user.contract || '');
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<User> = {
      role,
      contract: contract.trim() || undefined,
    };

    if (password) {
      updates.password = password;
    }

    onSave(updates);
    onClose();
  };

  const handleDelete = () => {
    if (user?.username === 'admin') {
      alert('Cannot delete the admin account');
      return;
    }
    if (confirm('Are you sure you want to delete this partner? They will lose access to all ventures.')) {
      onDelete();
      onClose();
    }
  };

  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${user.username}`} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          value={user.username}
          disabled
          className="opacity-50"
        />

        <Input
          label="New Password (leave blank to keep current)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter new password"
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
          label="Contract Terms"
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          placeholder="Enter any additional contract terms..."
          rows={4}
        />

        <div className="flex gap-3 pt-2">
          {user.username !== 'admin' && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          )}
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
