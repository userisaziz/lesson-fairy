'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Lesson } from '@/types/lesson';
import TableOfContents from './TableOfContents';
import DiagramRenderer from './DiagramRenderer';
import ImageRenderer from './ImageRenderer';
import CodeExampleRenderer from './CodeExampleRenderer';

interface LessonViewProps {
  lesson: Lesson;
  onQuizStart: () => void;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onQuizStart }) => {
  const [activeSection, setActiveSection] = useState(1);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const sectionRefs = useRef<{[key: number]: HTMLDivElement | null}>({});
  const observer = useRef<IntersectionObserver | null>(null);

  // Parse the lesson content safely
  let lessonContent = null;
  try {
    lessonContent = lesson.json_content || (lesson.content ? 
      (typeof lesson.content === 'string' ? JSON.parse(lesson.content) : lesson.content) : null);
  } catch (e) {
    console.error('Error parsing lesson content:', e);
    lessonContent = null;
  }

  // Set up intersection observer to track active section
  useEffect(() => {
    // Clean up previous observer
    if (observer.current) {
      observer.current.disconnect();
    }

    // Only set up observer if we have content
    if (lessonContent?.content?.sections) {
      // Create new observer
      observer.current = new IntersectionObserver(
        (entries) => {
          // Find the section that is most visible (highest intersection ratio)
          let mostVisibleSection: Element | null = null;
          let highestRatio = 0;
          
          entries.forEach(entry => {
            const ratio = entry.intersectionRatio;
            if (ratio > highestRatio) {
              highestRatio = ratio;
              mostVisibleSection = entry.target;
            }
          });
          
          // Update active section if we found one
          if (mostVisibleSection) {
            const sectionId = parseInt((mostVisibleSection as HTMLElement).id.replace('section-', ''));
            setActiveSection(sectionId);
          }
        },
        { 
          threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
          rootMargin: '0px 0px -50% 0px' // Trigger when section is 50% visible from top
        }
      );

      // Observe all section elements
      Object.values(sectionRefs.current).forEach(el => {
        if (el) observer.current?.observe(el);
      });
    }

    // Cleanup function
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [lessonContent?.content?.sections]);

  const scrollToSection = (sectionId: number) => {
    sectionRefs.current[sectionId]?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  const markSectionComplete = (sectionId: number) => {
    setCompletedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId) 
        : [...prev, sectionId]
    );
  };

  const isLessonComplete = lessonContent?.content?.sections && completedSections.length === lessonContent.content.sections.length;

  // Format content with basic markdown-like styling
  const formatContent = (content: string) => {
    // Handle empty or undefined content
    if (!content) {
      return <p className="mb-4 text-gray-700 leading-relaxed">No content available for this section.</p>;
    }
    
    return content
      .split('\n\n')
      .map((paragraph, index) => {
        // Handle bullet points
        if (paragraph.startsWith('• ')) {
          return (
            <ul key={index} className="list-disc list-inside mb-4 space-y-2 ml-4">
              {paragraph.split('\n').map((item, i) => (
                <li key={i} className="pl-2">{item.substring(2)}</li>
              ))}
            </ul>
          );
        }
        
        // Handle numbered lists
        if (/^\d+\./.test(paragraph)) {
          return (
            <ol key={index} className="list-decimal list-inside mb-4 space-y-2 ml-4">
              {paragraph.split('\n').map((item, i) => (
                <li key={i} className="pl-2">{item.replace(/^\d+\.\s*/, '')}</li>
              ))}
            </ol>
          );
        }
        
        // Handle bold text
        const formattedText = paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        return (
          <p 
            key={index} 
            className="mb-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      });
  };

  // Handle cases where lesson content might be missing or malformed
  if (!lesson || !lessonContent) {
    // Handle error state
    if (lesson.status === 'error') {
      return (
        <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Lesson Generation Failed</h3>
          <p className="text-gray-600 mb-4">We encountered an issue while generating this lesson. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // Handle generating state
    if (lesson.status === 'generating') {
      return (
        <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <svg className="h-12 w-12 animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Your Lesson</h3>
          <p className="text-gray-600">This usually takes 30-60 seconds. Please wait...</p>
          <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-gray-600 h-2.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Content Missing</h3>
        <p className="text-gray-600">This lesson appears to be missing content.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Table of Contents - Sidebar */}
      <TableOfContents
        sections={lessonContent.content.sections || []}
        activeSection={activeSection}
        completedSections={completedSections}
        onSectionClick={scrollToSection}
        onSectionComplete={markSectionComplete}
      />
      
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {/* Hero Section */}
        <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 mb-6 border border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {lessonContent.metadata.category || 'Uncategorized'}
              </span>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {lessonContent.metadata.difficulty ? lessonContent.metadata.difficulty.charAt(0).toUpperCase() + lessonContent.metadata.difficulty.slice(1) : 'Beginner'}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  {lessonContent.metadata.estimatedTime || 10} min
                </span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{lessonContent.metadata.title || 'Untitled Lesson'}</h1>
            <p className="text-lg text-gray-600 mb-6">{lessonContent.metadata.description || 'No description available.'}</p>
            <div className="flex flex-wrap gap-2">
              {lessonContent.metadata.tags && lessonContent.metadata.tags.length > 0 ? (
                lessonContent.metadata.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                  General
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Learning Objectives */}
        {lessonContent.content.learningObjectives && lessonContent.content.learningObjectives.length > 0 && (
          <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 mb-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="mr-2 h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002-2h2a2 2 0 002 2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Learning Objectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessonContent.content.learningObjectives.map((objective: string, index: number) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 mt-1 mr-3 text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-gray-700">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Sections */}
        <div className="space-y-6">
          {lessonContent.content.sections && lessonContent.content.sections.length > 0 ? (
            lessonContent.content.sections.map((section: any) => (
              <div 
                key={section.id}
                id={`section-${section.id}`}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200"
                data-section={section.id}
              >
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                    <span className="mr-3 w-8 h-8 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center font-bold text-sm">
                      {section.id}
                    </span>
                    {section.title || 'Untitled Section'}
                  </h2>
                  <button
                    onClick={() => markSectionComplete(section.id)}
                    className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                      completedSections.includes(section.id)
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-500'
                    }`}
                  >
                    {completedSections.includes(section.id) ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Visual content (diagrams/images) */}
                {section.generatedVisual && section.visuals?.type === 'diagram' && (
                  <div className="mb-6">
                    <DiagramRenderer 
                      svgContent={section.generatedVisual} 
                      title={`Illustration for ${section.title}`} 
                    />
                  </div>
                )}
                
                {section.visuals?.description && section.visuals?.type === 'image' && (
                  <div className="mb-6">
                    <ImageRenderer 
                      imageSrc={section.generatedVisual || ''} 
                      description={section.visuals.description} 
                      title={`Illustration for ${section.title}`} 
                    />
                  </div>
                )}
                
                {/* Code Example - Only show for technical/programming topics */}
                {section.codeExample && section.codeExample.code && section.codeExample.code.trim() !== '' && (
                  <div className="mb-6">
                    <CodeExampleRenderer example={section.codeExample} />
                  </div>
                )}
                
                <div className="prose max-w-none">
                  {formatContent(section.content)}
                </div>
                
                {/* Subsections */}
                {section.subsections && section.subsections.length > 0 && (
                  <div className="mt-8 space-y-6">
                    {section.subsections.map((subsection: any) => (
                      <div key={subsection.id} className="border-l-4 border-gray-200 pl-4 py-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center">
                          <span className="mr-2 w-6 h-6 rounded-full bg-gray-100 text-gray-800 flex items-center justify-center text-sm">
                            {subsection.id}
                          </span>
                          {subsection.title || 'Untitled Subsection'}
                        </h3>
                        <div className="prose max-w-none">
                          {formatContent(subsection.content)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Content Available</h3>
              <p className="text-gray-600">This lesson appears to be missing content sections.</p>
            </div>
          )}
        </div>

        {/* Navigation and Quiz Button */}
        <div className="mt-6 flex justify-between items-center bg-white rounded-xl shadow-[0_3px_10px_rgb(0,0,0,0.08)] p-6 border border-gray-200">
          <div className="text-gray-600">
            <span className="font-medium">{completedSections.length}</span> of <span className="font-medium">{lessonContent.content.sections ? lessonContent.content.sections.length : 0}</span> sections completed
          </div>
          <button
            onClick={onQuizStart}
            disabled={!isLessonComplete}
            className={`px-6 py-3 rounded-lg font-medium text-white shadow-sm transition-all ${
              isLessonComplete
                ? 'bg-gray-900 hover:bg-gray-800'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            {isLessonComplete ? (
              <span className="flex items-center">
                <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Take Quiz
              </span>
            ) : (
              'Complete All Sections to Unlock Quiz'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LessonView;