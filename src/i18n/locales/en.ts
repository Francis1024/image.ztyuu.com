export default {
  editPage: {
    download: 'Download',
    dimensions: 'Image Dimensions',
    compare: 'Compare with original',
    processing: 'Processing...',
    dragToCompare: 'Drag to compare'
  },
  'upload': {
    'title': 'Remove Image Background',
    'description': 'Upload an image to remove its background automatically using AI technology.',
    'dragText': 'Drag and drop image here',
    'orText': 'or',
    'selectFile': 'Select File',
    'sampleImages': 'Sample Images',
    'supportedFormats': 'Supported formats: JPG, PNG, WebP',
    'processing': 'Processing image...',
    'preview': {
      'title': 'Processing...',
      'loadingText': 'Removing background...'
    }
  },
  'header': {
    'logo': 'PixelPulse Logo',
    'title': 'PixelPulse',
    'currentLang': 'EN',
    'themeToggle': 'Toggle theme',
    'languages': {
      'english': 'English',
      'chinese': '中文'
    },
    'themes': {
      'light': 'Light',
      'dark': 'Dark',
      'system': 'System'
    }
  },
  'toast': {
    'error': {
      'title': 'Error',
      'processingFailed': 'Failed to process image. Please try again.'
    },
    success: {
      title: "Success",
      modelLoaded: "AI model loaded successfully"
    },
  },
  loading: {
    removingBackground: 'Removing background...',
    modelLoading: "Loading AI model..."

  },
  imageList: {
    addMore: 'Add more images',
    selectImage: 'Select image',
    processedImage: 'Processed image',
    deleteImage: 'Delete image'
  },
  "Text Classification": "Text Classification",
  "Enter text here": "Enter text here",
  "Loading...": "Loading...",
  tabs: {
    classicMode: "Classic Mode",
    aiMode: "AI Mode"
  },
  alert: {
    modelReady: {
      title: "AI Model Ready",
      description: "You can now use AI mode to process images"
    }
  },
  error: {
    modelNotReady: "AI model is not ready yet",
    processingFailed: "Failed to process image"
  },

} as const;
