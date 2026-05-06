/**
 * AI Service - Modular Category Suggestion
 *
 * This is a replaceable service layer. Currently uses keyword/heuristic matching
 * as a local model. Can be swapped with a real ML model (e.g., MobileNet,
 * CLIP, or a cloud vision API) without changing the interface.
 *
 * Interface contract: suggestCategory(imageBase64) => { category, confidence }
 */

const { CATEGORIES } = require('../models/Item');

// Simple keyword-based heuristic (replace with real ML model as needed)
async function suggestCategory(imageBase64) {
  // TODO: Replace this stub with actual image classification
  // Options:
  //   - TensorFlow.js with MobileNet: npm install @tensorflow/tfjs @tensorflow-models/mobilenet
  //   - Google Cloud Vision API
  //   - OpenAI Vision API
  //   - Local ONNX model via onnxruntime-node

  // For now, return a random category with low confidence as a placeholder
  // In production, plug in your ML model here
  const randomCategory = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

  return {
    category: randomCategory,
    confidence: 0.0, // 0.0 indicates stub/no real prediction
    isStub: true,
    message: 'AI module not configured. Please select category manually.',
  };
}

module.exports = { suggestCategory };
