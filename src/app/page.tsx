'use client'

import { useState } from 'react'
import ImageUpload from '@/components/ImageUpload'
import SubjectImageUpload from '@/components/SubjectImageUpload'
import AdvancedParameters from '@/components/AdvancedParameters'
import GeneratedImagePreview from '@/components/GeneratedImagePreview'
import { GenerationParams } from '@/types'

export default function Home() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [subjectImage, setSubjectImage] = useState<File | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    preserveClothing: false,
    preserveAccessories: false,
    preserveExpression: false,
    copyPose: false,
    customInstructions: ''
  })

  const handleGenerate = async (isRegeneration = false) => {
    if (!referenceImage || !subjectImage) {
      alert('Please upload both reference and subject images')
      return
    }

    setIsGenerating(true)
    
    try {
      const params = { ...generationParams, isRegeneration }
      const formData = new FormData()
      formData.append('referenceImage', referenceImage)
      formData.append('subjectImage', subjectImage)
      formData.append('params', JSON.stringify(params))

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      setGeneratedImages(data.images || [])
      setGeneratedPrompt(data.prompt || '')
    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to generate image. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleImageUpdate = (index: number, newImageUrl: string) => {
    setGeneratedImages(prev => {
      const updated = [...prev]
      updated[index] = newImageUrl
      return updated
    })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
        <header className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center space-x-3 mb-6 group cursor-pointer">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Nano-Banana
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Blend your subject with reference images using AI to create stunning compositions
          </p>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel - Inputs */}
          <div className="space-y-5 lg:space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200/60 p-4 sm:p-5 hover:shadow-md transition-all duration-200">
              <h2 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Reference Image</span>
              </h2>
              <ImageUpload
                onImageSelect={setReferenceImage}
                selectedImage={referenceImage}
                placeholder="Upload reference image"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200/60 p-4 sm:p-5 hover:shadow-md transition-all duration-200">
              <h2 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span>Subject Image</span>
              </h2>
              <SubjectImageUpload
                onImageSelect={setSubjectImage}
                selectedImage={subjectImage}
              />
            </div>

            <AdvancedParameters
              params={generationParams}
              onParamsChange={setGenerationParams}
            />

            <button
              onClick={() => handleGenerate(false)}
              disabled={!referenceImage || !subjectImage || isGenerating}
              className="w-full bg-gray-900 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-md text-sm sm:text-base"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span>Generate Image</span>
                </div>
              )}
            </button>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/60 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Generated Images</span>
            </h2>
            {isGenerating ? (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
                </div>
                <p className="text-sm sm:text-base text-gray-900 font-medium mb-2">Generating your image...</p>
                <p className="text-xs sm:text-sm text-gray-500">This may take a few moments</p>
                <div className="mt-4 w-48 mx-auto bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-900 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <GeneratedImagePreview
                    key={index}
                    imageUrl={imageUrl}
                    isGenerating={false}
                    onRegenerate={() => handleGenerate(true)}
                    onImageUpdate={(newImageUrl) => handleImageUpdate(index, newImageUrl)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium mb-2">No images generated yet</p>
                <p className="text-xs sm:text-sm text-gray-500">Upload images and click generate to see results</p>
              </div>
            )}
            
            {/* Prompt Display Section */}
            {generatedPrompt && (
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 flex items-center space-x-2 uppercase tracking-wider">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Generated Prompt</span>
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-mono bg-white p-2 sm:p-3 rounded border text-wrap break-words">
                  {generatedPrompt}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}