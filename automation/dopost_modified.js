/**
 * Modified doPost function with Billing Email Integration
 * 
 * This version includes:
 * 1. Original functionality (save to sheet, send admin email, send confirmation)
 * 2. NEW: Automatic billing invoice email
 */

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
      // Show exactly what sheets exist
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
    
    // Send admin email
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New JAS submission' + (p.org_type ? ' – ' + p.org_type : ''),
        htmlBody: summary,
        name: 'JUST A SECOND'
      });
    } catch (e1) {
      Logger.log('Admin email error: ' + e1);
    }

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
      
      // Send billing email (from billing_email_script.js)
      sendBillingEmail(formData);
      Logger.log('✅ Billing email sent successfully');
      
    } catch (billingError) {
      // Don't fail the whole submission if billing email fails
      Logger.log('⚠️ Billing email error (non-critical): ' + billingError);
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
      } catch (e2) {
        Logger.log('User confirmation email error: ' + e2);
      }
    }

    return HtmlService.createHtmlOutput('<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>הצלחה</title><style>body{font-family:Heebo,Arial;display:grid;place-items:center;height:100vh;background:#f6faf7;color:#4e6b5a}.card{background:#fff;padding:28px;border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(78,107,90,0.18)}.icon{font-size:40px}</style></head><body><div class="card"><div class="icon">✅</div><h1>הטופס נקלט בהצלחה!</h1><p>תודה על הרשמתך</p></div></body></html>');
  } catch (err) {
    Logger.log('Critical error in doPost: ' + err);
    return ContentService.createTextOutput('Error: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}
