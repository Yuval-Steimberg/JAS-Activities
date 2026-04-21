/**
 * Daily Email Reminder Agent - Google Apps Script
 * 
 * This script automatically:
 * 1. Runs every day at a specified time
 * 2. Checks Google Sheets for activities scheduled for today
 * 3. Sends email reminders to contacts
 * 
 * Setup:
 * 1. Open your Google Sheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste this code
 * 4. Run setupDailyTrigger() once to enable automatic daily execution
 */

// ==================== CONFIGURATION ====================

// Sheet configuration
const CONFIG = {
  // Name of the sheet with registration data
  SHEET_NAME: 'Responses', // Change to your sheet name
  
  // Column numbers (adjust based on your sheet structure)
  COLUMNS: {
    TIMESTAMP: 0,        // Column A - Submission timestamp
    ORG_TYPE: 1,         // Column B - Organization type
    ORG_NAME: 2,         // Column C - Organization name
    CONTACT_NAME: 3,     // Column D - Contact person name
    CONTACT_EMAIL: 4,    // Column E - Contact email
    CONTACT_PHONE: 5,    // Column F - Contact phone
    VISIT_DATE: 6,       // Column G - Visit date
    VISIT_PEOPLE: 7,     // Column H - Number of people
    VISIT_HOURS: 8,      // Column I - Visit hours
    ACTIVITIES: 9,       // Column J - Activities
    REMINDER_SENT: 10    // Column K - Reminder sent flag (auto-created)
  },
  
  // Email settings
  EMAIL: {
    FROM_NAME: 'JUST A SECOND',
    SUBJECT: '🔔 תזכורת - הביקור שלכם מתקרב!',
    DAYS_BEFORE: 1, // Send reminder 1 day before
  },
  
  // Trigger time (when to run daily check)
  TRIGGER_HOUR: 9, // 9 AM
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Main function - runs daily to check and send reminders
 * This is the function that gets triggered automatically
 */
function checkAndSendDailyReminders() {
  Logger.log('=== Starting Daily Reminder Check ===');
  Logger.log('Time: ' + new Date().toString());
  
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    let remindersSent = 0;
    let errorsCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Check if this row needs a reminder
        if (shouldSendReminder(row, i)) {
          sendReminderEmail(row, i + 1); // +1 because sheets are 1-indexed
          remindersSent++;
        }
      } catch (error) {
        Logger.log(`Error processing row ${i + 1}: ${error}`);
        errorsCount++;
      }
    }
    
    Logger.log(`=== Reminder Check Complete ===`);
    Logger.log(`Reminders sent: ${remindersSent}`);
    Logger.log(`Errors: ${errorsCount}`);
    
    // Optional: Send summary email to admin
    if (remindersSent > 0) {
      sendAdminSummary(remindersSent, errorsCount);
    }
    
  } catch (error) {
    Logger.log('Fatal error: ' + error);
    sendErrorNotification(error);
  }
}

/**
 * Check if a reminder should be sent for this row
 */
function shouldSendReminder(row, rowIndex) {
  const email = row[CONFIG.COLUMNS.CONTACT_EMAIL];
  const visitDate = row[CONFIG.COLUMNS.VISIT_DATE];
  const reminderSent = row[CONFIG.COLUMNS.REMINDER_SENT];
  
  // Skip if no email
  if (!email || email.trim() === '') {
    return false;
  }
  
  // Skip if no visit date
  if (!visitDate) {
    return false;
  }
  
  // Skip if reminder already sent
  if (reminderSent === 'SENT' || reminderSent === true) {
    return false;
  }
  
  // Check if visit date matches reminder criteria
  const targetDate = getTargetReminderDate();
  const visitDateObj = parseDate(visitDate);
  
  if (!visitDateObj) {
    Logger.log(`Row ${rowIndex + 1}: Invalid date format: ${visitDate}`);
    return false;
  }
  
  // Check if visit date matches target date
  if (isSameDay(visitDateObj, targetDate)) {
    Logger.log(`Row ${rowIndex + 1}: Match! Sending reminder for ${email}`);
    return true;
  }
  
  return false;
}

/**
 * Send reminder email to contact
 */
function sendReminderEmail(row, rowNumber) {
  const name = row[CONFIG.COLUMNS.CONTACT_NAME] || 'לקוח יקר';
  const email = row[CONFIG.COLUMNS.CONTACT_EMAIL];
  const visitDate = row[CONFIG.COLUMNS.VISIT_DATE];
  const visitHours = row[CONFIG.COLUMNS.VISIT_HOURS] || 'לא צוין';
  const numPeople = row[CONFIG.COLUMNS.VISIT_PEOPLE] || 'לא צוין';
  const orgName = row[CONFIG.COLUMNS.ORG_NAME] || row[CONFIG.COLUMNS.ORG_TYPE] || '';
  const phone = '058-787-6549';
  
  // Format date nicely
  const dateObj = parseDate(visitDate);
  const formattedDate = formatDateHebrew(dateObj);
  
  // Create email body
  const emailBody = createEmailBody({
    name: name,
    visitDate: formattedDate,
    visitHours: visitHours,
    numPeople: numPeople,
    orgName: orgName,
    phone: phone
  });
  
  try {
    // Send email
    MailApp.sendEmail({
      to: email,
      subject: CONFIG.EMAIL.SUBJECT,
      htmlBody: emailBody,
      name: CONFIG.EMAIL.FROM_NAME
    });
    
    Logger.log(`✅ Reminder sent to: ${email} (${name})`);
    
    // Mark as sent in sheet
    markReminderAsSent(rowNumber);
    
    return true;
    
  } catch (error) {
    Logger.log(`❌ Failed to send email to ${email}: ${error}`);
    throw error;
  }
}

/**
 * Create HTML email body
 */
function createEmailBody(data) {
  return `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; padding: 20px; direction: rtl;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #4e6b5a; color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔔 תזכורת ידידותית</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">JUST A SECOND</p>
        </div>
        
        <!-- Body -->
        <div style="padding: 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
            שלום <strong>${data.name}</strong>! 👋
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            זוהי תזכורת ידידותית - <strong>הביקור שלכם ב-JUST A SECOND מתקרב!</strong>
          </p>
          
          <!-- Details Box -->
          <div style="background-color: #f9f9f9; border-right: 4px solid #4e6b5a; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="margin-top: 0; color: #4e6b5a; font-size: 20px;">📋 פרטי הביקור</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold; width: 40%;">📅 תאריך:</td>
                <td style="padding: 8px 0; color: #333;">${data.visitDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">⏰ שעות:</td>
                <td style="padding: 8px 0; color: #333;">${data.visitHours}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">👥 מספר משתתפים:</td>
                <td style="padding: 8px 0; color: #333;">${data.numPeople}</td>
              </tr>
              ${data.orgName ? `
              <tr>
                <td style="padding: 8px 0; color: #666; font-weight: bold;">🏢 ארגון:</td>
                <td style="padding: 8px 0; color: #333;">${data.orgName}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            אנחנו מצפים לראותכם! 💚
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6;">
            אם יש שינויים בתכנון או שאלות נוספות, אנא צרו קשר:
          </p>
          
          <!-- Contact Box -->
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p style="margin: 5px 0; font-size: 16px; color: #333;">
              📞 <a href="tel:${data.phone}" style="color: #4e6b5a; text-decoration: none; font-weight: bold;">${data.phone}</a>
            </p>
            <p style="margin: 5px 0; font-size: 16px;">
              💬 <a href="https://wa.me/972587876549" style="color: #4e6b5a; text-decoration: none; font-weight: bold;">WhatsApp</a>
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 14px; margin: 5px 0;">
              🏡 <strong>JUST A SECOND</strong>
            </p>
            <p style="color: #999; font-size: 14px; margin: 5px 0;">
              מרחב שמחבר בין עיצוב, קיימות וקהילה
            </p>
            <p style="color: #999; font-size: 12px; margin: 15px 0 5px 0;">
              הרווחים מהמכירות מופנים לסיוע נפשי לכוחות הבטחון
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Mark reminder as sent in the sheet
 */
function markReminderAsSent(rowNumber) {
  const sheet = getSheet();
  const reminderColumn = CONFIG.COLUMNS.REMINDER_SENT + 1; // Convert to 1-indexed
  
  // Add column header if it doesn't exist
  if (rowNumber === 2) { // First data row
    sheet.getRange(1, reminderColumn).setValue('Reminder Sent');
  }
  
  sheet.getRange(rowNumber, reminderColumn).setValue('SENT');
  sheet.getRange(rowNumber, reminderColumn).setNote('Sent on: ' + new Date().toString());
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Get the sheet
 */
function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  
  if (!sheet) {
    throw new Error(`Sheet "${CONFIG.SHEET_NAME}" not found!`);
  }
  
  return sheet;
}

/**
 * Get target date for reminder (today + DAYS_BEFORE)
 */
function getTargetReminderDate() {
  const today = new Date();
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + CONFIG.EMAIL.DAYS_BEFORE);
  return targetDate;
}

/**
 * Parse date from various formats
 */
function parseDate(dateValue) {
  if (!dateValue) return null;
  
  // If it's already a Date object
  if (dateValue instanceof Date) {
    return dateValue;
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    // Try DD/MM/YYYY format
    const parts = dateValue.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // Month is 0-indexed
      const year = parseInt(parts[2]);
      return new Date(year, month, day);
    }
    
    // Try standard parsing
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  
  return null;
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

/**
 * Format date in Hebrew
 */
function formatDateHebrew(date) {
  if (!date) return 'תאריך לא זמין';
  
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  const dayOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'][date.getDay()];
  
  return `יום ${dayOfWeek}, ${day}/${month}/${year}`;
}

/**
 * Send admin summary
 */
function sendAdminSummary(remindersSent, errors) {
  try {
    const adminEmail = Session.getActiveUser().getEmail();
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: '✅ Daily Reminder Summary - JUST A SECOND',
      body: `
Daily Reminder Report
=====================

Date: ${new Date().toString()}
Reminders Sent: ${remindersSent}
Errors: ${errors}

Check the script logs for details.
      `
    });
  } catch (error) {
    Logger.log('Failed to send admin summary: ' + error);
  }
}

/**
 * Send error notification
 */
function sendErrorNotification(error) {
  try {
    const adminEmail = Session.getActiveUser().getEmail();
    
    MailApp.sendEmail({
      to: adminEmail,
      subject: '❌ Error in Daily Reminder Script - JUST A SECOND',
      body: `
An error occurred in the daily reminder script:

Error: ${error}
Time: ${new Date().toString()}

Please check the script and logs.
      `
    });
  } catch (e) {
    Logger.log('Failed to send error notification: ' + e);
  }
}

// ==================== SETUP FUNCTIONS ====================

/**
 * Setup daily trigger - RUN THIS ONCE
 * This creates an automatic trigger that runs checkAndSendDailyReminders() every day
 */
function setupDailyTrigger() {
  // Delete existing triggers first to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'checkAndSendDailyReminders') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new daily trigger
  ScriptApp.newTrigger('checkAndSendDailyReminders')
    .timeBased()
    .atHour(CONFIG.TRIGGER_HOUR)
    .everyDays(1)
    .create();
  
  Logger.log(`✅ Daily trigger created! Will run every day at ${CONFIG.TRIGGER_HOUR}:00`);
  
  // Send confirmation email
  const userEmail = Session.getActiveUser().getEmail();
  MailApp.sendEmail({
    to: userEmail,
    subject: '✅ Daily Reminder Trigger Setup Complete',
    body: `
Daily email reminder automation is now active!

Schedule: Every day at ${CONFIG.TRIGGER_HOUR}:00
Function: checkAndSendDailyReminders()

The system will automatically:
1. Check your Google Sheet for upcoming activities
2. Send email reminders ${CONFIG.EMAIL.DAYS_BEFORE} day(s) before each event
3. Mark reminders as sent

You can view trigger status at:
https://script.google.com/home/triggers

To test manually, run: testReminderSystem()
    `
  });
}

/**
 * Remove all triggers
 */
function removeAllTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log('All triggers removed');
}

/**
 * Test the reminder system manually
 */
function testReminderSystem() {
  Logger.log('=== TESTING REMINDER SYSTEM ===');
  
  // Test configuration
  Logger.log('Sheet name: ' + CONFIG.SHEET_NAME);
  Logger.log('Days before: ' + CONFIG.EMAIL.DAYS_BEFORE);
  Logger.log('Trigger hour: ' + CONFIG.TRIGGER_HOUR);
  
  // Test sheet access
  try {
    const sheet = getSheet();
    Logger.log('✅ Sheet found: ' + sheet.getName());
    Logger.log('Rows: ' + sheet.getLastRow());
  } catch (error) {
    Logger.log('❌ Sheet error: ' + error);
    return;
  }
  
  // Run the reminder check
  checkAndSendDailyReminders();
}

/**
 * Send test email to yourself
 */
function sendTestEmail() {
  const userEmail = Session.getActiveUser().getEmail();
  
  const testData = {
    name: 'שם לבדיקה',
    visitDate: 'מחר',
    visitHours: '10:00-13:00',
    numPeople: '25',
    orgName: 'חברה לדוגמה',
    phone: '058-787-6549'
  };
  
  const emailBody = createEmailBody(testData);
  
  MailApp.sendEmail({
    to: userEmail,
    subject: '🧪 TEST - ' + CONFIG.EMAIL.SUBJECT,
    htmlBody: emailBody,
    name: CONFIG.EMAIL.FROM_NAME
  });
  
  Logger.log('Test email sent to: ' + userEmail);
}
