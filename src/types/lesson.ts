export type Lesson = {
  id: string;
  outline: string;
  content: string | null;
  json_content: any | null;
  status: 'generating' | 'generated';
  created_at: string;
  // Bonus fields for images
  image_url?: string | null;
  diagram_svg?: string | null;
};

export interface LessonContent {
  id: number;
  type: string;
  metadata: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    estimatedTime: number;
    tags: string[];
    author: string;
    createdAt: string;
    generatedBy?: string;
  };
  content: {
    introduction: string;
    learningObjectives: string[];
    sections: Section[];
  };
  assessment: Assessment;
  certificate: {
    enabled: boolean;
    criteria: { minScore: number };
  };
}

export interface Section {
  id: number;
  title: string;
  content: string;
  type: string;
  order: number;
  visuals?: {
    description: string;
    type: 'image' | 'diagram' | 'code';
  };
  codeExample?: {
    language: string;
    title: string;
    description: string;
    code: string;
  };
  subsections?: Subsection[];
  generatedVisual?: string;
}

export interface Subsection {
  id: string;
  title: string;
  content: string;
}

export interface Assessment {
  id: number;
  type: string;
  passingScore: number;
  totalQuestions: number;
  timeLimit: number;
  instructions: string[];
  questions: Question[];
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  explanation: string;
  difficulty: string;
}

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}
