import React, { useState, useMemo } from 'react';
import { User, Property, PropertyStatus, UserRole, Currency } from '../types';
import { UsersIcon, CheckCircleIcon, XCircleIcon } from './icons';
import ConfirmationDialog from './ConfirmationDialog';

interface AdminDashboardProps {
  users: User[];
  properties: Property[];
  onUpdatePropertyStatus: (propertyId: string, status: PropertyStatus) => void;
  currency: Currency;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, properties, onUpdatePropertyStatus, currency }) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'users'>('properties');
  const [propertyFilter, setPropertyFilter] = useState<PropertyStatus>('PENDING');
  const [rejectionCandidate, setRejectionCandidate] = useState<Property | null>(null);


  const { pending, approved, rejected } = useMemo(() => {
    return properties.reduce((acc, prop) => {
        acc[prop.status.toLowerCase()].push(prop);
        return acc;
    }, { pending: [], approved: [], rejected: [] } as Record<string, Property[]>);
  }, [properties]);

  const filteredProperties = properties.filter(p => p.status === propertyFilter);
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency, minimumFractionDigits: 0 }).format(price);
  };
  
  const userMap = useMemo(() => {
    return users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
    }, {} as Record<string, User>);
  }, [users]);
  
  const handleConfirmRejection = () => {
    if (rejectionCandidate) {
      onUpdatePropertyStatus(rejectionCandidate.id, 'REJECTED');
      setRejectionCandidate(null); // Close dialog
    }
  };

  const PropertyList: React.FC<{list: Property[]}> = ({ list }) => (
    <div className="space-y-4">
        {list.length > 0 ? list.map(prop => (
             <div key={prop.id} className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4 border">
                <div className="flex items-center gap-4 flex-grow">
                    <img src={prop.imageUrl} alt={prop.title} className="w-24 h-20 object-cover rounded-md" />
                    <div>
                        <p className="font-bold text-lg text-gray-800">{prop.title}</p>
                        <p className="text-sm text-gray-500">{prop.location}</p>
                        <p className="text-sm text-gray-700">Vendeur: <span className="font-semibold">{userMap[prop.ownerId]?.name || 'Inconnu'}</span></p>
                    </div>
                </div>
                <div className="font-bold text-xl text-indigo-600 pr-4">
                    {formatPrice(prop.price)}
                </div>
                {prop.status === 'PENDING' && (
                    <div className="flex gap-2">
                        <button onClick={() => onUpdatePropertyStatus(prop.id, 'APPROVED')} className="px-4 py-2 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition-colors flex items-center gap-2">
                           <CheckCircleIcon className="w-5 h-5"/> Approuver
                        </button>
                        <button onClick={() => setRejectionCandidate(prop)} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition-colors flex items-center gap-2">
                            <XCircleIcon className="w-5 h-5"/> Rejeter
                        </button>
                    </div>
                )}
            </div>
        )) : (
            <div className="text-center py-12 text-gray-500">
                <p>Aucune propriété dans cette catégorie.</p>
            </div>
        )}
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Tableau de Bord Administrateur</h2>
          <p className="text-lg text-gray-600">Gérez les utilisateurs et validez les publications.</p>
        </div>

        <div className="flex border-b">
          <button onClick={() => setActiveTab('properties')} className={`px-6 py-3 font-semibold ${activeTab === 'properties' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
            Approbation des Propriétés
          </button>
          <button onClick={() => setActiveTab('users')} className={`px-6 py-3 font-semibold ${activeTab === 'users' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
            Gestion des Utilisateurs
          </button>
        </div>

        {activeTab === 'properties' && (
          <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button onClick={() => setPropertyFilter('PENDING')} className={`flex-1 py-2 rounded-md font-semibold text-sm ${propertyFilter === 'PENDING' ? 'bg-white shadow' : ''}`}>En attente ({pending.length})</button>
                  <button onClick={() => setPropertyFilter('APPROVED')} className={`flex-1 py-2 rounded-md font-semibold text-sm ${propertyFilter === 'APPROVED' ? 'bg-white shadow' : ''}`}>Approuvées ({approved.length})</button>
                  <button onClick={() => setPropertyFilter('REJECTED')} className={`flex-1 py-2 rounded-md font-semibold text-sm ${propertyFilter === 'REJECTED' ? 'bg-white shadow' : ''}`}>Rejetées ({rejected.length})</button>
              </div>
              <PropertyList list={filteredProperties} />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <h3 className="text-xl font-bold p-6">Liste des Utilisateurs</h3>
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b">
                      <tr>
                          <th className="p-4 font-semibold">Nom</th>
                          <th className="p-4 font-semibold">Email</th>
                          <th className="p-4 font-semibold">Rôle</th>
                      </tr>
                      </thead>
                      <tbody>
                      {users.map(user => (
                          <tr key={user.id} className="border-b last:border-b-0 hover:bg-gray-50">
                              <td className="p-4 font-semibold">{user.name}</td>
                              <td className="p-4 text-gray-600">{user.email}</td>
                              <td className="p-4">
                                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${user.role === UserRole.SELLER ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                      {user.role === UserRole.SELLER ? 'Vendeur' : 'Acheteur'}
                                  </span>
                              </td>
                          </tr>
                      ))}
                      </tbody>
                  </table>
              </div>
          </div>
        )}
      </div>
      <ConfirmationDialog
        isOpen={!!rejectionCandidate}
        onClose={() => setRejectionCandidate(null)}
        onConfirm={handleConfirmRejection}
        title="Confirmer le Rejet"
        message={`Êtes-vous sûr de vouloir rejeter la propriété "${rejectionCandidate?.title}" ? Cette action est définitive.`}
      />
    </>
  );
};

export default AdminDashboard;
