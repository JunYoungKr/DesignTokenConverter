'use client';

import { ColorTokens } from '@/lib/types/tokens';

interface ColorPreviewProps {
  colors: ColorTokens;
}

export function ColorPreview({ colors }: ColorPreviewProps) {
  const renderColors = (obj: unknown, path: string[] = []): React.ReactNode => {
    if (typeof obj !== 'object' || obj === null) return null;

    return Object.entries(obj).map(([key, value]) => {
      const currentPath = [...path, key];
      const pathString = currentPath.join('.');

      if (typeof value === 'string') {
        return (
          <div key={pathString} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
            <div 
              className="w-10 h-10 rounded-lg shadow-inner border border-gray-200"
              style={{ backgroundColor: value }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{pathString}</p>
              <p className="text-xs text-gray-400 font-mono">{value}</p>
            </div>
          </div>
        );
      }

      if (typeof value === 'object') {
        return (
          <div key={pathString} className="mb-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              {currentPath.join(' / ')}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
              {renderColors(value, currentPath)}
            </div>
          </div>
        );
      }

      return null;
    });
  };

  if (Object.keys(colors).length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        색상 토큰이 없습니다
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl border border-gray-200 overflow-hidden bg-white">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700">🎨 색상 미리보기</h3>
      </div>
      <div className="p-4 max-h-[400px] overflow-auto">
        {renderColors(colors)}
      </div>
    </div>
  );
}
