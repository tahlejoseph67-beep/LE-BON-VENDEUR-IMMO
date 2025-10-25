import React, { useState } from 'react';
import { generateVideoWithGemini } from '../services/geminiService';
import Modal from './Modal';
import { VideoIcon, LoaderIcon } from './icons';

interface VideoGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoGenerated: (videoUrl: string) => void;
}

const VideoGenerator: React.FC<VideoGeneratorProps> = ({ isOpen, onClose, onVideoGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Veuillez entrer un prompt pour la vidéo.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedVideoUrl(null);
    setStatusMessage('Lancement de la génération de la vidéo...');

    try {
      const videoUrl = await generateVideoWithGemini(prompt, aspectRatio, setStatusMessage);
      setGeneratedVideoUrl(videoUrl);
      setStatusMessage('Vidéo générée avec succès !');
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la génération de la vidéo. Veuillez réessayer.';
      setError(errorMessage);
      setStatusMessage(errorMessage);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAccept = () => {
    if (generatedVideoUrl) {
      onVideoGenerated(generatedVideoUrl);
      resetStateAndClose();
    }
  };
  
  const resetStateAndClose = () => {
    setPrompt('');
    setAspectRatio('16:9');
    setIsLoading(false);
    setError(null);
    setGeneratedVideoUrl(null);
    setStatusMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetStateAndClose} title="Générer une Vidéo Promo avec l'IA">
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <LoaderIcon className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-lg font-semibold text-gray-700">Génération de Votre Vidéo</p>
            <p className="text-gray-500">{statusMessage}</p>
          </div>
        ) : generatedVideoUrl ? (
          <div className="space-y-4">
            <video src={generatedVideoUrl} controls className="w-full rounded-lg" />
            <div className="flex justify-end gap-2">
              <button onClick={resetStateAndClose} className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300 transition-colors">Annuler</button>
              <button onClick={handleAccept} className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors">Accepter & Utiliser</button>
            </div>
          </div>
        ) : (
          <>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ex: 'Une visite cinématique d'un appartement de luxe moderne à Paris avec vue sur la Tour Eiffel'"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition h-28"
              disabled={isLoading}
            />
            
            <div className="space-y-2">
              <label className="font-semibold text-gray-700">Format de l'image</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="aspectRatio" value="16:9" checked={aspectRatio === '16:9'} onChange={() => setAspectRatio('16:9')} className="form-radio text-indigo-600" />
                  <span>16:9 (Paysage)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="aspectRatio" value="9:16" checked={aspectRatio === '9:16'} onChange={() => setAspectRatio('9:16')} className="form-radio text-indigo-600" />
                  <span>9:16 (Portrait)</span>
                </label>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <div className="flex justify-end">
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
              >
                <VideoIcon className="w-5 h-5 mr-2" />
                Générer la Vidéo
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default VideoGenerator;