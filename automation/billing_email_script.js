/**
 * Billing Email Automation - Google Apps Script
 * 
 * This script sends a detailed billing invoice to customers after form submission
 * Based on the JUST A SECOND pricing structure
 * 
 * Setup:
 * 1. Add this to your existing Google Apps Script
 * 2. Call sendBillingEmail() from your doPost function after form submission
 */

// ==================== CONFIGURATION ====================

const BILLING_CONFIG = {
  // Email settings
  FROM_NAME: 'JUST A SECOND',
  SUBJECT: 'הצעת מחיר | הרשאה חוזית מיידית עם תרומה - JUST A SECOND',
  
  // Company details
  COMPANY: {
    name: 'JUST A SECOND',
    tagline: 'ליצירת מפגש משמעותי',
    phone: '058-787-6549',
    website: 'justasecond.co.il',
    instagram: '/justasecondil',
    note: 'הרווחים מהמכירות מופנים לסיוע נפשי לכוחות הבטחון'
  },
  
  // Pricing structure (in ILS)
  PRICING: {
    tour: {
      name: 'סיור והרצאת השראה',
      description: 'סיור והרצאת השראה בחנם נספר על הבעיה החברתית והתמיכה שלנו תוך שילוב סיפורים מהשטח, שם הנרצאה: אשה, אתמאול, מיוחדת והנחלת שופתה של JUST A SECOND',
      pricePerPerson: 0,
      unit: 'לשעתיים',
      note: 'בשעה וחצי - שעתיים'
    },
    workshop_team: {
      name: 'יום בחיי JAS - סדנת מיחדוש ותרומה לקהילה',
      description: 'בסדנא תלכדו כיחד לטובת הקהילה והחברה. שיתוף/שיחה/קפה, מול קבוצת 30 ב JAS או בשלכם-שיחה/שיתוף על הרעיון, בימים הקשה הרחיים וצעיר שאנו מלכדות הגלריה שלנו. הפריטים שיאנכו לכוחות הבטחון',
      pricePerPerson: 2400,
      unit: 'למשתתף',
      note: '15 ש"ח (מקסימום 1,500 למשתתף)',
      additionalNote: 'בשעה וחצי - שעתיים'
    },
    salon_rent: {
      name: 'אופציה - כיבוד קל ושתיה חמה',
      description: 'ככלל מבחר עוגות / עוגיות / פיצוחים/ נשנושים/ פיתות לאורך כל היום (ללא א. מנה)',
      pricePerPerson: 1500,
      unit: 'למשתתף',
      note: '15 ש"ח ל 30 ש"ח',
      additionalNote: 'בשעה וחצי - שעתיים'
    },
    gift_60: {
      name: 'שי ייחודי',
      description: 'רוטא - מתקן מיוחד לייחורים',
      pricePerPerson: 60,
      unit: 'לאדם'
    },
    gift_custom: {
      name: 'שי ייחודי - קופסה ייעודית',
      description: 'קופסה ייעודית בהתאם לתקציב',
      pricePerPerson: 0, // Will be calculated based on budget
      unit: 'לאדם'
    },
    catering_light: {
      name: 'שתייה חמה + כיבוד קל',
      description: 'שתייה חמה וכיבוד קל לאורך המפגש',
      pricePerPerson: 40,
      unit: 'לאדם'
    },
    catering_full: {
      name: 'שתייה חמה + כיבוד מלא',
      description: 'שתייה חמה וכיבוד מלא לאורך הביקור',
      pricePerPerson: 60,
      unit: 'לאדם'
    }
  },
  
  // Discount
  DISCOUNT_PERCENTAGE: 20,
  
  // Payment details
  PAYMENT_INFO: {
    accountNumber: '580138122',
    bankName: 'בנק הפועלים',
    branch: '549',
    beneficiary: 'JUST A SECOND'
  }
};

// ==================== MAIN FUNCTION ====================

/**
 * Send billing email with invoice details
 * Call this function after form submission
 */
function sendBillingEmail(formData) {
  try {
    const email = formData.contact_email;
    const name = formData.contact_name || 'לקוח יקר';
    
    if (!email) {
      Logger.log('No email provided, skipping billing email');
      return;
    }
    
    // Calculate billing details
    const billingDetails = calculateBilling(formData);
    
    // Create email body
    const emailBody = createBillingEmailBody(formData, billingDetails);
    
    // Send email
    MailApp.sendEmail({
      to: email,
      subject: BILLING_CONFIG.SUBJECT,
      htmlBody: emailBody,
      name: BILLING_CONFIG.FROM_NAME
    });
    
    Logger.log(`✅ Billing email sent to: ${email} (${name})`);
    Logger.log(`Total amount: ₪${billingDetails.finalTotal}`);
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Failed to send billing email: ${error}`);
    throw error;
  }
}

// ==================== CALCULATION FUNCTIONS ====================

/**
 * Calculate billing based on form data
 */
function calculateBilling(formData) {
  const numPeople = parseInt(formData.visit_people) || 0;
  const items = [];
  let subtotal = 0;
  
  // Parse activities
  const activities = formData.activities || '';
  
  // Tour (free)
  if (activities.includes('סיור והרצאת השראה')) {
    items.push({
      name: BILLING_CONFIG.PRICING.tour.name,
      description: BILLING_CONFIG.PRICING.tour.description,
      quantity: numPeople,
      pricePerUnit: BILLING_CONFIG.PRICING.tour.pricePerPerson,
      total: 0,
      note: BILLING_CONFIG.PRICING.tour.note
    });
  }
  
  // Workshop Team
  if (activities.includes('סדנת הבית') || activities.includes('יום בחיי JAS')) {
    const price = BILLING_CONFIG.PRICING.workshop_team.pricePerPerson;
    const total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.workshop_team.name,
      description: BILLING_CONFIG.PRICING.workshop_team.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total,
      note: BILLING_CONFIG.PRICING.workshop_team.note
    });
    subtotal += total;
  }
  
  // Salon Rent / Event
  if (activities.includes('השכרת המתחם') || activities.includes('השכרת הארוע')) {
    const price = BILLING_CONFIG.PRICING.salon_rent.pricePerPerson;
    const total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.salon_rent.name,
      description: BILLING_CONFIG.PRICING.salon_rent.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total,
      note: BILLING_CONFIG.PRICING.salon_rent.note
    });
    subtotal += total;
  }
  
  // Gift
  const gift = formData.gift || '';
  if (gift.includes('60 ש"ח')) {
    const price = BILLING_CONFIG.PRICING.gift_60.pricePerPerson;
    const total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.gift_60.name,
      description: BILLING_CONFIG.PRICING.gift_60.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total
    });
    subtotal += total;
  } else if (gift.includes('קופסה ייעודית') || gift.includes('תו שי')) {
    const budget = parseInt(formData.gift_budget) || 50;
    const total = budget * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.gift_custom.name,
      description: BILLING_CONFIG.PRICING.gift_custom.description,
      quantity: numPeople,
      pricePerUnit: budget,
      total: total
    });
    subtotal += total;
  }
  
  // Catering
  const catering = formData.catering || '';
  if (catering.includes('40 ש"ח')) {
    const price = BILLING_CONFIG.PRICING.catering_light.pricePerPerson;
    const total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.catering_light.name,
      description: BILLING_CONFIG.PRICING.catering_light.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total
    });
    subtotal += total;
  } else if (catering.includes('60 ש"ח') || catering.includes('כיבוד מלא')) {
    const price = BILLING_CONFIG.PRICING.catering_full.pricePerPerson;
    const total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.catering_full.name,
      description: BILLING_CONFIG.PRICING.catering_full.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total
    });
    subtotal += total;
  }
  
  // Calculate discount and final total
  const discountAmount = Math.round(subtotal * (BILLING_CONFIG.DISCOUNT_PERCENTAGE / 100));
  const finalTotal = subtotal - discountAmount;
  
  return {
    items: items,
    subtotal: subtotal,
    discountPercentage: BILLING_CONFIG.DISCOUNT_PERCENTAGE,
    discountAmount: discountAmount,
    finalTotal: finalTotal,
    numPeople: numPeople
  };
}

// ==================== EMAIL TEMPLATE ====================

/**
 * Create HTML email body with billing details
 */
function createBillingEmailBody(formData, billing) {
  const name = formData.contact_name || 'לקוח יקר';
  const orgName = formData.org_exact_name || formData.org_type || '';
  const visitDate = formatDate(formData.visit_dates);
  const visitHours = formData.visit_hours || '';
  
  // Build items table rows
  let itemsRows = '';
  billing.items.forEach(item => {
    itemsRows += `
      <tr style="border-bottom: 1px solid #e0e0e0;">
        <td style="padding: 15px 10px; text-align: right; vertical-align: top;">
          <strong style="color: #2c3e50; font-size: 15px;">${item.name}</strong>
          <br>
          <span style="color: #7f8c8d; font-size: 13px; line-height: 1.6;">${item.description}</span>
          ${item.note ? `<br><span style="color: #95a5a6; font-size: 12px; font-style: italic;">${item.note}</span>` : ''}
        </td>
        <td style="padding: 15px 10px; text-align: center; color: #34495e; font-size: 14px;">
          ${item.quantity}
        </td>
        <td style="padding: 15px 10px; text-align: center; color: #34495e; font-size: 14px;">
          ${item.pricePerUnit > 0 ? `₪${item.pricePerUnit.toLocaleString('he-IL')}` : 'חינם'}
        </td>
        <td style="padding: 15px 10px; text-align: center; color: #2c3e50; font-weight: bold; font-size: 15px;">
          ${item.total > 0 ? `₪${item.total.toLocaleString('he-IL')}` : 'חינם'}
        </td>
      </tr>
    `;
  });
  
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @media only screen and (max-width: 600px) {
          .container { width: 100% !important; }
          .header { padding: 20px !important; }
          .content { padding: 20px !important; }
          table { font-size: 12px !important; }
        }
      </style>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; direction: rtl;">
      
      <!-- Main Container -->
      <div class="container" style="max-width: 700px; margin: 20px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        
        <!-- Header with Logo -->
        <div class="header" style="background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%); padding: 30px; text-align: center; position: relative;">
          <div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
            <span style="font-size: 40px; color: #ff8c42;">🔶</span>
          </div>
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
            ${BILLING_CONFIG.COMPANY.name}
          </h1>
          <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px; font-weight: 500;">
            ${BILLING_CONFIG.COMPANY.tagline}
          </p>
        </div>
        
        <!-- Content -->
        <div class="content" style="padding: 35px;">
          
          <!-- Greeting -->
          <div style="margin-bottom: 25px;">
            <h2 style="color: #2c3e50; font-size: 22px; margin: 0 0 10px 0;">
              שלום ${name}! 👋
            </h2>
            <p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0;">
              תודה על הרשמתך לפעילות ב-JUST A SECOND. להלן פירוט מלא של ההצעה והעלויות.
            </p>
          </div>
          
          <!-- Customer Details Box -->
          <div style="background-color: #f8f9fa; border-right: 4px solid #ff8c42; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">📋 פרטי הלקוח</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600; width: 35%;">שם איש קשר:</td>
                <td style="padding: 6px 0; color: #333;">${name}</td>
              </tr>
              ${orgName ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">ארגון:</td>
                <td style="padding: 6px 0; color: #333;">${orgName}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">תאריך ביקור:</td>
                <td style="padding: 6px 0; color: #333;">${visitDate}</td>
              </tr>
              ${visitHours ? `
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">שעות:</td>
                <td style="padding: 6px 0; color: #333;">${visitHours}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">מספר משתתפים:</td>
                <td style="padding: 6px 0; color: #333; font-weight: bold;">${billing.numPeople}</td>
              </tr>
            </table>
          </div>
          
          <!-- Invoice Title -->
          <h3 style="color: #2c3e50; font-size: 20px; margin: 30px 0 15px 0; border-bottom: 2px solid #ff8c42; padding-bottom: 10px;">
            💰 פירוט עלויות
          </h3>
          
          <!-- Items Table -->
          <div style="overflow-x: auto; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #34495e; color: white;">
                  <th style="padding: 12px 10px; text-align: right; font-weight: 600; font-size: 14px;">תיאור</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; font-size: 14px; width: 15%;">כמות</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; font-size: 14px; width: 18%;">מחיר ליחידה</th>
                  <th style="padding: 12px 10px; text-align: center; font-weight: 600; font-size: 14px; width: 18%;">סה"כ</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
          </div>
          
          <!-- Totals Box -->
          <div style="background-color: #fff8f0; border: 2px solid #ff8c42; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; text-align: right; color: #555; font-size: 16px;">סכום ביניים:</td>
                <td style="padding: 8px 0; text-align: left; color: #333; font-size: 16px; font-weight: 600;">
                  ₪${billing.subtotal.toLocaleString('he-IL')}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; text-align: right; color: #e74c3c; font-size: 16px;">
                  פחות ${billing.discountPercentage}% הנחה:
                </td>
                <td style="padding: 8px 0; text-align: left; color: #e74c3c; font-size: 16px; font-weight: 600;">
                  -₪${billing.discountAmount.toLocaleString('he-IL')}
                </td>
              </tr>
              <tr style="border-top: 2px solid #ff8c42;">
                <td style="padding: 12px 0 0 0; text-align: right; color: #2c3e50; font-size: 20px; font-weight: bold;">
                  סה"כ לתשלום:
                </td>
                <td style="padding: 12px 0 0 0; text-align: left; color: #ff8c42; font-size: 24px; font-weight: bold;">
                  ₪${billing.finalTotal.toLocaleString('he-IL')}
                </td>
              </tr>
            </table>
            <p style="margin: 15px 0 0 0; color: #7f8c8d; font-size: 13px; text-align: center; font-style: italic;">
              (כולל כיבוד ושתייה)
            </p>
          </div>
          
          <!-- Payment Information -->
          <div style="background-color: #e8f5e9; border-right: 4px solid #27ae60; padding: 20px; margin: 25px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 15px 0; color: #27ae60; font-size: 18px;">💳 פרטי תשלום</h3>
            <p style="margin: 0 0 10px 0; color: #555; font-size: 15px; line-height: 1.6;">
              ניתן לבצע העברה בנקאית לפרטים הבאים:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600; width: 35%;">מספר חשבון:</td>
                <td style="padding: 6px 0; color: #2c3e50; font-weight: bold; font-size: 16px;">${BILLING_CONFIG.PAYMENT_INFO.accountNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">בנק:</td>
                <td style="padding: 6px 0; color: #2c3e50;">${BILLING_CONFIG.PAYMENT_INFO.bankName}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">סניף:</td>
                <td style="padding: 6px 0; color: #2c3e50;">${BILLING_CONFIG.PAYMENT_INFO.branch}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #666; font-weight: 600;">שם המוטב:</td>
                <td style="padding: 6px 0; color: #2c3e50;">${BILLING_CONFIG.PAYMENT_INFO.beneficiary}</td>
              </tr>
            </table>
            <p style="margin: 15px 0 0 0; color: #555; font-size: 14px;">
              * לשאלות הנוגעות לתשלום, תקציב או הנחה לרכישת בתוכנה
            </p>
          </div>
          
          <!-- Contact Information -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 12px 0; color: #555; font-size: 15px;">
              שאלות? נשמח לעמוד לשירותכם:
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              📞 <a href="tel:${BILLING_CONFIG.COMPANY.phone}" style="color: #ff8c42; text-decoration: none; font-weight: bold;">${BILLING_CONFIG.COMPANY.phone}</a>
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              💬 <a href="https://wa.me/972587876549" style="color: #25D366; text-decoration: none; font-weight: bold;">WhatsApp</a>
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              🌐 <a href="https://${BILLING_CONFIG.COMPANY.website}" style="color: #3498db; text-decoration: none; font-weight: bold;">${BILLING_CONFIG.COMPANY.website}</a>
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              📸 <a href="https://instagram.com${BILLING_CONFIG.COMPANY.instagram}" style="color: #E1306C; text-decoration: none; font-weight: bold;">Instagram</a>
            </p>
          </div>
          
          <!-- Footer Note -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0; line-height: 1.6;">
              <strong style="color: #2c3e50;">JUST A SECOND</strong><br>
              מרחב שמחבר בין עיצוב, קיימות וקהילה
            </p>
            <p style="color: #e74c3c; font-size: 13px; margin: 15px 0 5px 0; font-weight: 600;">
              ⭐ ${BILLING_CONFIG.COMPANY.note}
            </p>
            <p style="color: #95a5a6; font-size: 12px; margin: 10px 0 0 0;">
              © ${new Date().getFullYear()} JUST A SECOND. All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
      
    </body>
    </html>
  `;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'לא צוין';
  
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    const dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const dayOfWeek = dayNames[date.getDay()];
    
    return `יום ${dayOfWeek}, ${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
}

// ==================== INTEGRATION WITH EXISTING SCRIPT ====================

/**
 * Modified doPost function - integrate this with your existing script
 * This should be called after saving data to Google Sheets
 */
function doPostWithBilling(e) {
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
      formData.catering || ''
      // ... add more fields as needed
    ]);
    
    // Send billing email automatically
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

/**
 * Test function - send a test billing email
 */
function testBillingEmail() {
  const testData = {
    contact_name: 'יובל סימון',
    contact_email: Session.getActiveUser().getEmail(), // Send to yourself for testing
    org_exact_name: 'חברת הדוגמה בע"מ',
    org_type: 'חברה עסקית',
    visit_dates: '2025-12-25',
    visit_hours: '10:00-13:00',
    visit_people: '15',
    activities: 'סיור והרצאת השראה של JAS, סדנת הבית',
    gift: 'כן - "רוטא" מתקן מיוחד לייחורים - בשווי 60 ש"ח לאדם',
    catering: 'שתייה חמה + כיבוד קל לאורך כל המפגש (40 ש"ח לאדם)',
    gift_budget: ''
  };
  
  sendBillingEmail(testData);
  Logger.log('Test billing email sent!');
}
