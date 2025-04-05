
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface BannerProps {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
}

const Banner: React.FC<BannerProps> = ({
  title,
  subtitle,
  buttonText,
  buttonLink = '/products',
  backgroundImage = '/placeholder.svg'
}) => {
  return (
    <div 
      className="relative overflow-hidden bg-cover bg-center py-16 md:py-24"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-navy/70" />
      <div className="container-custom relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        {buttonText && (
          <Button 
            asChild
            size="lg"
            className="bg-tech-blue hover:bg-tech-blue-dark transition-colors text-white"
          >
            <Link to={buttonLink}>{buttonText}</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Banner;
