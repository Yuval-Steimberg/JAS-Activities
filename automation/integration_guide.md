# 🔗 Integration Guide - Adding Billing to Your Existing doPost

## Overview

This guide shows you how to integrate the billing email system into your existing `doPost` function.

---

## 📋 What You Need

1. Your existing Google Apps Script with `doPost` function
2. The `billing_email_script.js` file
3. 5 minutes

---

## 🚀 Step-by-Step Integration

### Step 1: Add the Billing Script (2 minutes)

1. **Open Google Apps Script**
   - Open your Google Sheet
   - Extensions → Apps Script

2. **Create New File**
   - Click the **+** button next to "Files"
   - Name it: `BillingEmail.gs`

3. **Copy the Code**
   - Open `billing_email_script.js`
   - Copy **ALL** the code
   - Paste into `BillingEmail.gs`
   - Click **Save** (💾)

### Step 2: Modify Your doPost Function (3 minutes)

Find this section in your existing `doPost` function:

```javascript
// Send admin email
try {
  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: 'New JAS submission' + (p.org_type ? ' – ' + p.org_type : ''),
    htmlBody: summary,
    name: 'JUST A SECOND'
  });
} catch (e1) {}
```

**Add this code RIGHT AFTER the admin email section:**

```javascript
// ✨ NEW: Send billing invoice email
try {
  // Prepare form data for billing function
  var formData = {
    contact_name: p.contact_name || '',
    contact_email: p.contact_email || '',
    org_exact_name: p.org_exact_name || '',
    org_type: p.org_type || '',
    visit_dates: p.visit_dates || '',
    visit_hours: p.visit_hours || '',
    visit_people: p.visit_people || '',
    activities: activities,
    gift: p.gift || '',
    gift_budget: p.gift_budget || '',
    catering: p.catering || ''
  };
  
  // Send billing email (from BillingEmail.gs)
  sendBillingEmail(formData);
  Logger.log('✅ Billing email sent successfully');
  
} catch (billingError) {
  // Don't fail the whole submission if billing email fails
  Logger.log('⚠️ Billing email error (non-critical): ' + billingError);
}
```

### Step 3: Save and Test

1. **Save Your Changes**
   - Click **Save** (💾)

2. **Test the Billing Function**
   - Find `testBillingEmail()` in `BillingEmail.gs`
   - Click **Run** (▶️)
   - Authorize if prompted
   - Check your email!

3. **Test Full Submission**
   - Submit a test form
   - Check customer email
   - Verify they received the billing invoice

---

## 📍 Exact Placement

Here's where to add the code in your `doPost` function:

```javascript
function doPost(e) {
  try {
    // ... your existing code ...
    
    sheet.appendRow(row);
    var summary = buildSummary(p, activities);
    
    // 1. Send admin email (YOUR EXISTING CODE)
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New JAS submission' + (p.org_type ? ' – ' + p.org_type : ''),
        htmlBody: summary,
        name: 'JUST A SECOND'
      });
    } catch (e1) {}
    
    // ✨ 2. ADD THIS NEW SECTION HERE ✨
    try {
      var formData = {
        contact_name: p.contact_name || '',
        contact_email: p.contact_email || '',
        org_exact_name: p.org_exact_name || '',
        org_type: p.org_type || '',
        visit_dates: p.visit_dates || '',
        visit_hours: p.visit_hours || '',
        visit_people: p.visit_people || '',
        activities: activities,
        gift: p.gift || '',
        gift_budget: p.gift_budget || '',
        catering: p.catering || ''
      };
      sendBillingEmail(formData);
      Logger.log('✅ Billing email sent successfully');
    } catch (billingError) {
      Logger.log('⚠️ Billing email error: ' + billingError);
    }
    
    // 3. Send user confirmation (YOUR EXISTING CODE)
    if (p.contact_email) {
      var displayName = p.contact_name || 'שלום';
      // ... rest of your code ...
    }
    
    return HtmlService.createHtmlOutput(...);
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err);
  }
}
```

---

## 🎯 What Happens Now

After integration, when a customer submits the form:

1. ✅ Data saved to Google Sheets (existing)
2. ✅ Admin receives summary email (existing)
3. ✨ **Customer receives billing invoice** (NEW!)
4. ✅ Customer receives confirmation email (existing)

**All automatic, all instant!**

---

## 🔍 Verification Checklist

After integration, verify:

- [ ] Code saved without errors
- [ ] `testBillingEmail()` runs successfully
- [ ] Test form submission works
- [ ] Customer receives billing email
- [ ] Billing calculations are correct
- [ ] Email displays properly on mobile
- [ ] Admin still receives summary email
- [ ] Customer still receives confirmation

---

## 🧪 Testing

### Test 1: Billing Function Only

```javascript
// In Google Apps Script
testBillingEmail()
```

**Expected:**
- Email sent to your address
- Subject: "הצעת מחיר | הרשאה חוזית מיידית עם תרומה"
- Total: ₪30,800 (for test data)

### Test 2: Full Form Submission

1. Submit test form with:
   - 15 participants
   - Tour + Workshop
   - Gift (₪60)
   - Light catering (₪40)

2. **Expected Results:**
   - Admin receives summary
   - Customer receives billing invoice
   - Customer receives confirmation
   - All calculations correct

---

## 🔧 Troubleshooting

### Issue: Billing email not sent

**Solution:**
1. Check Apps Script permissions
2. Verify `sendBillingEmail` function exists in `BillingEmail.gs`
3. Check execution logs: Apps Script → Executions

### Issue: Error in doPost

**Solution:**
1. Check syntax - make sure you copied the code correctly
2. Verify all curly braces match
3. Check logs for specific error message

### Issue: Wrong calculations

**Solution:**
1. Verify form field names match:
   - `contact_email`
   - `visit_people`
   - `activities`
   - `gift`
   - `catering`
2. Check `activities` variable is properly set

---

## 📊 Email Flow

```
Customer submits form
         ↓
doPost() receives data
         ↓
Save to Google Sheets
         ↓
Send admin summary email
         ↓
✨ Send billing invoice ✨ (NEW)
         ↓
Send customer confirmation
         ↓
Return success page
```

---

## 💡 Important Notes

### Error Handling

The billing email is wrapped in a try-catch block:

```javascript
try {
  sendBillingEmail(formData);
} catch (billingError) {
  Logger.log('⚠️ Billing email error: ' + billingError);
}
```

**Why?**
- If billing email fails, form submission still succeeds
- Customer still gets confirmation
- Admin still gets notified
- Error is logged for debugging

### Data Mapping

The code maps your form parameters to the billing function:

| Your Form Field | Billing Field |
|----------------|---------------|
| `p.contact_name` | `contact_name` |
| `p.contact_email` | `contact_email` |
| `p.org_exact_name` | `org_exact_name` |
| `p.visit_people` | `visit_people` |
| `activities` (variable) | `activities` |
| `p.gift` | `gift` |
| `p.catering` | `catering` |

---

## 🎨 Customization

### Change When Billing Email is Sent

**Option 1: Before confirmation email**
```javascript
// Admin email
// Billing email ← Current position
// Confirmation email
```

**Option 2: After confirmation email**
```javascript
// Admin email
// Confirmation email
// Billing email ← Move here
```

### Add Condition for Billing Email

Only send billing email for certain organization types:

```javascript
// Only send billing for companies
if (p.org_type === 'חברה עסקית' || p.org_type === 'עמותה') {
  sendBillingEmail(formData);
}
```

### Log More Information

```javascript
Logger.log('Sending billing to: ' + p.contact_email);
Logger.log('Participants: ' + p.visit_people);
Logger.log('Activities: ' + activities);
sendBillingEmail(formData);
Logger.log('Billing email sent successfully');
```

---

## 📝 Complete Modified doPost

See `doPost_modified.js` for the complete modified function with:
- ✅ All your existing functionality
- ✅ Billing email integration
- ✅ Proper error handling
- ✅ Detailed logging

---

## 🚀 Quick Reference

### Minimal Integration (Just 3 Lines!)

Add this after the admin email:

```javascript
var formData = {contact_name:p.contact_name||'',contact_email:p.contact_email||'',org_exact_name:p.org_exact_name||'',org_type:p.org_type||'',visit_dates:p.visit_dates||'',visit_hours:p.visit_hours||'',visit_people:p.visit_people||'',activities:activities,gift:p.gift||'',gift_budget:p.gift_budget||'',catering:p.catering||''};
try{sendBillingEmail(formData);Logger.log('✅ Billing sent');}catch(e){Logger.log('⚠️ Billing error: '+e);}
```

**That's it!** (But the expanded version is more readable)

---

## ✅ Success Criteria

After integration, you should have:

1. **Two Files in Apps Script:**
   - Your original file with `doPost` (modified)
   - New `BillingEmail.gs` file

2. **Three Emails Sent:**
   - Admin summary
   - Customer billing invoice
   - Customer confirmation

3. **Zero Errors:**
   - Check Apps Script → Executions
   - All green checkmarks

4. **Happy Customers:**
   - Professional invoice received
   - Clear pricing breakdown
   - Easy payment process

---

## 🎉 You're Done!

Your billing automation is now integrated and working!

**What happens now:**
- Every form submission automatically sends a billing invoice
- No manual work required
- Professional, accurate invoices every time

**Next steps:**
1. Monitor first few submissions
2. Gather customer feedback
3. Adjust prices if needed
4. Enjoy automation! 🚀

---

**Need help?** Check:
- `BILLING_EMAIL_SETUP.md` - Detailed setup
- `BILLING_QUICK_START.md` - Quick reference
- `README_BILLING.md` - Complete docs
- Apps Script Executions - View logs

---

**Built for JUST A SECOND 🏡**  
*Simple integration, powerful automation*
