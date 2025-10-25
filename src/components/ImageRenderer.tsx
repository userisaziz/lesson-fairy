'use client';

import React, { useState } from 'react';

interface ImageRendererProps {
  imageSrc: string;
  description: string;
  title?: string;
}

export default function ImageRenderer({ imageSrc, description, title }: ImageRendererProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(description);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if imageSrc is a data URL (actual image) or just a description
  const isActualImage = imageSrc.startsWith('data:image');

  return (
    <div className="border rounded-xl overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.08)] my-6 border-gray-200">
      <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-200">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-800 font-medium">{title || 'Lesson Illustration'}</span>
        </div>
        {!isActualImage && (
          <button
            onClick={copyToClipboard}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {copied ? (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Copied!
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Copy Description
              </span>
            )}
          </button>
        )}
      </div>
      
      <div className="p-6 bg-white flex justify-center">
        {isActualImage ? (
          <div className="text-center">
            <img 
              src={imageSrc} 
              alt={title || 'Lesson illustration'} 
              className="max-w-full h-auto rounded-lg shadow-sm mx-auto"
              style={{ maxHeight: '400px' }}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI-Generated Illustration</h3>
            <p className="text-gray-600 mb-4">This visual description can be used to generate an image:</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left max-w-2xl mx-auto border border-gray-200">
              <p className="text-gray-700 italic">"{description}"</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-6 py-3 text-xs text-gray-500 border-t border-gray-200">
        <div className="flex items-center">
          <svg className="inline-block h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>
            {isActualImage 
              ? 'This is an AI-generated educational illustration.' 
              : 'This description can be used with AI image generators to create educational illustrations.'}
          </p>
        </div>
      </div>
    </div>
  );
}