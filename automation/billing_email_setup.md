# 📧 Billing Email Automation Setup Guide

## Overview
This guide will help you set up automatic billing emails that are sent to customers after they submit the registration form. The email includes:
- Customer details
- Itemized activity breakdown with prices
- Automatic 20% discount calculation
- Total amount to pay
- Payment information (bank details)

## 🎯 What the Customer Receives

After submitting the form, the customer will receive an email with:

1. **Customer Information Section**
   - Contact name
   - Organization name
   - Visit date and hours
   - Number of participants

2. **Detailed Invoice Table**
   - Each activity/service selected
   - Quantity (number of people)
   - Price per person
   - Total per item

3. **Cost Summary**
   - Subtotal
   - 20% discount
   - Final total to pay

4. **Payment Information**
   - Bank account number
   - Bank name and branch
   - Beneficiary name

## 📋 Prerequisites

- Google Account with access to Google Sheets
- Google Apps Script project (already set up for your form)
- Active form submission endpoint

## 🚀 Installation Steps

### Step 1: Access Google Apps Script

1. Open your Google Sheet with form responses
2. Click **Extensions** → **Apps Script**
3. You should see your existing `doPost` function

### Step 2: Add Billing Script

1. In the Apps Script editor, create a new file:
   - Click the **+** button next to "Files"
   - Name it: `BillingEmail.gs`

2. Copy the entire content from `billing_email_script.js` and paste it into the new file

3. Click **Save** (💾 icon)

### Step 3: Integrate with Existing doPost Function

Find your existing `doPost` function and modify it to call the billing email function:

```javascript
function doPost(e) {
  try {
    const formData = e.parameter;
    
    // Honeypot check
    if (formData.website) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid submission'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Save to Google Sheets (your existing code)
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses');
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      formData.org_type || '',
      formData.org_exact_name || '',
      formData.contact_name || '',
      formData.contact_email || '',
      formData.contact_phone || '',
      formData.visit_dates || '',
      formData.visit_people || '',
      formData.activities || '',
      formData.gift || '',
      formData.catering || '',
      formData.gift_budget || ''
      // ... add more fields as needed
    ]);
    
    // ✨ NEW: Send billing email automatically
    sendBillingEmail(formData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Registration received and billing email sent'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 4: Configure Pricing (Optional)

If you need to adjust prices, edit the `BILLING_CONFIG.PRICING` section in the billing script:

```javascript
PRICING: {
  tour: {
    pricePerPerson: 0,  // Free tour
  },
  workshop_team: {
    pricePerPerson: 2400,  // ₪2,400 per person
  },
  gift_60: {
    pricePerPerson: 60,  // ₪60 per person
  },
  catering_light: {
    pricePerPerson: 40,  // ₪40 per person
  },
  // ... etc
}
```

### Step 5: Update Payment Information

Update the bank details in `BILLING_CONFIG.PAYMENT_INFO`:

```javascript
PAYMENT_INFO: {
  accountNumber: '580138122',
  bankName: 'בנק הפועלים',
  branch: '549',
  beneficiary: 'JUST A SECOND'
}
```

### Step 6: Test the System

1. In Apps Script, find the `testBillingEmail()` function
2. Click **Run** (▶️ button)
3. Authorize the script if prompted
4. Check your email inbox for the test billing email

**Test Data Used:**
- 15 participants
- Tour + Workshop activities
- Gift (₪60 per person)
- Light catering (₪40 per person)

**Expected Result:**
- Subtotal: ₪4,900
- Discount (20%): -₪980
- **Final Total: ₪3,920**

## 🎨 Customization Options

### Change Discount Percentage

```javascript
DISCOUNT_PERCENTAGE: 20,  // Change to 15, 25, etc.
```

### Modify Email Subject

```javascript
SUBJECT: 'הצעת מחיר | הרשאה חוזית מיידית עם תרומה - JUST A SECOND',
```

### Update Company Information

```javascript
COMPANY: {
  name: 'JUST A SECOND',
  tagline: 'ליצירת מפגש משמעותי',
  phone: '058-787-6549',
  website: 'justasecond.co.il',
  instagram: '/justasecondil',
}
```

## 📊 Pricing Structure Reference

Based on the image you provided, here's the pricing structure:

| Activity | Price per Person | Notes |
|----------|------------------|-------|
| סיור והרצאת השראה | ₪0 (Free) | 1.5-2 hours |
| יום בחיי JAS - סדנת מיחדוש | ₪2,400 | Max ₪1,500 per participant |
| אופציה - כיבוד קל ושתיה חמה | ₪1,500 | ₪15-30 range |
| שי ייחודי (רוטא) | ₪60 | Per person |
| כיבוד קל | ₪40 | Per person |
| **Discount** | **20%** | Applied to subtotal |

## 🔍 Troubleshooting

### Email Not Sending

1. **Check Permissions:**
   - Go to Apps Script → Run → Review Permissions
   - Make sure Gmail sending is authorized

2. **Check Email Address:**
   - Verify `contact_email` field is being captured correctly
   - Check for typos in email addresses

3. **View Logs:**
   - In Apps Script, click **Executions** (left sidebar)
   - Check for error messages

### Wrong Prices Calculated

1. **Check Form Field Names:**
   - Ensure field names match exactly:
     - `activities`
     - `gift`
     - `catering`
     - `visit_people`

2. **Verify Activity Strings:**
   - The script looks for specific text in activities
   - Example: `activities.includes('סיור והרצאת השראה')`

### Email Formatting Issues

1. **Test in Different Email Clients:**
   - Gmail
   - Outlook
   - Mobile devices

2. **Check HTML Validity:**
   - Use an HTML validator if needed

## 📧 Email Preview

The customer will receive a beautifully formatted email with:

### Header
- Orange gradient background
- JUST A SECOND logo and branding

### Customer Details Box
- Name, organization, visit date, hours, number of participants

### Invoice Table
| Description | Quantity | Price/Unit | Total |
|-------------|----------|------------|-------|
| Tour & Lecture | 15 | Free | Free |
| Workshop | 15 | ₪2,400 | ₪36,000 |
| Gift (Rota) | 15 | ₪60 | ₪900 |
| Light Catering | 15 | ₪40 | ₪600 |

### Totals Box
- Subtotal: ₪37,500
- Discount (20%): -₪7,500
- **Final Total: ₪30,000**

### Payment Information
- Bank account details
- Contact information

## 🔐 Security Considerations

1. **Sensitive Data:**
   - Never include credit card information
   - Bank details are safe to share for wire transfers

2. **Email Privacy:**
   - Emails are sent individually (not BCC)
   - Only the customer receives their invoice

3. **Data Storage:**
   - All data is stored in your Google Sheet
   - Access is controlled by Google permissions

## 📞 Support

If you encounter issues:

1. Check the **Executions** log in Apps Script
2. Run `testBillingEmail()` to verify setup
3. Verify all form field names match the script

## 🎉 Success Checklist

- [ ] Script added to Google Apps Script
- [ ] `doPost` function updated to call `sendBillingEmail()`
- [ ] Pricing configured correctly
- [ ] Payment information updated
- [ ] Test email sent successfully
- [ ] Test form submission completed
- [ ] Customer received billing email
- [ ] Invoice calculations are correct
- [ ] Email displays properly on mobile and desktop

## 📝 Next Steps

After setup is complete:

1. **Test with Real Data:**
   - Submit a test form with various activity combinations
   - Verify calculations are correct

2. **Monitor First Week:**
   - Check that all customers receive emails
   - Gather feedback on clarity and design

3. **Iterate:**
   - Adjust pricing if needed
   - Update email copy based on customer questions
   - Add additional services as they become available

---

**Need Help?** Contact the development team or refer to the Google Apps Script documentation.
