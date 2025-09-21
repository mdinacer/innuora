-- Check recent credit transactions to debug purchase issue

-- Recent transactions (last 10)
SELECT 
  id,
  type,
  amount,
  reason,
  metadata,
  created_at
FROM credit_transactions 
ORDER BY created_at DESC 
LIMIT 10;

-- Pending purchase transactions
SELECT 
  id,
  type,
  amount,
  reason,
  metadata->>'status' as status,
  metadata->>'paymentIntentId' as payment_intent_id,
  metadata->>'productKey' as product_key,
  created_at
FROM credit_transactions 
WHERE reason = 'credit_purchase'
AND metadata->>'status' = 'pending'
ORDER BY created_at DESC;

-- All purchase transactions (completed and pending)
SELECT 
  id,
  type,
  amount,
  reason,
  metadata->>'status' as status,
  metadata->>'paymentIntentId' as payment_intent_id,
  metadata->>'productKey' as product_key,
  metadata->>'amountUSD' as amount_usd,
  created_at
FROM credit_transactions 
WHERE reason = 'credit_purchase'
ORDER BY created_at DESC
LIMIT 20;

-- Check current user balances
SELECT 
  id,
  auth_id,
  email,
  credits_balance,
  created_at,
  updated_at
FROM users 
ORDER BY updated_at DESC
LIMIT 10;