import { GoogleGenAI, Modality, Chat } from "@google/genai";
import { Property } from '../types';

// FIX: Corrected the global declaration for 'window.aistudio' to use the named type 'AIStudio' as required by the compiler, resolving a declaration conflict.
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    aistudio?: AIStudio;
  }
}

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const base64ToGenerativePart = (base64Data: string, mimeType: string) => {
    return {
        inlineData: { data: base64Data, mimeType: mimeType },
    };
};


export const editImageWithGemini = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = base64ToGenerativePart(base64Image, mimeType);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                imagePart,
                { text: prompt }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE],
        }
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("Aucune image n'a été générée par Gemini.");
};


export const generateVideoWithGemini = async (prompt: string, aspectRatio: '16:9' | '9:16', onProgress: (message: string) => void): Promise<string> => {
    onProgress("Vérification de la clé API...");
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        onProgress("Veuillez sélectionner une clé API pour générer des vidéos.");
        await window.aistudio.openSelectKey();
    }
    
    onProgress("Initialisation de la génération de la vidéo...");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio,
            }
        });

        onProgress("La génération de la vidéo a commencé. Cela peut prendre quelques minutes. Nous vérifierons le statut périodiquement.");

        const progressMessages = [
            "Analyse de votre prompt...",
            "Composition des scènes initiales...",
            "Rendu des images en haute qualité...",
            "Ajout des touches finales...",
            "Presque terminé, finalisation de la vidéo..."
        ];
        let messageIndex = 0;

        while (!operation.done) {
            onProgress(progressMessages[messageIndex % progressMessages.length]);
            messageIndex++;
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (operation.error) {
            throw new Error(`La génération de la vidéo a échoué: ${operation.error.message}`);
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Génération de la vidéo terminée, mais aucun lien de téléchargement n'a été trouvé.");
        }
        
        onProgress("Récupération de la vidéo générée...");
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        if (!videoResponse.ok) {
            throw new Error("Échec du téléchargement de la vidéo générée.");
        }

        const videoBlob = await videoResponse.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error: any) {
        if (error?.message?.includes("Requested entity was not found")) {
            onProgress("Erreur de clé API. Veuillez essayer de sélectionner à nouveau votre clé API.");
             if (window.aistudio) {
                await window.aistudio.openSelectKey();
             }
             throw new Error("La clé API est peut-être invalide ou n'a pas les autorisations nécessaires. Veuillez la resélectionner.");
        }
        console.error("Erreur de génération de vidéo:", error);
        throw error;
    }
};

export const streamChatbotResponse = async (
  properties: Property[],
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const propertyContext = properties.map((p) => ({
    title: p.title,
    description: p.description,
    price: p.price,
    location: p.location,
    bedrooms: p.bedrooms,
    status: p.isSold ? 'Vendue' : 'Disponible',
  }));

  const systemInstruction = `Tu es un assistant immobilier amical et serviable pour l'agence 'LE BON VENDEUR IMMO'. 
Ta mission est de répondre aux questions des utilisateurs en te basant EXCLUSIVEMENT sur les informations des propriétés fournies ci-dessous. 
Ne fournis AUCUNE information qui n'est pas dans la liste. Si tu ne connais pas la réponse, dis-le poliment.
Sois concis et direct.

Voici les propriétés disponibles :
${JSON.stringify(propertyContext, null, 2)}
`;

  const chat: Chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  const result = await chat.sendMessageStream({ message: newMessage });
  return result;
};
