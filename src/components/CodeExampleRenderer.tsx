'use client';

import React, { useState } from 'react';
import CodeRenderer from './CodeRenderer';

interface CodeExample {
  language: string;
  title: string;
  description: string;
  code: string;
}

interface CodeExampleRendererProps {
  example: CodeExample;
}

export default function CodeExampleRenderer({ example }: CodeExampleRendererProps) {
  const [showCode, setShowCode] = useState(false);

  // Don't render if there's no valid code
  if (!example || !example.code || example.code.trim() === '') {
    return null;
  }

  return (
    <div className="border rounded-xl overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.08)] my-6 border-gray-200">
      <div className="bg-gray-900 px-6 py-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-cyan-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span className="text-gray-200 font-medium">{example.title}</span>
          </div>
          <button
            onClick={() => setShowCode(!showCode)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all flex items-center"
          >
            {showCode ? (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
                Hide Code
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
                Show Code Example
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-white">
        <p className="text-gray-700 mb-4">{example.description}</p>
        
        {showCode && (
          <div className="mt-4">
            <CodeRenderer code={example.code} />
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t border-gray-200">
        <div className="flex items-center">
          <svg className="inline-block h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Click "Show Code Example" to reveal the interactive code sample for this concept.</p>
        </div>
      </div>
    </div>
  );
}