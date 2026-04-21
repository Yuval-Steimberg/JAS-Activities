/**
 * Google Apps Script Integration for WhatsApp Automation
 * Add this to your existing Google Apps Script
 */

// Configuration
const WHATSAPP_WEBHOOK_URL = 'http://YOUR_SERVER_URL:5000/webhook/registration';
// For production, use ngrok or deploy to a server with public URL

/**
 * Send WhatsApp confirmation when form is submitted
 */
function sendWhatsAppOnSubmit(formData) {
  try {
    // Prepare data for WhatsApp API
    const whatsappData = {
      contact_name: formData.contact_name || '',
      contact_phone: formData.contact_phone || '',
      org_type: formData.org_type || '',
      visit_dates: formData.visit_dates || '',
      visit_people: formData.visit_people || ''
    };
    
    // Call WhatsApp webhook
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(whatsappData),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(WHATSAPP_WEBHOOK_URL, options);
    const result = JSON.parse(response.getContentText());
    
    Logger.log('WhatsApp sent: ' + JSON.stringify(result));
    
    return result;
    
  } catch (error) {
    Logger.log('Error sending WhatsApp: ' + error);
    // Don't fail the form submission if WhatsApp fails
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Modified doPost function to include WhatsApp automation
 * Replace or integrate with your existing doPost
 */
function doPost(e) {
  try {
    // Parse form data
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
      // ... add more fields as needed
    ]);
    
    // Send WhatsApp confirmation automatically
    sendWhatsAppOnSubmit(formData);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Registration received'
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
 * Send reminders to upcoming events
 * Run this daily using a time-based trigger
 */
function sendDailyReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses');
  const data = sheet.getDataRange().getValues();
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const visitDate = new Date(row[6]); // Adjust index based on your sheet structure
    const phone = row[5]; // Phone number column
    const name = row[3]; // Name column
    
    // Check if visit is tomorrow
    if (visitDate.toDateString() === tomorrow.toDateString()) {
      sendReminderMessage({
        contact_name: name,
        contact_phone: phone,
        visit_dates: visitDate.toLocaleDateString('he-IL')
      });
    }
  }
}

/**
 * Send reminder message via webhook
 */
function sendReminderMessage(contactData) {
  try {
    const url = 'http://YOUR_SERVER_URL:5000/webhook/reminder';
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(contactData),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('Reminder sent: ' + response.getContentText());
    
  } catch (error) {
    Logger.log('Error sending reminder: ' + error);
  }
}

/**
 * Send custom WhatsApp message to specific contact
 * Usage: sendCustomMessage('+972501234567', 'Your message here')
 */
function sendCustomMessage(phoneNumber, message) {
  try {
    const url = 'http://YOUR_SERVER_URL:5000/webhook/send';
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        to: phoneNumber,
        message: message
      }),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    return JSON.parse(response.getContentText());
    
  } catch (error) {
    Logger.log('Error sending message: ' + error);
    return { status: 'error', message: error.toString() };
  }
}

/**
 * Send bulk messages to all contacts in sheet
 * Usage: Run from Scripts menu
 */
function sendBulkAnnouncement() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses');
  const data = sheet.getDataRange().getValues();
  
  const contacts = [];
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    contacts.push({
      name: row[3], // Name column
      phone: row[5]  // Phone column
    });
  }
  
  const messageTemplate = 'שלום {name}! הודעה חשובה מ-JUST A SECOND...';
  
  try {
    const url = 'http://YOUR_SERVER_URL:5000/webhook/bulk';
    
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        contacts: contacts,
        message_template: messageTemplate
      }),
      muteHttpExceptions: true
    };
    
    const response = UrlFetchApp.fetch(url, options);
    Logger.log('Bulk messages sent: ' + response.getContentText());
    
  } catch (error) {
    Logger.log('Error sending bulk messages: ' + error);
  }
}

/**
 * Create time-based trigger for daily reminders
 * Run this once to set up automatic reminders
 */
function createDailyReminderTrigger() {
  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'sendDailyReminders') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger - runs daily at 9 AM
  ScriptApp.newTrigger('sendDailyReminders')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();
  
  Logger.log('Daily reminder trigger created');
}
