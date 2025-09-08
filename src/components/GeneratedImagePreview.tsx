'use client'

import { useState } from 'react'
import { RefreshCw, MessageCircle, Download, Image as ImageIcon, Video } from 'lucide-react'
import Image from 'next/image'
import ChatToEdit from '@/components/ChatToEdit'
import { GradientButton } from '@/components/ui/gradient-button'
import { AILoader } from '@/components/ui/ai-loader'

interface GeneratedImagePreviewProps {
  imageUrl: string | null
  isGenerating: boolean
  onRegenerate: () => void
  onImageUpdate?: (newImageUrl: string) => void
  onLiveVideo?: (imageUrl: string) => Promise<void>
  isGeneratingVideo?: boolean
}

export default function GeneratedImagePreview({ 
  imageUrl, 
  isGenerating, 
  onRegenerate,
  onImageUpdate,
  onLiveVideo,
  isGeneratingVideo = false
}: GeneratedImagePreviewProps) {
  const [showChat, setShowChat] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleDownload = () => {
    if (!imageUrl) return
    
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `generated-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isGenerating) {
    return (
      <div className="aspect-square rounded-lg bg-gray-50 border border-gray-200 flex flex-col items-center justify-center space-y-3">
        <AILoader text="Generating" />
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="aspect-square rounded-lg bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center space-y-3">
        <ImageIcon className="h-12 w-12 text-gray-400" />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">Generated Image</p>
          <p className="text-xs text-gray-500 mt-1">
            Upload images and click generate to see results
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Generated Image */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border border-gray-200">
        <Image
          src={imageUrl}
          alt="Generated image"
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Loading overlay for image updates */}
        {isUpdating && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-4 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-900 border-t-transparent"></div>
              <span className="text-sm font-medium text-gray-900">Updating image...</span>
            </div>
          </div>
        )}
        
        {/* Overlay with download button */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
          <button
            onClick={handleDownload}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-white hover:bg-gray-50 text-gray-800 p-2.5 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <GradientButton
          onClick={onRegenerate}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Regenerate</span>
        </GradientButton>
        
        <GradientButton
          onClick={() => setShowChat(!showChat)}
          variant="variant"
          className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Chat to Edit</span>
        </GradientButton>
        
        <button
          onClick={async () => {
            if (onLiveVideo && imageUrl) {
              await onLiveVideo(imageUrl);
            }
          }}
          disabled={!imageUrl || isGeneratingVideo || isGenerating}
          className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-md"
        >
          {isGeneratingVideo ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Video className="h-4 w-4" />
              <span>Live Video</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Interface */}
      {showChat && (
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <ChatToEdit 
            currentImageUrl={imageUrl}
            onImageUpdate={(newImageUrl: string) => {
              if (onImageUpdate) {
                onImageUpdate(newImageUrl)
              }
            }}
            onLoadingChange={setIsUpdating}
            onAddToCanvas={onImageUpdate}
          />
        </div>
      )}
    </div>
  )
}