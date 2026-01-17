import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  { id: 'creators', label: 'Creators', color: '#22c55e' },
  { id: 'builders', label: 'Builders', color: '#3b82f6' },
  { id: 'founders', label: 'Founders', color: '#8b5cf6' },
  { id: 'academics', label: 'Academics', color: '#f59e0b' },
  { id: 'buyers', label: 'Buyers', color: '#ec4899' },
  { id: 'sellers', label: 'Sellers', color: '#06b6d4' },
] as const;

type Category = typeof CATEGORIES[number]['id'];

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  category: Category;
}

// Mock messages for demo
const MOCK_MESSAGES: Message[] = [
  { id: '1', sender: 'Alex Chen', content: 'Hey, I have a new app idea for the fitness space', timestamp: new Date(), category: 'creators' },
  { id: '2', sender: 'Sarah Kim', content: 'Looking for a React Native developer for our project', timestamp: new Date(), category: 'builders' },
  { id: '3', sender: 'Mike Johnson', content: 'Series A closed! Thanks for the intro', timestamp: new Date(), category: 'founders' },
];

export function ChatPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('creators');
  const [messages] = useState<Message[]>(MOCK_MESSAGES);

  const filteredMessages = messages.filter(m => m.category === activeCategory);
  const activeCategoryData = CATEGORIES.find(c => c.id === activeCategory)!;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="px-6 pt-6 pb-4 border-b border-white/10"
      >
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((category, index) => (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              onClick={() => setActiveCategory(category.id)}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                transition-all duration-300 ease-out
                ${activeCategory === category.id
                  ? 'text-white'
                  : 'text-white/50 hover:text-white/70'
                }
              `}
            >
              {/* Active background */}
              {activeCategory === category.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-full bg-white/10 border border-white/20"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{category.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Chat Header with Category */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="px-6 py-4 border-b border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              key={activeCategory}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeCategoryData.color }}
            />
            <AnimatePresence mode="wait">
              <motion.span
                key={activeCategory}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="text-white font-medium"
              >
                {activeCategoryData.label}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="text-white/40 text-sm">Audience → App</span>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Date divider */}
            <div className="flex justify-center">
              <span className="px-3 py-1 bg-white/5 rounded-full text-white/40 text-xs">
                Today {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>

            {filteredMessages.length > 0 ? (
              filteredMessages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex gap-3"
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium text-sm"
                    style={{ backgroundColor: activeCategoryData.color + '30' }}
                  >
                    {message.sender.split(' ').map(n => n[0]).join('')}
                  </div>

                  {/* Message content */}
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-medium">{message.sender}</span>
                      <span className="text-white/30 text-xs">
                        {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-white/70 mt-1">{message.content}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-white/40"
              >
                <div
                  className="w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                  style={{ backgroundColor: activeCategoryData.color + '20' }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: activeCategoryData.color }}
                  />
                </div>
                <p>No messages in {activeCategoryData.label} yet</p>
                <p className="text-sm mt-1">Start a conversation</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Message Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="px-6 py-4 border-t border-white/10"
      >
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder={`Message ${activeCategoryData.label}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 rounded-xl font-medium text-white transition-colors"
            style={{ backgroundColor: activeCategoryData.color }}
          >
            Send
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
