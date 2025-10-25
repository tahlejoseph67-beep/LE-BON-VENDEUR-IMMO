import React, { useState } from 'react';
import { Property, Currency } from '../types';
import PropertyCard from './PropertyCard';

interface PropertyListingsProps {
  properties: Property[];
  onLike: (id: string) => void;
  onPurchase: (id: string) => void;
  purchasedIds: Set<string>;
  currency: Currency;
}

const PropertyListings: React.FC<PropertyListingsProps> = ({ properties, onLike, onPurchase, purchasedIds, currency }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const availableProperties = properties.filter(p => !p.isSold && p.status === 'APPROVED');
  
  const filteredProperties = availableProperties.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Trouvez la Maison de Vos Rêves</h2>
        <p className="text-lg text-gray-600">Parcourez notre collection exclusive de propriétés vérifiées.</p>
      </div>

      <div className="sticky top-4 z-10">
        <input
          type="text"
          placeholder="Rechercher par titre ou lieu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.map(property => (
          <PropertyCard
            key={property.id}
            property={property}
            onLike={onLike}
            onPurchase={onPurchase}
            isPurchased={purchasedIds.has(property.id)}
            isBuyer={true}
            currency={currency}
          />
        ))}
      </div>
       {filteredProperties.length === 0 && (
            <div className="col-span-full text-center py-16">
                <p className="text-xl text-gray-500">Aucune propriété ne correspond à votre recherche.</p>
            </div>
       )}
    </div>
  );
};

export default PropertyListings;