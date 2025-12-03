'use client';

import { OutputFormat } from '@/lib/types/tokens';
import { formatInfo } from '@/lib/generators';

interface FormatSelectorProps {
  selected: OutputFormat;
  onChange: (format: OutputFormat) => void;
}

const formats: OutputFormat[] = [
  'tailwind',
  'css-variables',
  'scss',
  'emotion',
  'styled-components',
  'vanilla-extract',
  'panda-css',
];

export function FormatSelector({ selected, onChange }: FormatSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="text-sm font-medium text-gray-700 mb-3">출력 형식 선택</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {formats.map((format) => {
          const info = formatInfo[format];
          const isSelected = selected === format;
          
          return (
            <button
              key={format}
              onClick={() => onChange(format)}
              className={`
                flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <span className="text-2xl mb-2">{info.icon}</span>
              <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                {info.name}
              </span>
              <span className="text-xs text-gray-400 text-center mt-1 line-clamp-2">
                {info.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
