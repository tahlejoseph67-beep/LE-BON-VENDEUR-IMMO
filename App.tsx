import React, { useState, useMemo, useCallback } from 'react';
import { Property, User, UserRole, Currency, PropertyStatus } from './types';
import { BuildingIcon } from './components/icons';
import SellerDashboard from './components/SellerDashboard';
import PropertyListings from './components/PropertyListings';
import AdminDashboard from './components/AdminDashboard';
import Chatbot from './components/Chatbot';

// --- Données Fictives ---
const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice (Vendeuse)', email: 'alice@test.com', role: UserRole.SELLER },
  { id: 'user-2', name: 'Bob (Acheteur)', email: 'bob@test.com', role: UserRole.BUYER },
  { id: 'user-3', name: 'Charles (Admin)', email: 'admin@test.com', role: UserRole.ADMIN },
];

const MOCK_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    ownerId: 'user-1',
    title: 'Loft Moderne en Centre-Ville',
    description: 'Un magnifique et spacieux loft au cœur de la ville. Offre une vue imprenable, des planchers de bois franc et une cuisine ultramoderne. Parfait pour la vie urbaine.',
    price: 785000000,
    location: 'Dakar, SN',
    imageUrl: 'https://picsum.photos/seed/prop1/800/600',
    views: 1523,
    likes: 251,
    isSold: false,
    status: 'APPROVED',
    bedrooms: 2,
    lat: 14.7167,
    lng: -17.4677,
  },
  {
    id: 'prop-2',
    ownerId: 'user-1',
    title: 'Maison de Banlieue Agréable',
    description: 'Charmante maison de 3 chambres dans un quartier de banlieue calme. Grand jardin, salles de bains récemment rénovées et un garage pour deux voitures. Idéal pour les familles.',
    price: 490000000,
    location: 'Saly, SN',
    imageUrl: 'https://picsum.photos/seed/prop2/800/600',
    promoVideoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    views: 890,
    likes: 134,
    isSold: true,
    status: 'APPROVED',
    bedrooms: 3,
    lat: 14.4458,
    lng: -17.0053,
  },
   {
    id: 'prop-3',
    ownerId: 'user-1',
    title: 'Villa en Bord de Mer avec Vue Océan',
    description: 'Villa époustouflante directement sur la côte. Profitez de vues panoramiques sur l\'océan depuis chaque pièce. Comprend une piscine privée et un accès direct à la plage.',
    price: 2290000000,
    location: 'Nguerring, SN',
    imageUrl: 'https://picsum.photos/seed/prop3/800/600',
    views: 2845,
    likes: 789,
    isSold: false,
    status: 'APPROVED',
    bedrooms: 5,
    lat: 14.3667,
    lng: -16.9500,
  },
  {
    id: 'prop-4',
    ownerId: 'user-1',
    title: 'Chalet de Montagne Rustique',
    description: 'Un chalet confortable niché dans les montagnes. Parfait pour les escapades hivernales et les amoureux de la nature.',
    price: 320000000,
    location: 'Alpes, FR',
    imageUrl: 'https://picsum.photos/seed/prop4/800/600',
    views: 0,
    likes: 0,
    isSold: false,
    status: 'PENDING',
    bedrooms: 4,
    lat: 45.9237,
    lng: 6.8694,
  }
];

// --- Composants Auxiliaires ---
const UserSwitcher: React.FC<{
  currentUser: User;
  setCurrentUser: (user: User) => void;
}> = ({ currentUser, setCurrentUser }) => (
  <div className="absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md border z-20">
    <span className="text-sm font-semibold mr-2">Changer d'utilisateur :</span>
    <select
      value={currentUser.id}
      onChange={(e) => setCurrentUser(MOCK_USERS.find(u => u.id === e.target.value)!)}
      className="text-sm border-gray-300 rounded-md"
    >
      {MOCK_USERS.map(user => (
        <option key={user.id} value={user.id}>{user.name}</option>
      ))}
    </select>
  </div>
);

const CurrencySwitcher: React.FC<{
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}> = ({ currency, setCurrency }) => (
  <div className="absolute top-20 right-4 bg-white p-2 rounded-lg shadow-md border z-20 md:top-4 md:right-64">
    <span className="text-sm font-semibold mr-2">Devise :</span>
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as Currency)}
      className="text-sm border-gray-300 rounded-md"
    >
      <option value="XOF">XOF</option>
      <option value="USD">Dollar</option>
      <option value="EUR">Euro</option>
    </select>
  </div>
);

const Header: React.FC<{ currentUser: User }> = ({ currentUser }) => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <BuildingIcon className="w-8 h-8 text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-800">LE BON VENDEUR IMMO</h1>
      </div>
      <div className="text-right">
        <p className="font-semibold">{currentUser.name}</p>
        <p className="text-sm text-gray-500">{
            currentUser.role === UserRole.SELLER ? 'Vendeur' : 
            currentUser.role === UserRole.BUYER ? 'Acheteur' : 'Admin'
        }</p>
      </div>
    </div>
  </header>
);

// --- Composant Principal de l'Application ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);
  const [properties, setProperties] = useState<Property[]>(MOCK_PROPERTIES);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());
  const [currency, setCurrency] = useState<Currency>('XOF');

  const userProperties = useMemo(
    () => properties.filter(p => p.ownerId === currentUser.id),
    [properties, currentUser]
  );
  
  const handleUpdateProperty = useCallback((updatedProperty: Property) => {
    setProperties(prev => prev.map(p => p.id === updatedProperty.id ? updatedProperty : p));
  }, []);

  const handleAddProperty = useCallback((newProperty: Property) => {
    setProperties(prev => [newProperty, ...prev]);
  }, []);

  const handleLike = useCallback((propertyId: string) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, likes: p.likes + 1 } : p));
  }, []);

  const handlePurchase = useCallback((propertyId: string) => {
    setPurchasedIds(prev => new Set(prev).add(propertyId));
     // Ici, vous pourriez aussi mettre à jour le statut de la propriété, etc.
  }, []);
  
  const handleUpdatePropertyStatus = useCallback((propertyId: string, status: PropertyStatus) => {
    setProperties(prev => prev.map(p => p.id === propertyId ? { ...p, status } : p));
  }, []);


  return (
    <div className="min-h-screen bg-gray-100">
      <UserSwitcher currentUser={currentUser} setCurrentUser={setCurrentUser} />
      <CurrencySwitcher currency={currency} setCurrency={setCurrency} />
      <Header currentUser={currentUser} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {currentUser.role === UserRole.SELLER ? (
          <SellerDashboard 
            properties={userProperties} 
            onUpdateProperty={handleUpdateProperty}
            onAddProperty={handleAddProperty}
            ownerId={currentUser.id}
            currency={currency}
          />
        ) : currentUser.role === UserRole.BUYER ? (
          <PropertyListings 
            properties={properties}
            onLike={handleLike}
            onPurchase={handlePurchase}
            purchasedIds={purchasedIds}
            currency={currency}
           />
        ) : (
          <AdminDashboard
            users={users.filter(u => u.role !== UserRole.ADMIN)}
            properties={properties}
            onUpdatePropertyStatus={handleUpdatePropertyStatus}
            currency={currency}
          />
        )}
      </main>
      <Chatbot properties={properties.filter(p => p.status === 'APPROVED')} />
    </div>
  );
};

export default App;