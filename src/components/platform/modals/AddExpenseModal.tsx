import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { EXPENSE_CATEGORIES, type ExpenseCategory } from '../../../utils/platform/constants';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'venture' | 'studio';
  onAdd: (description: string, amount: number, category?: ExpenseCategory) => void;
}

export function AddExpenseModal({ isOpen, onClose, type, onAdd }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('operations');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);

    if (!description.trim() || !amountNum || amountNum <= 0) {
      return;
    }

    onAdd(description.trim(), amountNum, type === 'studio' ? category : undefined);

    setDescription('');
    setAmount('');
    setCategory('operations');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={type === 'studio' ? 'Add Studio Expense' : 'Add Expense'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What was this expense for?"
          required
        />

        {type === 'studio' && (
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            options={EXPENSE_CATEGORIES.map(c => ({
              value: c,
              label: c.charAt(0).toUpperCase() + c.slice(1),
            }))}
          />
        )}

        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
