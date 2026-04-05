import { Droplet, Moon, Sun, Globe } from 'lucide-react';
import { useWaterReminder } from '@/hooks/use-water-reminder';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export function Header() {
  const { isActive, toggle } = useWaterReminder();
  const { isDark, toggleTheme } = useTheme();
  const { t, toggleLang, lang } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/50">
      <div className="container max-w-6xl mx-auto px-4 h-24 flex items-center justify-between gap-4">
        {/* Logo only — no text */}
        <div className="flex items-center shrink-0">
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Be Active logo"
            className="h-20 w-20 object-contain drop-shadow-md"
          />
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Water Reminder */}
          <div className="flex items-center gap-2 bg-white/50 dark:bg-white/10 px-3 py-2 rounded-full border border-white dark:border-white/20">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-500">
              <Droplet className={`w-4 h-4 ${isActive ? 'animate-bounce' : ''}`} />
            </div>
            <div className="hidden sm:flex flex-col">
              <Label htmlFor="water-toggle" className="text-xs font-bold uppercase tracking-wider text-muted-foreground cursor-pointer leading-none">
                {t.waterReminder}
              </Label>
              <span className="text-xs font-medium text-foreground">
                {isActive ? t.waterEveryHour : t.waterOff}
              </span>
            </div>
            <Switch
              id="water-toggle"
              checked={isActive}
              onCheckedChange={toggle}
              className="ml-1 data-[state=checked]:bg-blue-500"
            />
          </div>

          {/* Dark Mode */}
          <button
            onClick={toggleTheme}
            title={t.darkMode}
            className="flex items-center gap-2 bg-white/50 dark:bg-white/10 px-3 py-2 rounded-full border border-white dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/20 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            <span className="hidden sm:inline text-xs font-semibold text-foreground">{t.darkMode}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={toggleLang}
            title="Switch language"
            className="flex items-center gap-2 bg-white/50 dark:bg-white/10 px-3 py-2 rounded-full border border-white dark:border-white/20 hover:bg-white/80 dark:hover:bg-white/20 transition-colors"
          >
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary">{t.language}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
