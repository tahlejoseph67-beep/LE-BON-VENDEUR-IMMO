import React, { useState, useEffect } from 'react';
import { Property } from '../types';
import { PlusCircleIcon, Wand2Icon, VideoIcon } from './icons';
import ImageEditor from './ImageEditor';
import VideoGenerator from './VideoGenerator';

interface PropertyFormProps {
  property?: Property;
  onSave: (property: Property) => void;
  onCancel: () => void;
  ownerId: string;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ property, onSave, onCancel, ownerId }) => {
  const [formData, setFormData] = useState<Omit<Property, 'id' | 'views' | 'likes' | 'isSold' | 'status'>>({
    ownerId: ownerId,
    title: '',
    description: '',
    price: 0,
    location: '',
    imageUrl: '',
    promoVideoUrl: '',
    bedrooms: 0,
  });
  
  const [imageFile, setImageFile] = useState<{file: File, base64: string} | null>(null);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [isVideoGeneratorOpen, setIsVideoGeneratorOpen] = useState(false);

  useEffect(() => {
    if (property) {
      const { id, views, likes, isSold, status, ...editableData } = property;
      setFormData(editableData);
    }
  }, [property]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'bedrooms') ? parseFloat(value) || 0 : value }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              setImageFile({ file, base64: base64String });
              setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
          };
          reader.readAsDataURL(file);
      }
  }

  const handleImageEdited = (newBase64Image: string) => {
    if (imageFile) {
        setImageFile(prev => prev ? { ...prev, base64: newBase64Image } : null);
        setFormData(prev => ({...prev, imageUrl: `data:image/png;base64,${newBase64Image}`}));
    }
  }
  
  const handleVideoGenerated = (videoUrl: string) => {
      setFormData(prev => ({...prev, promoVideoUrl: videoUrl}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalProperty: Property = {
        ...formData,
        id: property?.id || `prop-${new Date().getTime()}`,
        views: property?.views || 0,
        likes: property?.likes || 0,
        isSold: property?.isSold || false,
        status: property?.status || 'PENDING',
    };
    onSave(finalProperty);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">{property ? 'Modifier la Propriété' : 'Ajouter une Nouvelle Propriété'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Titre de la propriété" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Lieu (ex: Dakar, SN)" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 h-24" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Prix" required className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input type="number" name="bedrooms" value={formData.bedrooms || ''} onChange={handleChange} placeholder="Nombre de chambres" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        
        <div className="p-4 border-2 border-dashed rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Image de la Propriété</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100" />
            {formData.imageUrl && <img src={formData.imageUrl} alt="Aperçu de la propriété" className="mt-4 rounded-lg max-h-48" />}
            {imageFile && (
                <button type="button" onClick={() => setIsImageEditorOpen(true)} className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition-colors">
                    <Wand2Icon className="w-5 h-5 mr-2" /> Modifier avec l'IA
                </button>
            )}
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold text-gray-800">Générer une Vidéo Promotionnelle</h3>
            <p className="text-sm text-gray-500">Créez une superbe visite vidéo de la propriété avec l'IA.</p>
            {formData.promoVideoUrl && <p className="text-sm text-green-600 mt-2 font-semibold">Vidéo jointe !</p>}
          </div>
          <button type="button" onClick={() => setIsVideoGeneratorOpen(true)} className="flex items-center px-4 py-2 bg-purple-500 text-white font-semibold rounded-md hover:bg-purple-600 transition-colors">
            <VideoIcon className="w-5 h-5 mr-2" /> Générer la Vidéo
          </button>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Annuler</button>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700">{property ? 'Sauvegarder' : 'Soumettre pour validation'}</button>
        </div>
      </form>
      {imageFile && <ImageEditor isOpen={isImageEditorOpen} onClose={() => setIsImageEditorOpen(false)} base64Image={imageFile.base64} mimeType={imageFile.file.type} onImageEdited={handleImageEdited} />}
      <VideoGenerator isOpen={isVideoGeneratorOpen} onClose={() => setIsVideoGeneratorOpen(false)} onVideoGenerated={handleVideoGenerated} />
    </div>
  );
};

export default PropertyForm;