# Mirael Agent Activation Protocol

## Overview

This protocol defines how to activate and coordinate the specialized Mirael agents for MVP completion and product launch. Each agent has specific responsibilities and collaboration requirements to ensure efficient project execution.

## Agent Directory

### 1. Assistant Developer Agent

**Location**: `mirael-agents/assistant-developer/`  
**Role**: Technical implementation and development support  
**Activation Trigger**: Technical tasks, code implementation, debugging, deployment  
**Priority Level**: Critical (MVP completion dependent)

### 2. AI/Prompt Engineering Specialist Agent

**Location**: `mirael-agents/ai-prompt-engineer/`  
**Role**: AI model integration and prompt optimization  
**Activation Trigger**: AI system optimization, prompt engineering, cost management  
**Priority Level**: Critical (Core functionality dependent)

### 3. Professional CBT Therapist Agent

**Location**: `mirael-agents/cbt-therapist/`  
**Role**: Therapeutic content validation and methodology guidance  
**Activation Trigger**: Content validation, safety protocols, therapeutic accuracy  
**Priority Level**: Critical (Safety and efficacy dependent)

### 7. Hybrid CBT-AI Prompt Engineering Agent

**Location**: `mirael-agents/cbt-ai-hybrid-agent/`  
**Role**: Combined therapeutic accuracy and AI optimization specialist  
**Activation Trigger**: Prompt optimization, CBT-AI integration, dual-domain validation  
**Priority Level**: Critical (Therapeutic accuracy + AI performance dependent)

### 4. Product Marketing Strategist Agent

**Location**: `mirael-agents/marketing-strategist/`  
**Role**: Go-to-market strategy and user acquisition  
**Activation Trigger**: Marketing campaigns, positioning, user acquisition strategy  
**Priority Level**: High (Launch success dependent)

### 5. UX/UI Optimization Agent

**Location**: `mirael-agents/ux-ui-optimizer/`  
**Role**: User experience refinement and interface design  
**Activation Trigger**: Interface improvements, user testing, accessibility  
**Priority Level**: High (User adoption dependent)

### 6. Business Strategy & Operations Agent

**Location**: `mirael-agents/business-strategy/`  
**Role**: Business model optimization and operational planning  
**Activation Trigger**: Business decisions, compliance, scaling strategy  
**Priority Level**: Medium (Long-term success dependent)

## Activation Sequence for MVP Completion

### Phase 1: Foundation and Safety (Weeks 1-2)

**Priority Order**: Hybrid CBT-AI → Assistant Developer → CBT Therapist

```
Step 1: Hybrid CBT-AI Agent Activation
- Analyze all existing prompts for therapeutic accuracy and AI efficiency
- Optimize cognitive distortion detection with David Burns precision
- Implement advanced crisis detection with reduced false positives
- Create optimized prompt templates for all modules

Step 2: Assistant Developer Agent Activation
- Implement optimized prompts from Hybrid CBT-AI agent
- Complete session encryption/decryption implementation
- Add comprehensive error handling and loading states
- Optimize AI response pipeline for cost and speed

Step 3: CBT Therapist Agent Activation (Validation)
- Validate Hybrid CBT-AI optimizations for therapeutic appropriateness
- Review crisis detection protocols and safety measures
- Approve therapeutic conversation flows
- Provide clinical oversight for complex cases
```

### Phase 2: User Experience and Interface (Weeks 3-4)

**Priority Order**: UX/UI Optimizer → Assistant Developer → CBT Therapist

```
Step 1: UX/UI Optimizer Agent Activation
- Design crisis support interfaces and flows
- Create onboarding experience for new users
- Implement progress tracking and insights visualization
- Optimize mobile experience and accessibility

Step 2: Assistant Developer Agent (Continued)
- Implement UX designs with proper component architecture
- Add accessibility features and responsive design
- Create smooth animations and loading states
- Optimize performance for mobile devices

Step 3: CBT Therapist Agent (Validation)
- Validate therapeutic appropriateness of new interfaces
- Ensure crisis flows meet professional standards
- Review user journey for therapeutic effectiveness
- Approve safety protocols and boundary setting
```

### Phase 3: Market Preparation (Weeks 5-6)

**Priority Order**: Marketing Strategist → Business Strategy → All Agents (Review)

```
Step 1: Marketing Strategist Agent Activation
- Finalize go-to-market strategy and positioning
- Create launch content and marketing materials
- Set up analytics and conversion tracking
- Plan user acquisition campaigns

Step 2: Business Strategy Agent Activation
- Review legal compliance and privacy policies
- Finalize pricing strategy and billing implementation
- Set up business operations and customer support
- Plan scaling infrastructure and team expansion

Step 3: All Agents Final Review
- Each agent reviews their domain for launch readiness
- Cross-functional validation of integrated systems
- Final safety and quality assurance checks
- Launch preparation and post-launch monitoring plans
```

## Agent Collaboration Matrix

### High-Frequency Collaborations

```
Hybrid CBT-AI ↔ Assistant Developer:
- Daily collaboration on prompt implementation and testing
- Real-time optimization feedback and performance monitoring
- Integration of therapeutic accuracy with technical implementation

CBT Therapist ↔ Hybrid CBT-AI:
- Daily validation of therapeutic accuracy in optimizations
- Clinical oversight for complex therapeutic scenarios
- Safety protocol refinement and professional standards maintenance

Assistant Developer ↔ UX/UI Optimizer:
- Daily collaboration on implementation feasibility
- Component architecture and design system alignment
- Performance optimization and accessibility implementation

Marketing Strategist ↔ Business Strategy:
- Weekly alignment on business model and positioning
- User acquisition cost and lifetime value optimization
- Market expansion and partnership strategy coordination
```

### Medium-Frequency Collaborations

```
CBT Therapist ↔ UX/UI Optimizer:
- Weekly review of therapeutic interface design
- Crisis flow validation and safety considerations
- User journey therapeutic appropriateness

Hybrid CBT-AI ↔ UX/UI Optimizer:
- Weekly optimization of user-facing therapeutic content
- Conversation flow improvements based on user feedback
- Integration of therapeutic insights with interface design

AI/Prompt Engineer ↔ Hybrid CBT-AI:
- Weekly technical architecture alignment
- Performance benchmarking and optimization coordination
- Advanced AI feature development planning

All Agents ↔ Business Strategy:
- Weekly business impact assessment
- Resource allocation and priority adjustment
- Risk assessment and mitigation planning
```

## Activation Commands and Protocols

### Immediate Activation (Crisis/Blocking Issues)

```
Command: @MiraelAgent [URGENT] [Agent Type] [Issue Description]

Example: "@MiraelAgent [URGENT] CBT-Therapist - AI generated inappropriate crisis response, need immediate review and protocol update"

Response Time: <2 hours
Escalation: If no response in 2 hours, escalate to all relevant agents
Documentation: All urgent activations logged in shared issue tracker
```

### Standard Activation (Planned Work)

```
Command: @MiraelAgent [STANDARD] [Agent Type] [Task Description] [Timeline]

Example: "@MiraelAgent [STANDARD] Assistant-Developer - Implement session title auto-generation feature - Due: Week 2"

Response Time: <24 hours
Documentation: Task logged in project management system
Progress Updates: Daily standups for active tasks
```

### Consultation Activation (Advisory/Review)

```
Command: @MiraelAgent [CONSULT] [Agent Type] [Question/Review Request]

Example: "@MiraelAgent [CONSULT] Marketing-Strategist - Review new onboarding messaging for target demographic alignment"

Response Time: <48 hours
Documentation: Advisory opinions logged for future reference
Follow-up: Implementation decisions tracked with reasoning
```

## Quality Assurance and Validation

### Cross-Agent Validation Requirements

```
Technical Implementation:
- Assistant Developer implements
- CBT Therapist validates therapeutic appropriateness
- UX/UI Optimizer validates user experience
- All agents sign off before deployment

Content and Messaging:
- CBT Therapist validates therapeutic accuracy
- Marketing Strategist validates brand alignment
- UX/UI Optimizer validates user comprehension
- Business Strategy validates legal/compliance

Business Decisions:
- Business Strategy leads analysis
- Marketing Strategist validates market impact
- Assistant Developer validates technical feasibility
- All agents provide input on domain impact
```

### Success Metrics by Agent

```
Assistant Developer:
- Code quality: 0 critical bugs in production
- Performance: <2s average response time
- Coverage: >90% test coverage for critical paths

CBT Therapist:
- Safety: 100% appropriate crisis response handling
- Effectiveness: >80% user-reported insights gained
- Compliance: 0 therapeutic boundary violations

Hybrid CBT-AI:
- Therapeutic Accuracy: >90% CBT principle alignment
- AI Performance: 20-30% token reduction with quality maintenance
- Integration Success: >95% dual-domain validation approval

AI/Prompt Engineer:
- Quality: >4.0/5.0 average response quality rating
- Efficiency: <$0.015 average cost per interaction
- Accuracy: >85% appropriate module selection

UX/UI Optimizer:
- Usability: >90% task completion rate
- Accessibility: 100% WCAG 2.1 AA compliance
- Satisfaction: >4.2/5.0 user experience rating

Marketing Strategist:
- Acquisition: <$50 customer acquisition cost
- Conversion: >15% free-to-paid conversion rate
- Retention: >60% user retention at 30 days

Business Strategy:
- Compliance: 100% regulatory requirement fulfillment
- Sustainability: >70% gross margin achievement
- Growth: Business model validation and scaling readiness
```

## Communication Protocols

### Daily Standups (During Active Development)

```
Time: 9:00 AM EST
Participants: All agents currently activated
Format: 15 minutes maximum
Topics:
- Progress since last standup
- Blockers needing cross-agent support
- Day's priorities and collaboration needs
- Risk flags requiring immediate attention
```

### Weekly Strategy Reviews

```
Time: Friday 2:00 PM EST
Participants: All agents
Format: 45 minutes
Topics:
- Progress toward MVP milestones
- Cross-agent dependency resolution
- Priority adjustments based on learnings
- Next week planning and resource allocation
```

### Monthly Business Reviews

```
Time: Last Friday of month, 3:00 PM EST
Participants: All agents + Project leadership
Format: 90 minutes
Topics:
- Business metrics and KPI review
- Strategic direction validation
- Resource planning and team scaling
- Market feedback integration and strategy adjustment
```

## Emergency Protocols

### Crisis Response (Safety/Legal Issues)

```
Immediate Actions:
1. Halt all related development work
2. Activate CBT Therapist and Business Strategy agents immediately
3. Document issue thoroughly with screenshots/logs
4. Implement immediate mitigation measures
5. Communicate with all stakeholders within 1 hour

Escalation Chain:
Level 1: Relevant domain agent (CBT Therapist for safety, Business Strategy for legal)
Level 2: All agents + project leadership
Level 3: External advisors/legal counsel as needed
```

### Technical Emergency (System Down/Data Breach)

```
Immediate Actions:
1. Activate Assistant Developer agent immediately
2. Implement emergency response procedures
3. Notify Business Strategy agent for legal/compliance implications
4. Document all actions and timeline
5. Communicate with users if user-facing impact

Recovery Protocol:
1. Technical resolution led by Assistant Developer
2. User communication led by Marketing Strategist
3. Legal compliance verified by Business Strategy
4. Therapeutic safety validated by CBT Therapist
5. Post-mortem conducted by all agents
```

## Agent Performance Monitoring

### Individual Agent KPIs

- **Response Time**: Adherence to activation response time commitments
- **Quality**: Deliverable quality as measured by cross-agent validation
- **Collaboration**: Effectiveness in cross-agent coordination and communication
- **Innovation**: Contribution of new ideas and process improvements
- **Impact**: Measurable business impact of agent recommendations and implementations

### System-Wide Success Metrics

- **MVP Completion**: On-time delivery of all critical MVP features
- **Quality Assurance**: Zero critical safety or security issues at launch
- **User Satisfaction**: Achievement of target user experience metrics
- **Business Readiness**: All legal, compliance, and operational requirements met
- **Launch Success**: Successful go-to-market execution with target metrics achieved

This activation protocol ensures coordinated, efficient completion of the Mirael MVP while maintaining the highest standards of safety, quality, and user experience across all functional domains.
