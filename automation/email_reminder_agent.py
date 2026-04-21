"""
Daily Email Reminder Agent - Python Version
Reads Google Sheets and sends email reminders to contacts with activities today

This is an alternative to the Google Apps Script version for those who want:
- More control over the automation
- Integration with other systems
- Running from own server
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging

# Google Sheets integration
try:
    import gspread
    from google.oauth2.service_account import Credentials
    GSPREAD_AVAILABLE = True
except ImportError:
    GSPREAD_AVAILABLE = False
    print("⚠️ gspread not installed. Install with: pip install gspread google-auth")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class EmailReminderAgent:
    """Email reminder agent for daily notifications"""
    
    def __init__(self, config: Dict = None):
        """
        Initialize email reminder agent
        
        Args:
            config: Configuration dictionary
        """
        self.config = config or self._load_config()
        self.sheet_data = []
        
    def _load_config(self) -> Dict:
        """Load configuration from environment variables"""
        return {
            'google_sheets': {
                'credentials_file': os.getenv('GOOGLE_SHEETS_CREDENTIALS', 'credentials.json'),
                'spreadsheet_name': os.getenv('SPREADSHEET_NAME', 'JUST A SECOND Registrations'),
                'sheet_name': os.getenv('SHEET_NAME', 'Responses')
            },
            'email': {
                'smtp_server': os.getenv('SMTP_SERVER', 'smtp.gmail.com'),
                'smtp_port': int(os.getenv('SMTP_PORT', '587')),
                'sender_email': os.getenv('SENDER_EMAIL'),
                'sender_password': os.getenv('SENDER_PASSWORD'),
                'sender_name': os.getenv('SENDER_NAME', 'JUST A SECOND'),
                'days_before': int(os.getenv('REMINDER_DAYS_BEFORE', '1'))
            },
            'columns': {
                'timestamp': 0,
                'org_type': 1,
                'org_name': 2,
                'contact_name': 3,
                'contact_email': 4,
                'contact_phone': 5,
                'visit_date': 6,
                'visit_people': 7,
                'visit_hours': 8,
                'activities': 9,
                'reminder_sent': 10
            }
        }
    
    def connect_to_sheet(self) -> bool:
        """Connect to Google Sheets"""
        if not GSPREAD_AVAILABLE:
            logger.error("gspread library not available")
            return False
        
        try:
            credentials_file = self.config['google_sheets']['credentials_file']
            
            # Define the scope
            scopes = [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive'
            ]
            
            # Authenticate
            creds = Credentials.from_service_account_file(credentials_file, scopes=scopes)
            client = gspread.authorize(creds)
            
            # Open the spreadsheet
            spreadsheet_name = self.config['google_sheets']['spreadsheet_name']
            sheet_name = self.config['google_sheets']['sheet_name']
            
            spreadsheet = client.open(spreadsheet_name)
            self.sheet = spreadsheet.worksheet(sheet_name)
            
            logger.info(f"✅ Connected to Google Sheet: {spreadsheet_name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to connect to Google Sheets: {e}")
            return False
    
    def fetch_sheet_data(self) -> List[List]:
        """Fetch all data from sheet"""
        try:
            self.sheet_data = self.sheet.get_all_values()
            logger.info(f"Fetched {len(self.sheet_data) - 1} rows from sheet")
            return self.sheet_data
        except Exception as e:
            logger.error(f"Failed to fetch sheet data: {e}")
            return []
    
    def check_and_send_reminders(self) -> Dict:
        """
        Main function: Check sheet and send reminders
        
        Returns:
            Dictionary with statistics
        """
        logger.info("=== Starting Daily Reminder Check ===")
        
        stats = {
            'checked': 0,
            'sent': 0,
            'skipped': 0,
            'errors': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        # Connect to sheet
        if not self.connect_to_sheet():
            logger.error("Cannot connect to sheet")
            return stats
        
        # Fetch data
        data = self.fetch_sheet_data()
        if not data or len(data) <= 1:  # Only header or no data
            logger.warning("No data in sheet")
            return stats
        
        # Process each row (skip header)
        for i, row in enumerate(data[1:], start=2):  # Start at row 2 (after header)
            stats['checked'] += 1
            
            try:
                if self._should_send_reminder(row):
                    if self._send_reminder_email(row, i):
                        stats['sent'] += 1
                    else:
                        stats['errors'] += 1
                else:
                    stats['skipped'] += 1
                    
            except Exception as e:
                logger.error(f"Error processing row {i}: {e}")
                stats['errors'] += 1
        
        logger.info(f"=== Reminder Check Complete ===")
        logger.info(f"Checked: {stats['checked']}, Sent: {stats['sent']}, Skipped: {stats['skipped']}, Errors: {stats['errors']}")
        
        return stats
    
    def _should_send_reminder(self, row: List) -> bool:
        """Check if reminder should be sent for this row"""
        cols = self.config['columns']
        
        # Get values
        email = self._get_value(row, cols['contact_email'])
        visit_date_str = self._get_value(row, cols['visit_date'])
        reminder_sent = self._get_value(row, cols['reminder_sent'])
        
        # Skip if no email
        if not email:
            return False
        
        # Skip if reminder already sent
        if reminder_sent == 'SENT':
            return False
        
        # Skip if no visit date
        if not visit_date_str:
            return False
        
        # Parse visit date
        visit_date = self._parse_date(visit_date_str)
        if not visit_date:
            logger.warning(f"Invalid date format: {visit_date_str}")
            return False
        
        # Calculate target date
        days_before = self.config['email']['days_before']
        target_date = datetime.now() + timedelta(days=days_before)
        
        # Check if dates match
        if self._is_same_day(visit_date, target_date):
            logger.info(f"Match! Sending reminder to {email}")
            return True
        
        return False
    
    def _send_reminder_email(self, row: List, row_number: int) -> bool:
        """Send reminder email"""
        cols = self.config['columns']
        
        # Extract data
        name = self._get_value(row, cols['contact_name']) or 'לקוח יקר'
        email = self._get_value(row, cols['contact_email'])
        visit_date = self._get_value(row, cols['visit_date'])
        visit_hours = self._get_value(row, cols['visit_hours']) or 'לא צוין'
        num_people = self._get_value(row, cols['visit_people']) or 'לא צוין'
        org_name = self._get_value(row, cols['org_name']) or self._get_value(row, cols['org_type']) or ''
        
        # Create email
        subject = '🔔 תזכורת - הביקור שלכם מתקרב!'
        html_body = self._create_email_html(
            name=name,
            visit_date=visit_date,
            visit_hours=visit_hours,
            num_people=num_people,
            org_name=org_name
        )
        
        # Send email
        try:
            self._send_email(email, subject, html_body)
            logger.info(f"✅ Reminder sent to: {email} ({name})")
            
            # Mark as sent in sheet
            self._mark_reminder_sent(row_number)
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {email}: {e}")
            return False
    
    def _send_email(self, to_email: str, subject: str, html_body: str):
        """Send email via SMTP"""
        config = self.config['email']
        
        # Create message
        msg = MIMEMultipart('alternative')
        msg['From'] = f"{config['sender_name']} <{config['sender_email']}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        # Add HTML body
        html_part = MIMEText(html_body, 'html', 'utf-8')
        msg.attach(html_part)
        
        # Send via SMTP
        with smtplib.SMTP(config['smtp_server'], config['smtp_port']) as server:
            server.starttls()
            server.login(config['sender_email'], config['sender_password'])
            server.send_message(msg)
    
    def _create_email_html(self, name: str, visit_date: str, visit_hours: str, 
                          num_people: str, org_name: str) -> str:
        """Create HTML email body"""
        return f"""
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f5f5f5; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div style="background-color: #4e6b5a; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🔔 תזכורת ידידותית</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">JUST A SECOND</p>
        </div>
        
        <div style="padding: 30px;">
            <p style="font-size: 18px; color: #333;">שלום <strong>{name}</strong>! 👋</p>
            
            <p style="font-size: 16px; color: #555; line-height: 1.6;">
                זוהי תזכורת ידידותית - <strong>הביקור שלכם ב-JUST A SECOND מתקרב!</strong>
            </p>
            
            <div style="background-color: #f9f9f9; border-right: 4px solid #4e6b5a; padding: 20px; margin: 25px 0; border-radius: 5px;">
                <h2 style="margin-top: 0; color: #4e6b5a; font-size: 20px;">📋 פרטי הביקור</h2>
                <p style="margin: 10px 0;"><strong>📅 תאריך:</strong> {visit_date}</p>
                <p style="margin: 10px 0;"><strong>⏰ שעות:</strong> {visit_hours}</p>
                <p style="margin: 10px 0;"><strong>👥 מספר משתתפים:</strong> {num_people}</p>
                {f'<p style="margin: 10px 0;"><strong>🏢 ארגון:</strong> {org_name}</p>' if org_name else ''}
            </div>
            
            <p style="font-size: 16px; color: #555;">אנחנו מצפים לראותכם! 💚</p>
            
            <p style="font-size: 16px; color: #555;">
                אם יש שינויים או שאלות, צרו קשר:
            </p>
            
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
                <p style="margin: 5px 0;">📞 <a href="tel:+972587876549" style="color: #4e6b5a; text-decoration: none; font-weight: bold;">058-787-6549</a></p>
                <p style="margin: 5px 0;">💬 <a href="https://wa.me/972587876549" style="color: #4e6b5a; text-decoration: none; font-weight: bold;">WhatsApp</a></p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
                <p style="color: #999; font-size: 14px;">🏡 <strong>JUST A SECOND</strong></p>
                <p style="color: #999; font-size: 14px;">מרחב שמחבר בין עיצוב, קיימות וקהילה</p>
            </div>
        </div>
    </div>
</body>
</html>
        """
    
    def _mark_reminder_sent(self, row_number: int):
        """Mark reminder as sent in Google Sheets"""
        try:
            col_letter = self._number_to_letter(self.config['columns']['reminder_sent'] + 1)
            cell_address = f"{col_letter}{row_number}"
            
            self.sheet.update_acell(cell_address, 'SENT')
            self.sheet.update_acell(cell_address, 'SENT')  # Add note with timestamp
            
        except Exception as e:
            logger.warning(f"Could not mark reminder as sent: {e}")
    
    # Helper methods
    
    def _get_value(self, row: List, index: int) -> str:
        """Safely get value from row"""
        try:
            return row[index].strip() if index < len(row) else ''
        except:
            return ''
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """Parse date from various formats"""
        if not date_str:
            return None
        
        # Try DD/MM/YYYY
        try:
            parts = date_str.split('/')
            if len(parts) == 3:
                day, month, year = int(parts[0]), int(parts[1]), int(parts[2])
                return datetime(year, month, day)
        except:
            pass
        
        # Try ISO format
        try:
            return datetime.fromisoformat(date_str)
        except:
            pass
        
        return None
    
    def _is_same_day(self, date1: datetime, date2: datetime) -> bool:
        """Check if two dates are the same day"""
        return (date1.year == date2.year and 
                date1.month == date2.month and 
                date1.day == date2.day)
    
    def _number_to_letter(self, n: int) -> str:
        """Convert column number to letter (1=A, 2=B, etc.)"""
        result = ""
        while n > 0:
            n -= 1
            result = chr(65 + (n % 26)) + result
            n //= 26
        return result


def main():
    """Example usage"""
    agent = EmailReminderAgent()
    stats = agent.check_and_send_reminders()
    print(f"\n📊 Summary:")
    print(f"   Sent: {stats['sent']}")
    print(f"   Skipped: {stats['skipped']}")
    print(f"   Errors: {stats['errors']}")


if __name__ == '__main__':
    main()
