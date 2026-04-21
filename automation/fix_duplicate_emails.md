# 🔧 Fix: Customer Receiving 2 Emails

## Problem

Customer receives:
1. ❌ First email: Confirmation (without PDF)
2. ❌ Second email: Another confirmation (maybe with PDF)

**Should receive:** Only ONE email with PDF attached

---

## 🎯 Root Cause

You likely have **TWO Google Apps Scripts** running:
1. **Old script** - Sends confirmation email (no PDF)
2. **New script** - Sends confirmation email with PDF

Both are triggered when the form submits!

---

## ✅ Solution

### Step 1: Check Your Google Apps Script

1. Open Google Sheet
2. Extensions → Apps Script
3. **Look at the file list** on the left

**Do you see multiple files?**
- `Code.gs`
- `BillingEmail.gs`
- Other files?

### Step 2: Identify Which Script is Active

The form action URL in `index.html` points to:
```
https://script.google.com/macros/s/AKfycbwqQR1QWSHUctYNouVKVPYTg7T7lq0N_NqDf71NVj4Yyks_nEEaD_XWI8AhkjTpaojiFw/exec
```

This URL corresponds to **ONE deployment** of your script.

### Step 3: Replace ALL Code

**IMPORTANT:** Replace ALL code in your Google Apps Script with the updated version.

1. In Google Apps Script, select `Code.gs`
2. **Delete ALL existing code**
3. Copy the entire `COMPLETE_GOOGLE_SCRIPT_WITH_PDF.js`
4. Paste it
5. **Delete any other files** (like `BillingEmail.gs` if it exists)
6. Save

### Step 4: Update Configuration

```javascript
var SHEET_URL = 'YOUR_ACTUAL_SHEET_URL';
var ADMIN_EMAIL = 'YOUR_ACTUAL_EMAIL';
```

### Step 5: Deploy New Version

1. Click **Deploy** → **Manage deployments**
2. Click **Edit** (✏️) on existing deployment
3. **New version**
4. **Deploy**
5. The URL should stay the same (matches your form)

---

## 🧪 Test

### Test 1: Check Executions

1. Submit test form
2. Go to Apps Script → **Executions** (left sidebar)
3. Click on latest execution
4. **Check logs:**

**Should see:**
```
✅ Admin email sent with PDF attachment
✅ Confirmation email sent with PDF attachment
```

**Should NOT see duplicate logs**

### Test 2: Check Email

Customer should receive **ONLY ONE email:**

```
From: JUST A SECOND
To: customer@email.com
Subject: תודה! קיבלנו את הטופס שלך

Body:
שלום [Name], תודה! קיבלנו את הפרטים.
[Summary table]
בברכה,
JUST A SECOND

📎 Attachment: הצעת_מחיר_JUST_A_SECOND.pdf
```

---

## 🔍 Debug: Why 2 Emails?

### Possibility 1: Multiple doPost Functions

Check if your script has TWO `doPost` functions:

```javascript
function doPost(e) {  // ← First one
  // ...
}

// ... more code ...

function doPost(e) {  // ← Second one (DUPLICATE!)
  // ...
}
```

**Fix:** Keep only ONE `doPost` function

### Possibility 2: Old Billing Script Still Active

If you have `billing_email_script.js` code mixed with the main script:

```javascript
// Main doPost
function doPost(e) {
  // Sends confirmation email
}

// Billing function (separate)
function sendBillingEmail(formData) {
  // Sends billing email
}
```

**Fix:** Use the complete script that combines both

### Possibility 3: Multiple Deployments

Check if you have multiple deployments pointing to the same form:

1. Apps Script → **Deploy** → **Manage deployments**
2. Do you see multiple active deployments?
3. **Disable old ones**, keep only the latest

---

## ✅ Correct Setup

### One Script File: `Code.gs`

```javascript
// Configuration
var SHEET_URL = '...';
var ADMIN_EMAIL = '...';

// Billing config
const BILLING_CONFIG = { ... };

// Main function
function doPost(e) {
  // Save to sheet
  // Generate PDF
  // Send admin email + PDF
  // Send customer email + PDF  ← Only ONE email to customer
  // Return success
}

// PDF functions
function createBillingPDF(formData) { ... }
function calculateBilling(formData) { ... }
function createBillingHTMLForPDF(formData, billing) { ... }

// Helper functions
function esc(str) { ... }
function buildSummary(p, activities) { ... }

// Test function
function testBillingPDF() { ... }
```

### One Deployment

- **Active:** Latest version with PDF
- **Inactive:** All old versions

### One Form Action URL

```html
<form action="https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec">
```

---

## 📧 Expected Email Flow

```
Customer submits form
         ↓
Google Apps Script (ONE script)
         ↓
├─ Save to Sheets
├─ Generate PDF
├─ Send to Admin (with PDF)
└─ Send to Customer (with PDF)  ← ONLY ONE EMAIL
         ↓
Customer receives ONE email with PDF
```

---

## 🎯 Checklist

- [ ] Only ONE `Code.gs` file in Apps Script
- [ ] No other files (delete `BillingEmail.gs` if exists)
- [ ] Only ONE `doPost` function in the code
- [ ] Only ONE active deployment
- [ ] Form action URL matches active deployment
- [ ] Test shows only ONE email sent to customer
- [ ] Email has PDF attached

---

## 💡 Quick Fix

If still receiving 2 emails:

### Option 1: Start Fresh

1. **Delete ALL files** in Google Apps Script
2. Create new `Code.gs`
3. Paste `COMPLETE_GOOGLE_SCRIPT_WITH_PDF.js`
4. Update config
5. Deploy as NEW deployment
6. Update form action URL

### Option 2: Check Triggers

1. Apps Script → **Triggers** (left sidebar, clock icon)
2. Do you see any triggers?
3. **Delete all triggers** (we don't need them for form submissions)

---

## 🆘 Still Having Issues?

### Check Execution Logs

1. Submit form
2. Apps Script → **Executions**
3. Look for **duplicate executions** at same timestamp
4. If you see 2 executions → You have 2 scripts running

### Check Email Headers

In the duplicate emails, check the "From" field:
- Are they from different sender addresses?
- Are they sent at slightly different times?

This will help identify which script is sending which email.

---

## ✅ Success Criteria

After fix:

- ✅ Customer receives **exactly 1 email**
- ✅ Email has **PDF attached**
- ✅ PDF matches your image design
- ✅ Admin receives 1 email with PDF
- ✅ No duplicate executions in logs

---

**File to use:** `COMPLETE_GOOGLE_SCRIPT_WITH_PDF.js`  
**Action:** Replace ALL code in Google Apps Script  
**Result:** Only ONE email to customer with PDF! ✅
