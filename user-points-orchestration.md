# User Points Orchestration System

## Overview

The User Points System is a comprehensive engagement and value-tracking mechanism for Mirael that rewards users for meaningful interactions while providing flexible consumption models for AI services.

## Core Concepts

### Points as Universal Currency

Points serve as the unified currency for all AI interactions, replacing direct monetary charges with a more user-friendly credit system:

- **1 Point ≈ $0.01 USD** (base conversion rate)
- **Dynamic pricing** based on model complexity and features used
- **Transparent cost calculation** before each interaction

### Point Sources

#### 1. **Initial Welcome Bonus**
```typescript
const WELCOME_BONUS = 1000; // 1000 points = $10 value
```

#### 2. **Subscription Tiers**
```typescript
interface SubscriptionTier {
  name: "Free" | "Essential" | "Premium" | "Professional";
  monthlyPoints: number;
  pointsPerUSD: number; // Bonus points for subscribers
  features: string[];
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    name: "Free",
    monthlyPoints: 200, // $2 monthly allowance
    pointsPerUSD: 100,
    features: ["Basic conversations", "Limited sessions"]
  },
  {
    name: "Essential", 
    monthlyPoints: 1000, // $10 monthly allowance
    pointsPerUSD: 110, // 10% bonus
    features: ["Unlimited sessions", "Advanced analysis", "Priority support"]
  },
  {
    name: "Premium",
    monthlyPoints: 2500, // $25 monthly allowance
    pointsPerUSD: 120, // 20% bonus
    features: ["All models", "Export features", "Advanced insights"]
  },
  {
    name: "Professional",
    monthlyPoints: 5000, // $50 monthly allowance
    pointsPerUSD: 130, // 30% bonus
    features: ["Team features", "API access", "Priority processing"]
  }
];
```

#### 3. **Point Purchases**
```typescript
interface PointPackage {
  points: number;
  priceUSD: number;
  bonusPercent: number;
  popular?: boolean;
}

const POINT_PACKAGES: PointPackage[] = [
  { points: 500, priceUSD: 4.99, bonusPercent: 0 },
  { points: 1200, priceUSD: 9.99, bonusPercent: 20, popular: true },
  { points: 2600, priceUSD: 19.99, bonusPercent: 30 },
  { points: 5500, priceUSD: 39.99, bonusPercent: 37.5 },
  { points: 12000, priceUSD: 79.99, bonusPercent: 50 }
];
```

#### 4. **Engagement Rewards**
```typescript
interface EngagementReward {
  action: string;
  points: number;
  dailyLimit?: number;
  description: string;
}

const ENGAGEMENT_REWARDS: EngagementReward[] = [
  {
    action: "daily_checkin",
    points: 10,
    dailyLimit: 1,
    description: "Daily check-in bonus"
  },
  {
    action: "complete_session",
    points: 25,
    dailyLimit: 3,
    description: "Complete a meaningful conversation"
  },
  {
    action: "first_weekly_session",
    points: 50,
    dailyLimit: 1,
    description: "First session of the week"
  },
  {
    action: "referral_signup",
    points: 500,
    description: "Friend signs up using your referral"
  },
  {
    action: "feedback_submitted",
    points: 100,
    description: "Submit detailed feedback"
  }
];
```

### Point Consumption

#### 1. **Model-Based Pricing**
```typescript
interface ModelPricing {
  modelCode: string;
  basePointsPerMessage: number;
  pointsPerInputToken: number;
  pointsPerOutputToken: number;
  features: {
    analysis: number; // Additional points for state analysis
    memory: number;   // Points for memory storage
    export: number;   // Points for session export
  };
}

const MODEL_PRICING: ModelPricing[] = [
  {
    modelCode: "M1", // GPT-4o-mini
    basePointsPerMessage: 2,
    pointsPerInputToken: 0.0015,
    pointsPerOutputToken: 0.006,
    features: { analysis: 5, memory: 1, export: 10 }
  },
  {
    modelCode: "M2", // GPT-4o
    basePointsPerMessage: 10,
    pointsPerInputToken: 0.025,
    pointsPerOutputToken: 0.1,
    features: { analysis: 15, memory: 3, export: 20 }
  },
  {
    modelCode: "M3", // Claude-3.5-Sonnet
    basePointsPerMessage: 8,
    pointsPerInputToken: 0.03,
    pointsPerOutputToken: 0.15,
    features: { analysis: 12, memory: 2, export: 15 }
  }
];
```

#### 2. **Feature-Based Charges**
```typescript
interface FeatureCost {
  feature: string;
  points: number;
  description: string;
}

const FEATURE_COSTS: FeatureCost[] = [
  {
    feature: "session_analysis",
    points: 25,
    description: "Detailed cognitive analysis of session"
  },
  {
    feature: "export_pdf",
    points: 50,
    description: "Export session as formatted PDF"
  },
  {
    feature: "cloud_backup",
    points: 5,
    description: "Store session in cloud (one-time per session)"
  },
  {
    feature: "priority_processing",
    points: 20,
    description: "Skip queue for faster responses"
  }
];
```

## Technical Implementation

### Database Schema

```sql
-- User Points Balance
CREATE TABLE user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT positive_balance CHECK (balance >= 0)
);

-- Points Transactions Log
CREATE TABLE points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'purchase', 'subscription', 'engagement', 'ai_usage', etc.
  reference_id UUID, -- Links to session, purchase, etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT non_zero_amount CHECK (amount != 0)
);

-- Subscription Management
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  tier VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  points_allocated INTEGER NOT NULL DEFAULT 0,
  points_used INTEGER NOT NULL DEFAULT 0,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement Tracking
CREATE TABLE user_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action VARCHAR(50) NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, action, date)
);
```

### Core Service Architecture

```typescript
// Points Service - Core business logic
export class PointsService {
  
  async getUserBalance(userId: string): Promise<number> {
    const result = await supabase
      .from('user_points')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    return result.data?.balance || 0;
  }

  async deductPoints(
    userId: string, 
    amount: number, 
    source: string, 
    referenceId?: string,
    metadata?: any
  ): Promise<{ success: boolean; newBalance: number }> {
    const currentBalance = await this.getUserBalance(userId);
    
    if (currentBalance < amount) {
      throw new InsufficientPointsError(`Insufficient points. Required: ${amount}, Available: ${currentBalance}`);
    }

    const newBalance = currentBalance - amount;
    
    // Update balance and log transaction atomically
    const { error } = await supabase.rpc('deduct_user_points', {
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_reference_id: referenceId,
      p_metadata: metadata
    });

    if (error) throw error;
    
    return { success: true, newBalance };
  }

  async addPoints(
    userId: string,
    amount: number,
    source: string,
    referenceId?: string,
    metadata?: any
  ): Promise<{ newBalance: number }> {
    const { error } = await supabase.rpc('add_user_points', {
      p_user_id: userId,
      p_amount: amount,
      p_source: source,
      p_reference_id: referenceId,
      p_metadata: metadata
    });

    if (error) throw error;
    
    const newBalance = await this.getUserBalance(userId);
    return { newBalance };
  }

  async calculateMessageCost(
    modelCode: string,
    inputTokens: number,
    outputTokens: number,
    features: string[] = []
  ): Promise<number> {
    const pricing = MODEL_PRICING.find(p => p.modelCode === modelCode);
    if (!pricing) throw new Error(`Unknown model: ${modelCode}`);

    let cost = pricing.basePointsPerMessage;
    cost += Math.ceil(inputTokens * pricing.pointsPerInputToken);
    cost += Math.ceil(outputTokens * pricing.pointsPerOutputToken);

    // Add feature costs
    for (const feature of features) {
      const featureCost = FEATURE_COSTS.find(f => f.feature === feature);
      if (featureCost) {
        cost += featureCost.points;
      }
    }

    return cost;
  }
}

// Points Store for Frontend State Management
interface PointsStoreState {
  balance: number;
  isLoading: boolean;
  transactions: PointsTransaction[];
  subscription: UserSubscription | null;
  
  // Actions
  loadBalance: () => Promise<void>;
  loadTransactions: (limit?: number) => Promise<void>;
  loadSubscription: () => Promise<void>;
  
  // Real-time updates
  subscribeToUpdates: () => void;
  unsubscribeFromUpdates: () => void;
}

export const usePointsStore = create<PointsStoreState>()(
  subscribeWithSelector((set, get) => ({
    balance: 0,
    isLoading: false,
    transactions: [],
    subscription: null,

    loadBalance: async () => {
      set({ isLoading: true });
      try {
        const balance = await pointsService.getUserBalance(getCurrentUserId());
        set({ balance, isLoading: false });
      } catch (error) {
        console.error('Failed to load balance:', error);
        set({ isLoading: false });
      }
    },

    subscribeToUpdates: () => {
      const userId = getCurrentUserId();
      const subscription = supabase
        .channel('points_updates')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${userId}`
        }, (payload) => {
          if (payload.new && 'balance' in payload.new) {
            set({ balance: payload.new.balance });
          }
        })
        .subscribe();
      
      // Store subscription for cleanup
      set({ realtimeSubscription: subscription });
    }
  }))
);
```

### AI Integration

```typescript
// Enhanced Chat Controller with Points Integration
export class ChatController {
  private pointsService = new PointsService();

  async processMessage(
    content: string,
    sessionId: string,
    modelCode: string = 'M1'
  ): Promise<{ response: string; pointsUsed: number }> {
    
    // Pre-calculate cost estimate
    const estimatedCost = await this.estimateMessageCost(content, modelCode);
    
    // Check if user has sufficient points
    const userBalance = await this.pointsService.getUserBalance(this.userId);
    if (userBalance < estimatedCost) {
      throw new InsufficientPointsError(
        `Insufficient points for this message. Estimated cost: ${estimatedCost}, Available: ${userBalance}`
      );
    }

    // Process the message
    const startTime = Date.now();
    const aiResponse = await this.aiService.processMessage(content, sessionId, modelCode);
    const processingTime = Date.now() - startTime;

    // Calculate actual cost based on tokens used
    const actualCost = await this.pointsService.calculateMessageCost(
      modelCode,
      aiResponse.usage.inputTokens,
      aiResponse.usage.outputTokens,
      aiResponse.featuresUsed
    );

    // Deduct points
    await this.pointsService.deductPoints(
      this.userId,
      actualCost,
      'ai_usage',
      sessionId,
      {
        modelCode,
        inputTokens: aiResponse.usage.inputTokens,
        outputTokens: aiResponse.usage.outputTokens,
        processingTime,
        featuresUsed: aiResponse.featuresUsed
      }
    );

    return {
      response: aiResponse.content,
      pointsUsed: actualCost
    };
  }

  private async estimateMessageCost(content: string, modelCode: string): Promise<number> {
    // Rough estimation based on content length
    const estimatedInputTokens = Math.ceil(content.length / 4); // Rough token estimate
    const estimatedOutputTokens = Math.ceil(estimatedInputTokens * 1.5); // Conservative estimate
    
    return await this.pointsService.calculateMessageCost(
      modelCode,
      estimatedInputTokens,
      estimatedOutputTokens
    );
  }
}
```

### User Interface Components

```typescript
// Points Balance Component
export const PointsBalance: React.FC = () => {
  const { balance, isLoading, loadBalance } = usePointsStore();
  const { subscription } = useSubscription();

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  return (
    <div className="points-balance">
      <div className="balance-display">
        {isLoading ? (
          <Skeleton className="h-6 w-20" />
        ) : (
          <span className="text-lg font-semibold">
            {balance.toLocaleString()} points
          </span>
        )}
      </div>
      
      <div className="balance-value text-sm text-gray-600">
        ≈ ${(balance / 100).toFixed(2)} value
      </div>

      {subscription && (
        <div className="subscription-info text-xs">
          {subscription.tier} Plan • {subscription.pointsRemaining} points remaining this month
        </div>
      )}
    </div>
  );
};

// Cost Estimator Component
export const MessageCostEstimator: React.FC<{
  content: string;
  modelCode: string;
  onCostUpdate: (cost: number) => void;
}> = ({ content, modelCode, onCostUpdate }) => {
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const estimateCost = async () => {
      if (content.trim()) {
        const cost = await pointsService.estimateMessageCost(content, modelCode);
        setEstimatedCost(cost);
        onCostUpdate(cost);
      }
    };

    const debounced = debounce(estimateCost, 300);
    debounced();
  }, [content, modelCode, onCostUpdate]);

  if (!content.trim() || estimatedCost === 0) return null;

  return (
    <div className="cost-estimator text-xs text-gray-500">
      Estimated cost: {estimatedCost} points (${(estimatedCost / 100).toFixed(3)})
    </div>
  );
};

// Insufficient Points Warning
export const InsufficientPointsWarning: React.FC<{
  required: number;
  available: number;
}> = ({ required, available }) => {
  const deficit = required - available;

  return (
    <Alert variant="warning">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Insufficient Points</AlertTitle>
      <AlertDescription>
        You need {deficit} more points to send this message.
        <div className="mt-2 flex gap-2">
          <Button size="sm" onClick={() => window.open('/points/purchase', '_blank')}>
            Buy Points
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.open('/subscription', '_blank')}>
            Upgrade Plan
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};
```

## Engagement & Gamification

### Achievement System

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  criteria: {
    type: 'session_count' | 'points_spent' | 'consecutive_days' | 'feature_usage';
    threshold: number;
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time';
  };
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first conversation',
    icon: '🌱',
    points: 50,
    criteria: { type: 'session_count', threshold: 1 }
  },
  {
    id: 'dedicated_user',
    name: 'Dedicated User',
    description: 'Use Mirael for 7 consecutive days',
    icon: '🔥',
    points: 200,
    criteria: { type: 'consecutive_days', threshold: 7 }
  },
  {
    id: 'power_user',
    name: 'Power User',
    description: 'Complete 50 sessions',
    icon: '⚡',
    points: 500,
    criteria: { type: 'session_count', threshold: 50, timeframe: 'all_time' }
  }
];
```

### Referral System

```typescript
interface ReferralProgram {
  referrerBonus: number; // Points for successful referral
  refereeBonus: number;  // Points for new user
  tierMultipliers: Record<string, number>; // Bonus based on subscription tier
}

const REFERRAL_PROGRAM: ReferralProgram = {
  referrerBonus: 500,
  refereeBonus: 250,
  tierMultipliers: {
    'Free': 1,
    'Essential': 1.5,
    'Premium': 2,
    'Professional': 3
  }
};
```

## Security & Fraud Prevention

### Rate Limiting
```typescript
const RATE_LIMITS = {
  pointPurchase: {
    maxPerDay: 50000, // Max points purchasable per day
    maxPerHour: 10000
  },
  engagement: {
    maxDailyCheckins: 1,
    maxSessionRewards: 3,
    cooldownBetweenActions: 60000 // 1 minute
  }
};
```

### Abuse Detection
```typescript
interface AbuseDetectionRule {
  pattern: string;
  threshold: number;
  action: 'warn' | 'limit' | 'suspend';
}

const ABUSE_RULES: AbuseDetectionRule[] = [
  {
    pattern: 'rapid_session_creation',
    threshold: 10, // 10 sessions per hour
    action: 'limit'
  },
  {
    pattern: 'suspicious_referrals',
    threshold: 5, // 5 referrals from same IP
    action: 'warn'
  }
];
```

## Business Metrics & Analytics

### Key Performance Indicators

```typescript
interface PointsAnalytics {
  // Revenue Metrics
  pointsSold: number;
  revenue: number;
  averageTransactionSize: number;
  
  // Engagement Metrics
  dailyActiveUsers: number;
  pointsEarnedFromEngagement: number;
  achievementCompletionRate: number;
  
  // Consumption Metrics
  pointsSpentOnAI: number;
  averageSessionCost: number;
  modelUsageDistribution: Record<string, number>;
  
  // Retention Metrics
  pointsRetentionRate: number; // Users who return after earning points
  subscriptionUpgradeRate: number;
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1-2)
- [ ] Database schema setup
- [ ] Basic PointsService implementation
- [ ] User balance tracking
- [ ] Simple point deduction for AI usage

### Phase 2: UI Integration (Week 3-4)
- [ ] Points balance display
- [ ] Cost estimation in chat
- [ ] Insufficient points warnings
- [ ] Basic points purchase flow

### Phase 3: Engagement Features (Week 5-6)
- [ ] Daily check-in rewards
- [ ] Session completion bonuses
- [ ] Achievement system
- [ ] Referral program

### Phase 4: Advanced Features (Week 7-8)
- [ ] Subscription integration
- [ ] Advanced analytics dashboard
- [ ] Fraud detection
- [ ] Performance optimization

### Phase 5: Optimization & Polish (Week 9-10)
- [ ] A/B testing framework
- [ ] Advanced gamification
- [ ] Customer support tools
- [ ] Documentation and training

## Success Metrics

### Technical Success
- **99.9% uptime** for points transactions
- **<100ms response time** for balance queries
- **Zero point loss** incidents

### Business Success
- **20% increase** in user engagement
- **15% subscription upgrade rate** from free users
- **$50 average monthly points spending** per active user
- **4.5+ star rating** on points system usability

### User Experience Success
- **<3 seconds** for cost calculation
- **Clear cost transparency** before each interaction
- **Intuitive points earning** mechanisms
- **Fair and predictable** pricing structure

This comprehensive points orchestration system provides a solid foundation for monetizing Mirael while maintaining a positive user experience focused on value and engagement rather than direct payment friction.