import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { RoleBadge } from '../ui/Badge';
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
  const getUserVentures = (userId: number) => {
    return ventures
      .filter(v => (v.partners || []).some(p => p.userId === userId))
      .map(v => {
        const partner = v.partners.find(p => p.userId === userId);
        return { name: v.name, equity: partner?.equity || 0 };
      });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Partners</h1>
          <p className="text-white/40 text-sm mt-1">Manage team members and access</p>
        </div>
        <Button variant="primary" onClick={onAddPartner}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Partner
        </Button>
      </div>

      {/* Partners List */}
      <Card padding="none">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/40">No partners yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {users.map((user, i) => {
              const userVentures = getUserVentures(user.id);
              const isAdmin = user.role === 'admin';

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                      isAdmin ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{user.username}</span>
                        <RoleBadge role={user.role} />
                      </div>
                      {userVentures.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {userVentures.map(v => (
                            <span
                              key={v.name}
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] rounded-md text-xs"
                            >
                              <span className="text-white/70">{v.name}</span>
                              <span className="text-purple-400">{v.equity}%</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-white/30 mt-1">No ventures assigned</p>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEditPartner(user.id)}>
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
