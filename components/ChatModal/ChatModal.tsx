
import React, { useState, useMemo, useEffect, useRef } from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import { BibleData, ChatMode, ChatMessage, Heros, PersonnagePrincipal, ChatHistories } from '../../types';
import { generateChatResponse, isGeminiApiKeyAvailable } from '../../services/geminiService';
import { API_KEY_ERROR_MESSAGE } from '../../constants';
import Loader from '../UI/Loader';
import ChatMessageContent from './ChatMessageContent'; // Import the new component

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  bibleData: BibleData | null;
}

interface ChatCharacterOption {
  id: string;
  name: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, bibleData }) => {
  const [chatMode, setChatMode] = useState<ChatMode>('general');
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatHistories, setChatHistories] = useState<ChatHistories>({});
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isApiKeyAvail = isGeminiApiKeyAvailable();

  const characterOptionsForChat: ChatCharacterOption[] = useMemo(() => {
    if (!bibleData || !bibleData.personnagesSection) return [];
    const options: ChatCharacterOption[] = [];
    if (bibleData.personnagesSection.heros) {
      options.push({ 
        id: bibleData.personnagesSection.heros.id, 
        name: bibleData.personnagesSection.heros.nomComplet || bibleData.personnagesSection.heros.nom 
      });
    }
    bibleData.personnagesSection.personnagesPrincipaux?.forEach(p => {
      if(p.id && (p.nom || p.nomComplet)) { 
        options.push({ id: p.id, name: p.nomComplet || p.nom });
      }
    });
    return options;
  }, [bibleData]);

  const currentChatKey = useMemo(() => {
    if (chatMode === 'general') return 'general';
    if (chatMode === 'private' && selectedParticipantIds.length > 0) {
        return `private_${[...selectedParticipantIds].sort().join('_')}`;
    }
    return 'general'; 
  }, [chatMode, selectedParticipantIds]);

  const currentChatMessages = useMemo(() => {
    return chatHistories[currentChatKey] || [];
  }, [chatHistories, currentChatKey]);

  useEffect(() => {
    if (chatMode === 'general') {
      setSelectedParticipantIds([]);
    }
  }, [chatMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChatMessages]);

  const handleParticipantSelection = (participantId: string) => {
    setSelectedParticipantIds(prev =>
      prev.includes(participantId)
        ? prev.filter(id => id !== participantId)
        : [...prev, participantId]
    );
  };
  
  const getCurrentSenderNameForAI = (): string => {
    if (chatMode === 'private' && selectedParticipantIds.length > 0) {
        if (selectedParticipantIds.length === 1) {
            return characterOptionsForChat.find(c => c.id === selectedParticipantIds[0])?.name || 'Personnage';
        }
        return selectedParticipantIds.map(id => characterOptionsForChat.find(c => c.id === id)?.name).filter(Boolean).join(' & ') || 'Groupe';
    }
    return "L'Univers";
  };


  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoadingAI) return;
    if (!isApiKeyAvail) {
        setErrorAI(API_KEY_ERROR_MESSAGE);
        const errorMsg: ChatMessage = {
            id: `error-${Date.now()}`,
            sender: 'Système',
            text: API_KEY_ERROR_MESSAGE,
            timestamp: Date.now(),
            type: 'error',
        };
        setChatHistories(prev => ({ ...prev, [currentChatKey]: [...(prev[currentChatKey] || []), errorMsg] }));
        return;
    }
    if (chatMode === 'private' && selectedParticipantIds.length === 0) {
        setErrorAI("Veuillez sélectionner au moins un personnage pour envoyer un message privé.");
         const errorUIMsg: ChatMessage = {
            id: `ui-error-${Date.now()}`, sender: 'Système', text: "Veuillez sélectionner au moins un personnage.",
            timestamp: Date.now(), type: 'error',
        };
        setChatHistories(prev => ({ ...prev, [currentChatKey]: [...(prev[currentChatKey] || []), errorUIMsg]}));
        return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'Utilisateur',
      text: currentMessage,
      timestamp: Date.now(),
      type: 'user',
    };
    
    const currentAIName = getCurrentSenderNameForAI();
    const typingIndicator: ChatMessage = {
      id: `typing-${Date.now()}`,
      sender: currentAIName,
      text: `${currentAIName} ${selectedParticipantIds.length > 1 ? 'sont' : 'est'} en train d'écrire...`,
      timestamp: Date.now(),
      type: 'character',
      isTyping: true,
    };

    setChatHistories(prev => ({
      ...prev,
      [currentChatKey]: [...(prev[currentChatKey] || []), userMessage, typingIndicator],
    }));
    
    const messageToSendToAI = currentMessage;
    setCurrentMessage('');
    setIsLoadingAI(true);
    setErrorAI(null);

    try {
      if (!bibleData) throw new Error("Données de la Bible non disponibles.");
      const aiResponseText = await generateChatResponse(
        bibleData,
        chatMode,
        messageToSendToAI,
        selectedParticipantIds, 
        (chatHistories[currentChatKey] || []).filter(m => !m.isTyping) 
      );

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: currentAIName, 
        text: aiResponseText,
        timestamp: Date.now(),
        type: 'character',
      };
      
      setChatHistories(prev => ({
        ...prev,
        [currentChatKey]: (prev[currentChatKey] || []).filter(m => !m.isTyping).concat(aiMessage),
      }));

    } catch (error: any) {
      console.error("Erreur de réponse IA:", error);
      const errorText = error.message || "Une erreur est survenue lors de la communication avec l'IA.";
      setErrorAI(errorText);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'Système',
        text: errorText,
        timestamp: Date.now(),
        type: 'error',
      };
      setChatHistories(prev => ({
        ...prev,
        [currentChatKey]: (prev[currentChatKey] || []).filter(m => !m.isTyping).concat(errorMsg),
      }));
    } finally {
      setIsLoadingAI(false);
    }
  };
  
  const handleCloseModal = () => {
    setCurrentMessage('');
    setErrorAI(null);
    setIsLoadingAI(false);
    onClose();
  }

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleCloseModal} title="Chat avec l'Univers" maxWidthClass="max-w-3xl">
      {!bibleData ? (
        <p className="text-slate-600 text-center py-8">Chargez une Bible pour discuter avec votre univers.</p>
      ) : (
        <div className="flex flex-col h-[70vh]"> {/* Overall container for flex behavior */}
          {/* Sticky Header: Mode Selector & Participant Selector */}
          <div className="sticky top-0 bg-white pt-1 pb-3 mb-2 z-10 border-b border-slate-200">
            <div className="mb-3 flex items-center space-x-4">
              <span className="text-sm font-medium text-slate-700">Mode:</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="radio" name="chatMode" value="general" checked={chatMode === 'general'} onChange={() => setChatMode('general')} className="form-radio h-4 w-4 text-teal-600 border-slate-300 focus:ring-teal-500" />
                <span className="ml-2 text-sm text-slate-700">Général (avec L'Univers)</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input type="radio" name="chatMode" value="private" checked={chatMode === 'private'} onChange={() => setChatMode('private')} className="form-radio h-4 w-4 text-teal-600 border-slate-300 focus:ring-teal-500" />
                <span className="ml-2 text-sm text-slate-700">Message Privé</span>
              </label>
            </div>

            {chatMode === 'private' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Participants (choisir au moins un):</label>
                {characterOptionsForChat.length === 0 ? (
                  <p className="text-sm text-slate-500">Aucun personnage disponible pour le chat privé.</p>
                ) : (
                  <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-md p-1.5 space-y-1 scrollbar-thin bg-white">
                    {characterOptionsForChat.map(char => (
                      <label key={char.id} className="flex items-center p-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedParticipantIds.includes(char.id)}
                          onChange={() => handleParticipantSelection(char.id)}
                          className="form-checkbox h-4 w-4 text-teal-600 border-slate-300 rounded focus:ring-teal-500"
                        />
                        <span className="ml-2 text-sm text-slate-700">{char.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Messages Area: Takes remaining space and scrolls */}
          <div className="flex-grow overflow-y-auto border border-slate-200 p-4 rounded-md mb-4 bg-slate-50 scrollbar-thin space-y-3 min-h-[200px]">
            {currentChatMessages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-xl max-w-[75%] shadow ${
                  msg.type === 'user' ? 'bg-teal-600 text-white' 
                  : msg.type === 'character' ? (msg.isTyping ? 'bg-slate-200 text-slate-600 italic' : 'bg-white text-slate-800 border border-slate-200')
                  : 'bg-red-100 text-red-700 border border-red-300' 
                }`}>
                  <p className="text-xs font-semibold mb-0.5 opacity-80">{msg.sender}</p>
                  {msg.type === 'character' && !msg.isTyping ? <ChatMessageContent text={msg.text} /> : <p className="text-sm break-words whitespace-pre-line">{msg.text}</p>}
                  {!msg.isTyping && <p className="text-[0.65rem] opacity-60 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>}
                </div>
              </div>
            ))}
            {currentChatMessages.length === 0 && !isLoadingAI && <p className="text-slate-400 text-center italic py-10">Commencez la conversation...</p>}
             {isLoadingAI && !currentChatMessages.some(m => m.isTyping) && <Loader message="Chargement de la réponse..." size="sm"/>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex items-center pt-2 border-t border-slate-200">
            <textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={
                !isApiKeyAvail ? "Clé API Gemini manquante..." :
                (chatMode === 'private' && selectedParticipantIds.length === 0 && characterOptionsForChat.length > 0) ? "Sélectionnez au moins un participant..." : 
                "Votre message..."
              }
              rows={2}
              className="flex-grow p-2.5 bg-slate-700 text-slate-100 placeholder-slate-400 border border-slate-600 rounded-l-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm disabled:opacity-50 disabled:bg-slate-500 disabled:text-slate-400 disabled:placeholder-slate-500"
              disabled={isLoadingAI || !isApiKeyAvail || (chatMode === 'private' && selectedParticipantIds.length === 0 && characterOptionsForChat.length > 0)}
            />
            <Button 
              onClick={handleSendMessage} 
              className="rounded-l-none h-full px-5" 
              icon="send"
              isLoading={isLoadingAI}
              disabled={isLoadingAI || !isApiKeyAvail || (chatMode === 'private' && selectedParticipantIds.length === 0 && characterOptionsForChat.length > 0)}
            >
              Envoyer
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ChatModal;
