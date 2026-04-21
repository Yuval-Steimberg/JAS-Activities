/**
 * ADMIN ONLY SCRIPT
 * 
 * INSTRUCTIONS:
 * 1. Create a NEW Google Apps Script project (separate from your form script).
 * 2. Paste this code.
 * 3. Deploy as Web App (Execute as: Me, Access: Anyone).
 * 4. Use this URL in your admin.js
 */

var SHEET_URL = 'https://docs.google.com/spreadsheets/d/1piB6K-D-PyNHaG_XNqiHYRlczKJUQW_7dLMg5N51zUc/edit';
var SHEET_NAME = 'טופס מרכזי - לקוחות';
var ADMIN_KEY = 'secret_jas_admin_2025';

function doGet(e) {
    var p = (e && e.parameter) ? e.parameter : {};

    // Check API Key
    if (p.key !== ADMIN_KEY) {
        return jsonResponse({ error: 'Invalid API Key' });
    }

    // ACTION: Get All Data
    if (p.action === 'getData') {
        return getAdminData();
    }

    return jsonResponse({ error: 'Unknown GET action' });
}

function doPost(e) {
    var p = (e && e.parameter) ? e.parameter : {};

    // For POST requests, sometimes data is in e.postData.contents if sent as JSON
    var postData = {};
    try {
        if (e.postData && e.postData.contents) {
            postData = JSON.parse(e.postData.contents);
        }
    } catch (err) {
        // ignore
    }

    // Merge parameters
    for (var k in p) { postData[k] = p[k]; }

    // Check API Key
    if (postData.key !== ADMIN_KEY) {
        return jsonResponse({ error: 'Invalid API Key' });
    }

    // ACTION: Send Email
    if (postData.action === 'sendEmail') {
        return sendAdminEmail(postData);
    }

    return jsonResponse({ error: 'Unknown POST action: ' + postData.action });
}

// ======================= ACTIONS =======================

function getAdminData() {
    try {
        var ss = SpreadsheetApp.openByUrl(SHEET_URL);
        var sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) return jsonResponse({ error: 'Sheet not found' });

        var data = sheet.getDataRange().getDisplayValues();
        var rows = data.slice(1); // Skip header

        // Map rows to object
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
                status: 'new' // Placeholder for future status column
                // We could add row index here if we want to edit specific rows later
            };
        });

        // Return recent first
        return jsonResponse(result.reverse());
    } catch (err) {
        return jsonResponse({ error: err.toString() });
    }
}

function sendAdminEmail(data) {
    try {
        // Validate required fields
        if (!data.to || !data.subject || !data.body) {
            return jsonResponse({ error: 'Missing email fields (to, subject, body)' });
        }

        MailApp.sendEmail({
            to: data.to,
            subject: data.subject,
            htmlBody: data.body, // Support HTML
            name: 'JUST A SECOND'
        });

        return jsonResponse({ success: true, message: 'Email sent successfully to ' + data.to });
    } catch (err) {
        return jsonResponse({ error: 'Failed to send email: ' + err.toString() });
    }
}

// ======================= HELPERS =======================

function jsonResponse(data) {
    return ContentService.createTextOutput(JSON.stringify(data))
        .setMimeType(ContentService.MimeType.JSON);
}
