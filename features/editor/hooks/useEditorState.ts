import { useState, useCallback, useEffect } from 'react';
import { aiCore, AIModelType, AspectRatio, ImageSize } from '@/services/ai-core';
import { readImageFile } from '@/shared/utils/file';
import { logger } from '@/shared/utils/logger';

export const useEditorState = (onImageGenerated?: (url: string, prompt: string) => void) => {
  // Configuration State
  const [model, setModel] = useState<AIModelType>('gemini-2.5-flash-image');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [imageSize, setImageSize] = useState<ImageSize>("1K");
  const [useSearch, setUseSearch] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [isProKeySelected, setIsProKeySelected] = useState(false);

  // Payload State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  
  // UI Synchronization
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkKeySelection = async () => {
      const studio = (window as any).aistudio;
      if (studio?.hasSelectedApiKey) {
        const hasKey = await studio.hasSelectedApiKey();
        setIsProKeySelected(hasKey);
      }
    };
    checkKeySelection();
  }, []);

  const handleModelChange = async (newModel: AIModelType) => {
    const studio = (window as any).aistudio;
    if (newModel === 'gemini-3-pro-image-preview' && !isProKeySelected) {
      if (studio?.openSelectKey) {
        await studio.openSelectKey();
        setIsProKeySelected(true);
      }
    }
    setModel(newModel);
  };

  const processFile = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      logger.info(`Processing file: ${file.name}`);
      const base64 = await readImageFile(file);
      setSelectedImage(base64);
      setResultImage(null);
      setAnalysisResult(null);
      setGroundingSources([]);
    } catch (err: any) {
      setError(err.message || "Failed to process image.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePromptImageDrop = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    logger.info(`Handling prompt image drop for file: ${file.name}`);

    try {
      const base64 = await readImageFile(file);
      setSelectedImage(base64);
      setResultImage(null);
      setAnalysisResult(null);
      setGroundingSources([]);

      // Automatically describe the dropped image to populate the prompt
      const res = await aiCore.generate(
        "Describe this image in detail. This description will be used as a prompt for an AI image editor. Focus on the subject, style, and artistic elements. Keep it under 60 words.",
        [base64],
        { model: 'gemini-3-flash-preview' }
      );

      if (res.text) {
        setPrompt(res.text.trim());
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image drop.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAIRequest = async (intent: 'generate' | 'analyze') => {
    if (intent === 'generate' && !prompt) return;
    if (intent === 'analyze' && !selectedImage) return;

    setLoading(true);
    setError(null);
    setGroundingSources([]);
    logger.info(`Initiating AI task: ${intent}`);

    try {
      const targetModel = intent === 'analyze' ? 'gemini-3-pro-preview' : model;
      
      const res = await aiCore.generate(
        intent === 'analyze' ? (prompt || "Explain the visual elements.") : prompt,
        selectedImage ? [selectedImage] : [],
        {
          model: targetModel,
          aspectRatio,
          imageSize,
          useSearch,
          thinkingBudget: useThinking ? 32768 : undefined,
          systemInstruction: intent === 'analyze' 
            ? "Context: Professional Art Analyst. Describe composition, technique, and subject." 
            : "Context: Creative Image Editor. Follow the instruction with pixel-perfect accuracy."
        }
      );

      if (intent === 'analyze') {
        setAnalysisResult(res.text || "Analysis complete but no text returned.");
      } else {
        if (res.image) {
          setResultImage(res.image);
          onImageGenerated?.(res.image, prompt);
        } else if (res.text) {
          setAnalysisResult(res.text);
        }
      }

      if (res.groundingSources) setGroundingSources(res.groundingSources);
      logger.info(`AI task completed successfully: ${intent}`);
    } catch (err: any) {
      setError(err.message || "Internal generation error.");
      if (err.message?.includes("not found")) setIsProKeySelected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    logger.debug("Resetting editor state");
    setSelectedImage(null);
    setResultImage(null);
    setAnalysisResult(null);
    setPrompt('');
    setError(null);
    setGroundingSources([]);
  }, []);

  return {
    model, handleModelChange,
    aspectRatio, setAspectRatio,
    imageSize, setImageSize,
    useSearch, setUseSearch,
    useThinking, setUseThinking,
    isProKeySelected,
    selectedImage,
    prompt, setPrompt,
    resultImage,
    analysisResult,
    groundingSources,
    loading,
    error,
    processFile,
    handlePromptImageDrop,
    handleGenerate: () => handleAIRequest('generate'),
    handleAnalyze: () => handleAIRequest('analyze'),
    handleReset,
    clearAllErrors: useCallback(() => setError(null), [])
  };
};