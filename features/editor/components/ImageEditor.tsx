
import React, { useEffect } from 'react';
import { useEditorState } from '../hooks/useEditorState';
import { ImageDropzone } from './ImageDropzone';
import { EditorControls } from './EditorControls';
import { EditorCanvas } from './EditorCanvas';

interface ImageEditorProps {
  onImageGenerated: (url: string, prompt: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({ onImageGenerated }) => {
  const {
    selectedImage,
    prompt,
    activeError,
    loading,
    resultImage,
    setPrompt,
    processFile,
    handleEdit,
    handleReset,
    clearAllErrors
  } = useEditorState(onImageGenerated);

  // Sync result with parent callback
  useEffect(() => {
    if (resultImage) {
      onImageGenerated(resultImage, prompt);
    }
  }, [resultImage, prompt, onImageGenerated]);

  const handlePromptChange = (val: string) => {
    setPrompt(val);
    clearAllErrors();
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Input / Control Column */}
        <div className="flex flex-col space-y-4">
          <ImageDropzone 
            selectedImage={selectedImage}
            onFileSelect={processFile}
            onReset={handleReset}
            error={activeError}
          />

          <EditorControls 
            prompt={prompt}
            onPromptChange={handlePromptChange}
            onEdit={handleEdit}
            loading={loading}
            canEdit={!!selectedImage && !!prompt}
            error={activeError}
            onErrorDismiss={clearAllErrors}
          />
        </div>

        {/* Output / Preview Column */}
        <EditorCanvas 
          loading={loading}
          resultImage={resultImage}
          error={activeError}
          onRetry={handleEdit}
        />
      </div>
    </div>
  );
};
