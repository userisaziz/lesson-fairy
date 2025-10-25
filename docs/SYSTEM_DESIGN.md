# Feyra-AI System Design Documentation

## Table of Contents
- [System Architecture](#system-architecture)
- [Low-Level Design](#low-level-design)
- [Data Flow Diagrams](#data-flow-diagrams)
- [Entity Relationship Diagram](#entity-relationship-diagram)
- [Component Architecture](#component-architecture)
- [Sequence Diagrams](#sequence-diagrams)
- [State Diagrams](#state-diagrams)
- [Deployment Architecture](#deployment-architecture)

## System Architecture

```mermaid
graph TB
    A[Client Browser] --> B[Next.js Frontend]
    B --> C[API Routes]
    C --> D[Service Layer]
    D --> E[AI Providers]
    D --> F[Database]
    F --> G[Supabase PostgreSQL]
    E --> H[Google Gemini]
    E --> I[Hugging Face]
    B --> J[Real-time Updates]
    J --> G
    K[Observability] --> L[Langfuse Tracing]
```

### Architecture Layers

1. **Presentation Layer**: React components with Tailwind CSS
2. **Application Layer**: Next.js API routes and server components
3. **Service Layer**: Business logic and AI integration services
4. **Data Layer**: Supabase PostgreSQL with real-time capabilities
5. **AI Layer**: Multiple AI providers (Google Gemini, Hugging Face)
6. **Observability Layer**: Langfuse for tracing and monitoring

## Low-Level Design

### 1. Lesson Generation Pipeline

```mermaid
graph TD
    A[User Request] --> B[API Endpoint]
    B --> C[Create DB Record]
    C --> D[Async Generation]
    D --> E[Build Prompt]
    E --> F[AI Content Generation]
    F --> G[Content Validation]
    G --> H[Visual Enhancement]
    H --> I[Update DB Record]
    I --> J[Real-time Notification]
```

### 2. Content Generation Service Flow

```mermaid
graph TD
    A[generateLessonContentAsync] --> B[Build Lesson Prompt]
    B --> C[Generate Content with AI]
    C --> D{Content Valid?}
    D -->|Yes| E[Parse and Validate JSON]
    D -->|No| F[Retry or Error]
    E --> G[Enrich with Visuals]
    G --> H{Visuals Needed?}
    H -->|Yes| I[Generate Diagram/Image]
    H -->|No| J[Update Database]
    I --> J
    J --> K[Database Update]
    K --> L[Real-time Broadcast]
```

### 3. AI Provider Integration

```mermaid
graph TD
    A[AI Utility Layer] --> B{Provider Type}
    B -->|Gemini| C[Gemini API Client]
    B -->|Hugging Face| D[Hugging Face API Client]
    C --> E[Gemini Models]
    D --> F[HF Models]
    E --> G[Text Generation]
    F --> H[Image Generation]
    F --> I[Diagram Generation]
```

## Data Flow Diagrams

### Level 1 DFD: Main System Flow

```mermaid
graph TD
    A[User] --> B[Feyra-AI Platform]
    B --> C{Action Type}
    C -->|Create Lesson| D[Lesson Generation]
    C -->|View Lesson| E[Lesson Retrieval]
    C -->|Take Quiz| F[Quiz Processing]
    D --> G[AI Content Generation]
    G --> H[Supabase Database]
    E --> H
    F --> H
    H --> B
    B --> A
```

### Level 2 DFD: Lesson Generation Process

```mermaid
graph TD
    A[User Request] --> B[API Service]
    B --> C[Database Service]
    C --> D[Create Lesson Record]
    D --> E[Content Generation Service]
    E --> F[AI Prompt Builder]
    F --> G[AI Provider]
    G --> H[Raw Content]
    H --> I[Content Validator]
    I --> J[Visual Enhancement]
    J --> K[Database Update]
    K --> L[Real-time Notification]
```

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ LESSONS : creates
    LESSONS ||--o{ SECTIONS : contains
    LESSONS ||--o{ QUIZZES : has
    QUIZZES ||--o{ QUESTIONS : contains
    QUESTIONS ||--o{ OPTIONS : has
    USERS ||--o{ USER_PROGRESS : tracks
    USER_PROGRESS }|--|| LESSONS : for
    USER_PROGRESS }|--|| SECTIONS : tracks
    USER_PROGRESS }|--|| QUIZZES : tracks
    
    USERS {
        uuid id PK
        string email
        string name
        timestamp created_at
        timestamp last_login
    }
    
    LESSONS {
        uuid id PK
        text outline
        json content
        string status
        timestamp created_at
        text image_url
        text diagram_svg
    }
    
    SECTIONS {
        uuid id PK
        uuid lesson_id FK
        string title
        text content
        int order
        text visual_type
        text visual_content
    }
    
    QUIZZES {
        uuid id PK
        uuid lesson_id FK
        int passing_score
        int total_questions
        int time_limit
    }
    
    QUESTIONS {
        uuid id PK
        uuid quiz_id FK
        text question
        text explanation
        string difficulty
        int order
    }
    
    OPTIONS {
        uuid id PK
        uuid question_id FK
        text option_text
        boolean is_correct
    }
    
    USER_PROGRESS {
        uuid id PK
        uuid user_id FK
        uuid lesson_id FK
        uuid section_id FK
        uuid quiz_id FK
        boolean completed
        int score
        timestamp completed_at
    }
```

## Component Architecture

```mermaid
graph TD
    A[App Root] --> B[Layout Component]
    B --> C[Page Components]
    C --> D[Home Page]
    C --> E[Lesson Detail Page]
    D --> F[Lesson Generator]
    D --> G[Lessons Table]
    E --> H[Lesson View]
    E --> I[Quiz View]
    E --> J[Results View]
    H --> K[Table of Contents]
    H --> L[Content Renderer]
    H --> M[Diagram Renderer]
    H --> N[Code Renderer]
    I --> O[Quiz Timer]
    I --> P[Question Component]
    I --> Q[Answer Options]
    J --> R[Score Display]
    J --> S[Answer Review]
    J --> T[Performance Chart]
```

### Component Interaction Flow

```mermaid
graph TD
    A[LessonGenerator] --> B{Form Valid?}
    B -->|No| C[Show Error]
    B -->|Yes| D[Call API]
    D --> E[Create Lesson Record]
    E --> F[Navigate to Lesson]
    F --> G[Subscribe to Updates]
    G --> H[Real-time Updates]
    H --> I[Update UI]
    I --> J{Content Ready?}
    J -->|No| K[Show Loading]
    J -->|Yes| L[Render Content]
```

## Sequence Diagrams

### Lesson Creation Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API
    participant S as Service
    participant DB as Database
    participant AI as AI Provider

    U->>F: Submit lesson topic
    F->>A: POST /api/generateLesson
    A->>DB: Create lesson record (status: generating)
    A-->>F: Return lesson ID
    F->>F: Navigate to lesson page
    A->>S: Async content generation
    S->>S: Build AI prompt
    S->>AI: Request content generation
    AI-->>S: Return generated content
    S->>S: Validate and format content
    S->>DB: Update lesson (status: generated, content)
    DB-->>F: Real-time update
    F->>F: Display generated lesson
```

### Quiz Taking Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant DB as Database

    U->>F: Start Quiz
    F->>DB: Fetch quiz data
    DB-->>F: Return quiz content
    F->>F: Display first question
    U->>F: Select answer
    F->>F: Validate answer
    F->>F: Store answer
    F->>F: Move to next question
    U->>F: Complete quiz
    F->>DB: Save quiz results
    DB-->>F: Confirm save
    F->>F: Display results
```

### Real-time Updates Sequence

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant F as Frontend
    participant DB as Database

    U1->>F: Generate lesson
    F->>DB: Create lesson record
    DB-->>U2: Real-time notification
    U2->>F: See new lesson in list
    DB->>DB: Update lesson content
    DB-->>U1: Real-time content update
    U1->>F: See updated lesson content
```

## State Diagrams

### Lesson State Machine

```mermaid
stateDiagram-v2
    [*] --> Creating: New lesson request
    Creating --> Generating: Record created
    Generating --> Processing: AI generation started
    Processing --> Validating: Content received
    Validating --> Enhancing: Content validated
    Enhancing --> Completed: Visuals added
    Completed --> [*]: Lesson ready
    Generating --> Error: Generation failed
    Processing --> Error: Processing failed
    Validating --> Error: Validation failed
    Enhancing --> Error: Enhancement failed
    Error --> Retry: Retry mechanism
    Retry --> Generating: Retry attempt
```

### Quiz State Machine

```mermaid
stateDiagram-v2
    [*] --> NotStarted: Quiz available
    NotStarted --> InProgress: User starts quiz
    InProgress --> QuestionDisplayed: Question shown
    QuestionDisplayed --> AnswerSelected: User selects answer
    AnswerSelected --> QuestionDisplayed: Next question
    AnswerSelected --> Completed: Last question answered
    Completed --> ResultsDisplayed: Show results
    ResultsDisplayed --> ReviewAnswers: User reviews
    ReviewAnswers --> ResultsDisplayed: Back to results
    ResultsDisplayed --> [*]: Quiz session ends
```

### User Session State Machine

```mermaid
stateDiagram-v2
    [*] --> Anonymous: Initial visit
    Anonymous --> Browsing: View lessons
    Browsing --> ViewingLesson: Select lesson
    ViewingLesson --> TakingQuiz: Start quiz
    TakingQuiz --> ViewingResults: Complete quiz
    ViewingResults --> Browsing: Back to lessons
    ViewingLesson --> Browsing: Back to lessons
    Anonymous --> Authenticated: Sign in (if auth implemented)
    Authenticated --> Browsing: Access lessons
    Authenticated --> CreatingLesson: Generate new lesson
    CreatingLesson --> Browsing: Lesson created
```

## Deployment Architecture

```mermaid
graph TD
    A[Client Devices] --> B[CDN/Edge Network]
    B --> C[Vercel Frontend]
    C --> D{API Request}
    D -->|Lesson Gen| E[Vercel Serverless Functions]
    D -->|DB Ops| F[Supabase API]
    E --> G[AI Providers]
    G --> H[Google Gemini]
    G --> I[Hugging Face]
    F --> J[Supabase PostgreSQL]
    J --> K[Real-time Engine]
    K --> C
    L[Observability] --> M[Langfuse]
    E --> M
```

### Infrastructure Components

1. **Frontend Hosting**: Vercel for Next.js deployment
2. **API Hosting**: Vercel serverless functions
3. **Database**: Supabase PostgreSQL with real-time capabilities
4. **AI Services**: 
   - Google Gemini for text generation
   - Hugging Face for image/diagram generation
5. **Observability**: Langfuse for tracing
6. **Static Assets**: Vercel CDN for images and static files

### Scalability Considerations

```mermaid
graph TD
    A[Load Balancer] --> B[Multiple Vercel Instances]
    A --> C[Multiple Supabase Instances]
    B --> D[API Replicas]
    B --> E[Frontend Replicas]
    C --> F[DB Cluster]
    F --> G[Read Replicas]
    F --> H[Write Primary]
    D --> I[AI Provider Pool]
    I --> J[Gemini Instances]
    I --> K[Hugging Face Instances]
```

This comprehensive system design documentation provides a detailed view of the Feyra-AI platform architecture, including all requested diagrams and low-level design specifications.