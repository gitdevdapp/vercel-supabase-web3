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
      hover:scale-105 hover:opacity-80 
      flex items-center justify-center
      p-4 bg-background rounded-lg border
      min-h-[100px] w-full
      ${className}
    `}>
      <Image
        src={logoSrc}
        alt={`${name} logo`}
        width={120}
        height={60}
        className="max-h-12 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-200"
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
