import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { RoleBadge } from '../ui/Badge';
import { SearchInput } from '../ui/SearchInput';
import type { User, Venture } from '../../../utils/platform/types';

interface PartnersPageProps {
  users: User[];
  ventures: Venture[];
  onAddPartner: () => void;
  onEditPartner: (userId: number) => void;
}

export function PartnersPage({
  users,
  ventures,
  onAddPartner,
  onEditPartner,
}: PartnersPageProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const getUserVentures = (userId: number) => {
    return ventures
      .filter(v => (v.partners || []).some(p => p.userId === userId))
      .map(v => {
        const partner = v.partners.find(p => p.userId === userId);
        return { name: v.name, equity: partner?.equity || 0 };
      });
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(u =>
      u.username.toLowerCase().includes(query) ||
      u.role.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white">Partners</h1>
          <p className="text-white/40 text-xs sm:text-sm mt-1">Manage team members and access</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <SearchInput
            placeholder="Search partners..."
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-full sm:w-64"
          />
          <Button variant="primary" onClick={onAddPartner} className="w-full sm:w-auto justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Partner
          </Button>
        </div>
      </div>

      {/* Partners List */}
      <Card padding="none">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No partners yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filteredUsers.map((user, i) => {
              const userVentures = getUserVentures(user.id);
              const isAdmin = user.role === 'admin';

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 hover:bg-white/[0.02] transition-colors gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
                      isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{user.username}</span>
                        <RoleBadge role={user.role} />
                      </div>
                      {userVentures.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {userVentures.map(v => (
                            <span
                              key={v.name}
                              className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 bg-white/[0.03] rounded-md text-xs"
                            >
                              <span className="text-white/70 truncate max-w-[80px] sm:max-w-none">{v.name}</span>
                              <span className="text-purple-400">{v.equity}%</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/30 mt-1">No ventures assigned</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEditPartner(user.id)} className="self-end sm:self-center flex-shrink-0">
                    Edit
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
