import { Card } from '../ui/Card';
import type { User, Venture } from '../../../utils/platform/types';

interface PartnerContractProps {
  user: User;
  ventures: Venture[];
}

export function PartnerContract({ user, ventures }: PartnerContractProps) {
  const userVentures = ventures.filter(v =>
    (v.partners || []).some(p => p.userId === user.id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Partnership Contract</h1>
        <p className="text-white/40 text-sm mt-1">Your partnership agreement with MINDMUSH</p>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Partner Information */}
          <div>
            <h3 className="text-sm font-medium text-purple-400 mb-3">Partner Information</h3>
            <div className="space-y-2 text-sm">
              <p className="text-white/70">
                <span className="text-white/40">Partner:</span> {user.username}
              </p>
              <p className="text-white/70">
                <span className="text-white/40">Role:</span> {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <p className="text-white/70">
                <span className="text-white/40">Status:</span>{' '}
                <span className="text-green-400">Active</span>
              </p>
            </div>
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Venture Assignments */}
          <div>
            <h3 className="text-sm font-medium text-purple-400 mb-3">Venture Assignments</h3>
            <p className="text-sm text-white/50 mb-4">
              You have been assigned equity in the following ventures:
            </p>
            {userVentures.length === 0 ? (
              <p className="text-sm text-white/30">No ventures assigned yet.</p>
            ) : (
              <div className="space-y-2">
                {userVentures.map(venture => {
                  const partner = venture.partners.find(p => p.userId === user.id);
                  return (
                    <div
                      key={venture.id}
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden ${
                          venture.type === 'game' ? 'bg-orange-500/10' : 'bg-blue-500/10'
                        }`}>
                          {venture.icon ? (
                            <img src={venture.icon} alt={venture.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className={`w-4 h-4 ${venture.type === 'game' ? 'text-orange-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={venture.type === 'game' ? 'M14.25 6.087' : 'M10.5 1.5H8.25'} />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm text-white font-medium">{venture.name}</span>
                      </div>
                      <span className="text-sm text-purple-400 font-mono">{partner?.equity || 0}% equity</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="h-px bg-white/[0.06]" />

          {/* Payment Schedule */}
          <div>
            <h3 className="text-sm font-medium text-purple-400 mb-3">Payment Schedule</h3>
            <p className="text-sm text-white/50">
              Profit distributions are processed in accordance with Apple's payout schedule.
              Payments are typically disbursed within 45 days after the end of each fiscal month.
              Your share is calculated based on your equity percentage in each assigned venture,
              after deducting venture-specific expenses.
            </p>
          </div>

          {/* Additional Terms */}
          {user.contract && (
            <>
              <div className="h-px bg-white/[0.06]" />
              <div>
                <h3 className="text-sm font-medium text-purple-400 mb-3">Additional Terms</h3>
                <p className="text-sm text-white/50 whitespace-pre-wrap">{user.contract}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Footer */}
      <Card className="text-center">
        <p className="text-xs text-white/30">
          MINDMUSH LLC • Zurich, Switzerland
        </p>
      </Card>
    </div>
  );
}
