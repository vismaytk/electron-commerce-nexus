
import React, { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, name }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <img 
          src={images[selectedImage]} 
          alt={`${name} - view ${selectedImage + 1}`} 
          className="w-full object-contain h-96"
        />
      </div>
      
      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-1">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-20 h-20 rounded border-2 overflow-hidden transition-all ${
                selectedImage === index 
                  ? 'border-tech-blue' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img 
                src={image} 
                alt={`Thumbnail ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
