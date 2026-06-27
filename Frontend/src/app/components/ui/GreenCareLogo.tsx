import logo from '@/images/greencare-icon.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** 'dark' = white text (on dark/coloured bg), 'light' = dark text (on white bg) */
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 'h-8 w-8', title: 'text-[17px]', tagline: 'text-[10px]' },
  md: { img: 'h-10 w-10', title: 'text-xl', tagline: 'text-[11px]' },
  lg: { img: 'h-12 w-12', title: 'text-2xl', tagline: 'text-sm' },
};

export function GreenCareLogo({ size = 'md', variant = 'light', showTagline = false, className = '' }: LogoProps) {
  const s = sizeMap[size];

  // The icon is on a white background, so on a dark background we'll put it in a white circle
  // to ensure it pops and looks like an app icon.
  const ringColor    = variant === 'dark' ? 'ring-2 ring-white/20 bg-white' : 'ring-1 ring-gray-200 bg-white';
  const titleColor   = variant === 'dark' ? 'text-white drop-shadow-sm' : 'text-gray-900';
  const tagColor     = variant === 'dark' ? 'text-white/70' : 'text-gray-500';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logo}
        alt="GreenCare Icon"
        className={`${s.img} ${ringColor} rounded-xl object-contain shadow-sm flex-shrink-0`}
      />
      <div className="leading-tight flex flex-col justify-center">
        <p className={`font-extrabold tracking-tight ${s.title} ${titleColor}`}>GreenCare</p>
        {showTagline && <p className={`font-medium ${s.tagline} ${tagColor}`}>Rwanda</p>}
      </div>
    </div>
  );
}
