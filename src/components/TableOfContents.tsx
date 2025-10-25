'use client';

import React, { useState, useEffect } from 'react';
import { Section } from '@/types/lesson';

interface TableOfContentsProps {
  sections: Section[];
  activeSection: number;
  completedSections: number[];
  onSectionClick: (sectionId: number) => void;
  onSectionComplete: (sectionId: number) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  sections,
  activeSection,
  completedSections,
  onSectionClick,
  onSectionComplete
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localActiveSection, setLocalActiveSection] = useState(activeSection);

  // Update local state when activeSection prop changes
  useEffect(() => {
    setLocalActiveSection(activeSection);
  }, [activeSection]);

  // Calculate progress percentage
  const progress = sections.length > 0 
    ? Math.round((completedSections.length / sections.length) * 100) 
    : 0;

  return (
    <>
      {/* Mobile TOC Toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-10">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="bg-gray-900 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          aria-label="Toggle table of contents"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile TOC Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setIsMobileOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-5/6 bg-white p-6 overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
              <button 
                onClick={() => setIsMobileOpen(false)} 
                className="text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <TableOfContentsList 
              sections={sections}
              activeSection={localActiveSection}
              completedSections={completedSections}
              onSectionClick={(id) => {
                onSectionClick(id);
                setIsMobileOpen(false);
              }}
              onSectionComplete={onSectionComplete}
            />
          </div>
        </div>
      )}

      {/* Desktop TOC */}
      <div className="hidden md:block w-72 flex-shrink-0">
        <div className="sticky top-8 bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center">
            <svg className="mr-3 h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Course Content
          </h2>
          
          {/* Progress Bar */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between text-sm text-gray-700 mb-2">
              <span className="font-medium">Your Progress</span>
              <span className="font-bold text-gray-900">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gray-900 h-2 rounded-full transition-all duration-700 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {completedSections.length} of {sections.length} sections completed
            </div>
          </div>
          
          <TableOfContentsList 
            sections={sections}
            activeSection={localActiveSection}
            completedSections={completedSections}
            onSectionClick={onSectionClick}
            onSectionComplete={onSectionComplete}
          />
        </div>
      </div>
    </>
  );
};

interface TableOfContentsListProps {
  sections: Section[];
  activeSection: number;
  completedSections: number[];
  onSectionClick: (sectionId: number) => void;
  onSectionComplete: (sectionId: number) => void;
}

const TableOfContentsList: React.FC<TableOfContentsListProps> = ({
  sections,
  activeSection,
  completedSections,
  onSectionClick,
  onSectionComplete
}) => {
  return (
    <nav>
      <ul className="space-y-2">
        {sections.map((section) => {
          const isCompleted = completedSections.includes(section.id);
          const isActive = activeSection === section.id;
          
          return (
            <li key={section.id}>
              <div className={`flex items-start p-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-gray-100 border border-gray-200' 
                  : 'hover:bg-gray-50 border border-transparent'
              }`}>
                <button
                  onClick={() => onSectionComplete(section.id)}
                  className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label={isCompleted ? `Mark section ${section.id} as incomplete` : `Mark section ${section.id} as complete`}
                >
                  {isCompleted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold text-gray-500">{section.id}</span>
                  )}
                </button>
                <button
                  onClick={() => onSectionClick(section.id)}
                  className={`text-left flex-1 text-sm font-medium transition-colors ${
                    isActive ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                  }`}
                >
                  {section.title}
                </button>
              </div>
              
              {/* Subsections */}
              {section.subsections && section.subsections.length > 0 && (
                <ul className="ml-11 mt-2 space-y-2">
                  {section.subsections.map((subsection: any) => (
                    <li key={subsection.id} className="flex items-start group">
                      <span className="text-gray-400 mr-2 mt-1 group-hover:text-gray-600 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <button
                        onClick={() => onSectionClick(section.id)}
                        className="text-left text-xs text-gray-600 hover:text-gray-900 transition-colors group-hover:underline"
                      >
                        {subsection.title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TableOfContents;