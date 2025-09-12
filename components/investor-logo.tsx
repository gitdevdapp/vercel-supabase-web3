import Image from "next/image";

interface InvestorLogoProps {
  id: string;
  name: string;
  logoSrc: string;
  website?: string;
  className?: string;
}

export function InvestorLogo({ name, logoSrc, website, className }: InvestorLogoProps) {
  const logoElement = (
    <div className={`
      group cursor-pointer transition-all duration-200 
      hover:scale-105 hover:shadow-lg
      flex items-center justify-center
      p-6 bg-white rounded-lg border shadow-sm
      min-h-[120px] w-full
      ${className}
    `}>
      <Image
        src={logoSrc}
        alt={`${name} logo`}
        width={120}
        height={60}
        className="max-h-16 w-auto object-contain filter grayscale-0 hover:scale-110 transition-all duration-200"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
    </div>
  );

  if (website) {
    return (
      <a href={website} target="_blank" rel="noopener noreferrer" className="block">
        {logoElement}
      </a>
    );
  }

  return logoElement;
}
