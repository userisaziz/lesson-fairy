export function buildLessonPrompt(outline: string): string {
  return `Generate educational lesson JSON for: "${outline}"

Return ONLY valid JSON (no explanations, no markdown code blocks, no extra text):

{
  "id": 1,
  "type": "lesson-with-quiz",
  "metadata": {
    "title": "string",
    "description": "string (2 sentences)",
    "category": "string",
    "difficulty": "beginner|intermediate|advanced",
    "estimatedTime": 15,
    "tags": ["tag1", "tag2", "tag3"],
    "author": "AI Learning Platform",
    "createdAt": "${new Date().toISOString()}"
  },
  "content": {
    "introduction": "string (engaging paragraph)",
    "learningObjectives": ["objective1", "objective2", "objective3"],
    "sections": [
      {
        "id": 1,
        "title": "string",
        "content": "string (detailed, use **bold**, bullets •, \\n\\n)",
        "type": "text",
        "order": 1,
        "visuals": {
          "description": "string (brief image description)",
          "type": "image|diagram"
        },
        "subsections": [
          {
            "id": "1.1",
            "title": "string",
            "content": "string"
          }
        ]
      }
    ]
  },
  "assessment": {
    "id": 1,
    "type": "mcq",
    "passingScore": 70,
    "totalQuestions": 5,
    "timeLimit": 10,
    "instructions": ["Read carefully", "Select best answer", "70% to pass", "Unlimited retakes"],
    "questions": [
      {
        "id": 1,
        "question": "string",
        "options": [
          {"id": "a", "text": "string", "isCorrect": false},
          {"id": "b", "text": "string", "isCorrect": true},
          {"id": "c", "text": "string", "isCorrect": false},
          {"id": "d", "text": "string", "isCorrect": false}
        ],
        "explanation": "string (brief)",
        "difficulty": "easy|medium"
      }
    ]
  },
  "certificate": {
    "enabled": true,
    "criteria": {"minScore": 70}
  }
}

IMPORTANT FORMATTING RULES:
- Return ONLY valid JSON with no extra text
- Ensure all strings are properly quoted with double quotes
- Ensure all object keys are quoted
- No trailing commas
- Escape special characters properly
- No markdown code blocks or formatting
- 3 sections, each with 2 subsections
- 5 quiz questions (3 easy, 2 medium)
- Clear, accurate content
- Include code examples ONLY for programming topics
- Keep content concise but comprehensive`;
}

export function buildImageDescriptionPrompt(description: string): string {
  return `Describe visual for: "${description}"

Return brief description for image generation (one paragraph, no markdown):
- Describe scene, key elements, colors
- Specify style (e.g., "simple illustration", "diagram", "cartoon")
- Keep under 100 words
- Focus on what's visually important

Example: "A simple diagram showing a red circle labeled 'A' connected by an arrow to a blue square labeled 'B', with clean lines on white background, minimal style"`;
}