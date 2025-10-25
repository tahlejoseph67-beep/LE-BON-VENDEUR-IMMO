import React, { useState } from 'react';
import { editImageWithGemini } from '../services/geminiService';
import Modal from './Modal';
import { Wand2Icon, LoaderIcon } from './icons';

interface ImageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onImageEdited: (newBase64Image: string) => void;
  base64Image: string;
  mimeType: string;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ isOpen, onClose, onImageEdited, base64Image, mimeType }) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer une instruction de modification.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);

    try {
      const newBase64Image = await editImageWithGemini(base64Image, mimeType, prompt);
      setEditedImage(newBase64Image);
    } catch (err) {
      setError("Échec de la modification de l'image. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAccept = () => {
    if (editedImage) {
        onImageEdited(editedImage);
        resetStateAndClose();
    }
  }
  
  const resetStateAndClose = () => {
    setPrompt('');
    setIsLoading(false);
    setError(null);
    setEditedImage(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={resetStateAndClose} title="Modifier l'Image avec l'IA">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="border rounded-lg overflow-hidden">
                <p className="text-center bg-gray-100 p-2 text-sm font-semibold">Originale</p>
                <img src={`data:${mimeType};base64,${base64Image}`} alt="Original" className="w-full h-auto object-contain max-h-64"/>
            </div>
            <div className="border rounded-lg overflow-hidden">
                 <p className="text-center bg-gray-100 p-2 text-sm font-semibold">Modifiée</p>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 bg-gray-50">
                        <LoaderIcon className="w-8 h-8 text-indigo-600 animate-spin" />
                    </div>
                ) : editedImage ? (
                    <img src={`data:image/png;base64,${editedImage}`} alt="Modifiée" className="w-full h-auto object-contain max-h-64"/>
                ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-50 text-gray-500">
                        Votre image modifiée apparaîtra ici
                    </div>
                )}
            </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="ex: 'Rendre le ciel plus ensoleillé'"
            className="flex-grow w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            disabled={isLoading}
          />
          <button
            onClick={handleEdit}
            disabled={isLoading}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            <Wand2Icon className="w-5 h-5 mr-2" />
            {isLoading ? 'Modification...' : 'Appliquer'}
          </button>
        </div>
        
        {editedImage && (
             <div className="flex justify-end gap-2 pt-4">
                <button onClick={resetStateAndClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">Annuler</button>
                <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">Accepter & Utiliser</button>
            </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageEditor;