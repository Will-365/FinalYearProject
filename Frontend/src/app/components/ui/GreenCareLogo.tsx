import logo from '../../../images/greencare-icon.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  /** Included for props compatibility but unused as the logo is now a single image */
  variant?: 'dark' | 'light';
  showTagline?: boolean;
  className?: string;
}

const sizeMap = {
  sm: 'h-10',
  md: 'h-14',
  lg: 'h-20',
};

export function GreenCareLogo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={logo}
        alt="GreenCare Rwanda Logo"
        className={`${sizeMap[size]} w-auto object-contain flex-shrink-0`}
      />
    </div>
  );
}
