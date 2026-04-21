/**
 * COMPLETE GOOGLE APPS SCRIPT - READY TO USE
 * 
 * This file contains EVERYTHING you need:
 * 1. Your existing doPost function
 * 2. Billing email automation
 * 3. All helper functions
 * 
 * INSTRUCTIONS:
 * 1. Copy this ENTIRE file
 * 2. Replace your existing Code.gs in Google Apps Script
 * 3. Update SHEET_URL and ADMIN_EMAIL at the top
 * 4. Save and test!
 */

// ==================== CONFIGURATION ====================

// TODO: Update these with your actual values
var SHEET_URL = 'YOUR_GOOGLE_SHEET_URL_HERE';
var SHEET_NAME = 'Responses';
var ADMIN_EMAIL = 'YOUR_ADMIN_EMAIL_HERE';

// ==================== BILLING CONFIGURATION ====================

const BILLING_CONFIG = {
  FROM_NAME: 'JUST A SECOND',
  SUBJECT: 'הצעת מחיר | הרשאה חוזית מיידית עם תרומה - JUST A SECOND',
  
  COMPANY: {
    name: 'JUST A SECOND',
    tagline: 'ליצירת מפגש משמעותי',
    phone: '058-787-6549',
    website: 'justasecond.co.il',
    instagram: '/justasecondil',
    note: 'הרווחים מהמכירות מופנים לסיוע נפשי לכוחות הבטחון'
  },
  
  PRICING: {
    tour: {
      name: 'סיור והרצאת השראה',
      description: 'סיור והרצאת השראה בחנם נספר על הבעיה החברתית והתמיכה שלנו תוך שילוב סיפורים מהשטח',
      pricePerPerson: 1000,
      isFlat: true,
      unit: 'סה"כ',
      note: 'בשעה וחצי - שעתיים'
    },
    workshop_team: {
      name: 'יום בחיי JAS - סדנת מיחדוש ותרומה לקהילה',
      description: 'בסדנא תלכדו כיחד לטובת הקהילה והחברה. שיתוף/שיחה/קפה, מול קבוצת 30',
      pricePerPerson: 2400,
      unit: 'למשתתף',
      note: '15 ש"ח (מקסימום 1,500 למשתתף)',
      additionalNote: 'בשעה וחצי - שעתיים'
    },
    salon_rent: {
      name: 'אופציה - כיבוד קל ושתיה חמה',
      description: 'ככלל מבחר עוגות / עוגיות / פיצוחים/ נשנושים/ פיתות לאורך כל היום',
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
    catering_light: {
      name: 'שתייה חמה + כיבוד קל',
      description: 'שתייה חמה וכיבוד קל לאורך המפגש',
      pricePerPerson: 40,
      unit: 'לאדם'
    }
  },
  
  DISCOUNT_PERCENTAGE: 20,
  
  PAYMENT_INFO: {
    accountNumber: '580138122',
    bankName: 'בנק הפועלים',
    branch: '549',
    beneficiary: 'JUST A SECOND'
  }
};

// ==================== MAIN DOPOST FUNCTION ====================

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openByUrl(SHEET_URL);
    var allSheets = ss.getSheets();
    var sheetNames = [];
    for (var i = 0; i < allSheets.length; i++) {
      sheetNames.push('"' + allSheets[i].getName() + '"');
    }
    
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(
        'Sheet not found: "' + SHEET_NAME + '"\n\n' +
        'Available sheets:\n' + sheetNames.join('\n')
      ).setMimeType(ContentService.MimeType.TEXT);
    }

    var p = (e && e.parameter) ? e.parameter : {};
    if (p.website) return HtmlService.createHtmlOutput('');

    var emailKey = (p.contact_email || '').toLowerCase().trim();
    if (emailKey) {
      var cache = CacheService.getScriptCache();
      if (cache.get('lock:' + emailKey)) {
        return ContentService.createTextOutput('Please wait').setMimeType(ContentService.MimeType.TEXT);
      }
      cache.put('lock:' + emailKey, '1', 60);
    }

    var activities = '';
    if (p.activities) {
      if (Object.prototype.toString.call(p.activities) === '[object Array]') {
        activities = p.activities.join(', ');
      } else {
        activities = String(p.activities);
      }
    }

    var row = [
      p.org_type || '', p.org_exact_name || '', p.org_department || '', p.org_id || '',
      p.contact_name || '', p.contact_role || '', p.contact_email || '', p.contact_phone || '',
      activities, p.visit_people || '', p.visit_dates || '', p.visit_hours || '',
      p.gift || '', p.gift_budget || '', p.catering || '', p.catering_notes || '',
      p.payment || '', p.payment_invoice_name || '', p.payment_invoice_email || '',
      p.notes || '', new Date()
    ];
    sheet.appendRow(row);

    var summary = buildSummary(p, activities);
    
    // Send admin email
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New JAS submission' + (p.org_type ? ' – ' + p.org_type : ''),
        htmlBody: summary,
        name: 'JUST A SECOND'
      });
      Logger.log('✅ Admin email sent');
    } catch (e1) {
      Logger.log('⚠️ Admin email error: ' + e1);
    }

    // ✨ NEW: Send billing invoice email
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
      Logger.log('✅ Billing email sent to: ' + p.contact_email);
      
    } catch (billingError) {
      Logger.log('⚠️ Billing email error: ' + billingError);
    }

    // Send user confirmation email
    if (p.contact_email) {
      var displayName = p.contact_name || 'שלום';
      var userHtml = '<div dir="rtl"><p>' + esc(displayName) + ', תודה! קיבלנו את הפרטים.</p>' + summary + '<p>בברכה,<br>JUST A SECOND</p></div>';
      try {
        MailApp.sendEmail({
          to: p.contact_email,
          subject: 'תודה! קיבלנו את הטופס שלך',
          htmlBody: userHtml,
          name: 'JUST A SECOND',
          replyTo: 'mayaka712@gmail.com'
        });
        Logger.log('✅ Confirmation email sent');
      } catch (e2) {
        Logger.log('⚠️ Confirmation email error: ' + e2);
      }
    }

    return HtmlService.createHtmlOutput('<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>הצלחה</title><style>body{font-family:Heebo,Arial;display:grid;place-items:center;height:100vh;background:#f6faf7;color:#4e6b5a}.card{background:#fff;padding:28px;border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(78,107,90,0.18)}.icon{font-size:40px}</style></head><body><div class="card"><div class="icon">✅</div><h1>הטופס נקלט בהצלחה!</h1><p>תודה על הרשמתך</p></div></body></html>');
  } catch (err) {
    Logger.log('❌ Critical error: ' + err);
    return ContentService.createTextOutput('Error: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

// ==================== BILLING EMAIL FUNCTION ====================

function sendBillingEmail(formData) {
  try {
    var email = formData.contact_email;
    var name = formData.contact_name || 'לקוח יקר';
    
    if (!email) {
      Logger.log('No email provided, skipping billing email');
      return;
    }
    
    var billingDetails = calculateBilling(formData);
    var emailBody = createBillingEmailBody(formData, billingDetails);
    
    MailApp.sendEmail({
      to: email,
      subject: BILLING_CONFIG.SUBJECT,
      htmlBody: emailBody,
      name: BILLING_CONFIG.FROM_NAME
    });
    
    Logger.log('✅ Billing email sent to: ' + email + ' (' + name + ')');
    Logger.log('Total amount: ₪' + billingDetails.finalTotal);
    
    return true;
    
  } catch (error) {
    Logger.log('❌ Failed to send billing email: ' + error);
    throw error;
  }
}

function calculateBilling(formData) {
  var numPeople = parseInt(formData.visit_people) || 0;
  var items = [];
  var subtotal = 0;
  
  var activities = formData.activities || '';
  
  // Tour (flat rate of 1000)
  if (activities.indexOf('סיור והרצאת השראה') !== -1) {
    items.push({
      name: BILLING_CONFIG.PRICING.tour.name,
      description: BILLING_CONFIG.PRICING.tour.description,
      quantity: numPeople,
      pricePerUnit: BILLING_CONFIG.PRICING.tour.pricePerPerson,
      total: BILLING_CONFIG.PRICING.tour.pricePerPerson,
      note: BILLING_CONFIG.PRICING.tour.note
    });
    subtotal += BILLING_CONFIG.PRICING.tour.pricePerPerson;
  }
  
  // Workshop
  if (activities.indexOf('סדנת הבית') !== -1 || activities.indexOf('יום בחיי JAS') !== -1) {
    var price = BILLING_CONFIG.PRICING.workshop_team.pricePerPerson;
    var total = price * numPeople;
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
  
  // Gift
  var gift = formData.gift || '';
  if (gift.indexOf('60 ש"ח') !== -1 || gift.indexOf('רוטא') !== -1) {
    var price = BILLING_CONFIG.PRICING.gift_60.pricePerPerson;
    var total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.gift_60.name,
      description: BILLING_CONFIG.PRICING.gift_60.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total
    });
    subtotal += total;
  }
  
  // Catering
  var catering = formData.catering || '';
  if (catering.indexOf('40 ש"ח') !== -1) {
    var price = BILLING_CONFIG.PRICING.catering_light.pricePerPerson;
    var total = price * numPeople;
    items.push({
      name: BILLING_CONFIG.PRICING.catering_light.name,
      description: BILLING_CONFIG.PRICING.catering_light.description,
      quantity: numPeople,
      pricePerUnit: price,
      total: total
    });
    subtotal += total;
  }
  
  var discountAmount = Math.round(subtotal * (BILLING_CONFIG.DISCOUNT_PERCENTAGE / 100));
  var finalTotal = subtotal - discountAmount;
  
  return {
    items: items,
    subtotal: subtotal,
    discountPercentage: BILLING_CONFIG.DISCOUNT_PERCENTAGE,
    discountAmount: discountAmount,
    finalTotal: finalTotal,
    numPeople: numPeople
  };
}

function createBillingEmailBody(formData, billing) {
  var name = formData.contact_name || 'לקוח יקר';
  var orgName = formData.org_exact_name || formData.org_type || '';
  var visitDate = formatDate(formData.visit_dates);
  var visitHours = formData.visit_hours || '';
  
  var itemsRows = '';
  for (var i = 0; i < billing.items.length; i++) {
    var item = billing.items[i];
    itemsRows += '<tr style="border-bottom: 1px solid #e0e0e0;">' +
      '<td style="padding: 15px 10px; text-align: right; vertical-align: top;">' +
      '<strong style="color: #2c3e50; font-size: 15px;">' + item.name + '</strong><br>' +
      '<span style="color: #7f8c8d; font-size: 13px; line-height: 1.6;">' + item.description + '</span>' +
      (item.note ? '<br><span style="color: #95a5a6; font-size: 12px; font-style: italic;">' + item.note + '</span>' : '') +
      '</td>' +
      '<td style="padding: 15px 10px; text-align: center; color: #34495e; font-size: 14px;">' + item.quantity + '</td>' +
      '<td style="padding: 15px 10px; text-align: center; color: #34495e; font-size: 14px;">' +
      (item.pricePerUnit > 0 ? '₪' + item.pricePerUnit.toLocaleString('he-IL') : 'חינם') +
      '</td>' +
      '<td style="padding: 15px 10px; text-align: center; color: #2c3e50; font-weight: bold; font-size: 15px;">' +
      (item.total > 0 ? '₪' + item.total.toLocaleString('he-IL') : 'חינם') +
      '</td></tr>';
  }
  
  return '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin: 0; padding: 0; font-family: \'Segoe UI\', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; direction: rtl;">' +
    '<div style="max-width: 700px; margin: 20px auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">' +
    '<div style="background: linear-gradient(135deg, #ff8c42 0%, #ff6b35 100%); padding: 30px; text-align: center;">' +
    '<div style="background-color: white; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">' +
    '<span style="font-size: 40px; color: #ff8c42;">🔶</span></div>' +
    '<h1 style="margin: 0; color: white; font-size: 28px; font-weight: 800;">' + BILLING_CONFIG.COMPANY.name + '</h1>' +
    '<p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.95); font-size: 16px;">' + BILLING_CONFIG.COMPANY.tagline + '</p></div>' +
    '<div style="padding: 35px;"><div style="margin-bottom: 25px;"><h2 style="color: #2c3e50; font-size: 22px; margin: 0 0 10px 0;">שלום ' + name + '! 👋</h2>' +
    '<p style="color: #555; font-size: 16px; line-height: 1.6; margin: 0;">תודה על הרשמתך לפעילות ב-JUST A SECOND. להלן פירוט מלא של ההצעה והעלויות.</p></div>' +
    '<div style="background-color: #f8f9fa; border-right: 4px solid #ff8c42; padding: 20px; margin: 25px 0; border-radius: 8px;">' +
    '<h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px;">📋 פרטי הלקוח</h3><table style="width: 100%;">' +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">שם איש קשר:</td><td style="padding: 6px 0; color: #333;">' + name + '</td></tr>' +
    (orgName ? '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">ארגון:</td><td style="padding: 6px 0; color: #333;">' + orgName + '</td></tr>' : '') +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">תאריך ביקור:</td><td style="padding: 6px 0; color: #333;">' + visitDate + '</td></tr>' +
    (visitHours ? '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">שעות:</td><td style="padding: 6px 0; color: #333;">' + visitHours + '</td></tr>' : '') +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">מספר משתתפים:</td><td style="padding: 6px 0; color: #333; font-weight: bold;">' + billing.numPeople + '</td></tr>' +
    '</table></div><h3 style="color: #2c3e50; font-size: 20px; margin: 30px 0 15px 0; border-bottom: 2px solid #ff8c42; padding-bottom: 10px;">💰 פירוט עלויות</h3>' +
    '<table style="width: 100%; border-collapse: collapse; border: 1px solid #e0e0e0; border-radius: 8px;"><thead><tr style="background-color: #34495e; color: white;">' +
    '<th style="padding: 12px 10px; text-align: right;">תיאור</th><th style="padding: 12px 10px; text-align: center; width: 15%;">כמות</th>' +
    '<th style="padding: 12px 10px; text-align: center; width: 18%;">מחיר ליחידה</th><th style="padding: 12px 10px; text-align: center; width: 18%;">סה"כ</th>' +
    '</tr></thead><tbody>' + itemsRows + '</tbody></table>' +
    '<div style="background-color: #fff8f0; border: 2px solid #ff8c42; border-radius: 8px; padding: 20px; margin: 25px 0;"><table style="width: 100%;">' +
    '<tr><td style="padding: 8px 0; text-align: right; color: #555; font-size: 16px;">סכום ביניים:</td>' +
    '<td style="padding: 8px 0; text-align: left; color: #333; font-size: 16px; font-weight: 600;">₪' + billing.subtotal.toLocaleString('he-IL') + '</td></tr>' +
    '<tr><td style="padding: 8px 0; text-align: right; color: #e74c3c; font-size: 16px;">פחות ' + billing.discountPercentage + '% הנחה:</td>' +
    '<td style="padding: 8px 0; text-align: left; color: #e74c3c; font-size: 16px; font-weight: 600;">-₪' + billing.discountAmount.toLocaleString('he-IL') + '</td></tr>' +
    '<tr style="border-top: 2px solid #ff8c42;"><td style="padding: 12px 0 0 0; text-align: right; color: #2c3e50; font-size: 20px; font-weight: bold;">סה"כ לתשלום:</td>' +
    '<td style="padding: 12px 0 0 0; text-align: left; color: #ff8c42; font-size: 24px; font-weight: bold;">₪' + billing.finalTotal.toLocaleString('he-IL') + '</td></tr>' +
    '</table><p style="margin: 15px 0 0 0; color: #7f8c8d; font-size: 13px; text-align: center;">(כולל כיבוד ושתייה)</p></div>' +
    '<div style="background-color: #e8f5e9; border-right: 4px solid #27ae60; padding: 20px; margin: 25px 0; border-radius: 8px;">' +
    '<h3 style="margin: 0 0 15px 0; color: #27ae60; font-size: 18px;">💳 פרטי תשלום</h3>' +
    '<p style="margin: 0 0 10px 0; color: #555; font-size: 15px;">ניתן לבצע העברה בנקאית לפרטים הבאים:</p><table style="width: 100%; margin-top: 10px;">' +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">מספר חשבון:</td><td style="padding: 6px 0; color: #2c3e50; font-weight: bold;">' + BILLING_CONFIG.PAYMENT_INFO.accountNumber + '</td></tr>' +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">בנק:</td><td style="padding: 6px 0; color: #2c3e50;">' + BILLING_CONFIG.PAYMENT_INFO.bankName + '</td></tr>' +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">סניף:</td><td style="padding: 6px 0; color: #2c3e50;">' + BILLING_CONFIG.PAYMENT_INFO.branch + '</td></tr>' +
    '<tr><td style="padding: 6px 0; color: #666; font-weight: 600;">שם המוטב:</td><td style="padding: 6px 0; color: #2c3e50;">' + BILLING_CONFIG.PAYMENT_INFO.beneficiary + '</td></tr>' +
    '</table></div>' +
    '<div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">' +
    '<p style="margin: 0 0 12px 0; color: #555; font-size: 15px;">שאלות? נשמח לעמוד לשירותכם:</p>' +
    '<p style="margin: 5px 0; font-size: 16px;">📞 <a href="tel:' + BILLING_CONFIG.COMPANY.phone + '" style="color: #ff8c42; text-decoration: none; font-weight: bold;">' + BILLING_CONFIG.COMPANY.phone + '</a></p>' +
    '<p style="margin: 5px 0; font-size: 16px;">💬 <a href="https://wa.me/972587876549" style="color: #25D366; text-decoration: none; font-weight: bold;">WhatsApp</a></p>' +
    '</div><div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">' +
    '<p style="color: #7f8c8d; font-size: 14px; margin: 5px 0;"><strong style="color: #2c3e50;">JUST A SECOND</strong><br>מרחב שמחבר בין עיצוב, קיימות וקהילה</p>' +
    '<p style="color: #e74c3c; font-size: 13px; margin: 15px 0 5px 0; font-weight: 600;">⭐ ' + BILLING_CONFIG.COMPANY.note + '</p>' +
    '<p style="color: #95a5a6; font-size: 12px; margin: 10px 0 0 0;">© 2025 JUST A SECOND. All rights reserved.</p></div></div></div></body></html>';
}

function formatDate(dateString) {
  if (!dateString) return 'לא צוין';
  try {
    var date = new Date(dateString);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var dayNames = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    var dayOfWeek = dayNames[date.getDay()];
    return 'יום ' + dayOfWeek + ', ' + day + '/' + month + '/' + year;
  } catch (error) {
    return dateString;
  }
}

// ==================== HELPER FUNCTIONS ====================

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function buildSummary(p, activities) {
  var html = '<div dir="rtl" style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#f9f9f9;border:1px solid #ddd">';
  html += '<h2 style="color:#4e6b5a">פרטי ההרשמה</h2>';
  html += '<table style="width:100%;border-collapse:collapse">';
  
  function addRow(label, value) {
    if (value) {
      html += '<tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:bold">' + esc(label) + '</td>';
      html += '<td style="padding:8px;border-bottom:1px solid #eee">' + esc(value) + '</td></tr>';
    }
  }
  
  addRow('סוג גוף', p.org_type);
  addRow('שם הארגון', p.org_exact_name);
  addRow('שם המחלקה', p.org_department);
  addRow('ח"פ / מספר עמותה', p.org_id);
  addRow('שם איש קשר', p.contact_name);
  addRow('תפקיד', p.contact_role);
  addRow('מייל', p.contact_email);
  addRow('טלפון', p.contact_phone);
  addRow('פעילויות', activities);
  addRow('מספר אנשים', p.visit_people);
  addRow('תאריך', p.visit_dates);
  addRow('שעות', p.visit_hours);
  addRow('שי', p.gift);
  addRow('תקציב לשי', p.gift_budget);
  addRow('כיבוד', p.catering);
  addRow('הערות כיבוד', p.catering_notes);
  addRow('אופן תשלום', p.payment);
  addRow('שם לקוח (לדרישת תשלום)', p.payment_invoice_name);
  addRow('מייל לדרישת תשלום', p.payment_invoice_email);
  addRow('מידע נוסף', p.notes);
  
  html += '</table></div>';
  return html;
}

// ==================== TEST FUNCTION ====================

function testBillingEmail() {
  var testData = {
    contact_name: 'יובל סימון',
    contact_email: Session.getActiveUser().getEmail(),
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
