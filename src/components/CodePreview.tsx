'use client';

import { useState } from 'react';
import { GeneratorResult } from '@/lib/types/tokens';

interface CodePreviewProps {
  results: GeneratorResult[];
}

export function CodePreview({ results }: CodePreviewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  if (results.length === 0) {
    return (
      <div className="w-full h-64 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center">
        <p className="text-gray-400">JSON 파일을 업로드하면 변환 결과가 여기에 표시됩니다</p>
      </div>
    );
  }

  const activeResult = results[activeTab];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeResult.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([activeResult.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeResult.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    results.forEach((result) => {
      const blob = new Blob([result.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 overflow-hidden bg-white shadow-sm">
      {/* 탭 헤더 */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto">
          {results.map((result, index) => (
            <button
              key={result.filename}
              onClick={() => setActiveTab(index)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${index === activeTab 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {result.filename}
            </button>
          ))}
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex items-center gap-2 px-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-500">복사됨!</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>복사</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>다운로드</span>
          </button>

          {results.length > 1 && (
            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>전체 다운로드</span>
            </button>
          )}
        </div>
      </div>
      
      {/* 코드 영역 */}
      <div className="relative">
        <pre className="p-4 overflow-auto max-h-[500px] text-sm bg-gray-900 text-gray-100">
          <code>{activeResult.content}</code>
        </pre>
        
        {/* 언어 뱃지 */}
        <span className="absolute top-3 right-3 px-2 py-1 text-xs font-medium text-gray-400 bg-gray-800 rounded">
          {activeResult.language}
        </span>
      </div>
    </div>
  );
}
