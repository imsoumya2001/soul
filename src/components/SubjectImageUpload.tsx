'use client'

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, User } from 'lucide-react'
import Image from 'next/image'
import { RecentFace } from '@/types'

interface SubjectImageUploadProps {
  onImageSelect: (file: File | null) => void
  selectedImage: File | null
}

export default function SubjectImageUpload({ onImageSelect, selectedImage }: SubjectImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [recentFaces, setRecentFaces] = useState<RecentFace[]>([])

  useEffect(() => {
    // Load recent faces from localStorage
    const stored = localStorage.getItem('recentFaces')
    if (stored) {
      try {
        const faces = JSON.parse(stored)
        setRecentFaces(faces.slice(0, 5)) // Keep only last 5
      } catch (error) {
        console.error('Error loading recent faces:', error)
      }
    }
  }, [])

  const saveToRecentFaces = (file: File, previewUrl: string) => {
    const newFace: RecentFace = {
      id: Date.now().toString(),
      imageUrl: previewUrl,
      thumbnail: previewUrl,
      uploadedAt: new Date()
    }

    const updatedFaces = [newFace, ...recentFaces.filter(f => f.imageUrl !== previewUrl)].slice(0, 5)
    setRecentFaces(updatedFaces)
    localStorage.setItem('recentFaces', JSON.stringify(updatedFaces))
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      onImageSelect(file)
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreview(result)
        saveToRecentFaces(file, result)
      }
      reader.readAsDataURL(file)
    }
  }, [onImageSelect, recentFaces])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  })

  const selectRecentFace = async (face: RecentFace) => {
    try {
      // Convert data URL back to File
      const response = await fetch(face.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `recent-face-${face.id}`, { type: blob.type })
      
      onImageSelect(file)
      setPreview(face.imageUrl)
    } catch (error) {
      console.error('Error selecting recent face:', error)
    }
  }

  const clearImage = () => {
    onImageSelect(null)
    setPreview(null)
  }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
            ${isDragActive && !isDragReject ? 'border-blue-500 bg-blue-50' : ''}
            ${isDragReject ? 'border-red-500 bg-red-50' : ''}
            ${!isDragActive ? 'border-gray-300 hover:border-gray-400 hover:bg-gray-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            {isDragActive ? 'Drop the subject image here' : 'Drag and drop or click to upload subject image'}
          </p>
          <p className="text-sm text-gray-500">
            Supports JPG, PNG, WebP up to 10MB
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={preview}
              alt="Selected subject"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Recent Faces */}
      {recentFaces.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-700">Recently Used Faces</h3>
            <span className="text-xs text-gray-500">Click to reuse</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {recentFaces.map((face) => (
              <button
                key={face.id}
                onClick={() => selectRecentFace(face)}
                className="flex-shrink-0 relative w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group"
              >
                <Image
                  src={face.thumbnail}
                  alt="Recent face"
                  fill
                  className="object-contain group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                  <User className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}