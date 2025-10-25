import React, { useState } from 'react';
import { Property, Currency, PropertyStatus } from '../types';
import { HeartIcon, EyeIcon, DollarSignIcon, PlusCircleIcon, VideoIcon } from './icons';
import PropertyForm from './PropertyForm';

interface SellerDashboardProps {
  properties: Property[];
  onUpdateProperty: (property: Property) => void;
  onAddProperty: (property: Property) => void;
  ownerId: string;
  currency: Currency;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ properties, onUpdateProperty, onAddProperty, ownerId, currency }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);

  const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
  const totalLikes = properties.reduce((sum, p) => sum + p.likes, 0);
  const totalSalesValue = properties.filter(p => p.isSold).reduce((sum, p) => sum + p.price, 0);

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setIsFormVisible(true);
  };

  const handleAddNew = () => {
    setEditingProperty(undefined);
    setIsFormVisible(true);
  };

  const handleSave = (property: Property) => {
    if (editingProperty) {
      onUpdateProperty(property);
    } else {
      onAddProperty(property);
    }
    setIsFormVisible(false);
    setEditingProperty(undefined);
  };
  
  const handleCancel = () => {
      setIsFormVisible(false);
      setEditingProperty(undefined);
  }

  const formatPrice = (price: number, compact: boolean = false) => {
    return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: currency, 
        notation: compact ? 'compact' : 'standard',
        minimumFractionDigits: 0,
    }).format(price);
  };
  
  const StatusBadge: React.FC<{ status: PropertyStatus, isSold: boolean }> = ({ status, isSold }) => {
    if (isSold) {
      return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Vendue</span>;
    }
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">En attente</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Approuvée</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejetée</span>;
      default:
        return null;
    }
  };


  if (isFormVisible) {
    return <PropertyForm property={editingProperty} onSave={handleSave} onCancel={handleCancel} ownerId={ownerId} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de Bord Vendeur</h2>
          <p className="text-lg text-gray-600">Gérez vos propriétés et suivez leurs performances.</p>
        </div>
        <button onClick={handleAddNew} className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors">
          <PlusCircleIcon className="w-6 h-6 mr-2" />
          Ajouter une Propriété
        </button>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full"><EyeIcon className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Vues Totales (approuvées)</p>
            <p className="text-2xl font-bold">{totalViews.toLocaleString('fr-FR')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
          <div className="bg-pink-100 p-3 rounded-full"><HeartIcon className="w-6 h-6 text-pink-600" /></div>
          <div>
            <p className="text-sm text-gray-500">"J'aime" Totaux (approuvés)</p>
            <p className="text-2xl font-bold">{totalLikes.toLocaleString('fr-FR')}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full"><DollarSignIcon className="w-6 h-6 text-green-600" /></div>
          <div>
            <p className="text-sm text-gray-500">Valeur Totale des Ventes</p>
            <p className="text-2xl font-bold">{formatPrice(totalSalesValue, true)}</p>
          </div>
        </div>
      </div>

      {/* Liste des propriétés */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <h3 className="text-xl font-bold p-6">Vos Annonces</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold">Propriété</th>
                <th className="p-4 font-semibold text-center">Statut</th>
                <th className="p-4 font-semibold text-center">Vues</th>
                <th className="p-4 font-semibold text-center">J'aime</th>
                <th className="p-4 font-semibold text-right">Prix</th>
                <th className="p-4 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(prop => (
                <tr key={prop.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="p-4 flex items-center space-x-4">
                    <img src={prop.imageUrl} alt={prop.title} className="w-20 h-16 object-cover rounded-md" />
                    <div>
                        <p className="font-semibold">{prop.title}</p>
                        <p className="text-sm text-gray-500">{prop.location}</p>
                        {prop.promoVideoUrl && <VideoIcon className="w-5 h-5 text-purple-500 mt-1" />}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge status={prop.status} isSold={prop.isSold} />
                  </td>
                  <td className="p-4 text-center text-gray-600">{prop.views.toLocaleString('fr-FR')}</td>
                  <td className="p-4 text-center text-gray-600">{prop.likes.toLocaleString('fr-FR')}</td>
                  <td className="p-4 font-semibold text-right">{formatPrice(prop.price)}</td>
                  <td className="p-4 text-center">
                    <button onClick={() => handleEdit(prop)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Modifier</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {properties.length === 0 && (
            <div className="text-center py-12">
                <p className="text-gray-500">Vous n'avez pas encore mis de propriété en vente.</p>
            </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;