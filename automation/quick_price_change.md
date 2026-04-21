# ⚡ Quick Price Change Reference

## 🎯 One-Page Guide

All prices are in **ONE section** at the top of your Google Apps Script.

---

## 📍 Exact Location

```javascript
// Line 15-80 in Code.gs

const BILLING_CONFIG = {
  
  PRICING: {
    
    // ═══════════════════════════════════════
    // TOUR PRICE (Flat Rate)
    // ═══════════════════════════════════════
    tour: {
      priceTotal: 1000,  // ← CHANGE THIS
      participants: 15,
    },
    
    // ═══════════════════════════════════════
    // WORKSHOP PRICE (Per Person)
    // ═══════════════════════════════════════
    workshop_team: {
      pricePerPerson: 2400,  // ← CHANGE THIS
      participants: 15,
      maxPrice: 1500,        // ← CHANGE THIS
    },
    
    // ═══════════════════════════════════════
    // OPTION PRICE (Per Person)
    // ═══════════════════════════════════════
    option: {
      pricePerPerson: 1500,  // ← CHANGE THIS
      participants: 30,
    }
  },
  
  // ═══════════════════════════════════════
  // DISCOUNT PERCENTAGE
  // ═══════════════════════════════════════
  DISCOUNT_PERCENTAGE: 20,  // ← CHANGE THIS (20 = 20%)
  
  // ═══════════════════════════════════════
  // BANK ACCOUNT DETAILS
  // ═══════════════════════════════════════
  PAYMENT_INFO: {
    accountNumber: '580138122',  // ← CHANGE THIS
    bankName: 'בנק הפועלים',      // ← CHANGE THIS
    branch: '549'                 // ← CHANGE THIS
  },
  
  // ═══════════════════════════════════════
  // CONTACT INFORMATION
  // ═══════════════════════════════════════
  CONTACT: {
    instagram: '/justasecondil',  // ← CHANGE THIS
    website: 'justasecond.co.il', // ← CHANGE THIS
    phone: '058-787-6549',        // ← CHANGE THIS
  }
}
```

---

## 🔢 Current Calculations

### Tour
```
Price: ₪1,000 (flat rate)
Does NOT multiply by participants
```

### Workshop
```
Price: ₪2,400 per person
Total: ₪2,400 × 15 people = ₪36,000
```

### Option
```
Price: ₪1,500 per person
Total: ₪1,500 × 30 people = ₪45,000
```

### Subtotal
```
₪1,000 + ₪36,000 + ₪45,000 = ₪82,000
```

### Discount
```
₪82,000 × 20% = ₪16,400
```

### Final Total
```
₪82,000 - ₪16,400 = ₪65,600
```

---

## ⚡ Quick Changes

### Change Tour to ₪1,500
```javascript
tour: {
  priceTotal: 1500,  // Was 1000
}
```

### Change Workshop to ₪3,000
```javascript
workshop_team: {
  pricePerPerson: 3000,  // Was 2400
}
```

### Change Discount to 15%
```javascript
DISCOUNT_PERCENTAGE: 15,  // Was 20
```

### Change Bank Account
```javascript
PAYMENT_INFO: {
  accountNumber: '123456789',  // Your account
  bankName: 'בנק לאומי',
  branch: '123'
}
```

---

## 🧪 Test After Changes

```javascript
testBillingPDF()
```

1. Run this function
2. Check your email
3. Open PDF attachment
4. Verify prices are correct

---

## 📊 Price Change Impact

### If you change Tour from ₪1,000 → ₪1,500:

**Before:**
```
Subtotal:  ₪82,000
Discount:  -₪16,400
Final:     ₪65,600
```

**After:**
```
Subtotal:  ₪82,500  (+₪500)
Discount:  -₪16,500  (+₪100)
Final:     ₪66,000  (+₪400)
```

### If you change Workshop from ₪2,400 → ₪3,000:

**Before:**
```
Subtotal:  ₪82,000
Discount:  -₪16,400
Final:     ₪65,600
```

**After:**
```
Subtotal:  ₪91,000  (+₪9,000)
Discount:  -₪18,200  (+₪1,800)
Final:     ₪72,800  (+₪7,200)
```

### If you change Discount from 20% → 15%:

**Before:**
```
Subtotal:  ₪82,000
Discount:  -₪16,400  (20%)
Final:     ₪65,600
```

**After:**
```
Subtotal:  ₪82,000  (same)
Discount:  -₪12,300  (15%)
Final:     ₪69,700  (+₪4,100)
```

---

## 🎯 Most Common Changes

### 1. Increase All Prices by 10%
```javascript
tour: { priceTotal: 1100 },           // 1000 × 1.10
workshop_team: { pricePerPerson: 2640 }, // 2400 × 1.10
option: { pricePerPerson: 1650 }      // 1500 × 1.10
```

### 2. Special Discount (30%)
```javascript
DISCOUNT_PERCENTAGE: 30,
```

### 3. Update Bank Account
```javascript
PAYMENT_INFO: {
  accountNumber: 'YOUR_NEW_ACCOUNT',
  bankName: 'YOUR_BANK',
  branch: 'YOUR_BRANCH'
}
```

---

## ✅ Checklist

After making changes:

- [ ] Save script (💾)
- [ ] Run `testBillingPDF()`
- [ ] Check email
- [ ] Open PDF
- [ ] Verify all prices
- [ ] Check calculations
- [ ] Test form submission

---

## 🚀 That's It!

**Everything is in ONE place:**
- Line 15-80 in `Code.gs`
- Section: `BILLING_CONFIG`
- Change → Save → Test → Done!

**Need detailed guide?** See `PAYMENT_CONFIGURATION_GUIDE.md`
