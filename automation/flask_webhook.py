"""
Flask Webhook API for WhatsApp Agent
Receives form submissions and sends WhatsApp messages automatically
"""

from flask import Flask, request, jsonify
from whatsapp_agent import WhatsAppAgent
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Initialize WhatsApp agent
agent = WhatsAppAgent()


@app.route('/webhook/registration', methods=['POST'])
def handle_registration():
    """
    Webhook endpoint for new registrations
    Receives form data and sends WhatsApp confirmation
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        logger.info(f"Received registration for: {data.get('contact_name')}")
        
        # Send WhatsApp confirmation
        result = agent.send_registration_confirmation(data)
        
        if result.get('success'):
            return jsonify({
                'status': 'success',
                'message': 'WhatsApp message sent successfully',
                'message_id': result.get('message_id')
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('error', 'Failed to send message')
            }), 500
            
    except Exception as e:
        logger.error(f"Error processing registration: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/webhook/send', methods=['POST'])
def send_message():
    """
    Generic webhook endpoint for sending WhatsApp messages
    
    Expected JSON:
    {
        "to": "+972501234567",
        "message": "Your message here",
        "media_url": "https://optional-media-url.com/image.jpg"
    }
    """
    try:
        data = request.get_json()
        
        to = data.get('to')
        message = data.get('message')
        media_url = data.get('media_url')
        
        if not to or not message:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields: to, message'
            }), 400
        
        result = agent.send_message(to, message, media_url)
        
        if result.get('success'):
            return jsonify({
                'status': 'success',
                'message': 'Message sent successfully',
                'message_id': result.get('message_id')
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('error', 'Failed to send message')
            }), 500
            
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/webhook/reminder', methods=['POST'])
def send_reminder():
    """Send reminder message"""
    try:
        data = request.get_json()
        days_before = data.get('days_before', 1)
        
        result = agent.send_reminder(data, days_before)
        
        if result.get('success'):
            return jsonify({
                'status': 'success',
                'message': 'Reminder sent successfully'
            }), 200
        else:
            return jsonify({
                'status': 'error',
                'message': result.get('error', 'Failed to send reminder')
            }), 500
            
    except Exception as e:
        logger.error(f"Error sending reminder: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/webhook/bulk', methods=['POST'])
def send_bulk():
    """Send bulk messages"""
    try:
        data = request.get_json()
        contacts = data.get('contacts', [])
        message_template = data.get('message_template', '')
        
        if not contacts or not message_template:
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields: contacts, message_template'
            }), 400
        
        results = agent.send_bulk_messages(contacts, message_template)
        
        success_count = sum(1 for r in results if r['result'].get('success'))
        
        return jsonify({
            'status': 'success',
            'total': len(results),
            'successful': success_count,
            'failed': len(results) - success_count,
            'results': results
        }), 200
            
    except Exception as e:
        logger.error(f"Error sending bulk messages: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'WhatsApp Automation Agent',
        'provider': agent.provider
    }), 200


@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'service': 'WhatsApp Automation Agent API',
        'version': '1.0',
        'endpoints': {
            '/webhook/registration': 'POST - Send registration confirmation',
            '/webhook/send': 'POST - Send custom message',
            '/webhook/reminder': 'POST - Send reminder',
            '/webhook/bulk': 'POST - Send bulk messages',
            '/health': 'GET - Health check'
        },
        'provider': agent.provider
    })


if __name__ == '__main__':
    # Run on localhost:5000
    # For production, use gunicorn or similar WSGI server
    app.run(host='0.0.0.0', port=5000, debug=True)
