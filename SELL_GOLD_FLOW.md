# Sell Gold Flow - Complete Documentation

## 🔄 Flow Overview

```
Portfolio/Landing → Sell Gold → Sell Summary → Bank Account → Processing → Success → Portfolio
```

---

## 📊 Detailed Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STEP 1: ENTRY POINT                         │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              ┌─────▼──────┐            ┌──────▼─────┐
              │  Portfolio │            │  Landing   │
              │    Page    │            │    Page    │
              └─────┬──────┘            └──────┬─────┘
                    │                          │
                    └──────────┬───────────────┘
                               │
                    Click "Sell Gold" Button
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 2: SELL GOLD PAGE                         │
│                        Route: /sell-gold                            │
└─────────────────────────────────────────────────────────────────────┘
│                                                                       │
│  LEFT SECTION:                    RIGHT SECTION:                    │
│  ┌──────────────────┐            ┌──────────────────┐              │
│  │ Available Balance│            │   Sell Interface │              │
│  │   5.234 grams    │            │                  │              │
│  │  ≈ ₹85,577       │            │  Mode Toggle:    │              │
│  └──────────────────┘            │  • Sell in ₹     │              │
│                                   │  • Sell in Grams │              │
│  ┌──────────────────┐            │                  │              │
│  │  Trust Badges    │            │  Input Field     │              │
│  │  ⚡ Instant      │            │  [Enter amount]  │              │
│  │  ₹ Live Rates    │            │                  │              │
│  │  ✓ Secure        │            │  Quick Chips:    │              │
│  └──────────────────┘            │  ₹1K ₹2.5K ₹5K  │              │
│                                   │  [Sell All]      │              │
│  ┌──────────────────┐            │                  │              │
│  │Important Info    │            │  [Review Sell    │              │
│  │• Min: ₹100       │            │   Order] Button  │              │
│  │• T+1 settlement  │            └──────────────────┘              │
│  │• TDS applicable  │                                               │
│  └──────────────────┘                                               │
│                                                                       │
│  USER ACTIONS:                                                       │
│  1. Select mode (₹ or grams)                                        │
│  2. Enter amount or click quick chip                                │
│  3. View real-time conversion                                       │
│  4. System validates against available balance                      │
│  5. Click "Review Sell Order"                                       │
│                                                                       │
│  VALIDATION:                                                         │
│  ✓ Minimum: ₹100                                                    │
│  ✓ Maximum: Available balance (5.234g)                              │
│  ✓ Shows error if insufficient balance                              │
│                                                                       │
│  DATA PASSED:                                                        │
│  {                                                                   │
│    amount: "1000",                                                   │
│    sellMode: "rupees",                                               │
│    sellRate: 16350,                                                  │
│    availableGold: 5.234,                                             │
│    lockedAt: "2024-01-15T10:30:00.000Z"                             │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     STEP 3: SELL SUMMARY PAGE                       │
│                      Route: /sell-summary                           │
└─────────────────────────────────────────────────────────────────────┘
│                                                                       │
│  HEADER:                                                             │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ ← Back to Sell  |  Review Sell Order  | 🔒 2:50 remaining  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  WARNING BANNER:                                                     │
│  ⚠️ Price locked for 2:50 • Cannot cancel • T+1 settlement          │
│                                                                       │
│  SELL DETAILS:                                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Sell Rate:    ₹16,350/g                                  │      │
│  │ Quantity:     0.061 grams                                │      │
│  │ Purity:       24K • 999                                  │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
│  PAYOUT BREAKDOWN:                                                   │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Gross Value:        ₹1,000.00                            │      │
│  │ Processing (1%):    - ₹10.00                             │      │
│  │ TDS (1%):           - ₹10.00                             │      │
│  │ ─────────────────────────────────────────────────────    │      │
│  │ Net Payout:         ₹980.00                              │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
│  TERMS & CONDITIONS:                                                 │
│  ☐ I agree to the Terms & Conditions                                │
│                                                                       │
│  ACTION BUTTON:                                                      │
│  [Confirm & Sell Gold]                                               │
│                                                                       │
│  USER ACTIONS:                                                       │
│  1. Review sell details and payout breakdown                        │
│  2. Monitor 3-minute price lock timer                               │
│  3. Click "Terms & Conditions" to view modal                        │
│  4. Check acceptance checkbox                                       │
│  5. Click "Confirm & Sell Gold"                                     │
│                                                                       │
│  PRICE LOCK:                                                         │
│  • 3 minutes (180 seconds) countdown                                │
│  • Warning state when < 30 seconds                                  │
│  • Shows "Get Fresh Price" button if expired                        │
│                                                                       │
│  DATA PASSED:                                                        │
│  {                                                                   │
│    grams: "0.061",                                                   │
│    rupees: "1000.00",                                                │
│    processingFee: "10.00",                                           │
│    tds: "10.00",                                                     │
│    finalAmount: "980.00",                                            │
│    sellRate: 16350                                                   │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 4: BANK ACCOUNT PAGE                        │
│                      Route: /bank-account                           │
└─────────────────────────────────────────────────────────────────────┘
│                                                                       │
│  HEADER:                                                             │
│  Add Bank Account                                                    │
│  Enter your bank details to receive funds                           │
│                                                                       │
│  INFO BANNER:                                                        │
│  💡 Funds will be credited within T+1 working day                   │
│                                                                       │
│  FORM FIELDS:                                                        │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ 1. Bank Name (Searchable Dropdown)                       │      │
│  │    [Select your bank ▼]                                  │      │
│  │    • 30+ major Indian banks                              │      │
│  │    • Search functionality                                │      │
│  │    • SBI, HDFC, ICICI, Axis, etc.                        │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
│  ┌─────────────────────────┬────────────────────────────────┐      │
│  │ 2. Account Holder Name  │ 3. IFSC Code                   │      │
│  │    [JOHN DOE]           │    [SBIN0001234]               │      │
│  │    • Auto uppercase     │    • 11 characters             │      │
│  │    • Min 3 chars        │    • Format: XXXX0XXXXXX       │      │
│  └─────────────────────────┴────────────────────────────────┘      │
│                                                                       │
│  ┌─────────────────────────┬────────────────────────────────┐      │
│  │ 4. Account Number       │ 5. Confirm Account Number      │      │
│  │    [123456789012]       │    [123456789012]              │      │
│  │    • 9-18 digits        │    • Must match exactly        │      │
│  │    • Numeric only       │    • Prevents typos            │      │
│  └─────────────────────────┴────────────────────────────────┘      │
│                                                                       │
│  SECURITY NOTE:                                                      │
│  🛡️ Bank details are encrypted and stored securely                  │
│                                                                       │
│  ACTION BUTTON:                                                      │
│  [Verify & Continue]                                                 │
│                                                                       │
│  USER ACTIONS:                                                       │
│  1. Click bank name field → Dropdown opens                          │
│  2. Search for bank or scroll through list                          │
│  3. Select bank from dropdown                                       │
│  4. Enter account holder name (auto-uppercase)                      │
│  5. Enter IFSC code (auto-uppercase)                                │
│  6. Enter account number (numeric only)                             │
│  7. Re-enter account number for confirmation                        │
│  8. Click "Verify & Continue"                                       │
│                                                                       │
│  VALIDATION:                                                         │
│  ✓ Bank Name: Required, from dropdown                               │
│  ✓ Account Holder: Min 3 chars, required                            │
│  ✓ IFSC Code: 11 chars, format XXXX0XXXXXX                          │
│  ✓ Account Number: 9-18 digits, numeric only                        │
│  ✓ Confirm Account: Must match exactly                              │
│  ✓ Real-time validation with specific error messages                │
│                                                                       │
│  DATA PASSED:                                                        │
│  {                                                                   │
│    ...sellData,                                                      │
│    bankDetails: {                                                    │
│      accountHolder: "JOHN DOE",                                      │
│      bankName: "State Bank of India",                                │
│      accountNumber: "1234XXXX5678", // Masked for security          │
│      ifscCode: "SBIN0001234"                                         │
│    }                                                                 │
│  }                                                                   │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   STEP 5: SELL PROCESSING PAGE                      │
│                    Route: /sell-processing                          │
│                    (NO HEADER/FOOTER)                               │
└─────────────────────────────────────────────────────────────────────┘
│                                                                       │
│                    ┌─────────────────────┐                          │
│                    │   Animated Spinner  │                          │
│                    └─────────────────────┘                          │
│                                                                       │
│              Processing Your Sell Order                              │
│        Please wait while we process your transaction...              │
│                                                                       │
│  PROCESSING STEPS:                                                   │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ ✓ Verifying gold balance                                 │      │
│  │ ✓ Calculating sell value                                 │      │
│  │ ⟳ Processing transaction (active)                        │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
│  BEHAVIOR:                                                           │
│  • Full-screen loading view                                         │
│  • Animated spinner                                                 │
│  • Auto-redirects after 3 seconds                                   │
│  • No user interaction required                                     │
│  • Navigate to /sell-success                                        │
└─────────────────────────────────────────────────────────────────────┘
                               │
                    Auto-redirect (3 seconds)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 6: SELL SUCCESS PAGE                        │
│                      Route: /sell-success                           │
└─────────────────────────────────────────────────────────────────────┘
│                                                                       │
│                    ┌─────────────────────┐                          │
│                    │   ✓ Success Icon    │                          │
│                    │   (Green Checkmark) │                          │
│                    └─────────────────────┘                          │
│                                                                       │
│                  Gold Sold Successfully!                             │
│        Your gold has been sold and amount will be credited soon      │
│                                                                       │
│  SUCCESS CARD:                                                       │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │                                                            │      │
│  │  Amount Credited                                          │      │
│  │  ₹980                                                     │      │
│  │                                                            │      │
│  │  ─────────────────────────────────────────────────────    │      │
│  │                                                            │      │
│  │  Gold Sold:           0.061 grams                         │      │
│  │  Updated Balance:     5.173 grams                         │      │
│  │                                                            │      │
│  │  ─────────────────────────────────────────────────────    │      │
│  │                                                            │      │
│  │  Transaction ID:      TXN1705315800                       │      │
│  │  Date & Time:         15 Jan 2024, 10:30 AM              │      │
│  │                                                            │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
│  ACTION BUTTONS:                                                     │
│  ┌──────────────────────┐  ┌──────────────────────┐               │
│  │  View Portfolio      │  │  Sell More Gold      │               │
│  │     (Primary)        │  │    (Secondary)       │               │
│  └──────────────────────┘  └──────────────────────┘               │
│                                                                       │
│  USER ACTIONS:                                                       │
│  1. View transaction confirmation                                   │
│  2. Check updated balance                                           │
│  3. Click "View Portfolio" → Navigate to /portfolio                 │
│  4. Click "Sell More Gold" → Navigate to /sell-gold                 │
│                                                                       │
│  DISPLAYED DATA:                                                     │
│  • Net payout amount (highlighted)                                  │
│  • Gold quantity sold                                               │
│  • Remaining balance after sale                                     │
│  • Auto-generated transaction ID                                    │
│  • Formatted timestamp                                              │
└─────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      STEP 7: PORTFOLIO PAGE                         │
│                       Route: /portfolio                             │
└─────────────────────────────────────────────────────────────────────┘
│                                                                       │
│  UPDATED HOLDINGS:                                                   │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Total Gold Holdings:  5.173 grams (Updated!)             │      │
│  │ Current Value:        ₹85,090                            │      │
│  │ Total Gain/Loss:      +₹2,090 (+2.52%)                  │      │
│  └──────────────────────────────────────────────────────────┘      │
│                                                                       │
│  TRANSACTION HISTORY (New entry added):                              │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │ Date       │ Type │ Quantity  │ Amount  │ Status         │      │
│  │────────────┼──────┼───────────┼─────────┼────────────────│      │
│  │ 2024-01-15 │ SELL │ 0.061 g   │ ₹980    │ Completed ✓   │ NEW! │
│  │ 2024-01-15 │ Buy  │ 0.061 g   │ ₹1,000  │ Completed     │      │
│  │ 2024-01-10 │ Buy  │ 0.305 g   │ ₹5,000  │ Completed     │      │
│  └──────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘

```

---

## 📝 Data Flow Summary

### Step 1 → Step 2: Entry to Sell Gold
```javascript
// User clicks "Sell Gold" button
navigate('/sell-gold')
```

### Step 2 → Step 3: Sell Gold to Sell Summary
```javascript
{
  amount: "1000",              // User entered amount
  sellMode: "rupees",          // Selected mode (rupees/grams)
  sellRate: 16350,             // Current sell rate (₹100 less than buy)
  availableGold: 5.234,        // User's total gold balance
  lockedAt: "2024-01-15T10:30:00.000Z"  // Timestamp for price lock
}
```

### Step 3 → Step 4: Sell Summary to Bank Account
```javascript
{
  grams: "0.061",              // Calculated gold quantity
  rupees: "1000.00",           // Gross value
  processingFee: "10.00",      // 1% processing fee
  tds: "10.00",                // 1% TDS deduction
  finalAmount: "980.00",       // Net payout to user
  sellRate: 16350              // Locked sell rate
}
```

### Step 4 → Step 5: Bank Account to Processing
```javascript
{
  ...sellData,                 // All previous sell data
  bankDetails: {
    accountHolder: "JOHN DOE",
    bankName: "State Bank of India",
    accountNumber: "1234XXXX5678",  // Masked for security
    ifscCode: "SBIN0001234"
  }
}
```

### Step 5 → Step 6: Processing to Success
```javascript
// Auto-redirect after 3 seconds
// All data from previous steps available
```

### Step 6 → Step 7: Success to Portfolio
```javascript
// Navigate to portfolio with updated holdings
navigate('/portfolio')
```

---

## ⚙️ Key Features

### 1. Real-time Price Updates
- Sell rate updates every 5 seconds
- ±₹50 random variation to simulate market
- Always ₹100 less than buy rate

### 2. Price Lock Mechanism
- **Duration**: 3 minutes (180 seconds)
- **Warning**: Shows warning when < 30 seconds
- **Expiry**: Shows "Get Fresh Price" button
- **Visual**: Countdown timer in header

### 3. Balance Validation
- Checks against available gold (5.234g)
- Shows specific error messages
- Real-time validation as user types
- Prevents overselling

### 4. Fee Calculation
- **Processing Fee**: 1% of gross value
- **TDS**: 1% of gross value
- **Net Payout**: Gross - Processing - TDS
- All fees shown transparently

### 5. Bank Account Security
- Searchable dropdown with 30+ banks
- IFSC code format validation
- Account number masking
- Confirmation field to prevent typos
- Encrypted storage messaging

### 6. Empty State Handling
- If user has 0 gold balance
- Shows empty state card
- "Buy Gold Now" CTA
- Prevents sell attempt

---

## 🎯 User Experience Highlights

### Visual Feedback
✅ Live rate updates with "LIVE" indicator  
✅ Real-time conversion display  
✅ Price lock countdown timer  
✅ Processing animation  
✅ Success confirmation with checkmark  

### Error Handling
✅ Minimum amount validation (₹100)  
✅ Insufficient balance errors  
✅ Form field validation  
✅ Terms acceptance required  
✅ Price expiry handling  

### Trust Building
✅ T+1 settlement information  
✅ Bank-grade security messaging  
✅ Transparent fee breakdown  
✅ RBI compliance indicators  
✅ Encrypted data storage  

### Navigation
✅ Back buttons on every step  
✅ Clear progress indication  
✅ Multiple exit points  
✅ Smooth transitions  

---

## 🔐 Security Features

1. **Account Number Masking**: Shows only first 4 and last 4 digits
2. **IFSC Validation**: Ensures correct format (XXXX0XXXXXX)
3. **Confirmation Field**: Prevents account number typos
4. **Encrypted Storage**: Bank details encrypted messaging
5. **Secure Processing**: Full-screen processing view

---

## 📱 Responsive Design

- Desktop-first approach
- Two-column layout on desktop
- Single column on mobile (< 768px)
- Sticky elements become static on mobile
- Touch-friendly buttons and inputs

---

## ⏱️ Timing & Delays

| Step | Duration | Purpose |
|------|----------|---------|
| Price Lock | 180 seconds | Lock sell rate |
| Processing | 3 seconds | Simulate transaction |
| Auto-redirect | Immediate | Smooth flow |

---

## 🎨 UI Components

### Sell Gold Page
- Hero section with live rate
- Two-column layout
- Mode toggle (₹/grams)
- Input with conversion
- Quick amount chips
- Trust badges
- Important information box

### Sell Summary Page
- Price lock timer
- Warning banner
- Sell details card
- Payout breakdown
- Terms checkbox
- Confirm button

### Bank Account Page
- Searchable bank dropdown
- Form with validation
- Security indicators
- Submit button

### Processing Page
- Animated spinner
- Progress steps
- Loading message

### Success Page
- Success icon
- Transaction summary
- Action buttons
- Updated balance

---

## 🚀 Complete Flow Time

**Estimated Time**: 2-5 minutes
- Sell Gold: 30-60 seconds
- Sell Summary: 30-60 seconds (with 3-min timer)
- Bank Account: 60-120 seconds
- Processing: 3 seconds
- Success: Review time

---

## 📊 State Management

All data flows through `App.tsx`:
```typescript
const [transactionData, setTransactionData] = useState<any>(null);

const handleDataPass = (data: any) => {
  setTransactionData(data);
};
```

Each component receives:
- `sellData`: Previous step data
- `onDataPass`: Function to pass data forward

---

## ✅ Validation Rules

### Sell Gold Page
- Minimum: ₹100
- Maximum: Available balance
- Numeric input only
- Real-time conversion

### Sell Summary Page
- Terms must be accepted
- Price must be locked
- 3-minute timer active

### Bank Account Page
- Bank name: Required
- Account holder: Min 3 chars
- IFSC: 11 chars, format XXXX0XXXXXX
- Account number: 9-18 digits
- Confirm account: Must match

---

This is your complete Sell Gold flow! 🎉
