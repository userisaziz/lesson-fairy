
export function buildLessonPrompt(outline: string): string {
   return `You are an expert educational content creator. Generate a comprehensive, well-structured lesson based on this request: "${outline}"

CRITICAL REQUIREMENTS:
1. Return ONLY valid JSON - no explanations, no additional text
2. Create 4-6 main sections with comprehensive, detailed educational content
3. Each section should have 2-3 subsections for thorough coverage
4. Generate 8-12 quiz questions (mix of easy, medium, and challenging difficulty)
5. Content must be accurate, engaging, and educationally rigorous
6. Include advanced concepts, technical details, and professional applications
7. Provide multiple real-world examples, case studies, and practical implementations
8. Include detailed code examples WITH BEST PRACTICES AND THOROUGH EXPLANATIONS ONLY FOR TECHNICAL/PROGRAMMING TOPICS
9. Add professional tips, common pitfalls, and optimization strategies
10. Include comprehensive visual descriptions for technical diagrams
11. Cover both theoretical foundations and practical applications
12. Include performance considerations and scalability aspects
13. Add industry standards and professional workflows
14. Include troubleshooting guides and debugging techniques
15. IMPORTANT: Output must be pure JSON that can be directly parsed

JSON Format:
{
  "id": 1,
  "type": "lesson-with-quiz",
  "metadata": {
    "title": "<compelling title>",
    "description": "<2-3 sentence overview>",
    "category": "<category_name>",
    "difficulty": "beginner|intermediate|advanced",
    "estimatedTime": <total_minutes>,
    "tags": ["tag1", "tag2", "tag3"],
    "author": "AI Learning Platform",
    "createdAt": "<ISO_timestamp>"
  },
  "content": {
    "introduction": "<engaging introduction paragraph with fun hook>",
    "learningObjectives": [
      "<what students will learn - point 1>",
      "<what students will learn - point 2>",
      "<what students will learn - point 3>"
    ],
    "sections": [
      {
        "id": 1,
        "title": "<section title>",
        "content": "<detailed content with formatting using **bold**, bullet points with •, numbered lists, and line breaks \\n\\n>",
        "type": "text",
        "order": 1,
        "visuals": {
          "description": "<description of image/diagram to generate>",
          "type": "image|diagram|code"
        },
        "codeExample": {
          "language": "javascript|python|typescript",
          "title": "<descriptive title for code example>",
          "description": "<explanation of what the code does>",
          "code": "<actual code example>"
        },
        "subsections": [
          {
            "id": "1.1",
            "title": "<subsection title>",
            "content": "<subsection content>"
          }
        ]
      }
    ]
  },
  "assessment": {
    "id": 1,
    "type": "mcq",
    "passingScore": 70,
    "totalQuestions": <5-8>,
    "timeLimit": <minutes>,
    "instructions": [
      "Read each question carefully",
      "Select the best answer",
      "You need 70% to pass",
      "You can retake unlimited times"
    ],
    "questions": [
      {
        "id": 1,
        "question": "<clear question text>",
        "options": [
          { "id": "a", "text": "<option>", "isCorrect": false },
          { "id": "b", "text": "<option>", "isCorrect": true },
          { "id": "c", "text": "<option>", "isCorrect": false },
          { "id": "d", "text": "<option>", "isCorrect": false }
        ],
        "explanation": "<detailed explanation of correct answer>",
        "difficulty": "easy|medium"
      }
    ]
  },
  "certificate": {
    "enabled": true,
    "criteria": { "minScore": 70 }
  }
}

For "${outline}", create something specific, educational, and fun. Return ONLY the JSON without any additional formatting. ONLY include code examples for programming or technical topics - for non-technical lessons, omit the codeExample field entirely.`;
}

export function buildImageDescriptionPrompt(description: string): string {
  return `Create a detailed technical visual description for: "${description}".
Requirements:
1. Return ONLY the visual description (no explanations or markdown)
2. Make it detailed and specific for accurate AI image generation
3. Include technical specifications, components, and architecture details
4. Describe exact colors, lighting, perspective, and composition
5. Include labels, annotations, and explanatory elements
6. Specify spatial relationships, dimensions, and proportions
7. Describe data flows, system interactions, and technical processes
8. Use professional terminology and precise technical language
9. Use clear, concise language and avoid jargon
10. Focus on minimal and cost-efficient visualization
11. Use simple, easy-to-render image formats
Example format:
A simple illustration showing [description of scene] with [visual elements] in [style]`;
}
