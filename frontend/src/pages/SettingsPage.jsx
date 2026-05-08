import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const toggles = [
  { id: 'email', label: 'Email Notifications', description: 'Receive score summaries and interview reminders.' },
  { id: 'dark', label: 'Appearance', description: 'Keep the clean white dashboard theme.' },
  { id: 'history', label: 'Auto Save Sessions', description: 'Store generated questions and answers automatically.' },
];

export default function SettingsPage() {
  const [enabled, setEnabled] = useState({ email: true, dark: false, history: true });

  return (
    <div className="space-y-6 pb-10">
      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black">Settings</h1>
            <p className="mt-1 text-sm text-slate-500">A lightweight control panel for demo-friendly preferences.</p>
          </div>
          <Badge tone="default">Simple configuration</Badge>
        </div>
      </Card>

      <div className="grid gap-4">
        {toggles.map((toggle) => (
          <Card key={toggle.id} className="flex items-center justify-between gap-4 p-6">
            <div>
              <h3 className="text-base font-black">{toggle.label}</h3>
              <p className="mt-1 text-sm text-slate-500">{toggle.description}</p>
            </div>
            <button
              onClick={() => setEnabled((current) => ({ ...current, [toggle.id]: !current[toggle.id] }))}
              className={`relative h-8 w-14 rounded-full transition ${enabled[toggle.id] ? 'bg-brand-600' : 'bg-slate-300'}`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${enabled[toggle.id] ? 'left-7' : 'left-1'}`}
              />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
