'use client';

import React from 'react';
import { Loader2, Download, Play, Pause } from 'lucide-react';
import { AILoader } from '@/components/ui/ai-loader';

interface GeneratedVideoPreviewProps {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function GeneratedVideoPreview({
  videoUrl,
  isLoading,
  error,
  onRetry
}: GeneratedVideoPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    
    try {
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
              <AILoader />
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-red-200">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-red-800 font-medium mb-2">Video Generation Failed</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-auto rounded-lg"
            controls
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom play/pause overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded-lg">
            <button
              onClick={handlePlayPause}
              className="bg-white bg-opacity-90 rounded-full p-3 hover:bg-opacity-100 transition-all"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6 text-gray-800" />
              ) : (
                <Play className="h-6 w-6 text-gray-800 ml-1" />
              )}
            </button>
          </div>
        </div>
        
        {/* Video actions */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Generated Video
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}