# Mirael AI System Architecture

## Core AI Components

### 1. Mirael Core V2 (`src/lib/ai/mirael-core/v2/`)

The current AI system implementation with improved architecture and modularity.

#### Main Entry Point

- **`mirael-chat.action.ts`**: Central handler for user input processing
  - Validates user input
  - Orchestrates analysis and response generation
  - Handles cost tracking and token usage
  - Manages error handling and retries

#### Key Functions:

```typescript
handleUserInput(
  userInput: string,
  prevAnalysis: StateAnalysis[],
  messages: OpenChatMessage[],
  profile: Profile | null,
  prevMemory: string | null,
  locale: AppLocales,
  modelCode: ModelCode
): Promise<HandleUserInputResult>
```

### 2. State Analysis System

- **Purpose**: Analyzes user input to determine emotional state and appropriate response modules
- **Location**: `src/lib/ai/mirael-core/v2/state-analysis/`
- **Schema**: Structured analysis with intensity, themes, distortions, beliefs, and module selection

#### Analysis Output Structure:

```typescript
interface StateAnalysis {
  intensity: "low" | "medium" | "high" | "crisis";
  themes: string[];
  distortions: string[];
  core_beliefs: string[];
  silent_rules: string[];
  in_scope_challenges: string[];
  out_of_scope_challenges: string[];
  recall_memory: boolean;
  modules: string[];
}
```

### 3. Module System (`src/lib/ai/mirael-core/v2/modules/`)

Modular approach to handling different therapeutic interventions:

#### Core Modules:

- **COGNITIVE**: Cognitive distortion detection and reframing
- **CORE_BELIEFS**: Identity-level belief examination
- **CRISIS**: Immediate safety and containment
- **REFRAMING**: Alternative perspective offering
- **SHOULDS**: Rigid rule identification and softening

#### Module Instructions:

Each module has specific instructions for:

- Identification patterns
- Response strategies
- Tone adaptation
- User engagement approaches

### 4. Session Memory Management

- **Context Preservation**: Maintains conversation continuity
- **Memory Recall**: Selective memory integration based on analysis
- **Session Analysis**: Periodic summarization and insight generation

### 5. Prompt Engineering System

#### Core Prompts (`src/lib/ai/shared/prompts/`):

- **Persona Prompt**: Defines Mirael's therapeutic personality
- **Security Protocol**: Safety and boundary guidelines
- **Language Prompts**: Locale-specific communication rules
- **Tone Prompts**: Intensity-appropriate response styles
- **User Context**: Profile-based personalization

#### Prompt Building Process:

1. Security protocol injection
2. Persona definition with tone adaptation
3. User profile context (if available)
4. Module-specific instructions
5. Chat history integration
6. Memory context (if recalled)
7. Current user input

## AI Models and Cost Management

### Model Configuration (`src/lib/constants/ai-models.ts`)

- **M1, M2, M3**: Different model tiers for various use cases
- **Token Usage Tracking**: Comprehensive monitoring of input/output tokens
- **Cost Calculation**: Real-time USD cost tracking per interaction

### Usage Pattern:

```typescript
interface ModelTokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  costUSD: number;
}
```

## Security and Privacy

### 1. Input Validation

- Maximum length limits
- Content filtering
- Malicious input detection

### 2. Response Safety

- Crisis detection and intervention
- Out-of-scope challenge identification
- Appropriate resource referrals

### 3. Data Protection

- No sensitive data in prompts
- Encrypted session storage
- User-specific encryption keys

## Chat System Architecture

### 1. Open Chat System

- **Real-time**: Live conversation interface
- **State Management**: Zustand-based chat state
- **Message Types**: Text, system actions, user options
- **Context Preservation**: Maintains conversation flow

### 2. Flow Chat System (Legacy/Alternative)

- **Structured**: Step-by-step guided conversations
- **Predefined Flows**: Onboarding and specific therapeutic journeys
- **Message Components**: Specialized message types for different interactions

## Integration Points

### 1. Database Integration

- **Session Storage**: Encrypted conversation persistence
- **User Profiles**: Personalization data for AI responses
- **Analytics**: Usage tracking and cost monitoring

### 2. Authentication Integration

- **User Context**: Profile-aware responses
- **Session Management**: User-specific conversation histories
- **Permission Handling**: Secure access to AI features

### 3. Internationalization

- **Multi-language Support**: AI responses in user's preferred language
- **Cultural Adaptation**: Locale-specific therapeutic approaches
- **Dynamic Prompt Translation**: Runtime language switching

## Performance Optimizations

### 1. Parallel Processing

- Concurrent prompt building
- Parallel service initialization
- Batch processing capabilities (commented out but available)

### 2. Caching and Memory

- Session memory optimization
- Context reuse strategies
- Efficient prompt compilation

### 3. Error Handling

- Graceful degradation
- Retry mechanisms
- Comprehensive error classification

## Development Patterns

### 1. Modular Design

- Separate concerns for analysis, response generation, and context management
- Pluggable module system for therapeutic interventions
- Version management (v1/v2) for system evolution

### 2. Type Safety

- Comprehensive TypeScript interfaces
- Zod schema validation
- Strong typing throughout the AI pipeline

### 3. Testing Readiness

- Commented batch processing functions for testing
- Validation utilities for input processing
- Error simulation capabilities

## Future Extensibility

The architecture supports:

- Additional therapeutic modules
- New AI models and providers
- Enhanced personalization features
- Advanced analytics and insights
- Multi-modal interactions (text, voice, etc.)
