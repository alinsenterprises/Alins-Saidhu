import { Film, Gamepad2, Layers, Music, ShieldCheck, Sparkles, Tv, Video } from 'lucide-react';
import type { SubscriptionPlan } from '../shared/pricing';

interface PlanIconProps {
  iconKey: SubscriptionPlan['iconKey'];
  accentHex?: string;
}

export function getPlanSurfaceTheme(iconKey: SubscriptionPlan['iconKey']) {
  switch (iconKey) {
    case 'cinema':
      return { bg: '#0F172A', accent: '#38BDF8', label: '4K Cinema' };
    case 'tv':
      return { bg: '#111827', accent: '#188CE0', label: 'UHD Originals' };
    case 'video':
      return { bg: '#0B1324', accent: '#38BDF8', label: 'Live 60fps' };
    case 'music':
      return { bg: '#0F172A', accent: '#34D399', label: 'Lossless Audio' };
    case 'gamepad':
      return { bg: '#111827', accent: '#60A5FA', label: 'Cloud Gaming' };
    case 'layers':
      return { bg: '#0B2447', accent: '#38BDF8', label: 'All-Access Pack' };
    default:
      return { bg: '#0F172A', accent: '#38BDF8', label: 'Pro Suite' };
  }
}

export function PlanIcon({ iconKey, accentHex = '#188CE0' }: PlanIconProps) {
  const Icon =
    iconKey === 'cinema'
      ? Film
      : iconKey === 'tv'
      ? Tv
      : iconKey === 'video'
      ? Video
      : iconKey === 'music'
      ? Music
      : iconKey === 'gamepad'
      ? Gamepad2
      : iconKey === 'layers'
      ? Layers
      : iconKey === 'shield'
      ? ShieldCheck
      : Sparkles;

  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/15 bg-white/10 text-white"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12)` }}
      aria-hidden="true"
    >
      <Icon className="w-5 h-5" style={{ color: accentHex === '#0F172A' ? '#38BDF8' : '#FFFFFF' }} />
    </div>
  );
}
