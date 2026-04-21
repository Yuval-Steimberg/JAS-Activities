# 💰 Payment Configuration Guide

## Where to Change Everything

All payment calculations and data are in **ONE place** at the top of your Google Apps Script.

---

## 📍 Location

**File:** `Code.gs` (in Google Apps Script)

**Section:** `BILLING_CONFIG` (lines 15-80 approximately)

---

## 🎯 What You Can Change

### 1. Pricing for Each Service

```javascript
PRICING: {
  tour: {
    name: 'סיור והרצאת השראה',
    description: 'סיור והרצאת השראה בחנם...',
    priceTotal: 1000,        // ← CHANGE THIS: Total price for tour
    participants: 15,         // ← CHANGE THIS: Number of participants
    note: 'בשעה וחצי - שעתיים'
  },
  
  workshop_team: {
    name: '"יום בחיי JAS - סדנת מיחדוש ותרומה לקהילה"',
    description: 'בסדנא תלכדו כיחד...',
    pricePerPerson: 2400,    // ← CHANGE THIS: Price per person
    participants: 15,         // ← CHANGE THIS: Number of participants
    maxPrice: 1500,          // ← CHANGE THIS: Maximum price per person
    note: '15 ש"ח (מקסימום 1,500 למשתתף)',
    additionalNote: 'בשעה וחצי - שעתיים'
  },
  
  option: {
    name: 'אופציה - כיבוד קל ושתיה חמה',
    description: 'ככלל מבחר עוגות...',
    pricePerPerson: 1500,    // ← CHANGE THIS: Price per person
    participants: 30,         // ← CHANGE THIS: Number of participants
    priceRange: '15 ש"ח ל 30 ש"ח',
    note: 'בשעה וחצי - שעתיים'
  }
}
```

---

### 2. Discount Percentage

```javascript
DISCOUNT_PERCENTAGE: 20,     // ← CHANGE THIS: Discount % (20 = 20%)
DISCOUNT_NOTE: 'פחות 20% הנחה',  // ← CHANGE THIS: Display text
```

**Examples:**
- `DISCOUNT_PERCENTAGE: 15,` → 15% discount
- `DISCOUNT_PERCENTAGE: 25,` → 25% discount
- `DISCOUNT_PERCENTAGE: 0,` → No discount

---

### 3. Bank Payment Information

```javascript
PAYMENT_INFO: {
  accountNumber: '580138122',    // ← CHANGE THIS: Your account number
  bankName: 'בנק הפועלים',        // ← CHANGE THIS: Your bank name
  branch: '549'                  // ← CHANGE THIS: Your branch number
}
```

---

### 4. Contact Information

```javascript
CONTACT: {
  instagram: '/justasecondil',   // ← CHANGE THIS: Your Instagram handle
  website: 'justasecond.co.il',  // ← CHANGE THIS: Your website
  phone: '058-787-6549',         // ← CHANGE THIS: Your phone number
  tagline: 'צרו קשר'             // ← CHANGE THIS: Contact tagline
}
```

---

### 5. Text Content

```javascript
// Opening paragraph
OPENING_PARAGRAPH: 'עבור א.ב. דרוש ניהול פרויקטים הסכמים בע"מ',

// Customer section
CUSTOMER_SECTION_TITLE: 'קצת עלינו',
CUSTOMER_SECTION_TEXT: 'JUST A SECOND הוא מרחב סביבתי-חברתי...',

// Payment note
PAYMENT_NOTE: 'נפשי לכוחות ש/ח.    מועד תחילתן – 25-12-25 | מספר משתתפים – 15',

// Footer notes
FOOTER_NOTES: [
  '* משתתפים סדנא תשלום מסכם ב 580138122',
  '* לשאלות סדנא תשלום תקציב 10% הנחה לרכישת בתוכנה'
]
```

---

## 📊 Example: Change All Prices

### Scenario: Increase all prices by 10%

**Before:**
```javascript
PRICING: {
  tour: {
    priceTotal: 1000,
  },
  workshop_team: {
    pricePerPerson: 2400,
  },
  option: {
    pricePerPerson: 1500,
  }
}
```

**After:**
```javascript
PRICING: {
  tour: {
    priceTotal: 1100,        // Was 1000, now +10%
  },
  workshop_team: {
    pricePerPerson: 2640,    // Was 2400, now +10%
  },
  option: {
    pricePerPerson: 1650,    // Was 1500, now +10%
  }
}
```

---

## 🔢 How Calculations Work

### Tour Price
```javascript
Total = priceTotal (flat rate)
Example: ₪1,000 (doesn't multiply by participants)
```

### Workshop Price
```javascript
Total = pricePerPerson × participants
Example: ₪2,400 × 15 = ₪36,000
```

### Option Price
```javascript
Total = pricePerPerson × participants
Example: ₪1,500 × 30 = ₪45,000
```

### Subtotal
```javascript
Subtotal = Tour + Workshop + Option
Example: ₪1,000 + ₪36,000 + ₪45,000 = ₪82,000
```

### Discount
```javascript
Discount = Subtotal × (DISCOUNT_PERCENTAGE / 100)
Example: ₪82,000 × 0.20 = ₪16,400
```

### Final Total
```javascript
Final = Subtotal - Discount
Example: ₪82,000 - ₪16,400 = ₪65,600
```

---

## 🎯 Quick Change Examples

### Example 1: Change Tour Price to ₪1,500

```javascript
tour: {
  priceTotal: 1500,  // Changed from 1000
}
```

### Example 2: Change Workshop Price to ₪3,000

```javascript
workshop_team: {
  pricePerPerson: 3000,  // Changed from 2400
}
```

### Example 3: Change Discount to 15%

```javascript
DISCOUNT_PERCENTAGE: 15,  // Changed from 20
DISCOUNT_NOTE: 'פחות 15% הנחה',  // Update text too
```

### Example 4: Change Bank Account

```javascript
PAYMENT_INFO: {
  accountNumber: '123456789',  // Your new account
  bankName: 'בנק לאומי',        // Your bank
  branch: '123'                 // Your branch
}
```

### Example 5: Add New Service

```javascript
PRICING: {
  tour: { ... },
  workshop_team: { ... },
  option: { ... },
  
  // NEW SERVICE
  new_service: {
    name: 'שירות חדש',
    description: 'תיאור השירות החדש',
    pricePerPerson: 500,
    participants: 20,
    note: 'הערה'
  }
}
```

**Then add to calculation function:**
```javascript
// In calculateBilling function, add:
var newServicePrice = BILLING_CONFIG.PRICING.new_service.pricePerPerson;
var newServiceTotal = newServicePrice * BILLING_CONFIG.PRICING.new_service.participants;
items.push({
  name: BILLING_CONFIG.PRICING.new_service.name,
  description: BILLING_CONFIG.PRICING.new_service.description,
  participants: BILLING_CONFIG.PRICING.new_service.participants,
  pricePerUnit: newServicePrice,
  total: newServiceTotal,
  note: BILLING_CONFIG.PRICING.new_service.note
});
subtotal += newServiceTotal;
```

---

## 📝 Step-by-Step: How to Change Prices

### Step 1: Open Google Apps Script
1. Open your Google Sheet
2. Extensions → Apps Script

### Step 2: Find BILLING_CONFIG
1. Look for `const BILLING_CONFIG = {` (around line 15)
2. This section contains ALL payment settings

### Step 3: Change Values
1. Find the price you want to change
2. Change the number
3. Update any related text if needed

### Step 4: Save
1. Click **Save** (💾)
2. No need to redeploy!

### Step 5: Test
1. Run `testBillingPDF()`
2. Check the PDF
3. Verify calculations are correct

---

## 🔍 Find Specific Settings

### To Change Tour Price
**Search for:** `tour: {`
**Line:** ~30
**Change:** `priceTotal: 1000,`

### To Change Workshop Price
**Search for:** `workshop_team: {`
**Line:** ~37
**Change:** `pricePerPerson: 2400,`

### To Change Option Price
**Search for:** `option: {`
**Line:** ~46
**Change:** `pricePerPerson: 1500,`

### To Change Discount
**Search for:** `DISCOUNT_PERCENTAGE:`
**Line:** ~56
**Change:** `DISCOUNT_PERCENTAGE: 20,`

### To Change Bank Details
**Search for:** `PAYMENT_INFO: {`
**Line:** ~63
**Change:** Account number, bank name, branch

### To Change Contact Info
**Search for:** `CONTACT: {`
**Line:** ~69
**Change:** Instagram, website, phone

---

## 💡 Pro Tips

### Tip 1: Keep Backup
Before changing, copy the original values to a comment:
```javascript
pricePerPerson: 2400,  // Original: 2400
```

### Tip 2: Test After Changes
Always run `testBillingPDF()` after making changes

### Tip 3: Update Display Text
If you change prices, update the notes too:
```javascript
pricePerPerson: 3000,  // Changed price
note: '15 ש"ח (מקסימום 2,000 למשתתף)',  // Update note
```

### Tip 4: Use Comments
Add comments to remember why you changed something:
```javascript
pricePerPerson: 2640,  // Increased 10% for 2025
```

### Tip 5: Seasonal Pricing
Create different configs for different seasons:
```javascript
// Summer pricing
const SUMMER_PRICING = { ... };

// Winter pricing
const WINTER_PRICING = { ... };

// Use current season
const BILLING_CONFIG = SUMMER_PRICING;
```

---

## 🧪 Testing Your Changes

### Test Checklist

After changing prices:

- [ ] Save the script
- [ ] Run `testBillingPDF()`
- [ ] Open the PDF attachment
- [ ] Verify prices are correct
- [ ] Check subtotal calculation
- [ ] Check discount calculation
- [ ] Check final total
- [ ] Verify all text updated
- [ ] Test with real form submission

---

## 📊 Calculation Examples

### Example 1: Default Prices

**Input:**
- Tour: ₪1,000
- Workshop: ₪2,400 × 15 = ₪36,000
- Option: ₪1,500 × 30 = ₪45,000

**Calculation:**
```
Subtotal:     ₪82,000
Discount 20%: -₪16,400
Final Total:  ₪65,600
```

### Example 2: Increased Prices

**Input:**
- Tour: ₪1,500 (increased)
- Workshop: ₪3,000 × 15 = ₪45,000 (increased)
- Option: ₪2,000 × 30 = ₪60,000 (increased)

**Calculation:**
```
Subtotal:     ₪106,500
Discount 20%: -₪21,300
Final Total:  ₪85,200
```

### Example 3: Lower Discount

**Input:**
- Tour: ₪1,000
- Workshop: ₪2,400 × 15 = ₪36,000
- Option: ₪1,500 × 30 = ₪45,000
- Discount: 10% (changed from 20%)

**Calculation:**
```
Subtotal:     ₪82,000
Discount 10%: -₪8,200
Final Total:  ₪73,800
```

---

## 🎯 Common Changes

### Change 1: Seasonal Discount
```javascript
// Winter: 20% discount
DISCOUNT_PERCENTAGE: 20,

// Summer: 15% discount
DISCOUNT_PERCENTAGE: 15,
```

### Change 2: Group Size Pricing
```javascript
// Small groups (10-15)
pricePerPerson: 2400,

// Large groups (30+)
pricePerPerson: 2000,
```

### Change 3: Premium Package
```javascript
workshop_team: {
  name: 'חבילה פרימיום',
  pricePerPerson: 3500,  // Premium price
  maxPrice: 2500,
}
```

---

## 📞 Need Help?

If you're unsure about a change:

1. **Test first** - Use `testBillingPDF()` to see results
2. **Check logs** - Apps Script → Executions
3. **Verify math** - Use calculator to check totals
4. **Ask questions** - Better to ask than break it!

---

## ✅ Summary

**All payment settings are in ONE place:**

```javascript
const BILLING_CONFIG = {
  // Prices ← Change here
  PRICING: { ... },
  
  // Discount ← Change here
  DISCOUNT_PERCENTAGE: 20,
  
  // Bank details ← Change here
  PAYMENT_INFO: { ... },
  
  // Contact info ← Change here
  CONTACT: { ... }
}
```

**Location:** Top of `Code.gs` in Google Apps Script

**After changes:** Save → Test → Done! ✅

---

**File:** `COMPLETE_GOOGLE_SCRIPT_WITH_PDF.js`  
**Section:** `BILLING_CONFIG` (lines 15-80)  
**Test function:** `testBillingPDF()`
