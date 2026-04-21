/**
 * MERGED SCRIPT: Your Existing Form Logic + Admin Dashboard Data
 * 
 * INSTRUCTIONS:
 * 1. Replace your entire Google Script with this code.
 * 2. Save and Deploy as Web App (Execution: Me, Access: Anyone).
 */

/***** CONFIG *****/
var SHEET_URL = 'https://docs.google.com/spreadsheets/d/1piB6K-D-PyNHaG_XNqiHYRlczKJUQW_7dLMg5N51zUc/edit';
var SHEET_NAME = 'טופס מרכזי - לקוחות';
var ADMIN_EMAIL = 'justasecondil2@gmail.com';
var HOME_URL = 'https://magical-llama-e95d2c.netlify.app/';

// New Admin Key
var ADMIN_KEY = 'secret_jas_admin_2025';

function doGet(e) {
    var p = (e && e.parameter) ? e.parameter : {};

    // === NEW: Handle Admin Data Request ===
    if (p.action === 'getAdminData') {
        if (p.key !== ADMIN_KEY) {
            return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid Key' }))
                .setMimeType(ContentService.MimeType.JSON);
        }
        return getAdminDataAsJSON();
    }
    // ======================================

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
                    replyTo: 'mayaka712@gmail.com'
                });
            } catch (e2) { }
        }

        return HtmlService.createHtmlOutput('<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>הצלחה</title><style>body{font-family:Heebo,Arial;display:grid;place-items:center;height:100vh;background:#f6faf7;color:#4e6b5a}.card{background:#fff;padding:28px;border-radius:16px;text-align:center;box-shadow:0 10px 25px rgba(78,107,90,0.18)}.icon{font-size:40px}</style></head><body><div class="card"><div class="icon">✅</div><h1>הטופס נקלט בהצלחה!</h1><p>תודה על הרשמתך</p></div></body></html>');
    } catch (err) {
        return ContentService.createTextOutput('Error: ' + err).setMimeType(ContentService.MimeType.TEXT);
    }
}

// === NEW: Helper to fetch data for Admin Panel ===
function getAdminDataAsJSON() {
    try {
        var ss = SpreadsheetApp.openByUrl(SHEET_URL);
        var sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) return jsonError('Sheet not found');

        var data = sheet.getDataRange().getDisplayValues();
        var rows = data.slice(1); // Skip header

        // Map your specific column structure
        var result = rows.map(function (row) {
            return {
                org_type: row[0],
                org: row[1] || row[0],
                contact: row[4],
                email: row[6],
                phone: row[7],
                activity: row[8],
                participants: parseInt(row[9]) || 0,
                visit_date: row[10],
                timestamp: row[20],
                status: 'new' // You can add logic here if you have a status column
            };
        });

        return ContentService.createTextOutput(JSON.stringify(result.reverse()))
            .setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return jsonError(err.toString());
    }
}

function jsonError(msg) {
    return ContentService.createTextOutput(JSON.stringify({ error: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}

// Existing helpers...
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
