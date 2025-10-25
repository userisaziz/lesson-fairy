# Feyra-AI Observability and Tracing

## Table of Contents
- [Tracing Architecture](#tracing-architecture)
- [Langfuse Integration](#langfuse-integration)
- [Trace Structure](#trace-structure)
- [Observability Flow](#observability-flow)
- [Monitoring Dashboard](#monitoring-dashboard)

## Tracing Architecture

```mermaid
graph TD
    A[User Request] --> B[API Endpoint]
    B --> C[Tracing Middleware]
    C --> D[Trace Initialization]
    D --> E[Lesson Generation]
    E --> F[AI Provider Call]
    F --> G[Content Processing]
    G --> H[Database Operations]
    H --> I[Response Generation]
    I --> J[Trace Completion]
    D --> K[Langfuse]
    F --> K
    G --> K
    H --> K
    J --> K
```

## Langfuse Integration

### Tracing Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant T as Tracing
    participant L as Langfuse
    participant AI as AI Provider
    participant DB as Database

    U->>A: Request Lesson
    A->>T: Start Trace
    T->>L: Initialize Trace
    A->>AI: Generate Content
    AI->>T: Log Generation
    T->>L: Record Generation
    A->>DB: Save Content
    DB->>T: Log Database Op
    T->>L: Record DB Operation
    A->>T: End Trace
    T->>L: Finalize Trace
    L->>L: Store Trace Data
```

## Trace Structure

Based on the sample trace in `traces/sample.json`, here's the structure used for observability:

### Root Trace Object
```json
{
  "traceId": "unique-trace-id",
  "name": "lesson-generation",
  "startTime": "ISO Timestamp",
  "endTime": "ISO Timestamp",
  "status": "SUCCESS/ERROR",
  "input": {
    "outline": "Lesson topic"
  },
  "output": {
    "lessonId": "generated-lesson-id",
    "content": "generated-content"
  },
  "observations": []
}
```

### Generation Observation
```json
{
  "id": "generation-observation-id",
  "type": "GENERATION",
  "name": "ai-generation",
  "startTime": "ISO Timestamp",
  "endTime": "ISO Timestamp",
  "model": "gemini-2.0-flash-001",
  "input": "prompt-text",
  "output": "generated-content",
  "usage": {
    "promptTokens": 85,
    "completionTokens": 245,
    "totalTokens": 330
  }
}
```

## Observability Flow

### Complete Tracing Pipeline

```mermaid
graph TD
    A[Lesson Request] --> B[Create Trace]
    B --> C[Log Input]
    C --> D[Build Prompt]
    D --> E[Log Prompt]
    E --> F[AI Generation]
    F --> G[Log Generation]
    G --> H[Validate Content]
    H --> I{Valid?}
    I -->|Yes| J[Process Content]
    I -->|No| K[Log Error]
    J --> L[Log Processing]
    L --> M[Database Save]
    M --> N[Log Database Op]
    N --> O[Complete Trace]
    K --> O
    O --> P[Send to Langfuse]
```

### Error Handling Tracing

```mermaid
graph TD
    A[Lesson Request] --> B[Create Trace]
    B --> C[AI Generation]
    C --> D{Success?}
    D -->|Yes| E[Process Content]
    D -->|No| F[Log Error]
    F --> G[Set Error Status]
    G --> H[Complete Trace]
    E --> I[Complete Trace]
    H --> J[Send to Langfuse]
    I --> J
```

## Monitoring Dashboard

### Key Metrics Tracked

```mermaid
graph TD
    A[Langfuse Dashboard] --> B[Trace Metrics]
    A --> C[Performance Metrics]
    A --> D[Error Rates]
    A --> E[AI Usage]
    
    B --> F[Request Volume]
    B --> G[Success Rate]
    B --> H[Average Response Time]
    
    C --> I[API Latency]
    C --> J[Database Performance]
    C --> K[AI Generation Time]
    
    D --> L[Error by Type]
    D --> M[Error by Component]
    D --> N[Failure Rate]
    
    E --> O[Token Usage]
    E --> P[Model Performance]
    E --> Q[Cost Tracking]
```

### Alerting System

```mermaid
graph TD
    A[Metrics Collection] --> B[Threshold Monitoring]
    B --> C{Threshold Exceeded?}
    C -->|Yes| D[Trigger Alert]
    C -->|No| E[Continue Monitoring]
    D --> F[Send Notification]
    F --> G[Slack/Email/Webhook]
    D --> H[Create Incident]
    H --> I[Assign to Team]
```

This observability documentation shows how tracing is implemented in the Feyra-AI platform using Langfuse, providing visibility into the AI generation process, performance metrics, and error tracking.