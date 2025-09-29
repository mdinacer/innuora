# Onboarding Flow Documentation

## Overview

The Innuora onboarding flow is a 13-step progressive disclosure process that collects user profile data while introducing the platform's therapeutic approach. The flow is built on the session flow architecture and includes comprehensive error handling, multi-language support, and seamless integration with the user profile system.

## Flow Architecture

### Technical Foundation

**Route**: `/[locale]/onboarding`
**Component**: `src/components/sessions/onboarding-session.tsx`
**Session ID**: `ONBOARDING_SESSION`
**Flow Type**: `SessionFlowType.onboarding`

### Flow Configuration

```typescript
// src/domains/session-flow/flows/index.ts
export const ONBOARDING_SESSION_PROPS = {
  sessionId: SESSIONS_IDS.ONBOARDING_SESSION,
  autoStart: true,
  initializeStores: true,
  resetOnLanguageChange: true,
  saveProgressToProfile: true,
};
```

## Step-by-Step Flow Analysis

### Step 1: Welcome (`welcome`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Introduction to Innuora and therapeutic approach
**Content**: Welcoming message, platform overview, safety messaging
**UI**: Hero card with start session button
**Duration**: ~30 seconds reading time

**Key Features**:

- Localized welcome content
- App name integration (`APP_CONFIG.name`)
- Gentle, non-clinical tone
- Clear call-to-action

### Step 2: What to Expect (`what_to_expect`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Set expectations for onboarding process
**Content**: Process overview, time estimate, privacy assurance
**UI**: Multi-paragraph content with continue button
**Duration**: ~45 seconds reading time

**Key Features**:

- Process transparency
- Time commitment clarity
- Privacy and security messaging
- Reduce anxiety about sharing personal information

### Step 3: Display Name (`display_name`)

**Type**: `USER_INPUT`
**Advancement**: `MANUAL`
**Data Collection**: `displayName` (string, 40 char limit)

**Purpose**: Personalization identifier
**Input**: Text field with character counter
**Validation**: 1-40 characters, no special validation
**Storage**: `Profile.displayName`

**UX Considerations**:

- Optional field (can be skipped)
- No real name requirement
- Character limit prevents overflow
- Immediate validation feedback

### Step 4: Age Group (`age_group`)

**Type**: `OPTIONS`
**Mode**: `SINGLE`
**Advancement**: `MANUAL`
**Data Collection**: `ageGroup` (enum value)

**Purpose**: Demographic segmentation for age-appropriate content
**Options**:

- `TEEN` (13-17)
- `YOUNG_ADULT` (18-25)
- `ADULT` (26-45)
- `MIDDLE_AGED` (46-65)
- `SENIOR` (65+)

**Storage**: `Profile.ageGroup`
**Usage**: Content filtering, intervention customization

### Step 5: Self-Connection Introduction (`self_connection_intro`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Transition to identity exploration section
**Content**: Explanation of identity connection importance
**Duration**: ~30 seconds reading time

**Therapeutic Context**:

- Prepares user for deeper questions
- Normalizes identity exploration
- Sets therapeutic tone

### Step 6: Identity Connection (`identity_connection`)

**Type**: `OPTIONS`
**Mode**: `SINGLE`
**Advancement**: `MANUAL`
**Data Collection**: `identityConnection` (enum value)

**Purpose**: Assess user's relationship with their sense of self
**Options**:

- `VERY_CONNECTED` - Strong sense of identity
- `SOMEWHAT_CONNECTED` - Generally clear about identity
- `NEUTRAL` - Uncertain or mixed feelings
- `SOMEWHAT_DISCONNECTED` - Often confused about identity
- `VERY_DISCONNECTED` - Lost or unclear sense of self

**Storage**: `Profile.identityConnection`
**Therapeutic Use**: Core beliefs work, self-compassion modules

### Step 7: Pressure Introduction (`pressure_intro`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Transition to social pressure assessment
**Content**: Normalize social pressure experiences
**Duration**: ~30 seconds reading time

### Step 8: Social Pressure Sources (`social_pressure`)

**Type**: `OPTIONS`
**Mode**: `MULTIPLE`
**Max Selected**: 4
**Advancement**: `MANUAL`
**Data Collection**: `socialPressureSources` (array of enum values)

**Purpose**: Identify primary sources of external pressure
**Options**:

- `FAMILY` - Family expectations
- `PEERS` - Peer pressure and comparison
- `WORK` - Professional pressure
- `SOCIAL_MEDIA` - Online comparison and validation
- `SOCIETY` - Cultural and societal expectations
- `ACADEMIC` - Educational pressure
- `FINANCIAL` - Economic pressure
- `APPEARANCE` - Physical appearance pressure

**Storage**: `Profile.socialPressureSources`
**Max Selection**: Prevents overwhelming data, forces prioritization
**Therapeutic Use**: Cognitive restructuring, boundary setting

### Step 9: Emotional Weight Introduction (`emotional_weight_intro`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Transition to emotional concerns assessment
**Content**: Validate emotional struggles, encourage honesty
**Duration**: ~30 seconds reading time

### Step 10: Emotional Concerns (`emotional_concerns`)

**Type**: `OPTIONS`
**Mode**: `MULTIPLE`
**Max Selected**: 4
**Advancement**: `MANUAL`
**Data Collection**: `emotionalConcerns` (array of enum values)

**Purpose**: Identify primary emotional challenges
**Options**:

- `ANXIETY` - General anxiety and worry
- `DEPRESSION` - Low mood and depression
- `STRESS` - Overwhelming stress
- `ANGER` - Anger management issues
- `LONELINESS` - Social isolation and loneliness
- `SELF_DOUBT` - Low self-esteem and confidence
- `OVERWHELM` - Feeling overwhelmed by life
- `GRIEF` - Loss and grieving
- `TRAUMA` - Past traumatic experiences

**Storage**: `Profile.emotionalConcerns`
**Therapeutic Use**: Module selection, crisis detection, content recommendations

### Step 11: Coping Introduction (`coping_intro`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Transition to coping mechanism assessment
**Content**: Normalize coping strategies, encourage honesty
**Duration**: ~30 seconds reading time

### Step 12: Coping Mechanism (`coping_mechanism`)

**Type**: `OPTIONS`
**Mode**: `SINGLE`
**Advancement**: `MANUAL`
**Data Collection**: `copingMechanism` (enum value)

**Purpose**: Understand current primary coping strategy
**Options**:

- `PROBLEM_SOLVING` - Direct action and problem-solving
- `EMOTIONAL_SUPPORT` - Seeking emotional support from others
- `AVOIDANCE` - Avoiding or withdrawing from stressors
- `DISTRACTION` - Using activities to distract from problems
- `SUBSTANCE_USE` - Using substances to cope
- `PHYSICAL_ACTIVITY` - Exercise and physical activity
- `CREATIVE_EXPRESSION` - Art, music, writing for expression
- `SPIRITUAL_PRACTICE` - Religious or spiritual practices

**Storage**: `Profile.copingMechanism`
**Therapeutic Use**: Building on strengths, addressing maladaptive coping

### Step 13: Aspiration Introduction (`aspiration_intro`)

**Type**: `PARAGRAPHS`
**Advancement**: `MANUAL`

**Purpose**: Transition to goals and aspirations
**Content**: Focus on positive future-oriented thinking
**Duration**: ~30 seconds reading time

### Step 14: Emotional Aspirations (`emotional_aspirations`)

**Type**: `OPTIONS`
**Mode**: `MULTIPLE`
**Max Selected**: 3
**Advancement**: `MANUAL`
**Data Collection**: `emotionalAspirations` (array of enum values)

**Purpose**: Identify therapeutic goals and desired emotional outcomes
**Options**:

- `INNER_PEACE` - Finding calm and inner peace
- `CONFIDENCE` - Building self-confidence
- `EMOTIONAL_STABILITY` - Managing emotions effectively
- `MEANINGFUL_RELATIONSHIPS` - Developing deeper connections
- `PURPOSE` - Finding life purpose and meaning
- `RESILIENCE` - Building emotional resilience
- `SELF_ACCEPTANCE` - Accepting and loving yourself
- `HAPPINESS` - Experiencing more joy and happiness

**Storage**: `Profile.emotionalAspirations`
**Max Selection**: Forces prioritization, manageable goal setting
**Therapeutic Use**: Goal setting, motivation, progress tracking

### Step 15: Confirmation (`confirm_inputs`)

**Type**: `ACTION`
**Advancement**: `MANUAL`

**Purpose**: Review and confirm collected information
**Primary Action**: "This looks right" → Continue to reflection
**Secondary Action**: "Let me review" → Reset to `display_name` step

**Features**:

- Summary of all collected data
- Edit capability
- Final consent for data usage

### Step 16: Data Sync (`sync_before_reflection`)

**Type**: `SYSTEM`
**Advancement**: `MANUAL`
**Auto Advance Delay**: 800ms

**Purpose**: Save profile data before session completion
**System Actions**:

- `callback: "onSyncData"` - Triggers profile save
- Updates user onboarding status
- Prepares for session transition

### Step 17: Flow End (`end`)

**Type**: `FLOW_END`

**Purpose**: Complete onboarding and transition to main app
**Actions**:

- **Primary**: "Enter Innuora" → Navigate to `/sessions`
- **Secondary**: None (single action flow)

**Final Operations**:

- Mark user as `isOnboarded: true`
- Clear onboarding flow state
- Redirect to main application

## Data Flow & Storage

### Profile Data Mapping

```typescript
// Onboarding input values → Profile schema mapping
const profileMapping = {
  displayName: inputValues.displayName, // string
  ageGroup: inputValues.ageGroup, // AgeGroup enum
  identityConnection: inputValues.identityConnection, // IdentityConnectionLevel enum
  socialPressureSources: inputValues.socialPressureSources, // SocialPressureSource[]
  emotionalConcerns: inputValues.emotionalConcerns, // EmotionalConcern[]
  copingMechanism: inputValues.copingMechanism, // CopingMechanism enum
  emotionalAspirations: inputValues.emotionalAspirations, // EmotionalAspirations[]
};
```

### State Management

**Flow State**: Managed by `SessionFlowStore`

```typescript
{
  sessionId: "onboarding_session",
  currentStepId: string,
  inputValues: Record<string, any>,
  hasStarted: boolean,
  hasEnded: boolean,
  lastUpdated: Date
}
```

**Profile State**: Managed by `UserDataStore`

```typescript
{
  profile: Profile | null,
  isOnboarded: boolean,
  lastUpdated: Date
}
```

## Error Handling & Recovery

### Validation Errors

- **Input Validation**: Character limits, required fields
- **Selection Validation**: Max selection limits, valid enum values
- **Data Type Validation**: Runtime Zod schema validation

### Recovery Mechanisms

- **Step Navigation**: Back/forward navigation with state preservation
- **Flow Reset**: Complete restart option with confirmation
- **Partial Save**: Automatic state persistence between steps
- **Error Boundaries**: Graceful error handling with user messaging

### Network Issues

- **Offline Support**: Local state management continues during disconnection
- **Sync Recovery**: Automatic retry on connection restoration
- **Conflict Resolution**: Last-write-wins for profile data conflicts

## Localization & Accessibility

### Multi-Language Support

- **Translation Keys**: `locales/[locale]/sessions.json`
- **Dynamic Loading**: Server-side translation loading
- **RTL Support**: Arabic language full RTL implementation
- **Language Switch**: Real-time language switching with flow reset

### Accessibility Features

- **Screen Reader**: Full ARIA labels and descriptions
- **Keyboard Navigation**: Complete keyboard accessibility
- **Focus Management**: Logical focus progression
- **Color Contrast**: WCAG AA compliance
- **Font Scaling**: Responsive text sizing

## Performance Optimizations

### Loading Strategy

- **Dynamic Imports**: Lazy loading of onboarding components
- **Suspense Boundaries**: Progressive loading states
- **Prefetching**: Next step content prefetching

### State Optimization

- **Debounced Updates**: Prevents excessive state updates
- **Memoization**: React.memo and useCallback optimization
- **Selective Rendering**: Only re-render changed components

### Bundle Optimization

- **Code Splitting**: Session flow code split from main bundle
- **Tree Shaking**: Unused enum values and options removed
- **Compression**: Gzip compression for translation files

## Integration Points

### Session System Integration

- **Session Creation**: Automatic session creation for onboarding
- **Flow Orchestrator**: Uses `useSessionFlowOrchestrator` hook
- **Message System**: Integrates with chat message infrastructure

### User Profile Integration

- **Profile Creation**: Creates user profile on completion
- **Onboarding Status**: Updates `User.isOnboarded` flag
- **Data Validation**: Server-side profile validation

### Analytics Integration

- **Step Completion**: Track completion rates per step
- **Drop-off Analysis**: Identify abandonment points
- **Time Tracking**: Average time per step and total flow
- **Error Tracking**: Log validation errors and user struggles

## Security Considerations

### Data Protection

- **Input Sanitization**: XSS prevention on all user inputs
- **Validation**: Server-side validation for all collected data
- **Encryption**: Sensitive data encrypted before storage
- **Privacy**: GDPR-compliant data collection with consent

### Session Security

- **CSRF Protection**: Token-based request validation
- **Rate Limiting**: Prevent automated onboarding abuse
- **Input Limits**: Character and selection limits prevent abuse
- **Session Expiry**: Automatic cleanup of stale onboarding sessions

## Testing Strategy

### Unit Tests

- Flow step validation and transitions
- Input validation and sanitization
- Error handling and recovery
- State management operations

### Integration Tests

- Complete onboarding flow execution
- Profile data persistence and retrieval
- Multi-language flow functionality
- Error recovery scenarios

### User Experience Tests

- Accessibility compliance testing
- Mobile device compatibility
- Performance benchmarking
- User journey completion rates

## Monitoring & Analytics

### Flow Metrics

- **Completion Rate**: Percentage of users completing onboarding
- **Drop-off Points**: Most common abandonment steps
- **Time Analysis**: Average and median completion times
- **Error Rates**: Validation errors and technical issues

### User Behavior

- **Step Duration**: Time spent on each step
- **Edit Patterns**: How often users modify previous answers
- **Language Preferences**: Most common language selections
- **Device Usage**: Mobile vs desktop completion rates

### Technical Metrics

- **Performance**: Load times and response times
- **Error Tracking**: JavaScript errors and API failures
- **Resource Usage**: Memory and CPU impact
- **Network Efficiency**: Data transfer optimization

This comprehensive onboarding flow provides a smooth, therapeutic, and technically robust introduction to the Innuora platform while collecting essential user profile data for personalized therapeutic experiences.
