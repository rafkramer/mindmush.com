import { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Textarea, Select } from '../ui/Input';
import { IDEA_CATEGORIES, IDEA_CATEGORY_CONFIG, IDEA_STATUSES, IDEA_STATUS_CONFIG } from '../../../utils/platform/constants';
import { compressImage } from '../../../utils/platform/storage';
import type { Idea, IdeaCategory, Venture } from '../../../utils/platform/types';
import type { IdeaStatus } from '../../../utils/platform/constants';

interface AddIdeaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id' | 'createdAt'>) => void;
  ventures: Venture[];
  initialCategory?: IdeaCategory;
  editingIdea?: Idea | null;
}

export function AddIdeaModal({
  isOpen,
  onClose,
  onSave,
  ventures,
  initialCategory = 'idea',
  editingIdea,
}: AddIdeaModalProps) {
  const [category, setCategory] = useState<IdeaCategory>(initialCategory);
  const [status, setStatus] = useState<IdeaStatus>('brainstorm');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [tagsInput, setTagsInput] = useState('');
  const [ventureId, setVentureId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or editing changes
  useEffect(() => {
    if (isOpen) {
      if (editingIdea) {
        setCategory(editingIdea.category);
        setStatus(editingIdea.status);
        setTitle(editingIdea.title);
        setDescription(editingIdea.description || '');
        setUrl(editingIdea.url || '');
        setImage(editingIdea.image);
        setTagsInput(editingIdea.tags.join(', '));
        setVentureId(editingIdea.ventureId || '');
      } else {
        setCategory(initialCategory);
        setStatus('brainstorm');
        setTitle('');
        setDescription('');
        setUrl('');
        setImage(undefined);
        setTagsInput('');
        setVentureId('');
      }
    }
  }, [isOpen, editingIdea, initialCategory]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const compressed = await compressImage(file, 400, 0.7);
      setImage(compressed);
    } catch (err) {
      console.error('Failed to compress image:', err);
    }
    setIsLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    onSave({
      category,
      status,
      title: title.trim(),
      description: description.trim() || undefined,
      url: url.trim() || undefined,
      image,
      tags,
      ventureId: ventureId || undefined,
    });

    onClose();
  };

  const categoryConfig = IDEA_CATEGORY_CONFIG[category];

  const ventureOptions = [
    { value: '', label: 'No venture linked' },
    ...ventures.map(v => ({ value: v.id, label: v.name })),
  ];

  const getCategoryLabel = () => {
    switch (category) {
      case 'idea': return 'App Idea';
      case 'competitor': return 'Competitor';
      case 'inspiration': return 'Design Inspiration';
      case 'niche': return 'Niche';
      default: return 'Idea';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingIdea ? `Edit ${getCategoryLabel()}` : `Add ${getCategoryLabel()}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category selector */}
        <div className="flex gap-2 flex-wrap">
          {IDEA_CATEGORIES.map((cat) => {
            const config = IDEA_CATEGORY_CONFIG[cat];
            const isActive = category === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'text-white'
                    : 'text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
                }`}
                style={isActive ? { backgroundColor: config.bg, color: config.color } : {}}
              >
                <span>{config.icon}</span>
                <span>{config.label.slice(0, -1)}</span>
              </button>
            );
          })}
        </div>

        {/* Image upload */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className={`w-full h-24 rounded-xl border-2 border-dashed transition-colors flex items-center justify-center overflow-hidden ${
              image
                ? 'border-solid border-white/[0.1]'
                : 'border-white/[0.1] hover:border-white/[0.2]'
            }`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            ) : image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <svg className="w-6 h-6 mx-auto text-white/30 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <span className="text-xs text-white/40">Add image (optional)</span>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {image && (
          <button
            type="button"
            onClick={() => setImage(undefined)}
            className="w-full text-xs text-white/40 hover:text-white transition-colors"
          >
            Remove image
          </button>
        )}

        {/* Status selector (only for ideas category) */}
        {category === 'idea' && (
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {IDEA_STATUSES.map((s) => {
                const config = IDEA_STATUS_CONFIG[s];
                const isActive = status === s;

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
                    }`}
                    style={isActive ? { backgroundColor: config.bg, color: config.color } : {}}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            category === 'idea' ? 'My app idea...' :
            category === 'competitor' ? 'Competitor name...' :
            category === 'inspiration' ? 'Design inspiration...' :
            'Niche name...'
          }
          required
        />

        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            category === 'idea' ? 'Describe the app concept...' :
            category === 'competitor' ? 'What do they do? What can we learn?' :
            category === 'inspiration' ? 'What do you like about this design?' :
            'What makes this niche interesting?'
          }
          rows={3}
        />

        <Input
          label="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
        />

        <Input
          label="Tags"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="fitness, health, social (comma separated)"
        />

        <Select
          label="Link to Venture"
          value={ventureId}
          onChange={(e) => setVentureId(e.target.value)}
          options={ventureOptions}
        />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {editingIdea ? 'Save Changes' : `Add ${getCategoryLabel()}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
