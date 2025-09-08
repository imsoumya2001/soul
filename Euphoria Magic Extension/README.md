# Soul AI Scene Transformer - Chrome Extension

A Chrome extension that allows you to transform yourself into any scene using AI-powered image generation from any image on the web.

## Features

- **Image Hover Detection**: Automatically detects when you hover over images on websites
- **One-Click Transformation**: Use any scene as reference with a single click
- **Reference Scene Selection**: Choose any image as your background scene
- **Character Photo Upload**: Upload your own photo to be placed in the scene
- **Preservation Options**: Choose to preserve clothing, accessories, and expressions
- **Pose Copying**: Option to copy the pose from the original person in the scene
- **Chat-to-Edit**: Refine your transformations using natural language instructions
- **Regenerate**: Create multiple variations of the same transformation
- **Download**: Save your generated scene transformations

## Installation

### From Source (Developer Mode)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `chrome-extension` folder
5. The Soul AI extension should now appear in your extensions list

### From Chrome Web Store

*Coming soon - extension will be published to the Chrome Web Store*

## Usage

### Quick Transformation

1. Navigate to any website with images
2. Hover over an image you'd like to use as a reference scene
3. Click the "Use as Reference Scene" button that appears
4. Upload your character photo and select preservation options
5. Click "Generate" to create your scene transformation

### Advanced Transformation

1. Click the Soul AI extension icon in your browser toolbar
2. Upload your reference scene or use the current page's images
3. Customize transformation settings:
   - **Reference Scene**: The background scene to use
   - **Character Photo**: Your photo to be placed in the scene
   - **Preservation Options**: What elements to preserve from your photo
   - **Pose Copying**: Whether to copy the original person's pose
4. Click "Generate" to create your transformation

### Chat-to-Edit

After generating a transformation:

1. Use the chat interface to refine your transformation
2. Try commands like:
   - "Make the lighting more dramatic"
   - "Adjust my pose to match better"
   - "Change the background color"
   - "Make me blend in more naturally"
3. The AI will apply your changes and show the updated transformation

## Settings

### Advanced Parameters

- **Strength** (0.1-1.0): How much the AI should transform the original image
- **Guidance Scale** (1-20): How closely the AI should follow your prompts
- **Steps** (10-50): Quality vs speed trade-off for generation

## Supported Websites

The extension works on most websites that display images, including:

- E-commerce sites
- Social media platforms
- Image galleries
- Blog posts
- News websites

## Privacy & Security

- Images are processed securely through our API
- No personal data is stored permanently
- Generated transformations are only saved locally in your browser
- You can clear all data through Chrome's extension settings

## Troubleshooting

### Extension Not Working

1. Make sure the extension is enabled in `chrome://extensions/`
2. Refresh the webpage you're trying to use it on
3. Check that you have an active internet connection

### Generation Fails

1. Try a different image (some images work better than others)
2. Check your internet connection
3. Try reducing the image size if it's very large

### Button Not Appearing

1. Make sure you're hovering over a valid image
2. Some websites may block the extension - try a different site
3. Refresh the page and try again

## Technical Details

- **Manifest Version**: 3
- **Permissions**: activeTab, storage, scripting
- **Content Scripts**: Injected on all HTTP/HTTPS pages
- **Background**: Service worker for API communication
- **Popup**: 400x600px interface for advanced options

## Support

For issues, feature requests, or questions:

1. Check the troubleshooting section above
2. Create an issue on our GitHub repository
3. Contact our support team

## Version History

### v1.0.0
- Initial release
- Basic scene transformation from images
- Reference scene and character photo selection
- Preservation and pose copying options
- Chat-to-edit functionality
- Download and regenerate features

---

*Powered by Soul AI - Transform yourself into any scene with AI*