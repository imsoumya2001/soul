'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Settings } from 'lucide-react'
import { GenerationParams } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface AdvancedParametersProps {
  params: GenerationParams
  onParamsChange: (params: GenerationParams) => void
}

export default function AdvancedParameters({ params, onParamsChange }: AdvancedParametersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateParam = (key: keyof GenerationParams, value: boolean | string) => {
    onParamsChange({
      ...params,
      [key]: value
    })
  }

  const toggles = [
    {
      key: 'preserveClothing' as keyof GenerationParams,
      label: 'Clothing',
      description: 'Preserve clothing from subject image'
    },
    {
      key: 'preserveAccessories' as keyof GenerationParams,
      label: 'Accessories',
      description: 'Preserve accessories from subject image'
    },
    {
      key: 'preserveExpression' as keyof GenerationParams,
      label: 'Expression',
      description: 'Preserve facial expression from subject image'
    },
    {
      key: 'copyPose' as keyof GenerationParams,
      label: 'Copy Pose',
      description: 'Replicate the pose, posture, and orientation from reference image'
    }
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-all duration-200 group"
      >
        <div className="flex items-center space-x-3">
          <Settings className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
          <span className="text-base font-medium text-gray-900">
            Advanced Parameters
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
              {/* Parameters to Preserve */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Parameters to Preserve
                </h3>
                <div className="space-y-3">
                  {toggles.map((toggle) => (
                    <div key={toggle.key} className="flex items-center justify-between py-1">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-800">
                          {toggle.label}
                        </label>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {toggle.description}
                        </p>
                      </div>
                      <button
                        onClick={() => updateParam(toggle.key, !params[toggle.key])}
                        className={`
                          relative inline-flex h-5 w-9 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
                          ${params[toggle.key] ? 'bg-gray-900' : 'bg-gray-200'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200
                            ${params[toggle.key] ? 'translate-x-5' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="space-y-3">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Custom Instructions
                </h3>
                <textarea
                  value={params.customInstructions}
                  onChange={(e) => updateParam('customInstructions', e.target.value)}
                  placeholder="Add specific instructions for the image generation (e.g., 'Make the lighting warmer', 'Add a vintage filter effect')..."
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-300 resize-none text-sm placeholder-gray-400 transition-all duration-200"
                />
                <p className="text-xs text-gray-500">
                  Optional: Provide additional context or specific requirements for the generation
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}