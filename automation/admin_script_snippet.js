/**
 * =======================================================
 * ADMIN DASHBOARD API UPDATE
 * Copy and Paste these functions into your Google Apps Script
 * Replacing the existing doGet() function.
 * =======================================================
 */

var ADMIN_KEY = 'secret_jas_admin_2025'; // Keep this secret!

// Updated doGet to handle both Redirects AND JSON Data
function doGet(e) {
    var p = (e && e.parameter) ? e.parameter : {};

    // Check if this is an API request from the Admin Panel
    if (p.action === 'getAdminData') {
        if (p.key !== ADMIN_KEY) {
            return ContentService.createTextOutput(JSON.stringify({ error: 'Invalid Key' }))
                .setMimeType(ContentService.MimeType.JSON);
        }
        return getAdminDataAsJSON();
    }

    // Default behavior (Redirect to Website)
    var html = '<html><head><meta http-equiv="refresh" content="0; url=\'' + HOME_URL + '\'"/></head><body>Redirecting...</body></html>';
    return HtmlService.createHtmlOutput(html);
}

// Helper to fetch data and format as JSON
function getAdminDataAsJSON() {
    try {
        var ss = SpreadsheetApp.openByUrl(SHEET_URL);
        var sheet = ss.getSheetByName(SHEET_NAME);
        if (!sheet) return jsonError('Sheet not found');

        // Get all data efficiently
        var data = sheet.getDataRange().getDisplayValues(); // Use DisplayValues to get formatted dates/strings
        var rows = data.slice(1); // Skip header row

        // Map based on the column order in doPost
        // Indices based on: [org_type, org_exact_name, org_department, org_id, contact_name, contact_role, contact_email, contact_phone, activities, visit_people, visit_dates, visit_hours, gift, gift_budget, catering, catering_notes, payment, invoice_name, invoice_email, notes, timestamp]

        var result = rows.map(function (row) {
            // Simple logic to guess status (if date is past = done?)
            // Ideally you would add a 'Status' column to your sheet manually (col 22)
            var status = 'new';

            return {
                org_type: row[0],
                org: row[1] || row[0], // fallback to type if name empty
                contact: row[4],
                email: row[6],
                phone: row[7],
                activity: row[8],
                participants: parseInt(row[9]) || 0,
                visit_date: row[10],
                visit_hours: row[11],
                payment_method: row[16],
                timestamp: row[20],
                status: status
            };
        });

        // Sort by recent first
        result.reverse();

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return jsonError(err.toString());
    }
}

function jsonError(msg) {
    return ContentService.createTextOutput(JSON.stringify({ error: msg }))
        .setMimeType(ContentService.MimeType.JSON);
}
