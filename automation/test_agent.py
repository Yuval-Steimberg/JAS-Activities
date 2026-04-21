"""
Test script for WhatsApp Agent
Use this to test your configuration before deploying
"""

from whatsapp_agent import WhatsAppAgent
import sys


def test_configuration():
    """Test that configuration is loaded correctly"""
    print("🔧 Testing configuration...")
    try:
        agent = WhatsAppAgent()
        print(f"✅ Provider: {agent.provider}")
        print(f"✅ Configuration loaded successfully")
        return agent
    except Exception as e:
        print(f"❌ Configuration error: {e}")
        sys.exit(1)


def test_send_message(agent, test_phone):
    """Test sending a simple message"""
    print(f"\n📱 Testing message to {test_phone}...")
    
    test_message = """שלום! זוהי הודעת בדיקה מ-JUST A SECOND 🏡

זוהי הודעה אוטומטית לבדיקת המערכת.
אם קיבלת הודעה זו, המערכת פועלת כהלכה! ✅"""
    
    try:
        result = agent.send_message(test_phone, test_message)
        
        if result.get('success'):
            print(f"✅ Message sent successfully!")
            print(f"   Message ID: {result.get('message_id')}")
            print(f"   Provider: {result.get('provider')}")
        else:
            print(f"❌ Failed to send message: {result.get('error')}")
            
        return result
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return {'success': False, 'error': str(e)}


def test_registration_confirmation(agent, test_phone):
    """Test registration confirmation message"""
    print(f"\n📋 Testing registration confirmation to {test_phone}...")
    
    test_data = {
        'contact_name': 'בדיקת מערכת',
        'contact_phone': test_phone,
        'org_type': 'בדיקה',
        'visit_dates': '01/01/2025',
        'visit_people': '10'
    }
    
    try:
        result = agent.send_registration_confirmation(test_data)
        
        if result.get('success'):
            print(f"✅ Confirmation sent successfully!")
            print(f"   Message ID: {result.get('message_id')}")
        else:
            print(f"❌ Failed to send confirmation: {result.get('error')}")
            
        return result
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return {'success': False, 'error': str(e)}


def main():
    """Main test function"""
    print("=" * 60)
    print("🤖 WhatsApp Automation Agent - Test Suite")
    print("=" * 60)
    
    # Get test phone number
    test_phone = input("\n📞 Enter your phone number for testing (e.g., +972501234567): ").strip()
    
    if not test_phone:
        print("❌ Phone number is required!")
        sys.exit(1)
    
    # Test 1: Configuration
    agent = test_configuration()
    
    # Ask which tests to run
    print("\n" + "=" * 60)
    print("Select tests to run:")
    print("1. Send simple test message")
    print("2. Send registration confirmation")
    print("3. Run all tests")
    
    choice = input("\nEnter choice (1-3): ").strip()
    
    if choice == '1':
        test_send_message(agent, test_phone)
    elif choice == '2':
        test_registration_confirmation(agent, test_phone)
    elif choice == '3':
        test_send_message(agent, test_phone)
        input("\nPress Enter to continue to next test...")
        test_registration_confirmation(agent, test_phone)
    else:
        print("❌ Invalid choice!")
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("✅ Testing complete!")
    print("=" * 60)
    
    # Print next steps
    print("\n📚 Next Steps:")
    print("1. If tests passed, you're ready to integrate with your form")
    print("2. Check README.md for deployment options")
    print("3. Set up the Flask webhook for automatic form processing")
    print("4. Add the Google Apps Script integration")
    print("\n🎉 Happy automating!")


if __name__ == '__main__':
    main()
