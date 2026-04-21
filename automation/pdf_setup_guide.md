# 📄 PDF Billing Invoice - Setup Guide

## What's New

Instead of sending a separate HTML email, the billing invoice is now:
- ✅ Generated as a **PDF file**
- ✅ **Attached to the summary email** (not a separate email)
- ✅ Matches **exact design** from your image
- ✅ Includes **opening paragraph** and all sections

---

## 🎯 Changes Made

### Before:
- Admin receives summary email
- Customer receives billing HTML email (separate)
- Customer receives confirmation email

### After:
- Admin receives summary email **+ PDF attachment**
- Customer receives confirmation email **+ PDF attachment**
- **Only 2 emails instead of 3!**

---

## 📋 PDF Design (Matches Your Image)

### Header
- Orange circle logo (left)
- "JUST A SECOND" + tagline (right)

### Title
```
הצעת מחיר | הרשאה חוזית מיידית עם תרומה
Just a Second
```

### Opening Paragraph
```
עבור א.ב. דרוש ניהול פרויקטים הסכמים בע"מ
```

### "קצת עלינו" Section
Full paragraph about JUST A SECOND with orange border

### Payment Note
```
נפשי לכוחות ש/ח.    מועד תחילתן – 25-12-25 | מספר משתתפים – 15
```

### Invoice Table
| תיאור | תיאור | מספר משתתפים | מחיר בש"ח |
|-------|-------|-------------|-----------|
| סיור והרצאת השראה | [Full description] | 15 | 1,000 |
| "יום בחיי JAS..." | [Full description] | 15 | 2,400<br>15 ש"ח (מקסימום 1,500) |
| אופציה - כיבוד... | [Full description] | 30 | 1,500<br>15 ש"ח ל 30 ש"ח |
| **סה"כ** | | | **3,900** |

### Discount Row
```
פחות 20% הנחה = ₪4,900
Final: 3,900 (כולל כיבוד ושתייה)
```

### Footer Notes
```
* משתתפים סדנא תשלום מסכם ב 580138122
* לשאלות סדנא תשלום תקציב 10% הנחה לרכישת בתוכנה
```

### Contact Bar (Dark Gray)
```
📷 /justasecondil | 🌐 justasecond.co.il | 📞 058-787-6549 | צרו קשר
```

---

## 🚀 Installation

### Step 1: Replace Google Apps Script (2 min)

1. Open Google Apps Script
2. Select ALL code in `Code.gs`
3. Delete it
4. Copy ALL code from `COMPLETE_GOOGLE_SCRIPT_WITH_PDF.js`
5. Paste into `Code.gs`

### Step 2: Update Configuration (1 min)

```javascript
var SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';  // ← Change
var SHEET_NAME = 'Responses';                   // ← Verify
var ADMIN_EMAIL = 'YOUR_ADMIN_EMAIL_HERE';      // ← Change
```

### Step 3: Save & Deploy (1 min)

1. Click **Save** (💾)
2. Click **Deploy** → **Manage deployments**
3. Click **Edit** (✏️)
4. **New version**
5. **Deploy**

---

## 🧪 Test It

### Test Function

```javascript
testBillingPDF()
```

**What it does:**
- Creates PDF with test data
- Sends email to you with PDF attached
- Check your email!

**Expected:**
- Email received with PDF attachment
- PDF matches your image design
- All sections included

---

## 📧 What Customers Receive

### Email Subject
```
תודה! קיבלנו את הטופס שלך
```

### Email Body
```
שלום [Name], תודה! קיבלנו את הפרטים.

[Summary table]

בברכה,
JUST A SECOND
```

### Attachment
```
📎 הצעת_מחיר_JUST_A_SECOND.pdf
```

---

## 📊 Example Calculation

**15 participants:**

| Item | Participants | Price |
|------|-------------|-------|
| Tour | 15 | ₪1,000 |
| Workshop | 15 | ₪2,400 × 15 = ₪36,000 |
| Option | 30 | ₪1,500 × 30 = ₪45,000 |
| **Subtotal** | | **₪82,000** |
| **Discount (20%)** | | **-₪16,400** |
| **Final Total** | | **₪65,600** |

---

## 🎨 Design Features

### Matches Your Image:
- ✅ Orange circle logo
- ✅ Company name and tagline
- ✅ Opening paragraph
- ✅ "קצת עלינו" section with border
- ✅ Payment note line
- ✅ Table with 4 columns
- ✅ Dark gray header row
- ✅ Orange total row
- ✅ Discount calculation
- ✅ Footer notes
- ✅ Dark contact bar at bottom

### PDF Advantages:
- ✅ Professional format
- ✅ Easy to print
- ✅ Easy to forward to accounting
- ✅ Consistent formatting
- ✅ Can't be accidentally modified

---

## 🔍 Verify It Works

### Checklist:

- [ ] Code replaced in Google Apps Script
- [ ] Configuration updated
- [ ] Script saved
- [ ] New version deployed
- [ ] Test function runs successfully
- [ ] Test PDF received
- [ ] PDF design matches image
- [ ] Form submission works
- [ ] Customer receives email with PDF
- [ ] Admin receives email with PDF

---

## 💡 Customization

### Change Opening Paragraph

```javascript
OPENING_PARAGRAPH: 'Your custom text here',
```

### Change Customer Section

```javascript
CUSTOMER_SECTION_TITLE: 'קצת עלינו',
CUSTOMER_SECTION_TEXT: 'Your description here...',
```

### Change Payment Note

```javascript
PAYMENT_NOTE: 'Your payment note here',
```

### Change Footer Notes

```javascript
FOOTER_NOTES: [
  '* Your first note',
  '* Your second note'
],
```

### Change Contact Info

```javascript
CONTACT: {
  instagram: '/yourhandle',
  website: 'yoursite.com',
  phone: '050-1234567',
  tagline: 'צרו קשר'
}
```

---

## 🔧 Troubleshooting

### PDF not attached?

**Check 1: Permissions**
```
Apps Script → Run → Review Permissions
Allow all permissions
```

**Check 2: Logs**
```
Apps Script → Executions
Look for "PDF created" message
```

**Check 3: Email size**
```
PDF should be < 25MB
Check execution logs for errors
```

### PDF looks wrong?

**Check 1: HTML validity**
```
PDF is generated from HTML
Check createBillingHTMLForPDF function
```

**Check 2: Test function**
```
Run testBillingPDF()
Check if PDF opens correctly
```

### Wrong calculations?

**Check 1: Form data**
```
Verify visit_people field
Check activities field
```

**Check 2: Pricing config**
```
Verify BILLING_CONFIG.PRICING values
```

---

## 📱 Mobile Support

The PDF is designed to:
- ✅ Print well on A4 paper
- ✅ Display correctly on mobile
- ✅ Scale properly when zoomed
- ✅ Maintain Hebrew RTL layout

---

## 🎉 Benefits

### For You:
- ✅ Less emails to manage
- ✅ Professional PDF format
- ✅ Exact design match
- ✅ Easy to customize

### For Customers:
- ✅ One email instead of two
- ✅ PDF easy to save/print
- ✅ Professional appearance
- ✅ Clear pricing breakdown

### For Accounting:
- ✅ Standard PDF format
- ✅ Easy to file
- ✅ Print-ready
- ✅ All details included

---

## 📝 Summary

**What happens now:**

1. Customer submits form
2. Data saved to Google Sheets
3. PDF invoice generated
4. Admin receives: Summary email + PDF
5. Customer receives: Confirmation email + PDF
6. Done! ✅

**Total emails:** 2 (instead of 3)
**PDF design:** Matches your image exactly
**Automation:** 100% automatic

---

## 🚀 Next Steps

1. **Install** - Follow steps above
2. **Test** - Run `testBillingPDF()`
3. **Verify** - Check PDF design
4. **Deploy** - Update form action URL
5. **Go live!** - Start receiving automated invoices

---

**Need help?** Check execution logs in Google Apps Script for detailed error messages.

**File:** `COMPLETE_GOOGLE_SCRIPT_WITH_PDF.js`
**Test function:** `testBillingPDF()`
