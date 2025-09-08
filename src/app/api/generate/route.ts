import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const referenceImage = formData.get('referenceImage') as File
    const subjectImage = formData.get('subjectImage') as File
    const paramsString = formData.get('params') as string
    
    if (!referenceImage || !subjectImage) {
      return NextResponse.json(
        { error: 'Both reference and subject images are required' },
        { status: 400 }
      )
    }

    const params = JSON.parse(paramsString || '{}')
    
    // Convert images to base64
    const referenceBuffer = await referenceImage.arrayBuffer()
    const subjectBuffer = await subjectImage.arrayBuffer()
    
    const referenceBase64 = Buffer.from(referenceBuffer).toString('base64')
    const subjectBase64 = Buffer.from(subjectBuffer).toString('base64')

    // Construct the system prompt with clear image denotations
    let prompt = `Replace the person in the REFERENCE IMAGE (first image) with the person in the SUBJECT IMAGE (second image). Relight the SUBJECT to blend in with the ambience, and replace its attire, accessories and pose as per its gender and age group. Preserve the subject's skin tone, facial features and structure, hairstyle, body physique etc.`
    
    // Add parameter-specific instructions
    const preservationInstructions = []
    if (params.preserveClothing) {
      preservationInstructions.push('preserve the clothing style from the SUBJECT IMAGE')
    }
    if (params.preserveAccessories) {
      preservationInstructions.push('preserve accessories from the SUBJECT IMAGE')
    }
    if (params.preserveExpression) {
      preservationInstructions.push('preserve the facial expression from the SUBJECT IMAGE')
    }
    
    if (preservationInstructions.length > 0) {
      prompt += ` However, ${preservationInstructions.join(', ')}.`
    }
    
    // Add pose copying instruction if enabled
    if (params.copyPose) {
      prompt += ` Replicate the pose, posture, and orientation of the person in the REFERENCE IMAGE exactly, while applying it to the SUBJECT.`
    }
    
    if (params.customInstructions) {
      prompt += ` Additional requirements: ${params.customInstructions}.`
    }
    
    prompt += ` Ensure seamless integration with proper lighting, shadows, and perspective matching the REFERENCE IMAGE environment.`

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-image-preview' })

    // Generate two images with variations
    const generateImage = async (variation: string) => {
      const variedPrompt = `${prompt} ${variation}`
      
      const result = await model.generateContent([
        {
          text: "REFERENCE IMAGE (the scene/environment to copy):"
        },
        {
          inlineData: {
            mimeType: referenceImage.type,
            data: referenceBase64
          }
        },
        {
          text: "SUBJECT IMAGE (the person to place in the scene):"
        },
        {
          inlineData: {
            mimeType: subjectImage.type,
            data: subjectBase64
          }
        },
        {
          text: variedPrompt
        }
      ])

      const response = await result.response
      
      // Check if the response contains an image
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No image generated')
      }

      const candidate = response.candidates[0]
      
      // Extract the generated image data
      let imageData: string | null = null
      
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            imageData = part.inlineData.data
            break
          }
        }
      }

      if (!imageData) {
        throw new Error('No image data in response')
      }

      return `data:image/png;base64,${imageData}`
    }

    // Always generate two images with different variations
    const variations = [
      'Keep the pose natural and relaxed with a slight smile.',
      'Use a more confident pose with a different facial expression or head tilt.'
    ]

    // Generate both images concurrently with different variations
    const [imageUrl1, imageUrl2] = await Promise.all([
      generateImage(variations[0]),
      generateImage(variations[1])
    ])

    return NextResponse.json({
      success: true,
      images: [imageUrl1, imageUrl2],
      prompt: prompt
    })

  } catch (error) {
    console.error('Error generating image:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to generate image', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}