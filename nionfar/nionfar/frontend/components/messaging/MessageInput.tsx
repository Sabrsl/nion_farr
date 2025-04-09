import React, { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { 
  FiSend, 
  FiPaperclip, 
  FiX, 
  FiSmile, 
  FiImage, 
  FiFile, 
  FiFileText,
  FiUploadCloud
} from 'react-icons/fi/index.js';

interface Attachment {
  id?: string;
  file: File;
  preview?: string;
  uploading?: boolean;
  error?: string;
  progress?: number;
}

interface MessageInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  maxAttachments?: number;
  isSending?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Écrivez votre message...',
  maxAttachments = 5,
  isSending = false
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Autoredimensionnement du textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  };
  
  // Gérer les pièces jointes
  const handleAttachmentClick = () => {
    if (attachments.length >= maxAttachments) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxAttachments} fichiers.`);
      return;
    }
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Vérifier le nombre total de pièces jointes
    if (attachments.length + files.length > maxAttachments) {
      alert(`Vous ne pouvez pas ajouter plus de ${maxAttachments} fichiers.`);
      return;
    }
    
    // Ajouter chaque fichier
    const newAttachments: Attachment[] = [];
    
    Array.from(files).forEach(file => {
      // Vérifier la taille du fichier (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Le fichier ${file.name} est trop volumineux. La taille maximale est de 10MB.`);
        return;
      }
      
      // Créer un aperçu pour les images
      let preview = undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }
      
      newAttachments.push({
        file,
        preview,
        uploading: false,
        progress: 0
      });
    });
    
    setAttachments([...attachments, ...newAttachments]);
    
    // Réinitialiser l'input file
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    
    // Libérer l'URL de l'aperçu si elle existe
    if (newAttachments[index].preview) {
      URL.revokeObjectURL(newAttachments[index].preview!);
    }
    
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  // Obtenir une icône basée sur le type de fichier
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FiImage className="h-5 w-5" />;
    } else if (fileType.includes('pdf')) {
      return <FiFileText className="h-5 w-5" />;
    } else if (fileType.includes('document') || fileType.includes('msword') || fileType.includes('officedocument')) {
      return <FiFileText className="h-5 w-5" />;
    } else {
      return <FiFile className="h-5 w-5" />;
    }
  };
  
  // Formater la taille du fichier
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Gérer l'envoi du message
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if ((!trimmedMessage && attachments.length === 0) || disabled || isSending) {
      return;
    }
    
    // Envoyer le message avec les pièces jointes
    onSendMessage(
      trimmedMessage,
      attachments.map(att => att.file)
    );
    
    // Réinitialiser l'état
    setMessage('');
    
    // Libérer les URL des aperçus
    attachments.forEach(att => {
      if (att.preview) {
        URL.revokeObjectURL(att.preview);
      }
    });
    
    setAttachments([]);
    
    // Réinitialiser la hauteur du textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };
  
  // Gérer le raccourci Entrée pour envoyer (sauf si Maj+Entrée)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 p-4">
      {/* Aperçu des pièces jointes */}
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div 
              key={index} 
              className="relative bg-gray-50 border border-gray-200 rounded-lg p-2 flex items-center gap-2"
            >
              {/* Aperçu pour les images */}
              {attachment.preview ? (
                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                  <img 
                    src={attachment.preview} 
                    alt={attachment.file.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                  {getFileIcon(attachment.file.type)}
                </div>
              )}
              
              {/* Informations sur le fichier */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                  {attachment.file.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachment.file.size)}
                </div>
              </div>
              
              {/* Barre de progression pour l'upload */}
              {attachment.uploading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center">
                  <div className="w-full max-w-[80%] bg-gray-200 rounded-full h-1.5 mx-4">
                    <div 
                      className="bg-indigo-600 h-1.5 rounded-full" 
                      style={{ width: `${attachment.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {/* Bouton de suppression */}
              <button 
                type="button"
                onClick={() => removeAttachment(index)}
                className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
                disabled={attachment.uploading}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Zone de saisie du message */}
      <div className="flex items-end gap-2">
        {/* Bouton pour ajouter des pièces jointes */}
        <button 
          type="button"
          onClick={handleAttachmentClick}
          disabled={disabled || attachments.length >= maxAttachments}
          className={`p-2.5 rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors ${
            disabled || attachments.length >= maxAttachments ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FiPaperclip className="h-5 w-5" />
        </button>
        
        {/* Input caché pour les fichiers */}
        <input 
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain"
        />
        
        {/* Textarea pour le message */}
        <div className="flex-1 relative">
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full py-3 px-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all min-h-[50px] max-h-[150px] ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
            rows={1}
          ></textarea>
          
          {/* Émojis (placeholder) */}
          <button 
            type="button"
            className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600"
            disabled={disabled}
          >
            <FiSmile className="h-5 w-5" />
          </button>
        </div>
        
        {/* Bouton d'envoi */}
        <button 
          type="submit"
          disabled={disabled || isSending || (message.trim() === '' && attachments.length === 0)}
          className={`p-3 rounded-xl bg-indigo-600 text-white flex-shrink-0 transition-colors ${
            (disabled || isSending || (message.trim() === '' && attachments.length === 0))
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-indigo-700'
          }`}
        >
          {isSending ? (
            <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend className="h-5 w-5" />
          )}
        </button>
      </div>
    </form>
  );
};

export default MessageInput; 