'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Link } from 'lucide-react'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  selectedImage: File | null
  placeholder: string
}

export default function ImageUpload({ onImageSelect, selectedImage, placeholder }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onImageSelect(file)
      const reader = new FileReader()
      reader.onload = () => setPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }, [onImageSelect])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return
    
    try {
      const response = await fetch(urlInput)
      const blob = await response.blob()
      const file = new File([blob], 'image-from-url', { type: blob.type })
      
      onImageSelect(file)
      setPreview(urlInput)
      setShowUrlInput(false)
      setUrlInput('')
    } catch (error) {
      console.error('Error fetching image from URL:', error)
      alert('Failed to load image from URL')
    }
  }

  const clearImage = () => {
    onImageSelect(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 group
              ${isDragActive && !isDragReject ? 'border-gray-900 bg-gray-50' : ''}
              ${isDragReject ? 'border-red-500 bg-red-50' : ''}
              ${!isDragActive ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-10 w-10 text-gray-400 mb-4 group-hover:text-gray-600 transition-colors duration-200" />
            <p className="text-base font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop the image here' : placeholder}
            </p>
            <p className="text-sm text-gray-500">
              Supports JPG, PNG, WebP up to 10MB
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
          {!showUrlInput ? (
            <button
              onClick={() => setShowUrlInput(true)}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              <Link className="h-4 w-4 text-gray-600" />
              <span className="text-gray-700 font-medium">Paste Image URL</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition-all duration-200"
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Load
              </button>
              <button
                onClick={() => {
                  setShowUrlInput(false)
                  setUrlInput('')
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="relative group">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image
              src={preview}
              alt="Selected image"
              fill
              className="object-cover"
            />
          </div>
          <button
            onClick={clearImage}
            className="absolute top-3 right-3 p-1.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-sm"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}