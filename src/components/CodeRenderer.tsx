'use client';

import { useState } from 'react';

interface CodeRendererProps {
  code: string;
}

export default function CodeRenderer({ code }: CodeRendererProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Enhanced syntax highlighting for TypeScript
  const highlightCode = (code: string) => {
    // First, escape HTML characters
    const escapeHtml = (unsafe: string) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let escapedCode = escapeHtml(code);
    
    // Apply syntax highlighting
    return escapedCode
      // Comments (// and /* */)
      .replace(/(\/\/.*$)/gm, '<span class="text-green-400">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-green-400">$1</span>')
      // Keywords
      .replace(/\b(abstract|any|as|asserts|bigint|boolean|break|case|catch|class|const|constructor|continue|debugger|declare|default|delete|do|else|enum|export|extends|false|finally|for|from|function|get|if|implements|import|in|infer|instanceof|interface|is|keyof|let|module|namespace|never|new|null|number|object|of|override|package|private|protected|public|readonly|require|global|module|namespace|return|set|static|string|super|switch|symbol|this|throw|true|try|type|typeof|undefined|var|void|while|with|yield|window|console|log)\b/g, '<span class="text-purple-400 font-medium">$1</span>')
      // Types
      .replace(/\b(Array|Boolean|Date|Function|Map|Number|Object|Promise|RegExp|Set|String|Symbol|WeakMap|WeakSet|Record|Partial|Readonly|Pick|Omit|Exclude|Extract|Required|ReturnType|InstanceType|void|unknown|any|never)\b/g, '<span class="text-blue-400">$1</span>')
      // Strings
      .replace(/(".*?"|'.*?'|`.*?`)/g, '<span class="text-yellow-400">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-red-400">$1</span>')
      // Functions
      .replace(/(\w+)(?=\s*\()/g, '<span class="text-cyan-400">$1</span>');
  };

  return (
    <div className="border rounded-xl overflow-hidden shadow-[0_3px_10px_rgb(0,0,0,0.08)] border-gray-200">
      <div className="bg-gray-900 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-gray-200 font-medium">TypeScript Lesson Code</span>
        </div>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
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
              Copy Code
            </span>
          )}
        </button>
      </div>
      <pre className="p-6 bg-gray-900 overflow-x-auto">
        <code 
          className="text-gray-100 text-sm font-mono leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
        />
      </pre>
      <div className="bg-gray-800 px-6 py-3 text-xs text-gray-400">
        <div className="flex items-center">
          <svg className="inline-block h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Click "Copy Code" to copy the entire code to your clipboard</p>
        </div>
      </div>
    </div>
  );
}