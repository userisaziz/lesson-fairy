'use client';

import React, { useState, useEffect } from 'react';

interface DiagramRendererProps {
  svgContent: string;
  title?: string;
}

export default function DiagramRenderer({ svgContent, title }: DiagramRendererProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImageDataUrl = svgContent.startsWith('data:image');

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white">
            <svg className="h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-slate-900">{title || 'Lesson Diagram'}</span>
        </div>
        <button
          onClick={copyToClipboard}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
            copied 
              ? 'bg-slate-900 text-white' 
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          {copied ? (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
      
      {/* Image Content */}
      <div className="flex justify-center bg-white p-6">
        {isImageDataUrl ? (
          <img 
            src={svgContent} 
            alt={title || 'Lesson diagram'} 
            className="h-auto max-w-full rounded-lg border border-slate-200"
            style={{ maxHeight: '400px' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-slate-600">No diagram available</p>
          </div>
        )}
      </div>
      
      {/* Footer */}
      {/* <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>AI-generated visual aid for enhanced learning</p>
        </div>
      </div> */}
    </div>
  );
}