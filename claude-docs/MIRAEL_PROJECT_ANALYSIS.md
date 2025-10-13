# Mirael Project - Comprehensive Analysis

Based on my in-depth analysis, here's what **Mirael** is and how it works:

## 🎯 **What Mirael Is**

**Mirael** is an **AI-powered therapeutic chat platform** specifically designed for **high-functioning women** dealing with burnout, overwhelm, and perfectionism. It provides **personalized emotional support** using **Cognitive Behavioral Therapy (CBT)** methodologies through conversational AI.

### Target Audience

- High-functioning women facing emotional burnout
- Users experiencing perfectionism and overwhelm
- People seeking emotional clarity and self-reflection
- Individuals interested in CBT-based therapeutic conversations

## 🏗️ **Core Architecture**

### **Technology Stack**

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Database**: Supabase (PostgreSQL) with Prisma ORM
- **Authentication**: Supabase Auth with role-based access
- **AI Integration**: OpenAI (GPT-4o, GPT-4o-mini) + OpenRouter (Claude 3.5 Sonnet)
- **Encryption**: WebCrypto API for client-side data protection
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS + Radix UI components
- **Deployment**: Vercel with analytics and monitoring

### **Key Database Models**

- **User**: Authentication, credits balance, configuration
- **Profile**: Demographics and therapeutic preferences
- **Session**: Encrypted therapeutic conversations
- **CreditTransaction**: AI usage monetization tracking
- **AuditLog**: Comprehensive system logging
- **Tester**: Early access user management

## 🧠 **How Mirael Works**

### **1. Therapeutic AI Engine (Mirael Core)**

- **7 CBT Modules** for different therapeutic interventions:
  - **COGNITIVE**: Pattern recognition and cognitive distortion identification
  - **BEHAVIORAL_ACTIVATION**: Depression and low energy intervention
  - **MINDFULNESS**: Rumination and emotional regulation
  - **VALUES_CLARIFICATION**: Personal agency and meaning-making
  - **CORE_BELIEFS**: Deep belief exploration using downward arrow technique
  - **REFRAMING**: Alternative perspective development
  - **SHOULDS**: Rigid internal rules identification and softening

### **2. Conversation Flow**

1. **User Input Analysis**: AI analyzes emotional state and psychological patterns
2. **CBT Module Selection**: System selects appropriate therapeutic intervention
3. **Contextual Response**: Generates empathetic, CBT-informed responses
4. **Session Memory**: Maintains therapeutic context across conversations
5. **Progress Tracking**: Monitors user patterns and therapeutic progress

### **3. Security & Privacy**

- **Client-side Encryption**: All therapeutic data encrypted using WebCrypto API
- **PBKDF2 Key Derivation**: 600k iterations for password-based encryption
- **AES-GCM Encryption**: 256-bit encryption for session data
- **User Consent**: Granular control over cloud storage preferences
- **Zero-Knowledge Architecture**: Server cannot read encrypted therapeutic content

### **4. Credits-Based Monetization**

- **Transparent Pricing**: 1 credit = $0.01 USD
- **AI Model Pricing**:
  - GPT-4o-mini (M1): 2 base credits + token-based costs
  - GPT-4o (M2): 10 base credits + token-based costs
  - Claude 3.5 Sonnet (M3): 8 base credits + token-based costs
- **Real-time Cost Estimation**: Users see costs before sending messages
- **Transaction History**: Complete audit trail of credit usage

### **5. Session Management**

- **Encrypted Storage**: Sessions stored with client-side encryption
- **Smart Sync**: Local storage with optional cloud backup
- **Session Analysis**: AI-powered summaries and insights
- **Title Auto-generation**: Automatic session naming based on content
- **Export Capabilities**: Multiple format export options

### **6. Multi-language Support**

- **Supported Languages**: English, Arabic (RTL), French
- **Culturally Aware**: Therapeutic approaches adapted for different cultures
- **RTL Support**: Full right-to-left text support for Arabic
- **Localized Content**: Translated UI, errors, and therapeutic content

## 🔄 **User Journey**

1. **Discovery**: Landing page showcases therapeutic approach and AI demo
2. **Early Access**: Join waitlist system for controlled rollout
3. **Onboarding**: Profile setup with therapeutic preferences
4. **First Session**: Guided introduction to Mirael's capabilities
5. **Ongoing Therapy**: Regular check-ins and therapeutic conversations
6. **Progress Tracking**: Session analysis and personal insights
7. **Export & Review**: Access to conversation history and growth patterns

## 🎯 **Unique Value Propositions**

### **For Users**

- **Specialized AI**: Trained specifically for high-functioning women's emotional needs
- **Privacy-First**: End-to-end encryption ensures therapeutic conversations remain private
- **CBT-Based**: Evidence-based therapeutic methodology
- **Cultural Sensitivity**: Multi-language support with cultural awareness
- **Flexible Access**: Pay-per-use model with transparent pricing

### **For Developers**

- **Clean Architecture**: Well-organized domain-driven design
- **Type Safety**: Full TypeScript implementation with Prisma
- **Security-First**: Comprehensive encryption and audit logging
- **Scalable**: Cloud-native architecture with monitoring
- **Maintainable**: Extensive documentation and modular design

## 📈 **Current Status**

Based on the git status and recent commits, the project is actively developing:

- **Active Branch**: `feat-0011-implement-user-credits`
- **Recent Implementation**: Credits system replacing previous points system
- **Ready Features**: Core therapeutic AI, encryption, session management
- **In Development**: Credits UI components and transaction handling

This is a sophisticated, production-ready therapeutic AI platform with strong technical foundations and a clear focus on user privacy and therapeutic effectiveness.
