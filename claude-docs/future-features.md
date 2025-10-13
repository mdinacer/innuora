# Future Features - Removed Models Documentation

This document contains database models that were removed during the credits system implementation but may be needed for future features.

## 🗂️ Removed Models (For Future Implementation)

### 1. **Subscription Model**

```prisma
model Subscription {
  id String @id @default(uuid())

  // Foreign keys
  userId String @unique @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Business fields
  plan   SubscriptionPlan?   @default(free)
  status SubscriptionStatus? @default(active)

  // Timestamps
  startedAt DateTime  @default(now()) @map("started_at")
  expiresAt DateTime? @map("expires_at")

  @@map("subscriptions")
}

enum SubscriptionPlan {
  free
  pro
  enterprise
}

enum SubscriptionStatus {
  active
  canceled
  past_due
}
```

**Use Case**: Monthly/annual subscription plans with recurring billing
**Implementation Priority**: High (for business model)

### 2. **Payment Model**

```prisma
model Payment {
  id String @id @default(cuid())

  // Foreign keys
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Business fields
  provider    String
  providerRef String        @map("provider_ref")
  amountCents Int           @map("amount_cents")
  currency    String        @default("usd")
  status      PaymentStatus @default(pending)

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([userId])
  @@index([createdAt])
  @@map("payments")
}

enum PaymentStatus {
  pending
  succeeded
  failed
  refunded
}
```

**Use Case**: Track Stripe/payment provider transactions for credit purchases
**Implementation Priority**: High (for credit purchases)

### 3. **Feedback Model**

```prisma
model Feedback {
  id String @id @default(cuid())

  // Foreign keys
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Business fields
  message String
  rating  Int?

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")

  @@map("feedbacks")
}
```

**Use Case**: Collect user feedback for product improvement
**Implementation Priority**: Medium (for user research)

### 4. **UserFeatureFlag Model**

```prisma
model UserFeatureFlag {
  id String @id @default(cuid())

  // Foreign keys
  userId String @map("user_id")
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Business fields
  flag    String
  enabled Boolean @default(false)

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([userId, flag])
  @@map("user_feature_flags")
}
```

**Use Case**: A/B testing and gradual feature rollouts
**Implementation Priority**: Low (for growth optimization)

### 5. **AdminAdjustment Model**

```prisma
model AdminAdjustment {
  id String @id @default(cuid())

  // Foreign keys
  userId String @map("user_id")
  user   User   @relation("AdjustmentsReceived", fields: [userId], references: [id], onDelete: Cascade)

  adminId String @map("admin_id")
  admin   User   @relation("AdjustmentsMade", fields: [adminId], references: [id], onDelete: Cascade)

  // Business fields
  amount Int
  reason String?

  // Timestamps
  createdAt DateTime @default(now()) @map("created_at")

  @@map("admin_adjustments")
}
```

**Use Case**: Track manual admin adjustments to user accounts (credits, status changes)
**Implementation Priority**: Medium (for customer support)

## 🎯 Implementation Roadmap

### Phase 1: Monetization (Q1)

1. **Payment Model** - Enable credit purchases
2. **Subscription Model** - Monthly plans with credit allocations

### Phase 2: Support & Growth (Q2)

3. **AdminAdjustment Model** - Customer support tools
4. **Feedback Model** - User feedback collection

### Phase 3: Optimization (Q3)

5. **UserFeatureFlag Model** - A/B testing capabilities

## 📝 Notes

- All models were fully designed but not implemented in the codebase
- User model relationships were removed and will need to be re-added
- Corresponding enums and indexes are documented above
- Migration files may need to reference these schemas when re-implementing

## 🔗 Related Documentation

- Original analysis: `docs/UNIMPLEMENTED_MODELS_ANALYSIS.md` (removed)
- Points system documentation: `docs/user-points-orchestration.md` (removed - was gamification focused)

---

**This document ensures we don't lose the database design work when we're ready to implement these features.**
