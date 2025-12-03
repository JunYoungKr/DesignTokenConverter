'use client';

import { useCallback, useState } from 'react';

interface FileUploaderProps {
  onFileLoad: (json: Record<string, unknown>, fileName: string) => void;
}

export function FileUploader({ onFileLoad }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!file.name.endsWith('.json')) {
      setError('JSON 파일만 업로드할 수 있습니다.');
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const json = JSON.parse(content);
        setFileName(file.name);
        onFileLoad(json, file.name);
      } catch {
        setError('유효하지 않은 JSON 파일입니다.');
      }
    };

    reader.onerror = () => {
      setError('파일을 읽는 중 오류가 발생했습니다.');
    };

    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  return (
    <div className="w-full">
      <label
        className={`
          flex flex-col items-center justify-center w-full h-48 
          border-2 border-dashed rounded-xl cursor-pointer
          transition-all duration-200
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {fileName ? (
            <>
              <svg 
                className="w-10 h-10 mb-3 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <p className="mb-2 text-sm text-gray-700 font-medium">{fileName}</p>
              <p className="text-xs text-gray-500">다른 파일을 업로드하려면 클릭하세요</p>
            </>
          ) : (
            <>
              <svg 
                className={`w-10 h-10 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">클릭하여 업로드</span> 또는 드래그 앤 드롭
              </p>
              <p className="text-xs text-gray-400">JSON 파일 (Figma Design Tokens)</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept=".json"
          onChange={handleInputChange}
        />
      </label>
      
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
