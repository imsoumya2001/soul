export interface GenerationParams {
  preserveClothing: boolean
  preserveAccessories: boolean
  preserveExpression: boolean
  copyPose: boolean
  customInstructions: string
}

export interface RecentFace {
  id: string
  imageUrl: string
  thumbnail: string
  uploadedAt: Date
}

export interface GenerationResult {
  imageUrl: string
  success: boolean
  error?: string
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  imageUrl?: string
  hasAddToCanvas?: boolean
}