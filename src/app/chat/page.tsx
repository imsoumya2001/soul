'use client'

import { useState, useEffect } from 'react'
import { Send, Download, RotateCcw } from 'lucide-react'
import Image from 'next/image'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  imageUrl?: string
}

interface SessionData {
  generatedImage: string
  referenceImages?: string[]
  timestamp: number
}

export default function ChatPage() {
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [currentImage, setCurrentImage] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load session data from localStorage
    const storedData = localStorage.getItem('euphoria_edit_session')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setSessionData(data)
        setCurrentImage(data.generatedImage)
        
        // Add welcome message
        setMessages([{
          id: '1',
          content: 'Hi! I can help you edit your generated image. What changes would you like to make?',
          role: 'assistant',
          timestamp: new Date()
        }])
      } catch (error) {
        console.error('Error loading session data:', error)
      }
    }
  }, [])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentImage || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat-edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          currentImageUrl: currentImage,
          conversationHistory: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: data.response,
          role: 'assistant',
          timestamp: new Date(),
          imageUrl: data.newImageUrl
        }

        setMessages(prev => [...prev, assistantMessage])
        
        // Update current image if a new one was generated
        if (data.newImageUrl) {
          setCurrentImage(data.newImageUrl)
        }
      } else {
        throw new Error(data.error || 'Failed to process request')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!currentImage) return
    
    const link = document.createElement('a')
    link.href = currentImage
    link.download = `soul-ai-edited-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleReset = () => {
    if (sessionData) {
      setCurrentImage(sessionData.generatedImage)
      setMessages([{
        id: Date.now().toString(),
        content: 'Image reset to original. What would you like to edit?',
        role: 'assistant',
        timestamp: new Date()
      }])
    }
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Image Session Found</h1>
          <p className="text-gray-600">Please generate an image first and then use the "Chat to Edit" feature.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h1 className="text-2xl font-bold">Soul AI - Chat to Edit</h1>
            <p className="text-purple-100 mt-2">Describe the changes you'd like to make to your image</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Image Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Current Image</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
              
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                {currentImage && (
                  <Image
                    src={currentImage}
                    alt="Current edited image"
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            </div>
            
            {/* Chat Panel */}
            <div className="flex flex-col h-[600px]">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Chat</h2>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg border">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      {message.imageUrl && (
                        <div className="mt-2 relative aspect-square w-32 rounded overflow-hidden">
                          <Image
                            src={message.imageUrl}
                            alt="Generated variation"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                        <span className="text-sm">Processing your request...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Input */}
              <div className="mt-4 flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Describe the changes you want to make..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}