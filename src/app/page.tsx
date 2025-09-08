'use client'

import { useState, useRef, useEffect } from 'react'
import { ShaderAnimation } from '@/components/ui/shader-animation'
import { RainbowButton } from '@/components/ui/rainbow-button'
import DownloadExtensionButton from '@/components/ui/download-extension-button'
import ImageUpload from '@/components/ImageUpload'
import SubjectImageUpload from '@/components/SubjectImageUpload'
import AdvancedParameters from '@/components/AdvancedParameters'
import GeneratedImagePreview from '@/components/GeneratedImagePreview'
import GeneratedVideoPreview from '@/components/GeneratedVideoPreview'
import { AILoader } from '@/components/ui/ai-loader'
import { GenerationParams } from '@/types'

export default function Home() {
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [subjectImage, setSubjectImage] = useState<File | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [falApiKey, setFalApiKey] = useState<string>('')

  // Load Fal.ai API key from localStorage on component mount
  useEffect(() => {
    const savedFalApiKey = localStorage.getItem('fal_api_key')
    if (savedFalApiKey) {
      setFalApiKey(savedFalApiKey)
    }
  }, [])

  // Save Fal.ai API key to localStorage
  const saveFalApiKey = () => {
    if (falApiKey.trim()) {
      localStorage.setItem('fal_api_key', falApiKey.trim())
      alert('Fal.ai API key saved successfully!')
    } else {
      alert('Please enter a valid Fal.ai API key')
    }
  }
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    preserveClothing: false,
    preserveAccessories: false,
    preserveExpression: false,
    copyPose: false,
    customInstructions: ''
  })
  const dashboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dashboardRef.current) {
        dashboardRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

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

  const handleLiveVideo = async (imageUrl: string) => {
    if (!falApiKey) {
      alert('Please enter and save your Fal.ai API key');
      return;
    }

    // Get Gemini API key from environment
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!geminiApiKey) {
      alert('Gemini API key not configured in environment variables. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.');
      return;
    }
    
    if (!imageUrl) {
      alert('No image available for video generation');
      return;
    }

    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);

    try {
      // Import the services dynamically to avoid SSR issues
      const { GeminiService } = await import('../utils/gemini');
      const { FalService } = await import('../utils/fal');
      
      const geminiService = new GeminiService(geminiApiKey);
      const falService = new FalService(falApiKey);
      
      console.log('Starting video generation process...');
      
      // Step 1: Generate video prompt using Gemini
      console.log('Generating video prompt with Gemini...');
      const videoPrompt = await geminiService.generateVideoPrompt(imageUrl);
      console.log('Generated prompt:', videoPrompt);
      
      // Step 2: Validate parameters
      const validation = falService.validateParameters({
        imageUrl,
        prompt: videoPrompt,
        duration: 6,
        resolution: '720p'
      });
      
      if (!validation.valid) {
        throw new Error(`Invalid parameters: ${validation.errors.join(', ')}`);
      }
      
      // Step 3: Generate video using Fal.ai
      console.log('Generating video with Fal.ai...');
      const videoUrl = await falService.generateVideo({
        imageUrl,
        prompt: videoPrompt,
        duration: 6,
        resolution: '720p'
      });
      
      console.log('Video generated successfully:', videoUrl);
      
      // Step 4: Display video inline
      if (videoUrl) {
        setGeneratedVideoUrl(videoUrl);
      }
      
    } catch (error) {
      console.error('Error generating video:', error);
      setVideoError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsGeneratingVideo(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Shader Animation */}
      <div className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        <ShaderAnimation />
        <div className="absolute pointer-events-none z-10 text-center">
          <h1 className="text-7xl leading-none font-semibold tracking-tighter whitespace-pre-wrap text-white mb-4">
            PROJECT EUPHORIA
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed font-medium">
             Your gateway to creativity
           </p>
        </div>
      </div>

      {/* Dashboard Section */}
      <div ref={dashboardRef} className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-6xl">
          <header className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center space-x-3 mb-6 group cursor-pointer">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
                 Euphoria AI
               </h2>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
               Upload a reference image from Pinterest or anywhere, upload your own image, then hit generate to imagine yourself as in the reference.
             </p>
          </header>

          {/* Euphoria Magic Extension Block */}
          <div className="bg-black rounded-xl p-6 sm:p-8 mb-8 sm:mb-10 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-white shadow-lg">
            <div className="flex items-start flex-1">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">Euphoria Magic Extension Available!</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Use any image from Pinterest as reference and imagine yourself in just one-click with our Magic Chrome Extension.
                </p>
              </div>
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <DownloadExtensionButton />
            </div>
          </div>

          {/* API Keys Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>API Configuration</span>
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="fal-key" className="block text-xs font-medium text-gray-700 mb-1">
                  Fal.ai API Key
                </label>
                <input
                  id="fal-key"
                  type="password"
                  placeholder="Enter Fal.ai API key"
                  value={falApiKey}
                  onChange={(e) => setFalApiKey(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={saveFalApiKey}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                >
                  Save
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Required only for Live Video generation. Key is stored locally in your browser.
            </p>
          </div>

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

            <div className="flex justify-center">
              <RainbowButton
                onClick={() => handleGenerate(false)}
                disabled={!referenceImage || !subjectImage || isGenerating}
                className="disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-sm hover:shadow-md text-sm sm:text-base"
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
              </RainbowButton>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/60 p-4 sm:p-6 hover:shadow-md transition-all duration-200">
            <h2 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4 flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Generated Images</span>
            </h2>
            {isGenerating ? (
              <div className="text-center py-12 sm:py-16">
                <AILoader />
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {generatedImages.map((imageUrl, index) => (
                  <GeneratedImagePreview
                    key={index}
                    imageUrl={imageUrl}
                    isGenerating={false}
                    isGeneratingVideo={isGeneratingVideo}
                    onRegenerate={() => handleGenerate(true)}
                    onImageUpdate={(newImageUrl) => handleImageUpdate(index, newImageUrl)}
                    onLiveVideo={handleLiveVideo}
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

            {/* Video Preview Section */}
            {(isGeneratingVideo || generatedVideoUrl || videoError) && (
              <GeneratedVideoPreview
                videoUrl={generatedVideoUrl}
                isLoading={isGeneratingVideo}
                error={videoError}
                onRetry={() => {
                  if (generatedImages.length > 0) {
                    handleLiveVideo(generatedImages[0]);
                  }
                }}
              />
            )}

          </div>
          </div>
        </div>
      </div>
    </div>
  )
}