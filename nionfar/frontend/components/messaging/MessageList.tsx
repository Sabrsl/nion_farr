import React, { useRef, useEffect } from 'react';
import { Message, User } from '../../types';
import { FiClock, FiCheck, FiCheckCircle, FiPaperclip, FiDownload, FiImage, FiFile } from 'react-icons/fi';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
  recipientUser?: User;
  isLoading?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUser,
  recipientUser,
  isLoading = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.createdAt || new Date());
    const dateKey = date.toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    
    groups[dateKey].push(message);
    return groups;
  }, {});
  
  // Format date for display
  const formatMessageDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return format(date, 'HH:mm', { locale: fr });
    } catch (error) {
      return '';
    }
  };
  
  // Format date header
  const formatDateHeader = (dateKey: string) => {
    try {
      const date = new Date(dateKey);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Aujourd\'hui';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Hier';
      } else {
        return format(date, 'EEEE d MMMM yyyy', { locale: fr });
      }
    } catch (error) {
      return dateKey;
    }
  };
  
  // Return file icon based on MIME type
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return <FiImage className="h-5 w-5" />;
    } else if (mimeType.startsWith('video/')) {
      return <FiFile className="h-5 w-5" />;
    } else if (mimeType.startsWith('audio/')) {
      return <FiFile className="h-5 w-5" />;
    } else if (mimeType.includes('pdf')) {
      return <FiFile className="h-5 w-5" />;
    } else if (mimeType.includes('document') || mimeType.includes('sheet') || mimeType.includes('presentation')) {
      return <FiFile className="h-5 w-5" />;
    } else {
      return <FiPaperclip className="h-5 w-5" />;
    }
  };
  
  // Generate file size display
  const formatFileSize = (bytes?: number | string) => {
    if (!bytes) return '';
    
    const byteSize = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(byteSize)) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = byteSize;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  
  // Get message status icon
  const getMessageStatusIcon = (message: Message) => {
    if (message.isTemporary) {
      return <FiClock className="h-3.5 w-3.5 text-gray-400" />;
    } else if (message.isRead) {
      return <FiCheckCircle className="h-3.5 w-3.5 text-blue-500" />;
    } else if (message.isDelivered) {
      return <FiCheck className="h-3.5 w-3.5 text-gray-500" />;
    } else {
      return <FiClock className="h-3.5 w-3.5 text-gray-400" />;
    }
  };
  
  // Determine if the message is from the current user
  const isOwnMessage = (message: Message) => {
    return message.sender?.id === currentUser.id;
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col flex-grow p-4 space-y-8 overflow-y-auto">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-2/3 ${i % 2 === 0 ? 'mr-auto' : 'ml-auto'}`}>
                <div className={`p-3 rounded-lg ${i % 2 === 0 ? 'bg-gray-200 rounded-tl-none' : 'bg-indigo-200 rounded-tr-none'}`}>
                  <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-5/6"></div>
                </div>
                <div className="h-3 mt-1 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
          <FiCheck className="h-8 w-8 text-indigo-600" />
        </div>
        <h3 className="text-gray-700 font-medium mb-1">Commencez la conversation</h3>
        <p className="text-gray-500 text-sm max-w-md">
          Envoyez votre premier message à {recipientUser?.name || recipientUser?.username || 'ce contact'} pour démarrer la conversation.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col flex-grow p-4 overflow-y-auto">
      {/* Messages groupés par date */}
      {Object.keys(groupedMessages).map((dateKey, index) => (
        <div key={dateKey} className="mb-6">
          {/* Date header */}
          <div className="flex justify-center mb-4">
            <div className="bg-gray-100 px-3 py-1 rounded-full text-xs text-gray-600 font-medium">
              {formatDateHeader(dateKey)}
            </div>
          </div>
          
          {/* Messages for this date */}
          <div className="space-y-3">
            {groupedMessages[dateKey].map((message, messageIndex) => {
              const own = isOwnMessage(message);
              const showAvatar = own 
                ? messageIndex === 0 || isOwnMessage(groupedMessages[dateKey][messageIndex - 1]) !== own
                : messageIndex === 0 || isOwnMessage(groupedMessages[dateKey][messageIndex - 1]) !== own;
              
              return (
                <div 
                  key={message.id || `temp-${messageIndex}`} 
                  className={`flex ${own ? 'justify-end' : 'justify-start'}`}
                  id={`message-${message.id}`}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] ${own ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className="flex-shrink-0">
                        {own ? (
                          <div className="w-8 h-8">
                            {currentUser.avatar ? (
                              <img 
                                src={currentUser.avatar} 
                                alt={currentUser.name || 'Moi'} 
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/avatar-placeholder.jpg';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
                                {(currentUser.name || 'M').charAt(0)}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-8">
                            {recipientUser?.avatar ? (
                              <img 
                                src={recipientUser.avatar} 
                                alt={recipientUser.name || recipientUser.username || 'Contact'} 
                                className="w-8 h-8 rounded-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/images/avatar-placeholder.jpg';
                                }}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                {(recipientUser?.name || recipientUser?.username || 'C').charAt(0)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-8 flex-shrink-0"></div>
                    )}
                    
                    {/* Message content */}
                    <div className={`flex flex-col ${own ? 'items-end' : 'items-start'}`}>
                      {/* Message bubble */}
                      <div 
                        className={`p-3 rounded-lg ${
                          own 
                            ? 'bg-indigo-600 text-white rounded-br-none' 
                            : 'bg-gray-100 text-gray-800 rounded-bl-none'
                        } ${message.isTemporary ? 'opacity-70' : ''}`}
                      >
                        {/* Text content */}
                        <div className="whitespace-pre-wrap break-words text-sm">
                          {message.content}
                        </div>
                        
                        {/* Attachments */}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((file, fileIndex) => (
                              <div 
                                key={fileIndex} 
                                className={`flex items-center p-2 rounded ${
                                  own ? 'bg-indigo-700' : 'bg-gray-200'
                                }`}
                              >
                                <div className={`mr-2 ${own ? 'text-indigo-200' : 'text-gray-600'}`}>
                                  {getFileIcon(file.type || 'application/octet-stream')}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className={`text-sm font-medium truncate ${own ? 'text-white' : 'text-gray-800'}`}>
                                    {file.name}
                                  </div>
                                  <div className={`text-xs ${own ? 'text-indigo-200' : 'text-gray-600'}`}>
                                    {formatFileSize(file.size)}
                                  </div>
                                </div>
                                <a 
                                  href={file.url} 
                                  download={file.name}
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`p-2 rounded-full ${
                                    own 
                                      ? 'text-indigo-200 hover:text-white hover:bg-indigo-800' 
                                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-300'
                                  }`}
                                >
                                  <FiDownload className="h-4 w-4" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp and status */}
                      <div className={`mt-1 flex items-center gap-1 text-xs text-gray-500 ${own ? 'justify-end' : ''}`}>
                        <span>{formatMessageDate(message.createdAt)}</span>
                        {own && (
                          <span className="ml-1">
                            {getMessageStatusIcon(message)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Reference for auto-scrolling */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList; 