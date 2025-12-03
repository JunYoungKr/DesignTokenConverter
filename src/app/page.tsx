'use client';

import { useState, useCallback } from 'react';
import { FileUploader, FormatSelector, CodePreview, ColorPreview } from '@/components';
import { parseFigmaTokens } from '@/lib/parsers/figma-tokens';
import { generate } from '@/lib/generators';
import { NormalizedTokens, OutputFormat, GeneratorResult } from '@/lib/types/tokens';

export default function Home() {
  const [tokens, setTokens] = useState<NormalizedTokens | null>(null);
  const [format, setFormat] = useState<OutputFormat>('tailwind');
  const [results, setResults] = useState<GeneratorResult[]>([]);
  const [isConverting, setIsConverting] = useState(false);

  const handleFileLoad = useCallback((json: Record<string, unknown>) => {
    try {
      const parsed = parseFigmaTokens(json);
      setTokens(parsed);
      
      // 자동으로 변환
      const generated = generate(parsed, format);
      setResults(generated);
    } catch (error) {
      console.error('Failed to parse tokens:', error);
    }
  }, [format]);

  const handleFormatChange = useCallback((newFormat: OutputFormat) => {
    setFormat(newFormat);
    
    if (tokens) {
      setIsConverting(true);
      // 약간의 딜레이를 줘서 UI 피드백
      setTimeout(() => {
        const generated = generate(tokens, newFormat);
        setResults(generated);
        setIsConverting(false);
      }, 100);
    }
  }, [tokens]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎨</span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Design Token Converter</h1>
              <p className="text-sm text-gray-500">Figma 토큰을 다양한 CSS 형식으로 변환하세요</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Step 1: 파일 업로드 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium">1</span>
              <h2 className="text-lg font-semibold text-gray-800">JSON 파일 업로드</h2>
            </div>
            <FileUploader onFileLoad={handleFileLoad} />
          </section>

          {/* Step 2: 형식 선택 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium">2</span>
              <h2 className="text-lg font-semibold text-gray-800">출력 형식 선택</h2>
            </div>
            <FormatSelector selected={format} onChange={handleFormatChange} />
          </section>

          {/* 토큰 미리보기 */}
          {tokens && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">👁️</span>
                <h2 className="text-lg font-semibold text-gray-800">토큰 미리보기</h2>
              </div>
              <ColorPreview colors={tokens.colors} />
            </section>
          )}

          {/* Step 3: 결과 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm font-medium">3</span>
              <h2 className="text-lg font-semibold text-gray-800">변환 결과</h2>
              {isConverting && (
                <span className="text-sm text-gray-400 animate-pulse">변환 중...</span>
              )}
            </div>
            <CodePreview results={results} />
          </section>
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Figma Design Tokens 플러그인에서 export한 JSON을 지원합니다
            </p>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.figma.com/community/plugin/888356646278934516" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Design Tokens 플러그인 →
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
