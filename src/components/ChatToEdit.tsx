'use client'

import { useState } from 'react'
import { Send, Bot, User, MessageCircle } from 'lucide-react'
import { ChatMessage } from '@/types'

interface ChatToEditProps {
  currentImageUrl: string
  onImageUpdate: (newImageUrl: string) => void
  onLoadingChange?: (isLoading: boolean) => void
  onAddToCanvas?: (imageUrl: string) => void
}

export default function ChatToEdit({ currentImageUrl, onImageUpdate, onLoadingChange, onAddToCanvas }: ChatToEditProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsProcessing(true)
    onLoadingChange?.(true)

    try {
      const response = await fetch('/api/chat-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          currentImageUrl: currentImageUrl, // Always use current canvas image
          conversationHistory: messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to process edit request')
      }

      const result = await response.json()
      
      if (result.success) {
          // Add assistant response with or without image
          const assistantMessage: ChatMessage = {
            id: Date.now().toString() + '_assistant',
            content: result.newImageUrl ? 'Here\'s your updated image:' : result.response,
            role: 'assistant',
            timestamp: new Date(),
            imageUrl: result.newImageUrl || undefined,
            hasAddToCanvas: !!result.newImageUrl
          }
          setMessages(prev => [...prev, assistantMessage])
        } else {
          throw new Error(result.error || 'Failed to generate image')
        }
      
      // Clear input after successful processing
      setInputValue('')
    } catch (error) {
      console.error('Error processing chat edit:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsProcessing(false)
      onLoadingChange?.(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4 shadow-sm">
      <div className="flex items-center space-x-2 pb-3 border-b border-gray-100">
        <MessageCircle className="h-4 w-4 text-gray-800" />
        <span className="text-sm font-medium text-gray-900">
          Edit with Chat
        </span>
      </div>

      {/* Messages */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 font-medium">
              Describe your edits in natural language
            </p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Try: "Change to summer clothes" or "Make background darker"
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-gray-700" />
                </div>
              )}
              <div
                className={`max-w-xs px-3 py-2.5 rounded-lg text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-50 text-gray-800 border border-gray-100'
                }`}
              >
                {message.content}
                {message.imageUrl && (
                  <div className="mt-2">
                    <img 
                      src={message.imageUrl} 
                      alt="Generated image" 
                      className="w-full rounded-lg border"
                    />
                    {message.hasAddToCanvas && onAddToCanvas && (
                      <button
                        onClick={() => onAddToCanvas(message.imageUrl!)}
                        className="mt-2 w-full px-3 py-1.5 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
                      >
                        Add to Canvas
                      </button>
                    )}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-7 h-7 bg-gray-900 rounded-full flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isProcessing && (
          <div className="flex space-x-3 justify-start">
            <div className="flex-shrink-0 w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <Bot className="h-3.5 w-3.5 text-gray-700" />
            </div>
            <div className="bg-gray-50 text-gray-800 border border-gray-100 px-3 py-2.5 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Describe your changes..."
          disabled={isProcessing}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 text-sm disabled:opacity-50 bg-white placeholder-gray-400 text-gray-900"
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isProcessing}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}