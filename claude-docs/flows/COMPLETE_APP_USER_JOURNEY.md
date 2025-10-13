# Complete App User Journey Documentation

## Overview

This document maps the complete user journey through Innuora from initial app access to advanced therapeutic features, including all major flows, decision points, and integration touchpoints. It provides a comprehensive view of how users navigate and experience the platform.

## User Journey Stages

### Stage 1: Initial Access & Authentication

#### 1.1 App Entry Points

**Web Access** (`/[locale]`):

- Landing page with therapeutic messaging
- Clear call-to-action for getting started
- Language selection (EN/AR/FR)
- Accessibility options

**Direct Authentication** (`/[locale]/auth`):

- Sign up with email/password
- Sign in for returning users
- Password recovery flow
- OAuth integrations (if enabled)

**Authentication Flow**:

```
User visits app
├── New User
│   ├── Sign Up (/auth/signup)
│   ├── Email verification
│   ├── Account activation
│   └── → Onboarding Flow
└── Returning User
    ├── Sign In (/auth/signin)
    ├── Session validation
    └── → Sessions Dashboard
```

#### 1.2 Post-Authentication Routing

```typescript
// Authentication success routing logic
const determineInitialRoute = (user: User) => {
  if (!user.isOnboarded) {
    return "/onboarding";
  }

  if (user.role === "admin") {
    return "/admin/dashboard";
  }

  if (user.creditsBalance <= 0) {
    return "/credits/purchase";
  }

  return "/sessions";
};
```

### Stage 2: Onboarding & Profile Creation

#### 2.1 Onboarding Flow Journey

**Route**: `/[locale]/onboarding`
**Duration**: 3-5 minutes
**Components**: 13 progressive steps

```
Onboarding Journey:
1. Welcome → Platform introduction
2. What to Expect → Process overview
3. Display Name → Personalization
4. Age Group → Demographic data
5. Self-Connection Intro → Section transition
6. Identity Connection → Self-awareness assessment
7. Pressure Intro → Context setting
8. Social Pressure Sources → External pressure identification
9. Emotional Weight Intro → Emotional exploration
10. Emotional Concerns → Current challenges
11. Coping Intro → Coping strategies
12. Coping Mechanisms → Current coping methods
13. Aspiration Intro → Goals setting
14. Emotional Aspirations → Desired outcomes
15. Confirmation → Review & confirm
16. Data Sync → Profile creation
17. Flow End → App entry
```

**Decision Points**:

- **Step 15 (Confirmation)**:
  - Primary: "This looks right" → Complete onboarding
  - Secondary: "Let me review" → Return to Step 3

**Data Collection**:

```typescript
interface OnboardingData {
  displayName: string; // Step 3
  ageGroup: AgeGroup; // Step 4
  identityConnection: IdentityConnectionLevel; // Step 6
  socialPressureSources: SocialPressureSource[]; // Step 8 (max 4)
  emotionalConcerns: EmotionalConcern[]; // Step 10 (max 4)
  copingMechanism: CopingMechanism; // Step 12
  emotionalAspirations: EmotionalAspirations[]; // Step 14 (max 3)
}
```

**Completion Actions**:

- Create user profile
- Set `user.isOnboarded = true`
- Redirect to `/sessions`

### Stage 3: Main Application Navigation

#### 3.1 Sessions Dashboard

**Route**: `/[locale]/(protected)/sessions`
**Purpose**: Central hub for all therapeutic sessions

**Dashboard Components**:

```
Sessions Dashboard:
├── Header (Credits, Settings, Language)
├── Session Creation
│   ├── New Open Chat Session
│   ├── Guided Therapeutic Session
│   └── Crisis Support Access
├── Active Sessions
│   ├── Recent Sessions List
│   ├── Session Preview Cards
│   └── Continue Session Actions
├── Session History
│   ├── Completed Sessions
│   ├── Session Analytics
│   └── Export Options
└── Recommendations
    ├── Suggested Content
    ├── Therapeutic Insights
    └── Progress Tracking
```

**Navigation Options**:

- **New Session**: Create new open chat → Session Flow
- **Continue Session**: Resume existing → Open Chat Flow
- **Session Details**: View analysis → Session Details Flow
- **Settings**: User preferences → Settings Flow
- **Content Library**: Educational content → Content Library Flow

#### 3.2 Session Creation Flow

```
Session Creation Decision Tree:
User clicks "New Session"
├── Open Chat Session
│   ├── Model Selection (M1/M2/M3)
│   ├── Session Title (auto/manual)
│   ├── Cloud Sync Preference
│   └── → Open Chat Interface
├── Guided Session
│   ├── Session Type Selection
│   ├── Difficulty Level
│   ├── Duration Preference
│   └── → Structured Session Flow
└── Crisis Support
    ├── Crisis Assessment
    ├── Immediate Resources
    ├── Emergency Contacts
    └── → Crisis Intervention Flow
```

### Stage 4: Open Chat Therapeutic Conversations

#### 4.1 Open Chat Session Flow

**Route**: `/[locale]/(protected)/sessions/[sessionId]`
**Purpose**: Free-form therapeutic AI conversations

**Chat Interface Journey**:

```
Open Chat Experience:
1. Session Initialization
   ├── Encryption key derivation
   ├── Session state hydration
   ├── Memory loading
   └── AI model activation

2. Pre-Session Setup
   ├── Mood check-in (optional)
   ├── Session goals (optional)
   ├── Trigger warnings review
   └── Chat interface ready

3. Conversation Flow
   ├── User message input
   ├── Real-time processing
   ├── AI response generation
   ├── Therapeutic analysis
   ├── Memory enhancement
   └── Session wellness monitoring

4. Background Processes
   ├── Local sync (1s debounce)
   ├── Cloud sync (10min debounce)
   ├── Token usage tracking
   ├── Credits deduction
   └── Analytics collection

5. Session Conclusion
   ├── Post-session mood check
   ├── Session summary generation
   ├── Insights presentation
   ├── Next session recommendations
   └── Data encryption & storage
```

**Real-Time Features**:

- **Typing Indicators**: AI processing states
- **Message Status**: Sent, processing, delivered
- **Token Counter**: Real-time cost tracking
- **Memory Updates**: Background memory enhancement
- **Analysis Snapshots**: Continuous therapeutic analysis

#### 4.2 Session Wellness Monitoring

```
Wellness Monitoring System:
├── Frequency Management (87% token savings)
│   ├── Smart check intervals
│   ├── Crisis indicator detection
│   └── Pattern-based triggers
├── Session Assessment
│   ├── Conversation depth analysis
│   ├── Therapeutic progress evaluation
│   └── Conclusion recommendations
└── Gentle Guidance
    ├── Natural conclusion suggestions
    ├── Session break recommendations
    └── Follow-up scheduling
```

### Stage 5: Session Analysis & Insights

#### 5.1 Session Details Flow

**Route**: `/[locale]/(protected)/sessions/[sessionId]/details`
**Purpose**: Comprehensive session analysis and insights

**Session Details Components**:

```
Session Details Interface:
├── Session Overview
│   ├── Title & Subtitle
│   ├── Duration & Message Count
│   ├── Token Usage & Credits
│   └── Last Activity
├── Conversation Summary
│   ├── Key Topics Discussed
│   ├── Emotional Journey
│   ├── Therapeutic Progress
│   └── AI-Generated Summary
├── Therapeutic Analysis
│   ├── Real-time Analysis Snapshots
│   ├── Aggregated Session Analysis
│   ├── CBT Module Utilization
│   └── Progress Indicators
├── Session Diagnostics
│   ├── Core Beliefs Identified
│   ├── Cognitive Distortions
│   ├── Behavioral Patterns
│   ├── Therapeutic Opportunities
│   └── Hidden Leverage Points
├── Session Actions
│   ├── Continue Conversation
│   ├── Generate Diagnostics
│   ├── Export Session Data
│   ├── Share with Healthcare Provider
│   └── Archive/Delete Session
└── Related Content
    ├── Recommended Articles
    ├── Relevant Exercises
    ├── Follow-up Activities
    └── Educational Resources
```

#### 5.2 Session Diagnostics Generation

**Trigger Points**:

- User manual request
- Session completion (10+ messages)
- Weekly automatic generation
- Before healthcare provider meetings

**Generation Flow**:

```
Diagnostics Generation Process:
1. Data Preparation
   ├── Session summary creation
   ├── Memory store compilation
   ├── Analysis aggregation
   └── Context preparation

2. AI Analysis
   ├── Session summary generation
   ├── Advanced diagnostic analysis
   ├── Pattern recognition
   └── Therapeutic recommendations

3. Validation & Formatting
   ├── JSON parsing & validation
   ├── Confidence assessment
   ├── Quality assurance
   └── User-friendly formatting

4. Presentation
   ├── Insights dashboard
   ├── Downloadable reports
   ├── Shareable summaries
   └── Progress tracking updates
```

### Stage 6: Content & Learning Resources

#### 6.1 Content Library Flow

**Route**: `/[locale]/content`
**Purpose**: Educational therapeutic content and self-help resources

**Content Navigation**:

```
Content Library Experience:
├── Content Overview
│   ├── Featured Articles
│   ├── Category Navigation
│   ├── Search Functionality
│   └── Personalized Recommendations
├── Category Pages
│   ├── Category-specific Content
│   ├── Difficulty Levels
│   ├── Reading Time Estimates
│   └── Related Content Links
├── Article Reading
│   ├── SEO-optimized Content
│   ├── Progress Tracking
│   ├── Interactive Elements
│   ├── Related Discussions
│   └── Follow-up Exercises
└── Learning Progress
    ├── Reading History
    ├── Completed Exercises
    ├── Knowledge Assessment
    └── Skill Building Tracks
```

**Content Categories**:

- Cognitive Behavioral Therapy
- Anxiety Management
- Depression Support
- Stress Management
- Relationship Patterns
- Self-Compassion
- Mindfulness Techniques
- Mood Tracking

#### 6.2 Personalized Content Recommendations

```
Recommendation Engine:
├── Context Analysis
│   ├── Recent session themes
│   ├── Identified challenges
│   ├── CBT modules used
│   └── User goals
├── Content Matching
│   ├── Relevance scoring
│   ├── Difficulty assessment
│   ├── Reading level matching
│   └── Interest alignment
├── Presentation
│   ├── Recommended articles
│   ├── Guided exercises
│   ├── Video content
│   └── Interactive tools
└── Tracking
    ├── Engagement metrics
    ├── Effectiveness scores
    ├── Completion rates
    └── User feedback
```

### Stage 7: Account Management & Settings

#### 7.1 Settings & Preferences Flow

**Route**: `/[locale]/(protected)/settings`
**Purpose**: User account, privacy, and application preferences

**Settings Categories**:

```
Settings Organization:
├── Account Settings
│   ├── Profile Information
│   ├── Display Name & Avatar
│   ├── Contact Information
│   └── Account Deletion
├── Privacy & Security
│   ├── Encryption Settings
│   ├── Data Sync Preferences
│   ├── Cloud Storage Options
│   ├── Data Export/Import
│   └── Account Backup
├── Therapeutic Preferences
│   ├── AI Model Selection
│   ├── Session Reminders
│   ├── Crisis Support Settings
│   ├── Therapeutic Goals
│   └── Progress Sharing
├── App Preferences
│   ├── Language Selection
│   ├── Appearance (Dark/Light mode)
│   ├── Notification Settings
│   ├── Accessibility Options
│   └── Performance Settings
└── Billing & Credits
    ├── Current Balance
    ├── Usage History
    ├── Purchase Credits
    ├── Billing Information
    └── Subscription Management
```

#### 7.2 Privacy & Data Control

```
Privacy Management:
├── Encryption Controls
│   ├── Master Password Setup
│   ├── Encryption Key Management
│   ├── Local vs Cloud Storage
│   └── Backup Key Recovery
├── Data Sharing
│   ├── Healthcare Provider Sharing
│   ├── Research Participation
│   ├── Anonymized Analytics
│   └── Third-party Integrations
├── Data Export
│   ├── Complete Data Download
│   ├── Selective Export Options
│   ├── Format Selection (JSON/PDF)
│   └── Encrypted Backups
└── Account Deletion
    ├── Data Deletion Scope
    ├── Retention Policies
    ├── Confirmation Process
    └── Recovery Options
```

### Stage 8: Credits & Billing Management

#### 8.1 Credits System Flow

**Route**: `/[locale]/(protected)/credits`
**Purpose**: Credit balance management and purchasing

**Credits Experience**:

```
Credits Management:
├── Balance Overview
│   ├── Current Credits
│   ├── Recent Usage
│   ├── Usage Patterns
│   └── Estimated Duration
├── Usage Analytics
│   ├── Credits per Session
│   ├── Model Usage Distribution
│   ├── Cost Optimization Tips
│   └── Historical Trends
├── Purchase Options
│   ├── Credit Packages
│   ├── Payment Methods
│   ├── Secure Checkout
│   └── Transaction History
└── Smart Recommendations
    ├── Optimal Package Size
    ├── Usage-based Suggestions
    ├── Cost-saving Tips
    └── Model Recommendations
```

**Credit Packages**:

- **Starter**: 1000 credits for $5 (Trial users)
- **Regular**: 2200 credits for $10 (Most popular)
- **Premium**: 6000 credits for $25 (Power users)

#### 8.2 Billing Integration

```
Payment Processing:
├── Stripe Integration
│   ├── Secure payment processing
│   ├── Card management
│   ├── Subscription handling
│   └── Webhook processing
├── Transaction Management
│   ├── Real-time credit addition
│   ├── Transaction logging
│   ├── Receipt generation
│   └── Refund processing
└── Usage Tracking
    ├── Token-based billing
    ├── Model-specific pricing
    ├── Real-time deduction
    └── Detailed usage logs
```

### Stage 9: Advanced Features & Integrations

#### 9.1 Healthcare Provider Integration

**Purpose**: Professional care coordination and data sharing

**Integration Features**:

```
Healthcare Integration:
├── Provider Dashboard Access
│   ├── Secure login portal
│   ├── Patient progress overview
│   ├── Session summaries
│   └── Diagnostic reports
├── Data Sharing Controls
│   ├── Granular permissions
│   ├── Time-limited access
│   ├── Specific data selection
│   └── Audit trails
├── Clinical Reports
│   ├── Professional summaries
│   ├── Progress tracking
│   ├── Therapeutic insights
│   └── Downloadable PDFs
└── Communication Tools
    ├── Secure messaging
    ├── Session scheduling
    ├── Treatment coordination
    └── Emergency notifications
```

#### 9.2 Crisis Intervention System

**Route**: `/[locale]/(protected)/crisis`
**Purpose**: Immediate support and safety resources

**Crisis Support Flow**:

```
Crisis Intervention Journey:
├── Crisis Detection
│   ├── AI-powered assessment
│   ├── User self-reporting
│   ├── Session analysis alerts
│   └── Manual trigger options
├── Immediate Support
│   ├── Crisis chat interface
│   ├── Breathing exercises
│   ├── Grounding techniques
│   └── Safety planning
├── Resource Connection
│   ├── Emergency contacts
│   ├── Local crisis lines
│   ├── Mental health services
│   └── Emergency services
├── Follow-up Care
│   ├── Safety check-ins
│   ├── Scheduled follow-ups
│   ├── Provider notifications
│   └── Recovery planning
└── Documentation
    ├── Crisis incident logging
    ├── Intervention tracking
    ├── Outcome monitoring
    └── Provider reporting
```

### Stage 10: User Journey Decision Points

#### 10.1 Major Decision Trees

**Session Type Selection**:

```
User wants to start therapy session
├── Feeling overwhelmed/crisis
│   └── → Crisis Intervention Flow
├── Specific issue to work on
│   ├── → Guided Session Flow
│   └── → Content Library (educational)
├── General therapeutic conversation
│   └── → Open Chat Flow
└── Continue previous work
    └── → Resume Session Flow
```

**Model Selection Guidance**:

```
User choosing AI model
├── Budget-conscious
│   └── → M1 (GPT-4.1 Mini) - 2 credits/message
├── Balanced approach
│   └── → M3 (GPT-3.5 Turbo) - 1 credit/message
├── Premium experience
│   └── → M2 (GPT-4O) - 10 credits/message
└── Uncertain
    └── → M1 with upgrade prompts
```

**Privacy Preference Routing**:

```
User configuring privacy
├── Maximum Privacy
│   ├── Local-only storage
│   ├── No cloud sync
│   └── Enhanced encryption
├── Balanced Approach
│   ├── Encrypted cloud sync
│   ├── Selective sharing
│   └── Standard encryption
├── Convenience-focused
│   ├── Full cloud sync
│   ├── Automated backups
│   └── Provider sharing enabled
└── Healthcare Integration
    ├── Professional sharing
    ├── Clinical reports
    └── Care coordination
```

#### 10.2 Exit Points & Re-engagement

**Natural Exit Points**:

- Session completion with insights
- Goal achievement milestones
- Crisis resolution
- Content consumption completion
- Account setup completion

**Re-engagement Strategies**:

```
User Re-engagement:
├── Email Reminders
│   ├── Gentle check-ins
│   ├── New content notifications
│   ├── Progress summaries
│   └── Achievement celebrations
├── In-App Nudges
│   ├── Session continuation prompts
│   ├── Goal progress updates
│   ├── Content recommendations
│   └── Feature discovery
├── Therapeutic Value
│   ├── Progress tracking
│   ├── Insight delivery
│   ├── Skill building
│   └── Community connection
└── Crisis Support
    ├── Always-available access
    ├── Immediate intervention
    ├── Safety net messaging
    └── Professional referrals
```

### Stage 11: Analytics & Monitoring Throughout Journey

#### 11.1 User Journey Analytics

**Key Metrics Tracked**:

```
Journey Analytics:
├── Acquisition Metrics
│   ├── Traffic sources
│   ├── Conversion rates
│   ├── Drop-off points
│   └── Time to onboarding
├── Engagement Metrics
│   ├── Session frequency
│   ├── Session duration
│   ├── Message counts
│   └── Feature utilization
├── Therapeutic Metrics
│   ├── Progress indicators
│   ├── Goal achievement
│   ├── Crisis interventions
│   └── Outcome measures
├── Business Metrics
│   ├── Credit consumption
│   ├── Revenue per user
│   ├── Retention rates
│   └── Lifetime value
└── Technical Metrics
    ├── Performance monitoring
    ├── Error tracking
    ├── Load times
    └── Success rates
```

#### 11.2 Continuous Improvement

**Optimization Feedback Loops**:

```
Improvement Cycles:
├── User Feedback
│   ├── In-app surveys
│   ├── Session ratings
│   ├── Feature requests
│   └── Support interactions
├── Data Analysis
│   ├── Behavior patterns
│   ├── Conversion funnels
│   ├── Drop-off analysis
│   └── Performance metrics
├── A/B Testing
│   ├── Onboarding variants
│   ├── UI/UX experiments
│   ├── Content strategies
│   └── Pricing models
└── Iterative Enhancement
    ├── Feature improvements
    ├── Flow optimizations
    ├── Content updates
    └── Performance upgrades
```

## Summary: Complete User Journey Value Proposition

### 1. **Seamless Entry** (Stage 1-2)

- Frictionless authentication
- Therapeutic onboarding experience
- Immediate value delivery
- Privacy-first approach

### 2. **Personalized Therapy** (Stage 3-4)

- AI-powered conversations
- Real-time therapeutic analysis
- Adaptive intervention strategies
- Crisis support integration

### 3. **Deep Insights** (Stage 5)

- Professional-grade diagnostics
- Actionable therapeutic recommendations
- Progress tracking
- Data-driven insights

### 4. **Continuous Learning** (Stage 6)

- Educational content library
- Skill-building exercises
- Personalized recommendations
- Evidence-based resources

### 5. **User Empowerment** (Stage 7-8)

- Complete privacy control
- Transparent billing
- Data ownership
- Flexible options

### 6. **Professional Integration** (Stage 9)

- Healthcare provider coordination
- Clinical reporting
- Care continuity
- Emergency support

### 7. **Sustainable Engagement** (Stage 10-11)

- Value-driven retention
- Continuous improvement
- Outcome measurement
- Long-term therapeutic relationships

This comprehensive user journey ensures that Innuora delivers exceptional therapeutic value while maintaining the highest standards of privacy, security, and clinical effectiveness throughout the entire user experience.
