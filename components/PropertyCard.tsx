import React from 'react';
import { Property, Currency } from '../types';
import { MapPinIcon, DollarSignIcon, HeartIcon, EyeIcon, DirectionsIcon } from './icons';

interface PropertyCardProps {
  property: Property;
  onLike: (id: string) => void;
  onPurchase: (id: string) => void;
  isPurchased: boolean;
  isBuyer: boolean;
  currency: Currency;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onLike, onPurchase, isPurchased, isBuyer, currency }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
      <div className="relative">
        <img className="w-full h-56 object-cover" src={property.imageUrl} alt={property.title} />
        <div className="absolute top-2 right-2 flex items-center bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span>{property.location}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h3>
        <p className="text-gray-600 mb-4 h-20 overflow-hidden text-ellipsis">{property.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-3xl font-extrabold text-indigo-600">
            <DollarSignIcon className="w-7 h-7 mr-1" />
            <span>{formatPrice(property.price)}</span>
          </div>
          <div className="flex space-x-4 text-gray-500">
            <div className="flex items-center">
              <HeartIcon className="w-5 h-5 mr-1" />
              <span>{property.likes}</span>
            </div>
            <div className="flex items-center">
              <EyeIcon className="w-5 h-5 mr-1" />
              <span>{property.views}</span>
            </div>
          </div>
        </div>

        {isBuyer && (
          <div className="space-y-2 pt-2">
             <button
              onClick={() => onPurchase(property.id)}
              disabled={isPurchased}
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isPurchased ? 'Achetée' : 'Acheter'}
            </button>
            <div className="flex items-center space-x-2">
                <button
                onClick={() => onLike(property.id)}
                className="flex-1 flex items-center justify-center py-2 px-4 bg-pink-100 text-pink-600 font-semibold rounded-lg hover:bg-pink-200 transition-colors"
                >
                <HeartIcon className="w-5 h-5 mr-2" />
                J'aime
                </button>
                {property.lat && property.lng && (
                    <a
                    href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center py-2 px-4 bg-sky-100 text-sky-600 font-semibold rounded-lg hover:bg-sky-200 transition-colors"
                    >
                    <DirectionsIcon className="w-5 h-5 mr-2" />
                    Itinéraire
                    </a>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;