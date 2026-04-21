/***** CONFIG *****/
var SHEET_URL = 'https://docs.google.com/spreadsheets/d/1piB6K-D-PyNHaG_XNqiHYRlczKJUQW_7dLMg5N51zUc/edit';
var SHEET_NAME = 'טופס מרכזי - לקוחות';
var ADMIN_EMAIL = 'mayaka712@gmail.com';
var HOME_URL = 'https://magical-llama-e95d2c.netlify.app/';

// ==================== BILLING CONFIGURATION ====================

var BILLING_CONFIG = {
  FROM_NAME: 'JUST A SECOND',
  SUBJECT: 'הצעת מחיר | הרשאה חוזית מיידית עם תרומה - JUST A SECOND',
  OPENING_PARAGRAPH: 'עבור א.ב. דרוש ניהול פרויקטים הסכמים בע"מ',
  CUSTOMER_SECTION_TITLE: 'קצת עלינו',
  CUSTOMER_SECTION_TEXT: 'JUST A SECOND הוא מיזם סביבתי-חברתי שמציע פתרון מערכתי רחב היקף לניהול ושימוש חוזר בפסולת גושית - תוך הפיכתה למשאב קהילתי, עיצובי וכלכלי. המיזם פועל מתוך תפיסת עולם שמבקשת לא רק לצמצם נזק אלא לייצר ערך - לסביבה, לאדם ולחברה. רווחי המיזם נרתמים לעמותת "בשביל המחר" לסיוע נפשי ללוחמים וכוחות הבטחון',
  PAYMENT_NOTE: 'נפשי לכוחות ש/ח.    מועד תחילתן – 25-12-25 | מספר משתתפים – 15',
  PRICING: {
    tour: {
      name: 'סיור והרצאת השראה',
      description: 'סיור והרצאת השראה בחנם נספר על הבעיה החברתית והתמיכה שלנו תוך שילוב סיפורים מהשטח, שם המרצאה: אשה, אתמאול, מיוחדת והנחלת שופתה של JUST A SECOND',
      priceTotal: 1000,
      participants: 15,
      note: 'לשעה וחצי – שעתיים'
    },
    workshop_team: {
      name: '"יום בחיי JAS - סדנת מיחדוש ותרומה לקהילה"',
      description: 'בסדנא תלכדו כיחד לטובת הקהילה והחברה. שיתוף/שיחה/קפה, מול קבוצת 30 ב JAS או בשלכם-שיחה/שיתוף על הרעיון, בימים הקשה הרחיים וצעיר שאנו מלכדות הגלריה שלנו. הפריטים שיאנכו לכוחות הבטחון',
      pricePerPerson: 2400,
      participants: 15,
      maxPrice: 1500,
      note: '15 ש"ח (מקסימום 1,500 למשתתף)',
      additionalNote: 'לשעה וחצי – שעתיים'
    },
    option: {
      name: 'אופציה - כיבוד קל ושתיה חמה',
      description: 'ככלל מבחר עוגות / עוגיות / פיצוחים/ נשנושים/ פיתות לאורך כל היום (ללא א. בקרק)',
      pricePerPerson: 1500,
      participants: 15,
      priceRange: '15 ש"ח ל 30 ש"ח',
      note: 'בשעה וחצי - שעתיים'
    }
  },
  DISCOUNT_PERCENTAGE: 20,
  DISCOUNT_NOTE: 'פחות 20% הנחה',
  FOOTER_NOTES: [
    '* המשתתפים סדנא תשלום מסכם ב 580138122',
    '* לשאלות סדנא תשלום תקציב 10% הנחה לרכישת בתוכנה'
  ],
  PAYMENT_INFO: {
    accountNumber: '580138122',
    bankName: 'בנק הפועלים',
    branch: '549'
  },
  CONTACT: {
    instagram: '/justasecondil',
    website: 'justasecond.co.il',
    phone: '058-787-6549',
    tagline: 'צרו קשר'
  }
};

// ==================== YOUR ORIGINAL FUNCTIONS (UNCHANGED) ====================

function doGet(e) {
  var html = '<html><head><meta http-equiv="refresh" content="0; url=\'' + HOME_URL + '\'"/></head><body>OK</body></html>';
  return HtmlService.createHtmlOutput(html);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openByUrl(SHEET_URL);
    
    // DEBUG: Get all sheet names
    var allSheets = ss.getSheets();
    var sheetNames = [];
    for (var i = 0; i < allSheets.length; i++) {
      sheetNames.push('"' + allSheets[i].getName() + '"');
    }
    
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return ContentService.createTextOutput(
        'Sheet not found: "' + SHEET_NAME + '"\n\n' +
        'Available sheets in this spreadsheet:\n' +
        sheetNames.join('\n')
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
    
    // ✨ NEW: Generate PDF
    var pdfBlob = null;
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
      pdfBlob = createBillingPDF(formData);
    } catch (pdfError) {
      Logger.log('PDF error: ' + pdfError);
    }
    
    // Send admin email (WITH PDF)
    try {
      var adminOptions = {
        to: ADMIN_EMAIL,
        subject: 'New JAS submission' + (p.org_type ? ' – ' + p.org_type : ''),
        htmlBody: summary,
        name: 'JUST A SECOND'
      };
      if (pdfBlob) {
        adminOptions.attachments = [pdfBlob];
      }
      MailApp.sendEmail(adminOptions);
    } catch (e1) {}

    // Send customer email (WITH PDF)
    if (p.contact_email) {
      var displayName = p.contact_name || 'שלום';
      var userHtml = '<div dir="rtl"><p>' + esc(displayName) + ', תודה! קיבלנו את הפרטים.</p>' + summary + '<p>בברכה,<br>JUST A SECOND</p></div>';
      try {
        var userOptions = {
          to: p.contact_email,
          subject: 'תודה! קיבלנו את הטופס שלך',
          htmlBody: userHtml,
          name: 'JUST A SECOND',
          replyTo: 'mayaka712@gmail.com'
        };
        if (pdfBlob) {
          userOptions.attachments = [pdfBlob];
        }
        MailApp.sendEmail(userOptions);
      } catch (e2) {}
    }

    return HtmlService.createHtmlOutput('<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>הצלחה</title><style>body{font-family:Heebo,Arial;display:grid;place-items:center;height:100vh;background:#f6faf7;color:#4e6b5a}.card{background:#fff;padding:28px;border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(78,107,90,0.18)}.icon{font-size:40px}</style></head><body><div class="card"><div class="icon">✅</div><h1>הטופס נקלט בהצלחה!</h1><p>תודה על הרשמתך</p></div></body></html>');
  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

function buildSummary(p, activities) {
  var row = function(l, v) {
    return '<tr><td style="padding:6px 10px;border:1px solid #eee"><b>' + l + '</b></td><td style="padding:6px 10px;border:1px solid #eee">' + esc(v) + '</td></tr>';
  };
  return '<div dir="rtl"><table style="border-collapse:collapse;width:100%">' +
    row('סוג גוף', p.org_type) + row('שם מדויק', p.org_exact_name) + row('מחלקה', p.org_department) +
    row('ח"פ', p.org_id) + row('שם', p.contact_name) + row('תפקיד', p.contact_role) +
    row('מייל', p.contact_email) + row('טלפון', p.contact_phone) + row('פעילויות', activities) +
    row('משתתפים', p.visit_people) + row('תאריך', p.visit_dates) + row('שעות', p.visit_hours) +
    row('שי', p.gift) + row('תקציב', p.gift_budget) + row('כיבוד', p.catering) +
    row('העדפות', p.catering_notes) + row('תשלום', p.payment) +
    row('שם לחשבונית', p.payment_invoice_name || '') + row('מייל לחשבונית', p.payment_invoice_email || '') +
    row('הערות', p.notes) + '</table></div>';
}

function esc(v) {
  if (!v) return '';
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==================== NEW PDF FUNCTIONS ====================

function createBillingPDF(formData) {
  var billingDetails = calculateBilling(formData);
  var htmlContent = createBillingHTMLForPDF(formData, billingDetails);
  var htmlBlob = Utilities.newBlob(htmlContent, 'text/html', 'invoice.html');
  var pdfBlob = htmlBlob.getAs('application/pdf');
  pdfBlob.setName('הצעת_מחיר_JUST_A_SECOND.pdf');
  return pdfBlob;
}

function calculateBilling(formData) {
  var numPeople = parseInt(formData.visit_people) || 15;
  var items = [];
  var subtotal = 0;
  
  items.push({
    name: BILLING_CONFIG.PRICING.tour.name,
    description: BILLING_CONFIG.PRICING.tour.description,
    participants: BILLING_CONFIG.PRICING.tour.participants,
    pricePerUnit: '',
    total: BILLING_CONFIG.PRICING.tour.priceTotal,
    note: BILLING_CONFIG.PRICING.tour.note
  });
  subtotal += BILLING_CONFIG.PRICING.tour.priceTotal;
  
  var workshopPrice = BILLING_CONFIG.PRICING.workshop_team.pricePerPerson;
  var workshopTotal = workshopPrice * numPeople;
  items.push({
    name: BILLING_CONFIG.PRICING.workshop_team.name,
    description: BILLING_CONFIG.PRICING.workshop_team.description,
    participants: numPeople,
    pricePerUnit: workshopPrice + ' ש"ח (מקסימום ' + BILLING_CONFIG.PRICING.workshop_team.maxPrice + ' למשתתף)',
    total: workshopTotal,
    note: BILLING_CONFIG.PRICING.workshop_team.additionalNote
  });
  subtotal += workshopTotal;
  
  var optionPrice = BILLING_CONFIG.PRICING.option.pricePerPerson;
  var optionTotal = optionPrice * BILLING_CONFIG.PRICING.option.participants;
  items.push({
    name: BILLING_CONFIG.PRICING.option.name,
    description: BILLING_CONFIG.PRICING.option.description,
    participants: BILLING_CONFIG.PRICING.option.participants,
    pricePerUnit: BILLING_CONFIG.PRICING.option.priceRange,
    total: optionTotal,
    note: BILLING_CONFIG.PRICING.option.note
  });
  subtotal += optionTotal;
  
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

function createBillingHTMLForPDF(formData, billing) {
  var html = '<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8">' +
    '<style>' +
    'body { font-family: Arial, sans-serif; direction: rtl; margin: 40px; }' +
    '.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }' +
    '.logo { width: 80px; height: 80px; background: #ff8c42; border-radius: 50%; }' +
    '.company-name { text-align: left; }' +
    '.company-name h1 { margin: 0; font-size: 24px; }' +
    '.company-name p { margin: 5px 0 0 0; font-size: 14px; color: #666; }' +
    'h2 { text-align: center; font-size: 20px; margin: 20px 0; }' +
    '.opening { text-align: center; margin: 20px 0; padding: 15px; background: #f5f5f5; }' +
    '.customer-section { margin: 30px 0; padding: 20px; background: #f9f9f9; border-right: 4px solid #ff8c42; }' +
    '.customer-section h3 { margin-top: 0; color: #ff8c42; }' +
    '.payment-note { text-align: center; margin: 20px 0; font-weight: bold; }' +
    'table { width: 100%; border-collapse: collapse; margin: 20px 0; }' +
    'th { background: #4a4a4a; color: white; padding: 12px; text-align: right; font-weight: bold; }' +
    'td { padding: 12px; border-bottom: 1px solid #ddd; vertical-align: top; }' +
    '.description { font-size: 12px; color: #666; margin-top: 5px; }' +
    '.note { font-size: 11px; color: #999; font-style: italic; margin-top: 5px; }' +
    '.total-row { background: #ff8c42; color: white; font-weight: bold; font-size: 16px; }' +
    '.total-cell { background: #ff8c42; color: white; font-weight: bold; padding: 15px; }' +
    '.footer-notes { margin: 20px 0; font-size: 12px; }' +
    '.footer-notes p { margin: 5px 0; }' +
    '.contact-bar { background: #4a4a4a; color: white; padding: 20px; margin-top: 40px; display: flex; justify-content: space-between; align-items: center; }' +
    '</style></head><body>';
  
  html += '<div class="header"><div class="logo"></div><div class="company-name"><h1>JUST A SECOND</h1><p>ליצירת מפגש משמעותי</p></div></div>';
  html += '<h2>הצעת מחיר | הרשאה חוזית מיידית עם תרומה<br>Just a Second</h2>';
  html += '<div class="opening">' + BILLING_CONFIG.OPENING_PARAGRAPH + '</div>';
  html += '<div class="customer-section"><h3>' + BILLING_CONFIG.CUSTOMER_SECTION_TITLE + '</h3><p>' + BILLING_CONFIG.CUSTOMER_SECTION_TEXT + '</p></div>';
  html += '<div class="payment-note">' + BILLING_CONFIG.PAYMENT_NOTE + '</div>';
  
  html += '<table><thead><tr><th style="width: 15%;">תיאור</th><th style="width: 50%;">תיאור</th><th style="width: 15%; text-align: center;">מספר משתתפים</th><th style="width: 20%; text-align: center;">מחיר בש"ח</th></tr></thead><tbody>';
  
  for (var i = 0; i < billing.items.length; i++) {
    var item = billing.items[i];
    html += '<tr><td><strong>' + item.name + '</strong></td><td>' + item.description + (item.note ? '<div class="note">' + item.note + '</div>' : '') + '</td>' +
      '<td style="text-align: center;">' + item.participants + '</td><td style="text-align: center;">' +
      (item.pricePerUnit ? item.pricePerUnit + '<br>' : '') + '<strong>' + item.total.toLocaleString('he-IL') + '</strong></td></tr>';
  }
  
  html += '<tr class="total-row"><td colspan="3" style="text-align: left; padding-right: 20px;">סה"כ</td><td style="text-align: center;">' + billing.subtotal.toLocaleString('he-IL') + '</td></tr></tbody></table>';
  html += '<table><tr><td colspan="3" style="text-align: left; padding-right: 20px; font-weight: bold;">' + BILLING_CONFIG.DISCOUNT_NOTE + ' = ₪' + billing.discountAmount.toLocaleString('he-IL') + '</td>' +
    '<td class="total-cell" style="text-align: center; font-size: 18px;">' + billing.finalTotal.toLocaleString('he-IL') + '<br><span style="font-size: 12px;">(כולל כיבוד ושתייה)</span></td></tr></table>';
  
  html += '<div class="footer-notes">';
  for (var j = 0; j < BILLING_CONFIG.FOOTER_NOTES.length; j++) {
    html += '<p>' + BILLING_CONFIG.FOOTER_NOTES[j] + '</p>';
  }
  html += '</div>';
  
  html += '<div class="contact-bar"><div>📷 ' + BILLING_CONFIG.CONTACT.instagram + '</div><div>🌐 ' + BILLING_CONFIG.CONTACT.website + '</div><div>📞 ' + BILLING_CONFIG.CONTACT.phone + '</div><div><strong>' + BILLING_CONFIG.CONTACT.tagline + '</strong></div></div>';
  html += '</body></html>';
  
  return html;
}
