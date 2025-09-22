# Mirael Credits System - Comprehensive Analysis

## 🎯 **Overview**

Mirael's **credits system** is a **transparent, pay-as-you-go monetization model** that replaced the previous points-based gamification system. It provides **precise cost tracking** for AI interactions with **atomic transactions**, **real-time balance updates**, and **comprehensive audit trails**.

## 🏗️ **System Architecture**

### **1. Database Schema Design**

#### **User Model Enhancement**

```prisma
model User {
  creditsBalance     Int                @default(0) @map("credits_balance")
  creditTransactions CreditTransaction[]
  // ... other fields
}
```

#### **Credit Transaction Model**

```prisma
model CreditTransaction {
  id        String                @id @default(cuid())
  userId    String                @map("user_id")
  user      User                  @relation(fields: [userId], references: [id], onDelete: Cascade)

  type      CreditTransactionType // CREDIT | DEBIT
  amount    Int                   // Credits amount (always positive)
  reason    String                // "ai_usage", "purchase", "admin_adjustment"
  sessionId String?               @map("session_id") // Link to session if AI usage
  metadata  Json?                 // Additional context (model, tokens, etc.)

  createdAt DateTime @default(now()) @map("created_at")

  // Performance indexes
  @@index([userId, createdAt, type, reason])
  @@map("credit_transactions")
}

enum CreditTransactionType {
  CREDIT  // User receives credits (purchase, bonus, refund)
  DEBIT   // User spends credits (AI usage)
}
```

**Key Design Principles**:

- **Atomic Operations**: Balance updates and transaction creation in single DB transaction
- **Immutable History**: Transaction records never modified, only created
- **Rich Context**: Metadata includes model, tokens, session references
- **Performance Optimized**: Strategic indexes for common queries

---

### **2. Pricing Model & Economics**

#### **Conversion Rate**

```typescript
export const CREDITS_TO_USD = 0.01; // 1 credit = $0.01 USD
```

#### **AI Model Pricing Structure**

```typescript
export const AI_MODEL_PRICING = {
  M1: {
    // GPT-4o-mini - Most affordable
    baseCredits: 2,
    inputTokenMultiplier: 0.0015,
    outputTokenMultiplier: 0.006,
  },
  M2: {
    // GPT-4o - Premium
    baseCredits: 10,
    inputTokenMultiplier: 0.025,
    outputTokenMultiplier: 0.1,
  },
  M3: {
    // Claude-3.5-Sonnet - High-quality
    baseCredits: 8,
    inputTokenMultiplier: 0.03,
    outputTokenMultiplier: 0.15,
  },
};
```

**Pricing Strategy**:

- **Base Credits**: Fixed cost per message (covers API overhead)
- **Token Multipliers**: Variable cost based on actual usage
- **Minimum Charge**: 1 credit per message (prevents micro-charges)
- **Conservative Estimates**: Pre-flight estimation with 1.5x output token buffer

#### **Cost Calculation Logic**

```typescript
export function calculateCreditsFromTokens(
  modelCode: keyof typeof AI_MODEL_PRICING,
  inputTokens: number,
  outputTokens: number
): number {
  const pricing = AI_MODEL_PRICING[modelCode];

  // Calculate cost: base + input tokens + output tokens
  const inputCost = Math.ceil(inputTokens * pricing.inputTokenMultiplier);
  const outputCost = Math.ceil(outputTokens * pricing.outputTokenMultiplier);
  const totalCost = pricing.baseCredits + inputCost + outputCost;

  return Math.max(1, totalCost); // Minimum 1 credit per message
}
```

---

### **3. Core Business Logic Operations**

#### **3.1 Balance Management**

**Location**: `src/app/actions/credit-actions.ts`

##### **Get Balance**

```typescript
export async function getUserCreditsBalance(userId: string): Promise<number>;
```

- Fetches current user balance
- Error handling with structured logging
- Returns 0 for non-existent users

##### **Add Credits (Purchase/Bonus)**

```typescript
export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult>;
```

- **Atomic Transaction**: Balance increment + transaction record
- **Validation**: Positive amounts only
- **Audit Trail**: Reason and metadata tracking
- **Error Recovery**: Comprehensive error handling

##### **Deduct Credits (AI Usage)**

```typescript
export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  sessionId?: string,
  metadata?: Record<string, any>
): Promise<CreditOperationResult>;
```

- **Pre-validation**: Checks sufficient balance
- **Atomic Transaction**: Balance decrement + transaction record
- **Session Linking**: Associates usage with therapeutic sessions
- **Rich Metadata**: Model, tokens, content length tracking

#### **3.2 Cost Estimation & Validation**

##### **Pre-flight Estimation**

```typescript
export async function estimateAIMessageCost(content: string, modelCode: keyof typeof AI_MODEL_PRICING): Promise<number>;
```

- **Conservative Estimation**: ~4 chars per token, 1.5x output buffer
- **Real-time Feedback**: Used in UI for live cost preview
- **Model-aware**: Different pricing per AI model

##### **Sufficient Balance Check**

```typescript
export async function checkSufficientCredits(userId: string, requiredCredits: number): Promise<boolean>;
```

- **Pre-authorization**: Validates before processing
- **UX Optimization**: Prevents failed attempts
- **Error Prevention**: Blocks insufficient balance operations

##### **Actual Cost Calculation**

```typescript
export async function calculateAIMessageCost(
  modelCode: keyof typeof AI_MODEL_PRICING,
  inputTokens: number,
  outputTokens: number
): Promise<number>;
```

- **Precise Billing**: Based on actual token usage
- **Post-processing**: Called after AI response
- **Accurate Charges**: Reflects real API costs

---

### **4. AI Integration Flow**

#### **4.1 Pre-Flight Phase**

**Location**: `src/domains/open-chat/open-chat.action.ts:156-173`

```typescript
// Check credits if userId is provided
if (userId) {
  const estimatedCost = await estimateAIMessageCost(userInput, modelCode);
  const hasSufficientCredits = await checkSufficientCredits(userId, estimatedCost);

  if (!hasSufficientCredits) {
    logger.logErrorAndThrow(
      ERROR_CODES.VALIDATION_FAILED,
      new Error(`Insufficient credits. Estimated cost: ${estimatedCost} credits`)
      // ... context
    );
  }
}
```

**Benefits**:

- **Early Validation**: Prevents wasted AI calls
- **User Feedback**: Clear error messages
- **Resource Conservation**: Avoids unnecessary processing

#### **4.2 Post-Processing Phase**

**Location**: `src/domains/open-chat/open-chat.action.ts:194-219`

```typescript
// Step 4: Calculate actual credits cost and deduct
if (userId && miraelResponse.modelTokenUsage) {
  const inputTokens = miraelResponse.modelTokenUsage.usage?.prompt_tokens ?? 0;
  const outputTokens = miraelResponse.modelTokenUsage.usage?.completion_tokens ?? 0;

  const actualCreditsNeeded = await calculateAIMessageCost(modelCode, inputTokens, outputTokens);

  // Atomic credit deduction with session reference
  const creditResult = await deductCredits(userId, actualCreditsNeeded, "ai_usage", sessionId, {
    modelCode,
    inputTokens,
    outputTokens,
    messageLength: userInput.length,
    responseLength: miraelResponse.message.length,
  });

  creditsUsed = actualCreditsNeeded;
}
```

**Features**:

- **Accurate Billing**: Based on actual token consumption
- **Comprehensive Metadata**: Full context for audit trails
- **Session Correlation**: Links spending to therapeutic sessions
- **Error Handling**: Rollback on deduction failures

---

### **5. User Interface Components**

#### **5.1 Credits Balance Display**

**Location**: `src/components/credits/credits-balance.tsx`

```typescript
export function CreditsBalance({ userId, showUSDValue = true }: CreditsBalanceProps);
```

**Features**:

- **Real-time Updates**: Fetches current balance on mount
- **USD Conversion**: Shows equivalent dollar value
- **Loading States**: Skeleton UI during fetch
- **Error Handling**: Graceful failure display

#### **5.2 Cost Estimator**

**Location**: `src/components/credits/credits-cost-estimator.tsx`

```typescript
export function CreditsCostEstimator({ content, modelCode, onCostUpdate }: CreditsCostEstimatorProps);
```

**Features**:

- **Live Estimation**: Updates as user types
- **Debounced Calculation**: 300ms delay to prevent excessive calls
- **Model-aware**: Different costs per AI model
- **USD Display**: Shows both credits and dollar cost
- **Parent Callbacks**: Notifies parent components of cost changes

**Integration Example** (in chat input):

```typescript
{userId && modelCode && inputValue.trim() && (
  <div className="mt-2 px-4">
    <CreditsCostEstimator
      content={inputValue}
      modelCode={modelCode}
      onCostUpdate={setEstimatedCost}
      className="text-xs text-mir-text-secondary"
    />
  </div>
)}
```

#### **5.3 Insufficient Credits Warning**

**Location**: `src/components/credits/insufficient-credits-warning.tsx`

```typescript
export function InsufficientCreditsWarning({ required, available, onPurchaseClick }: InsufficientCreditsWarningProps);
```

**Features**:

- **Deficit Calculation**: Shows exactly how many credits needed
- **Purchase CTA**: Direct path to credit purchase
- **Pricing Link**: Option to view pricing information
- **USD Context**: Shows deficit in dollar terms

#### **5.4 Transaction History**

**Location**: `src/components/credits/credits-transaction-history.tsx`

```typescript
export function CreditsTransactionHistory({ userId, limit = 20 }: CreditsTransactionHistoryProps);
```

**Features**:

- **Comprehensive History**: All credit transactions
- **Transaction Types**: Visual distinction between credits/debits
- **Rich Context**: Shows reason, amount, date
- **Pagination Support**: Configurable result limits
- **Metadata Display**: Session links, model information

---

### **6. Admin Operations**

#### **6.1 Credit Adjustments**

**Location**: `src/app/actions/credit-actions.ts:320-412`

```typescript
export async function adminAdjustCredits(
  adminUserId: string,
  targetUserId: string,
  amount: number, // Can be positive (add) or negative (deduct)
  reason: string
): Promise<CreditOperationResult>;
```

**Security Features**:

- **Role Verification**: Ensures admin permissions
- **Audit Trail**: Tracks admin actions with operator ID
- **Balance Validation**: Prevents negative balance deductions
- **Comprehensive Logging**: Full context for admin operations

**Use Cases**:

- **Customer Support**: Refunds, compensations
- **Promotional Credits**: Marketing campaigns, bonuses
- **System Adjustments**: Bug fixes, service credits
- **Account Management**: Manual balance corrections

#### **6.2 Audit & Monitoring**

- **Unified Logging**: All operations logged with structured data
- **Error Tracking**: Failed operations with full context
- **Performance Metrics**: Operation timing and success rates
- **Fraud Detection**: Unusual patterns and behaviors

---

### **7. Security & Compliance**

#### **7.1 Transaction Integrity**

- **Atomic Operations**: Database transactions ensure consistency
- **Idempotency**: Safe retry mechanisms
- **Validation**: Input sanitization and business rule enforcement
- **Audit Trails**: Immutable transaction history

#### **7.2 Access Control**

- **User Isolation**: Users can only access their own data
- **Admin Authorization**: Role-based access for administrative functions
- **API Security**: Server-side validation and authorization

#### **7.3 Error Handling**

- **Graceful Degradation**: System continues operating during partial failures
- **User Communication**: Clear error messages with actionable guidance
- **Recovery Mechanisms**: Automatic retry with exponential backoff

---

### **8. Performance Optimizations**

#### **8.1 Database Design**

- **Strategic Indexes**: Optimized for common query patterns
- **Efficient Queries**: Minimal data transfer and processing
- **Connection Pooling**: Optimal database resource utilization

#### **8.2 Caching Strategy**

- **Balance Caching**: Client-side balance updates
- **Estimation Caching**: Debounced cost calculations
- **Transaction History**: Paginated loading

#### **8.3 UI Optimizations**

- **Debounced Inputs**: Prevents excessive API calls
- **Loading States**: Responsive user feedback
- **Error Boundaries**: Isolated failure handling

---

## 🎯 **Business Impact**

### **Monetization Benefits**

- **Transparent Pricing**: Users see exact costs before interaction
- **Fair Usage**: Pay only for what you consume
- **Predictable Revenue**: Clear cost-to-revenue mapping
- **Scalable Model**: Automatically adjusts with usage patterns

### **User Experience Advantages**

- **No Surprises**: Cost estimation before every interaction
- **Flexible Spending**: No subscription commitments required
- **Value Awareness**: Clear correlation between features and costs
- **Budget Control**: Users can monitor and control spending

### **Technical Excellence**

- **Atomic Consistency**: No partial states or lost transactions
- **Comprehensive Auditing**: Full transaction traceability
- **Scalable Architecture**: Handles high-volume operations
- **Maintainable Code**: Clean separation of concerns

---

## 🚀 **Future Enhancements**

### **Phase 1: Purchase Integration**

- Payment gateway integration (Stripe)
- Credit packages ($5, $10, $25, $50)
- Webhook handling for payment confirmations

### **Phase 2: Advanced Features**

- Subscription models with monthly allocations
- Bulk discounts and promotional pricing
- Usage analytics and reporting
- Referral bonuses and social features

### **Phase 3: Enterprise Features**

- Team accounts with shared credit pools
- Usage quotas and spending limits
- Advanced admin dashboards
- Custom pricing for enterprise clients

---

**The credits system provides a solid foundation for sustainable monetization while maintaining excellent user experience and technical reliability.**
