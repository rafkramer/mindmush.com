import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { SearchInput } from '../ui/SearchInput';
import { IDEA_CATEGORIES, IDEA_CATEGORY_CONFIG, IDEA_STATUS_CONFIG } from '../../../utils/platform/constants';
import type { Idea, IdeaCategory, Venture } from '../../../utils/platform/types';

interface IdeasPageProps {
  ideas: Idea[];
  ventures: Venture[];
  onAddIdea: (category: IdeaCategory) => void;
  onViewIdea: (idea: Idea) => void;
  onEditIdea: (idea: Idea) => void;
  onDeleteIdea: (id: string) => void;
}

export function IdeasPage({
  ideas,
  ventures,
  onAddIdea,
  onViewIdea,
  onEditIdea,
  onDeleteIdea,
}: IdeasPageProps) {
  const [activeCategory, setActiveCategory] = useState<IdeaCategory>('idea');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIdeas = useMemo(() => {
    let result = ideas.filter(i => i.category === activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(i =>
        i.title.toLowerCase().includes(query) ||
        i.description?.toLowerCase().includes(query) ||
        i.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return result;
  }, [ideas, activeCategory, searchQuery]);

  const getVentureName = (ventureId?: string) => {
    if (!ventureId) return null;
    return ventures.find(v => v.id === ventureId)?.name;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const categoryConfig = IDEA_CATEGORY_CONFIG[activeCategory];
  const categoryCount = (cat: IdeaCategory) => ideas.filter(i => i.category === cat).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Ideas</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Brainstorm, research, and organize</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <SearchInput
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:w-64"
          />
          <Button
            variant="primary"
            onClick={() => onAddIdea(activeCategory)}
            className="w-full sm:w-auto justify-center"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add {categoryConfig.label.slice(0, -1)}
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {IDEA_CATEGORIES.map((cat) => {
          const config = IDEA_CATEGORY_CONFIG[cat];
          const count = categoryCount(cat);
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'text-white'
                  : 'text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]'
              }`}
              style={isActive ? { backgroundColor: config.bg, color: config.color } : {}}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              {count > 0 && (
                <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                  isActive ? 'bg-white/20' : 'bg-white/[0.06]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Ideas Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {filteredIdeas.length === 0 ? (
            <Card className="text-center py-12">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: categoryConfig.bg }}
              >
                {categoryConfig.icon}
              </div>
              <p className="text-white/40">
                No {categoryConfig.label.toLowerCase()} yet. Add your first one!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIdeas.map((idea, i) => {
                const ventureName = getVentureName(idea.ventureId);

                return (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card hover className="group relative cursor-pointer" onClick={() => onViewIdea(idea)}>
                      {/* Image preview */}
                      {idea.image && (
                        <div className="mb-3 -mx-4 -mt-4 rounded-t-2xl overflow-hidden">
                          <img
                            src={idea.image}
                            alt={idea.title}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-white line-clamp-2">
                            {idea.title}
                          </h3>
                          {/* Status badge for ideas */}
                          {idea.category === 'idea' && idea.status && (
                            <span
                              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs"
                              style={{
                                backgroundColor: IDEA_STATUS_CONFIG[idea.status].bg,
                                color: IDEA_STATUS_CONFIG[idea.status].color
                              }}
                            >
                              {IDEA_STATUS_CONFIG[idea.status].icon} {IDEA_STATUS_CONFIG[idea.status].label}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditIdea(idea);
                            }}
                            className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4 text-white/40 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this item?')) {
                                onDeleteIdea(idea.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4 text-white/40 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Description */}
                      {idea.description && (
                        <p className="text-sm text-white/50 line-clamp-2 mb-3">
                          {idea.description}
                        </p>
                      )}

                      {/* URL */}
                      {idea.url && (
                        <a
                          href={idea.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 mb-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                          {new URL(idea.url).hostname}
                        </a>
                      )}

                      {/* Tags */}
                      {idea.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {idea.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs rounded-md bg-white/[0.06] text-white/60"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-white/30">
                        <span>{formatDate(idea.createdAt)}</span>
                        {ventureName && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">
                            {ventureName}
                          </span>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
