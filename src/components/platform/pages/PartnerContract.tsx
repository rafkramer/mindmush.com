import { Card } from '../ui/Card';
import { getDocuments } from '../../../utils/platform/storage';
import type { User, Venture, Document } from '../../../utils/platform/types';

interface PartnerContractProps {
  user: User;
  ventures: Venture[];
}

const getDocumentStatusColor = (status: Document['status']) => {
  switch (status) {
    case 'signed': return { text: 'text-green-400', bg: 'bg-green-500/10' };
    case 'pending_signature': return { text: 'text-amber-400', bg: 'bg-amber-500/10' };
    case 'draft': return { text: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'expired': return { text: 'text-red-400', bg: 'bg-red-500/10' };
    default: return { text: 'text-white/40', bg: 'bg-white/[0.03]' };
  }
};

const getDocumentTypeIcon = (type: Document['type']) => {
  switch (type) {
    case 'contract':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />;
    case 'nda':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />;
    case 'agreement':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />;
    case 'amendment':
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />;
    default:
      return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />;
  }
};

const formatDocumentDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function PartnerContract({ user, ventures }: PartnerContractProps) {
  const userVentures = ventures.filter(v =>
    (v.partners || []).some(p => p.userId === user.id)
  );

  const userDocuments = getDocuments().filter(d => d.userId === user.id);

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

          {/* Documents & Agreements */}
          <div>
            <h3 className="text-sm font-medium text-purple-400 mb-3">Documents & Agreements</h3>
            <p className="text-sm text-white/50 mb-4">
              Your signed documents and pending agreements:
            </p>
            {userDocuments.length === 0 ? (
              <p className="text-sm text-white/30">No documents yet.</p>
            ) : (
              <div className="space-y-2">
                {userDocuments.map(doc => {
                  const statusColor = getDocumentStatusColor(doc.status);
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {getDocumentTypeIcon(doc.type)}
                          </svg>
                        </div>
                        <div>
                          <span className="text-sm text-white font-medium block">{doc.title}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-white/40 capitalize">{doc.type.replace('_', ' ')}</span>
                            <span className="text-white/20">•</span>
                            <span className="text-xs text-white/40">
                              {doc.signedAt ? `Signed ${formatDocumentDate(doc.signedAt)}` : `Created ${formatDocumentDate(doc.createdAt)}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-lg ${statusColor.bg} ${statusColor.text}`}>
                        {doc.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
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
