# 🚀 Billing Email - Quick Start Guide

## 5-Minute Setup

Get automated billing emails working in 5 minutes!

---

## ✅ Prerequisites

- Google Sheet with form responses
- Google Apps Script access
- Customer email addresses in your form

---

## 📝 Step-by-Step Setup

### Step 1: Open Google Apps Script (1 min)

1. Open your Google Sheet
2. Click **Extensions** → **Apps Script**
3. You should see your existing code

### Step 2: Add Billing Script (2 min)

1. Click the **+** button next to "Files"
2. Name it: `BillingEmail.gs`
3. Copy **ALL** content from `billing_email_script.js`
4. Paste into the new file
5. Click **Save** (💾)

### Step 3: Update doPost Function (1 min)

Find your `doPost` function and add ONE line:

```javascript
function doPost(e) {
  try {
    const formData = e.parameter;
    
    // Your existing code to save to sheets
    // ...
    
    // ✨ ADD THIS LINE:
    sendBillingEmail(formData);
    
    // Your existing return statement
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error);
  }
}
```

### Step 4: Test It! (1 min)

1. Find the `testBillingEmail()` function
2. Click **Run** (▶️)
3. Authorize if prompted
4. Check your email!

---

## 🎯 What You'll Get

### Email Preview

**Subject:** הצעת מחיר | הרשאה חוזית מיידית עם תרומה - JUST A SECOND

**Content:**
- Beautiful orange gradient header with logo
- Customer details (name, org, date, participants)
- Itemized invoice table
- Automatic 20% discount
- Final total in large text
- Bank payment details
- Contact information

---

## 💰 Example Invoice

**15 Participants:**

| Item | Qty | Price/Unit | Total |
|------|-----|------------|-------|
| Tour & Lecture | 15 | Free | Free |
| Workshop | 15 | ₪2,400 | ₪36,000 |
| Gift (Rota) | 15 | ₪60 | ₪900 |
| Light Catering | 15 | ₪40 | ₪600 |

```
Subtotal:        ₪37,500
Discount (20%):  -₪7,500
─────────────────────────
TOTAL:           ₪30,000
```

---

## ⚙️ Configuration (Optional)

### Change Prices

In `BillingEmail.gs`, find `BILLING_CONFIG.PRICING`:

```javascript
PRICING: {
  tour: {
    pricePerPerson: 0,  // Free
  },
  workshop_team: {
    pricePerPerson: 2400,  // Change this
  },
  gift_60: {
    pricePerPerson: 60,  // Change this
  },
  catering_light: {
    pricePerPerson: 40,  // Change this
  }
}
```

### Change Discount

```javascript
DISCOUNT_PERCENTAGE: 20,  // Change to 15, 25, etc.
```

### Update Bank Details

```javascript
PAYMENT_INFO: {
  accountNumber: '580138122',  // Your account
  bankName: 'בנק הפועלים',      // Your bank
  branch: '549',                // Your branch
  beneficiary: 'JUST A SECOND'  // Your name
}
```

---

## 🧪 Testing

### Test with Sample Data

Run `testBillingEmail()` - it will send to your email with:
- 15 participants
- Tour + Workshop + Gift + Catering
- Expected total: ₪30,800

### Test with Real Form

1. Submit a test form
2. Check customer email
3. Verify calculations are correct

---

## 🔍 Troubleshooting

### Email Not Received?

**Check 1: Permissions**
- Apps Script → Run → Review Permissions
- Allow Gmail sending

**Check 2: Email Address**
- Verify `contact_email` field exists
- Check for typos

**Check 3: Logs**
- Apps Script → Executions (left sidebar)
- Look for errors

### Wrong Prices?

**Check Field Names:**
- Form fields must match exactly:
  - `activities`
  - `gift`
  - `catering`
  - `visit_people`

**Check Activity Text:**
- Script looks for specific Hebrew text
- Example: `'סיור והרצאת השראה'`

### Email Looks Broken?

**Test in Different Clients:**
- Gmail ✅
- Outlook ✅
- Mobile ✅

---

## 📊 How It Calculates

### Automatic Detection

The script automatically detects:

1. **Activities** - from `activities` field
   - Looks for keywords like "סיור", "סדנה", etc.
   
2. **Gift** - from `gift` field
   - "60 ש"ח" → ₪60 per person
   - "קופסה ייעודית" → uses `gift_budget` field
   
3. **Catering** - from `catering` field
   - "40 ש"ח" → ₪40 per person
   - "60 ש"ח" → ₪60 per person

4. **Participants** - from `visit_people` field
   - Multiplies prices by this number

5. **Discount** - automatic
   - Always 20% off subtotal

---

## 🎨 Customization Examples

### Example 1: Change Email Subject

```javascript
SUBJECT: 'חשבונית - JUST A SECOND',
```

### Example 2: Add New Service

```javascript
PRICING: {
  // ... existing services
  new_service: {
    name: 'שירות חדש',
    description: 'תיאור השירות',
    pricePerPerson: 100,
    unit: 'למשתתף'
  }
}
```

Then in `calculateBilling()`:

```javascript
if (activities.includes('שירות חדש')) {
  const price = BILLING_CONFIG.PRICING.new_service.pricePerPerson;
  const total = price * numPeople;
  items.push({
    name: BILLING_CONFIG.PRICING.new_service.name,
    description: BILLING_CONFIG.PRICING.new_service.description,
    quantity: numPeople,
    pricePerUnit: price,
    total: total
  });
  subtotal += total;
}
```

### Example 3: Change Company Info

```javascript
COMPANY: {
  name: 'YOUR COMPANY',
  tagline: 'Your tagline',
  phone: '050-1234567',
  website: 'yoursite.com',
  instagram: '/yourhandle'
}
```

---

## 📧 Email Flow

```
Customer submits form
         ↓
Google Apps Script receives data
         ↓
Saves to Google Sheets
         ↓
Calls sendBillingEmail(formData)
         ↓
Calculates prices & discount
         ↓
Generates HTML email
         ↓
Sends via Gmail
         ↓
Customer receives beautiful invoice!
```

---

## ✨ Features

- ✅ **Automatic Calculation** - No manual work
- ✅ **Professional Design** - Orange gradient, modern layout
- ✅ **Mobile Responsive** - Looks great on all devices
- ✅ **Hebrew Support** - RTL text, Hebrew fonts
- ✅ **Itemized Invoice** - Clear breakdown of costs
- ✅ **Payment Details** - Bank info included
- ✅ **Brand Consistent** - Matches JUST A SECOND style
- ✅ **Error Handling** - Graceful failures, logs errors

---

## 🎯 Success Checklist

- [ ] Script added to Google Apps Script
- [ ] `doPost` updated with `sendBillingEmail()` call
- [ ] Test email sent successfully
- [ ] Test form submission completed
- [ ] Customer received email
- [ ] Prices are correct
- [ ] Discount calculated properly
- [ ] Bank details are correct
- [ ] Email displays well on mobile

---

## 📞 Need Help?

1. Check `BILLING_EMAIL_SETUP.md` for detailed guide
2. Check `PRICING_REFERENCE.md` for pricing structure
3. View Apps Script logs: Executions → View logs
4. Test function: `testBillingEmail()`

---

## 🚀 You're Done!

Your billing automation is now live! Every form submission will automatically send a professional invoice to the customer.

**Next Steps:**
1. Monitor first few emails
2. Gather customer feedback
3. Adjust prices if needed
4. Enjoy automated billing! 🎉

---

**Created for JUST A SECOND 🏡**
*Automated billing made simple*
