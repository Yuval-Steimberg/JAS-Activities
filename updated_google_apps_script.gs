/***** CONFIG *****/
var SHEET_URL = 'https://docs.google.com/spreadsheets/d/1piB6K-D-PyNHaG_XNqiHYRlczKJUQW_7dLMg5N51zUc/edit';
var SHEET_NAME = 'טופס מרכזי - לקוחות';
var ADMIN_EMAIL = 'justasecond12@gmail.com';

// Redirect URLs
var HOME_URL = 'https://jas-activities.vercel.app';
var SUCCESS_URL = 'https://jas-activities.vercel.app/success.html';

function doGet(e) {
  var html = '<html><head><meta http-equiv="refresh" content="0; url=\'' + HOME_URL + '\'"/></head><body>Redirecting to ' + HOME_URL + '...</body></html>';
  return HtmlService.createHtmlOutput(html);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openByUrl(SHEET_URL);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Fallback if sheet missing
    if (!sheet) {
      return ContentService.createTextOutput('Error: Sheet "' + SHEET_NAME + '" not found.').setMimeType(ContentService.MimeType.TEXT);
    }

    var p = (e && e.parameter) ? e.parameter : {};
    if (p.website) return HtmlService.createHtmlOutput(''); // Honeypot

    // Spam prevention (simple)
    var emailKey = (p.contact_email || '').toLowerCase().trim();
    if (emailKey) {
      var cache = CacheService.getScriptCache();
      if (cache.get('lock:' + emailKey)) {
        return ContentService.createTextOutput('Please wait 60 seconds before resubmitting.').setMimeType(ContentService.MimeType.TEXT);
      }
      cache.put('lock:' + emailKey, '1', 60);
    }

    // Process Activities
    var activities = '';
    if (p.activities) {
      if (Object.prototype.toString.call(p.activities) === '[object Array]') {
        activities = p.activities.join(', ');
      } else {
        activities = String(p.activities);
      }
    }

    // Append Row
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
    try {
      MailApp.sendEmail({
        to: ADMIN_EMAIL,
        subject: 'New JAS submission' + (p.org_type ? ' – ' + p.org_type : ''),
        htmlBody: summary,
        name: 'JUST A SECOND'
      });
    } catch (e1) { }

    if (p.contact_email) {
      var displayName = p.contact_name || 'שלום';
      var userHtml = '<div dir="rtl"><p>' + esc(displayName) + ', תודה! קיבלנו את הפרטים.</p>' + summary + '<p>בברכה,<br>JUST A SECOND</p></div>';
      try {
        MailApp.sendEmail({
          to: p.contact_email,
          subject: 'תודה! קיבלנו את הטופס שלך',
          htmlBody: userHtml,
          name: 'JUST A SECOND',
          replyTo: 'justasecond12@gmail.com'
        });
      } catch (e2) { }
    }

    var successHtml = '<html><head>' +
      '<script>window.top.location.href = "' + SUCCESS_URL + '";<\/script>' +
      '<meta http-equiv="refresh" content="0; url=\'' + SUCCESS_URL + '\'"/>' +
      '</head><body>Redirecting...</body></html>';
    return HtmlService.createHtmlOutput(successHtml);

  } catch (err) {
    return ContentService.createTextOutput('Error: ' + err).setMimeType(ContentService.MimeType.TEXT);
  }
}

function buildSummary(p, activities) {
  var row = function (l, v) {
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
