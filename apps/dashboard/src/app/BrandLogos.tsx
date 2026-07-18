import React from 'react';

interface BrandLogoProps {
  carName: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ carName, className = 'w-12 h-12' }) => {
  const nameLower = carName.toLowerCase();
  let logoUrl = '';
  let brandAlt = 'شعار السيارة';

  // Toyota (تويوتا)
  if (nameLower.includes('تويوتا') || nameLower.includes('toyota')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Toyota_logo_%282020%29.svg/256px-Toyota_logo_%282020%29.svg.png';
    brandAlt = 'Toyota';
  }
  // Lexus (لكزس)
  else if (nameLower.includes('لكزس') || nameLower.includes('lexus')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Lexus_Division_logo.svg/256px-Lexus_Division_logo.svg.png';
    brandAlt = 'Lexus';
  }
  // Mercedes (مرسيدس)
  else if (nameLower.includes('مرسيدس') || nameLower.includes('mercedes')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Mercedes-Benz_Logo_2010.svg/256px-Mercedes-Benz_Logo_2010.svg.png';
    brandAlt = 'Mercedes-Benz';
  }
  // BMW (بي ام)
  else if (nameLower.includes('bmw') || nameLower.includes('بي ام')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW.svg/256px-BMW.svg.png';
    brandAlt = 'BMW';
  }
  // Genesis (جينسس)
  else if (nameLower.includes('جينسس') || nameLower.includes('genesis')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Genesis_Motor_logo.svg/256px-Genesis_Motor_logo.svg.png';
    brandAlt = 'Genesis';
  }
  // Nissan (نيسان)
  else if (nameLower.includes('نيسان') || nameLower.includes('nissan')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Nissan_2020_logo.svg/256px-Nissan_2020_logo.svg.png';
    brandAlt = 'Nissan';
  }
  // Chevrolet (تاهو, سوبربان, شفروليه)
  else if (nameLower.includes('تاهو') || nameLower.includes('سوبربان') || nameLower.includes('شفروليه') || nameLower.includes('chevrolet')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Chevrolet-logo.png/256px-Chevrolet-logo.png';
    brandAlt = 'Chevrolet';
  }
  // GMC (يوكن, جي ام سي)
  else if (nameLower.includes('يوكن') || nameLower.includes('gmc') || nameLower.includes('جي ام سي')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/GMC_logo.svg/256px-GMC_logo.svg.png';
    brandAlt = 'GMC';
  }
  // Ford (فورد)
  else if (nameLower.includes('فورد') || nameLower.includes('ford') || nameLower.includes('تورس')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Ford_Motor_Company_Logo.svg/256px-Ford_Motor_Company_Logo.svg.png';
    brandAlt = 'Ford';
  }
  // Hyundai (هيونداي)
  else if (nameLower.includes('هيونداي') || nameLower.includes('hyundai') || nameLower.includes('سوناتا') || nameLower.includes('إلنترا') || nameLower.includes('أكسنت')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Hyundai_logo_2017.svg/256px-Hyundai_logo_2017.svg.png';
    brandAlt = 'Hyundai';
  }
  // Kia (كيا)
  else if (nameLower.includes('كيا') || nameLower.includes('kia') || nameLower.includes('سيراتو')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Kia_logo_2021.svg/256px-Kia_logo_2021.svg.png';
    brandAlt = 'Kia';
  }
  // MG (ام جي)
  else if (nameLower.includes('mg') || nameLower.includes('ام جي')) {
    logoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/MG_logo.svg/256px-MG_logo.svg.png';
    brandAlt = 'MG';
  }
  // Fallback icon URL
  else {
    return (
      <svg className={className} viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10,40 L15,30 L35,28 L50,15 L70,15 L80,28 L90,32 L92,42 L82,42 C82,37 78,33 73,33 C68,33 64,37 64,42 L36,42 C36,37 32,33 27,33 C22,33 18,37 18,42 L10,42 Z" />
        <circle cx="27" cy="42" r="6" fill="currentColor" />
        <circle cx="73" cy="42" r="6" fill="currentColor" />
      </svg>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt={brandAlt} 
      className={`${className} object-contain select-none`} 
      onError={(e) => {
        // Fallback to simple icon if image fails to load
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};
