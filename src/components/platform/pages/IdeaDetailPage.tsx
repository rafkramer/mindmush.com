import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { IDEA_CATEGORY_CONFIG, IDEA_STATUSES, IDEA_STATUS_CONFIG, VENTURE_TYPES, VENTURE_STATES } from '../../../utils/platform/constants';
import type { Idea, Venture } from '../../../utils/platform/types';
import type { IdeaStatus, VentureType, VentureState } from '../../../utils/platform/constants';

interface IdeaDetailPageProps {
  idea: Idea;
  relatedIdeas: Idea[]; // competitors, inspiration, niches linked to this idea or its venture
  ventures: Venture[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: IdeaStatus) => void;
  onConvertToVenture: (ventureData: {
    name: string;
    type: VentureType;
    state: VentureState;
  }) => void;
  onViewRelatedIdea: (idea: Idea) => void;
}

export function IdeaDetailPage({
  idea,
  relatedIdeas,
  ventures,
  onBack,
  onEdit,
  onDelete,
  onUpdateStatus,
  onConvertToVenture,
  onViewRelatedIdea,
}: IdeaDetailPageProps) {
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertName, setConvertName] = useState(idea.title);
  const [convertType, setConvertType] = useState<VentureType>('app');

  const categoryConfig = IDEA_CATEGORY_CONFIG[idea.category];
  const statusConfig = IDEA_STATUS_CONFIG[idea.status];
  const linkedVenture = idea.ventureId ? ventures.find(v => v.id === idea.ventureId) : null;
  const convertedVenture = idea.convertedToVentureId ? ventures.find(v => v.id === idea.convertedToVentureId) : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleConvert = () => {
    onConvertToVenture({
      name: convertName,
      type: convertType,
      state: 'building',
    });
    setShowConvertModal(false);
  };

  const currentStatusIndex = IDEA_STATUSES.indexOf(idea.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-white/[0.06] transition-colors"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: categoryConfig.bg, color: categoryConfig.color }}
              >
                {categoryConfig.icon} {categoryConfig.label.slice(0, -1)}
              </span>
              {idea.category === 'idea' && (
                <span
                  className="px-2 py-0.5 rounded-md text-xs font-medium"
                  style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                >
                  {statusConfig.icon} {statusConfig.label}
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-white">{idea.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onEdit}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Edit
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (confirm('Delete this idea?')) {
                onDelete();
              }
            }}
            className="text-red-400 hover:text-red-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {idea.image && (
            <Card className="p-0 overflow-hidden">
              <img
                src={idea.image}
                alt={idea.title}
                className="w-full h-64 object-cover"
              />
            </Card>
          )}

          {/* Description */}
          {idea.description && (
            <Card>
              <h3 className="text-sm font-medium text-white/60 mb-2">Description</h3>
              <p className="text-white whitespace-pre-wrap">{idea.description}</p>
            </Card>
          )}

          {/* Status Progression (only for ideas) */}
          {idea.category === 'idea' && !convertedVenture && (
            <Card>
              <h3 className="text-sm font-medium text-white/60 mb-4">Progress</h3>
              <div className="flex items-center gap-2">
                {IDEA_STATUSES.map((s, index) => {
                  const config = IDEA_STATUS_CONFIG[s];
                  const isActive = idea.status === s;
                  const isPast = index < currentStatusIndex;
                  const isNext = index === currentStatusIndex + 1;

                  return (
                    <div key={s} className="flex-1 flex items-center">
                      <button
                        onClick={() => isNext && onUpdateStatus(s)}
                        disabled={!isNext}
                        className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                          isActive
                            ? 'bg-white/[0.06]'
                            : isPast
                            ? 'opacity-50'
                            : isNext
                            ? 'hover:bg-white/[0.03] cursor-pointer'
                            : 'opacity-30'
                        }`}
                      >
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                            isActive || isPast ? '' : 'grayscale'
                          }`}
                          style={isActive || isPast ? { backgroundColor: config.bg } : { backgroundColor: 'rgba(255,255,255,0.03)' }}
                        >
                          {config.icon}
                        </span>
                        <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-white/40'}`}>
                          {config.label}
                        </span>
                      </button>
                      {index < IDEA_STATUSES.length - 1 && (
                        <div className={`w-4 h-0.5 ${isPast ? 'bg-white/20' : 'bg-white/[0.06]'}`} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Convert to Venture button */}
              {idea.status === 'building' && !convertedVenture && (
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <Button
                    variant="primary"
                    onClick={() => setShowConvertModal(true)}
                    className="w-full justify-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    </svg>
                    Convert to Venture
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Converted Venture Notice */}
          {convertedVenture && (
            <Card className="border border-green-500/20 bg-green-500/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/60">This idea has been converted to a venture</p>
                  <p className="text-white font-medium">{convertedVenture.name}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Related Ideas */}
          {relatedIdeas.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-white/60 mb-4">Related Research</h3>
              <div className="space-y-3">
                {relatedIdeas.map((related) => {
                  const relatedConfig = IDEA_CATEGORY_CONFIG[related.category];
                  return (
                    <motion.button
                      key={related.id}
                      onClick={() => onViewRelatedIdea(related)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-left"
                      whileHover={{ x: 4 }}
                    >
                      {related.image ? (
                        <img src={related.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: relatedConfig.bg }}
                        >
                          {relatedConfig.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{related.title}</p>
                        <p className="text-xs text-white/40">{relatedConfig.label.slice(0, -1)}</p>
                      </div>
                      <svg className="w-4 h-4 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </motion.button>
                  );
                })}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Meta Info */}
          <Card>
            <div className="space-y-4">
              {/* URL */}
              {idea.url && (
                <div>
                  <h4 className="text-xs font-medium text-white/40 mb-1">Link</h4>
                  <a
                    href={idea.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    {new URL(idea.url).hostname}
                  </a>
                </div>
              )}

              {/* Linked Venture */}
              {linkedVenture && (
                <div>
                  <h4 className="text-xs font-medium text-white/40 mb-1">Linked to Venture</h4>
                  <div className="flex items-center gap-2">
                    {linkedVenture.icon ? (
                      <img src={linkedVenture.icon} alt="" className="w-6 h-6 rounded-lg" />
                    ) : (
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">
                        {linkedVenture.name.charAt(0)}
                      </div>
                    )}
                    <span className="text-sm text-white">{linkedVenture.name}</span>
                  </div>
                </div>
              )}

              {/* Tags */}
              {idea.tags.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-white/40 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {idea.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-md bg-white/[0.06] text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="pt-3 border-t border-white/[0.06]">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Created</span>
                  <span className="text-white/60">{formatDate(idea.createdAt)}</span>
                </div>
                {idea.updatedAt && idea.updatedAt !== idea.createdAt && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-white/40">Updated</span>
                    <span className="text-white/60">{formatDate(idea.updatedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 w-full max-w-md"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Convert to Venture</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Venture Name</label>
                <input
                  type="text"
                  value={convertName}
                  onChange={(e) => setConvertName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Type</label>
                <div className="flex gap-2">
                  {VENTURE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setConvertType(t)}
                      className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        convertType === t
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                          : 'bg-white/[0.03] text-white/50 border border-transparent hover:bg-white/[0.06]'
                      }`}
                    >
                      {t === 'app' ? 'App' : 'Game'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowConvertModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConvert} className="flex-1">
                Create Venture
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
