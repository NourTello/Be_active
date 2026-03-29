import { Droplet } from 'lucide-react';
import { useWaterReminder } from '@/hooks/use-water-reminder';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function Header() {
  const { isActive, toggle } = useWaterReminder();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/50">
      <div className="container max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            AuraWellness
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white/50 px-4 py-2 rounded-full border border-white">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-500">
            <Droplet className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
          </div>
          <div className="flex flex-col">
            <Label htmlFor="water-toggle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer">
              Water Reminder
            </Label>
            <span className="text-xs font-medium text-foreground">
              {isActive ? 'Every 20 mins' : 'Off'}
            </span>
          </div>
          <Switch 
            id="water-toggle" 
            checked={isActive} 
            onCheckedChange={toggle}
            className="ml-2 data-[state=checked]:bg-blue-500"
          />
        </div>
      </div>
    </header>
  );
}
