import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import type { Settings } from '../../../utils/platform/types';

interface SettingsPageProps {
  settings: Settings;
  onSaveSettings: (settings: Settings) => void;
  onTestApi: () => Promise<boolean>;
}

export function SettingsPage({
  settings,
  onSaveSettings,
  onTestApi,
}: SettingsPageProps) {
  const [apiKey, setApiKey] = useState(settings.applovinApiKey || '');
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSave = () => {
    onSaveSettings({ ...settings, applovinApiKey: apiKey });
    setTestStatus('idle');
  };

  const handleTest = async () => {
    setTesting(true);
    setTestStatus('idle');
    const success = await onTestApi();
    setTestStatus(success ? 'success' : 'error');
    setTesting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-white/40 text-sm mt-1">Configure API integrations</p>
      </div>

      {/* AppLovin MAX */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">AppLovin MAX</h3>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                testStatus === 'success' ? 'bg-green-500/10 text-green-400' :
                testStatus === 'error' ? 'bg-red-500/10 text-red-400' :
                apiKey ? 'bg-blue-500/10 text-blue-400' : 'bg-white/[0.05] text-white/40'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  testStatus === 'success' ? 'bg-green-400' :
                  testStatus === 'error' ? 'bg-red-400' :
                  apiKey ? 'bg-blue-400' : 'bg-white/30'
                }`} />
                {testStatus === 'success' ? 'Connected' :
                 testStatus === 'error' ? 'Connection failed' :
                 apiKey ? 'API key configured' : 'Not configured'}
              </div>
            </div>
            <p className="text-sm text-white/40 mb-4">
              Connect your AppLovin MAX account to automatically sync ad revenue from mobile games.
              Your Report Key can be found in the AppLovin dashboard under Account {">"} Keys.
            </p>
            <div className="space-y-4">
              <Input
                label="Report Key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your AppLovin Report Key"
              />
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleTest} loading={testing}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Test Connection
                </Button>
                <Button variant="primary" onClick={handleSave}>
                  Save Key
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Superwall Info */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">Superwall</h3>
            <p className="text-sm text-white/40">
              Superwall API keys are configured per-app in the venture settings. When editing a Consumer App venture,
              you can add the Superwall API key specific to that app to enable revenue tracking.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
