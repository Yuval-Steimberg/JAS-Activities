"""
WhatsApp Automation Agent
Sends automated WhatsApp messages for JUST A SECOND registration system
Supports multiple WhatsApp API providers: Twilio, Green API, WhatsApp Business API
"""

import os
import json
import requests
from typing import Dict, List, Optional
from datetime import datetime
from enum import Enum
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WhatsAppProvider(Enum):
    """Supported WhatsApp API providers"""
    TWILIO = "twilio"
    GREEN_API = "green_api"
    WHATSAPP_BUSINESS = "whatsapp_business"


class WhatsAppAgent:
    """Main WhatsApp automation agent"""
    
    def __init__(self, provider: str = None, config: Dict = None):
        """
        Initialize WhatsApp agent
        
        Args:
            provider: WhatsApp API provider (twilio, green_api, whatsapp_business)
            config: Configuration dictionary with API credentials
        """
        self.provider = provider or os.getenv('WHATSAPP_PROVIDER', 'twilio')
        self.config = config or self._load_config()
        self._validate_config()
        
    def _load_config(self) -> Dict:
        """Load configuration from environment variables or config file"""
        # Try to load from config.json first
        config_path = os.path.join(os.path.dirname(__file__), 'config.json')
        if os.path.exists(config_path):
            with open(config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # Fallback to environment variables
        return {
            'twilio': {
                'account_sid': os.getenv('TWILIO_ACCOUNT_SID'),
                'auth_token': os.getenv('TWILIO_AUTH_TOKEN'),
                'from_number': os.getenv('TWILIO_WHATSAPP_NUMBER', 'whatsapp:+14155238886')
            },
            'green_api': {
                'instance_id': os.getenv('GREEN_API_INSTANCE_ID'),
                'api_token': os.getenv('GREEN_API_TOKEN')
            },
            'whatsapp_business': {
                'phone_number_id': os.getenv('WA_PHONE_NUMBER_ID'),
                'access_token': os.getenv('WA_ACCESS_TOKEN')
            }
        }
    
    def _validate_config(self):
        """Validate that required configuration exists"""
        if self.provider not in self.config:
            raise ValueError(f"Configuration for provider '{self.provider}' not found")
        
        provider_config = self.config[self.provider]
        if not any(provider_config.values()):
            logger.warning(f"No credentials found for {self.provider}. Please configure in config.json or environment variables.")
    
    def send_message(self, to: str, message: str, media_url: Optional[str] = None) -> Dict:
        """
        Send WhatsApp message
        
        Args:
            to: Recipient phone number (format: +972501234567)
            message: Message text
            media_url: Optional URL to media file (image, PDF, etc.)
            
        Returns:
            Response dictionary with status and message ID
        """
        # Normalize phone number
        to = self._normalize_phone(to)
        
        logger.info(f"Sending WhatsApp message to {to} via {self.provider}")
        
        if self.provider == 'twilio':
            return self._send_via_twilio(to, message, media_url)
        elif self.provider == 'green_api':
            return self._send_via_green_api(to, message, media_url)
        elif self.provider == 'whatsapp_business':
            return self._send_via_whatsapp_business(to, message, media_url)
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _normalize_phone(self, phone: str) -> str:
        """Normalize phone number to international format"""
        # Remove common separators
        phone = phone.replace('-', '').replace(' ', '').replace('(', '').replace(')', '')
        
        # Add + if missing
        if not phone.startswith('+'):
            # Assume Israeli number if starts with 0
            if phone.startswith('0'):
                phone = '+972' + phone[1:]
            else:
                phone = '+' + phone
        
        return phone
    
    def _send_via_twilio(self, to: str, message: str, media_url: Optional[str] = None) -> Dict:
        """Send message via Twilio WhatsApp API"""
        from twilio.rest import Client
        
        config = self.config['twilio']
        client = Client(config['account_sid'], config['auth_token'])
        
        try:
            params = {
                'from_': config['from_number'],
                'body': message,
                'to': f'whatsapp:{to}'
            }
            
            if media_url:
                params['media_url'] = [media_url]
            
            twilio_message = client.messages.create(**params)
            
            logger.info(f"Twilio message sent successfully. SID: {twilio_message.sid}")
            return {
                'success': True,
                'message_id': twilio_message.sid,
                'status': twilio_message.status,
                'provider': 'twilio'
            }
        except Exception as e:
            logger.error(f"Twilio error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'provider': 'twilio'
            }
    
    def _send_via_green_api(self, to: str, message: str, media_url: Optional[str] = None) -> Dict:
        """Send message via Green API"""
        config = self.config['green_api']
        instance_id = config['instance_id']
        token = config['api_token']
        
        # Remove + from phone number for Green API
        phone = to.replace('+', '')
        
        url = f"https://api.green-api.com/waInstance{instance_id}/sendMessage/{token}"
        
        payload = {
            'chatId': f'{phone}@c.us',
            'message': message
        }
        
        try:
            response = requests.post(url, json=payload)
            response.raise_for_status()
            result = response.json()
            
            # Send media if provided
            if media_url:
                self._send_media_green_api(phone, media_url, message)
            
            logger.info(f"Green API message sent successfully. ID: {result.get('idMessage')}")
            return {
                'success': True,
                'message_id': result.get('idMessage'),
                'provider': 'green_api'
            }
        except Exception as e:
            logger.error(f"Green API error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'provider': 'green_api'
            }
    
    def _send_media_green_api(self, phone: str, media_url: str, caption: str = ""):
        """Send media file via Green API"""
        config = self.config['green_api']
        instance_id = config['instance_id']
        token = config['api_token']
        
        url = f"https://api.green-api.com/waInstance{instance_id}/sendFileByUrl/{token}"
        
        payload = {
            'chatId': f'{phone}@c.us',
            'urlFile': media_url,
            'fileName': 'file',
            'caption': caption
        }
        
        response = requests.post(url, json=payload)
        return response.json()
    
    def _send_via_whatsapp_business(self, to: str, message: str, media_url: Optional[str] = None) -> Dict:
        """Send message via official WhatsApp Business API"""
        config = self.config['whatsapp_business']
        phone_number_id = config['phone_number_id']
        access_token = config['access_token']
        
        url = f"https://graph.facebook.com/v18.0/{phone_number_id}/messages"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Remove + from phone number
        to = to.replace('+', '')
        
        payload = {
            'messaging_product': 'whatsapp',
            'to': to,
            'type': 'text',
            'text': {'body': message}
        }
        
        if media_url:
            # Determine media type from URL
            media_type = self._get_media_type(media_url)
            payload = {
                'messaging_product': 'whatsapp',
                'to': to,
                'type': media_type,
                media_type: {
                    'link': media_url,
                    'caption': message
                }
            }
        
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"WhatsApp Business API message sent. ID: {result.get('messages', [{}])[0].get('id')}")
            return {
                'success': True,
                'message_id': result.get('messages', [{}])[0].get('id'),
                'provider': 'whatsapp_business'
            }
        except Exception as e:
            logger.error(f"WhatsApp Business API error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'provider': 'whatsapp_business'
            }
    
    def _get_media_type(self, url: str) -> str:
        """Determine media type from URL"""
        url_lower = url.lower()
        if any(ext in url_lower for ext in ['.jpg', '.jpeg', '.png', '.gif']):
            return 'image'
        elif any(ext in url_lower for ext in ['.pdf']):
            return 'document'
        elif any(ext in url_lower for ext in ['.mp4', '.mov']):
            return 'video'
        else:
            return 'document'
    
    def send_registration_confirmation(self, contact_data: Dict) -> Dict:
        """
        Send registration confirmation message
        
        Args:
            contact_data: Dictionary with registration details
                - contact_name: Contact person name
                - contact_phone: Phone number
                - org_type: Organization type
                - visit_dates: Visit date
                - visit_people: Number of people
        """
        name = contact_data.get('contact_name', 'לקוח יקר')
        date = contact_data.get('visit_dates', 'תאריך שיקבע')
        people = contact_data.get('visit_people', '')
        org = contact_data.get('org_type', '')
        
        message = f"""שלום {name}! 👋

תודה על ההרשמה לפעילות ב-JUST A SECOND! 

📋 פרטי ההרשמה:
• ארגון: {org}
• תאריך: {date}
• מספר משתתפים: {people}

נחזור אליך בהקדם לאישור סופי ופרטים נוספים.

🏡 JUST A SECOND
058-787-6549
מרחב שמחבר בין עיצוב, קיימות וקהילה"""
        
        phone = contact_data.get('contact_phone')
        return self.send_message(phone, message)
    
    def send_reminder(self, contact_data: Dict, days_before: int = 1) -> Dict:
        """
        Send reminder before the event
        
        Args:
            contact_data: Registration details
            days_before: Number of days before event
        """
        name = contact_data.get('contact_name', 'לקוח יקר')
        date = contact_data.get('visit_dates', '')
        
        message = f"""שלום {name}! 🔔

תזכורת ידידותית - הביקור שלכם ב-JUST A SECOND מתקרב!

📅 תאריך: {date}

נשמח לראותכם! 
אם יש שינויים או שאלות, צרו קשר: 058-787-6549

🏡 JUST A SECOND"""
        
        phone = contact_data.get('contact_phone')
        return self.send_message(phone, message)
    
    def send_thank_you(self, contact_data: Dict) -> Dict:
        """Send thank you message after the event"""
        name = contact_data.get('contact_name', 'לקוח יקר')
        
        message = f"""שלום {name}! 💚

תודה שבחרתם ב-JUST A SECOND!
נשמח לשמוע איך היה המפגש.

נשמח לארח אתכם שוב! 

🏡 JUST A SECOND
058-787-6549"""
        
        phone = contact_data.get('contact_phone')
        return self.send_message(phone, message)
    
    def send_bulk_messages(self, contacts: List[Dict], message_template: str) -> List[Dict]:
        """
        Send bulk messages to multiple contacts
        
        Args:
            contacts: List of contact dictionaries with 'phone' and 'name'
            message_template: Message template with {name} placeholder
            
        Returns:
            List of results for each message
        """
        results = []
        
        for contact in contacts:
            name = contact.get('name', 'לקוח יקר')
            phone = contact.get('phone')
            
            if not phone:
                logger.warning(f"No phone number for contact: {name}")
                continue
            
            message = message_template.format(name=name)
            result = self.send_message(phone, message)
            results.append({
                'contact': name,
                'phone': phone,
                'result': result
            })
            
            # Be nice to the API - add small delay between messages
            import time
            time.sleep(1)
        
        return results


def main():
    """Example usage"""
    # Initialize agent (will use config.json or environment variables)
    agent = WhatsAppAgent(provider='twilio')  # or 'green_api', 'whatsapp_business'
    
    # Example: Send registration confirmation
    contact_data = {
        'contact_name': 'יוסי כהן',
        'contact_phone': '+972501234567',
        'org_type': 'חברה עסקית',
        'visit_dates': '15/12/2024',
        'visit_people': '25'
    }
    
    result = agent.send_registration_confirmation(contact_data)
    print(f"Message sent: {result}")
    
    # Example: Send custom message
    # result = agent.send_message(
    #     to='+972501234567',
    #     message='שלום! זוהי הודעת בדיקה'
    # )


if __name__ == '__main__':
    main()
