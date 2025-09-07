import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { message, currentImageUrl, conversationHistory } = await request.json()
    
    if (!message || !currentImageUrl) {
      return NextResponse.json(
        { error: 'Message and current image URL are required' },
        { status: 400 }
      )
    }

    // Extract base64 data from data URL
    const base64Data = currentImageUrl.split(',')[1]
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid image data' },
        { status: 400 }
      )
    }

    // Build conversation context with clear image denotation
    const conversationParts = [];
    
    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        conversationParts.push({
          text: `${msg.role}: ${msg.content}`
        });
      });
    }
    
    // Add current request with clear image denotation
    conversationParts.push({
      text: `I have an AI-generated image that was created by replacing a person from a REFERENCE IMAGE with a person from a SUBJECT IMAGE. The person was relit to blend with the ambience and their attire, accessories and pose were adjusted. Please help me modify this CURRENT IMAGE based on my request: "${message}". Apply the requested changes while maintaining overall quality and coherence. Make modifications natural and well-integrated. If unclear or impossible, provide a helpful explanation instead.`
    });
    
    // Add the current image
    conversationParts.push({
      inlineData: {
        mimeType: 'image/png',
        data: base64Data
      }
    });

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' });

    // Generate the edited image
    const result = await model.generateContent(conversationParts)

    const response = await result.response
    
    // Check if the response contains an image
    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json({
        success: true,
        response: "I understand your request, but I wasn't able to generate a modified image. Could you please try rephrasing your request or be more specific about the changes you'd like to make?",
        newImageUrl: null
      })
    }

    const candidate = response.candidates[0]
    
    // Extract the generated image data or text response
    let imageData: string | null = null
    let textResponse = "I've processed your request."
    
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data
        } else if (part.text) {
          textResponse = part.text
        }
      }
    }

    let newImageUrl: string | null = null
    if (imageData) {
      newImageUrl = `data:image/png;base64,${imageData}`
    }

    return NextResponse.json({
      success: true,
      response: textResponse,
      newImageUrl: newImageUrl
    })

  } catch (error) {
    console.error('Error in chat edit:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to process edit request', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}