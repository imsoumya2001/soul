# Nano-Banana Image Generator

A modern web application that blends subject images with reference images using Google's Gemini 2.5 Flash Image Preview model to create stunning AI-generated compositions.

## Features

- **Drag & Drop Interface**: Easy image upload with support for JPG, PNG, and WebP formats
- **Subject Image Management**: Recently used faces storage for quick reselection
- **Advanced Parameters**: Preserve clothing, accessories, and expressions from subject images
- **Custom Instructions**: Add specific requirements for image generation
- **Chat to Edit**: Interactive editing through natural language commands
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Notion-Inspired UI**: Clean, minimalist design with smooth animations

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **AI Integration**: Google Gemini 2.5 Flash Image Preview
- **UI Components**: Framer Motion, Lucide React icons
- **File Handling**: React Dropzone

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Google AI Studio API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd image-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Get your Gemini API key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Basic Workflow

1. **Upload Reference Image**: Drag and drop or click to upload the background/environment image
2. **Upload Subject Image**: Add the subject that you want to blend into the reference
3. **Configure Parameters** (Optional):
   - Toggle preservation of clothing, accessories, or expressions
   - Add custom instructions for specific requirements
4. **Generate**: Click the generate button to create your blended image
5. **Refine**: Use "Chat to Edit" for further modifications or "Regenerate" for variations

### Advanced Features

- **Recently Used Faces**: The app automatically saves your last 5 uploaded subject images for quick reuse
- **Custom Instructions**: Provide specific guidance like "Make the lighting warmer" or "Add a vintage filter"
- **Interactive Editing**: Use natural language to request modifications to generated images

## API Endpoints

### POST `/api/generate`
Generates a new image by blending reference and subject images.

**Request**: FormData with:
- `referenceImage`: File
- `subjectImage`: File  
- `params`: JSON string with generation parameters

**Response**:
```json
{
  "success": true,
  "imageUrl": "data:image/png;base64,...",
  "prompt": "Generated prompt used"
}
```

### POST `/api/chat-edit`
Modifies existing images based on natural language instructions.

**Request**:
```json
{
  "message": "Make the sky more dramatic",
  "currentImageUrl": "data:image/png;base64,...",
  "conversationHistory": []
}
```

**Response**:
```json
{
  "success": true,
  "response": "I've made the sky more dramatic with enhanced clouds and lighting.",
  "newImageUrl": "data:image/png;base64,..."
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate/route.ts      # Main image generation endpoint
│   │   └── chat-edit/route.ts     # Chat-based editing endpoint
│   ├── globals.css                # Global styles and Tailwind imports
│   ├── layout.tsx                 # Root layout component
│   └── page.tsx                   # Main application page
├── components/
│   ├── AdvancedParameters.tsx     # Parameter configuration dropdown
│   ├── ChatToEdit.tsx            # Interactive editing interface
│   ├── GeneratedImagePreview.tsx  # Image preview with actions
│   ├── ImageUpload.tsx           # Reference image upload component
│   └── SubjectImageUpload.tsx    # Subject image upload with recent faces
├── types/
│   └── index.ts                  # TypeScript type definitions
└── utils/                        # Utility functions (if needed)
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key for image generation | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Note**: This application requires a valid Google Gemini API key to function. Make sure to keep your API key secure and never commit it to version control.