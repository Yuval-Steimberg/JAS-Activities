"""
Quick Start Setup Script
Helps you configure the WhatsApp Automation Agent
"""

import json
import os
import sys


def print_header():
    """Print welcome header"""
    print("=" * 70)
    print("🤖 WhatsApp Automation Agent - Quick Setup")
    print("   for JUST A SECOND Registration System")
    print("=" * 70)
    print()


def choose_provider():
    """Let user choose WhatsApp provider"""
    print("📱 Choose your WhatsApp API provider:\n")
    print("1. Twilio (Recommended for beginners)")
    print("   ✅ Easy to setup")
    print("   ✅ $0.005 per message")
    print("   ✅ Free trial available")
    print("   ⚠️  Requires Sandbox approval for testing")
    print()
    print("2. Green API (Good for Israel)")
    print("   ✅ Works with regular WhatsApp")
    print("   ✅ Simple interface")
    print("   💰 Plans from $10/month")
    print()
    print("3. WhatsApp Business API (Enterprise)")
    print("   ⚠️  Requires Meta approval")
    print("   ⚠️  More complex setup")
    print("   💰 Higher costs")
    print()
    
    choice = input("Enter your choice (1-3): ").strip()
    
    if choice == '1':
        return 'twilio'
    elif choice == '2':
        return 'green_api'
    elif choice == '3':
        return 'whatsapp_business'
    else:
        print("❌ Invalid choice!")
        sys.exit(1)


def setup_twilio():
    """Setup Twilio credentials"""
    print("\n🔵 Twilio Setup")
    print("-" * 70)
    print("1. Sign up at: https://www.twilio.com/try-twilio")
    print("2. Go to Console: https://console.twilio.com")
    print("3. Copy your Account SID and Auth Token")
    print("4. Enable WhatsApp Sandbox: Console → Messaging → Try it out")
    print()
    
    account_sid = input("Enter Account SID: ").strip()
    auth_token = input("Enter Auth Token: ").strip()
    from_number = input("Enter WhatsApp Number [whatsapp:+14155238886]: ").strip()
    
    if not from_number:
        from_number = "whatsapp:+14155238886"
    
    return {
        'account_sid': account_sid,
        'auth_token': auth_token,
        'from_number': from_number
    }


def setup_green_api():
    """Setup Green API credentials"""
    print("\n🟢 Green API Setup")
    print("-" * 70)
    print("1. Sign up at: https://green-api.com")
    print("2. Create a new Instance")
    print("3. Copy your Instance ID and API Token")
    print()
    
    instance_id = input("Enter Instance ID: ").strip()
    api_token = input("Enter API Token: ").strip()
    
    return {
        'instance_id': instance_id,
        'api_token': api_token
    }


def setup_whatsapp_business():
    """Setup WhatsApp Business API credentials"""
    print("\n⚪ WhatsApp Business API Setup")
    print("-" * 70)
    print("This is an advanced option for enterprise users.")
    print("You need approval from Meta and Business Manager access.")
    print()
    
    phone_number_id = input("Enter Phone Number ID: ").strip()
    access_token = input("Enter Access Token: ").strip()
    
    return {
        'phone_number_id': phone_number_id,
        'access_token': access_token
    }


def save_config(provider, credentials):
    """Save configuration to config.json"""
    config = {
        'whatsapp_provider': provider,
        'twilio': {
            'account_sid': 'YOUR_TWILIO_ACCOUNT_SID',
            'auth_token': 'YOUR_TWILIO_AUTH_TOKEN',
            'from_number': 'whatsapp:+14155238886'
        },
        'green_api': {
            'instance_id': 'YOUR_INSTANCE_ID',
            'api_token': 'YOUR_API_TOKEN'
        },
        'whatsapp_business': {
            'phone_number_id': 'YOUR_PHONE_NUMBER_ID',
            'access_token': 'YOUR_ACCESS_TOKEN'
        }
    }
    
    # Update with actual credentials
    config[provider] = credentials
    
    config_path = 'config.json'
    
    # Backup existing config if exists
    if os.path.exists(config_path):
        backup_path = 'config.json.backup'
        with open(config_path, 'r', encoding='utf-8') as f:
            with open(backup_path, 'w', encoding='utf-8') as backup:
                backup.write(f.read())
        print(f"\n📋 Backed up existing config to {backup_path}")
    
    # Save new config
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Configuration saved to {config_path}")


def check_dependencies():
    """Check if required packages are installed"""
    print("\n📦 Checking dependencies...")
    
    missing = []
    
    try:
        import requests
        print("✅ requests")
    except ImportError:
        missing.append('requests')
        print("❌ requests - MISSING")
    
    try:
        import flask
        print("✅ flask")
    except ImportError:
        missing.append('flask')
        print("❌ flask - MISSING")
    
    try:
        from twilio.rest import Client
        print("✅ twilio")
    except ImportError:
        missing.append('twilio')
        print("❌ twilio - MISSING")
    
    if missing:
        print(f"\n⚠️  Missing packages: {', '.join(missing)}")
        print("\nInstall them with:")
        print("pip install -r requirements.txt")
        return False
    
    print("\n✅ All dependencies installed!")
    return True


def run_test():
    """Ask if user wants to run test"""
    print("\n" + "=" * 70)
    choice = input("Would you like to run a test message now? (y/n): ").strip().lower()
    
    if choice == 'y':
        print("\nRunning test...")
        print("Execute: python test_agent.py")
        print()
        
        import subprocess
        try:
            subprocess.run(['python', 'test_agent.py'])
        except Exception as e:
            print(f"Could not run test automatically: {e}")
            print("Please run manually: python test_agent.py")


def show_next_steps(provider):
    """Show next steps"""
    print("\n" + "=" * 70)
    print("🎉 Setup Complete!")
    print("=" * 70)
    print("\n📚 Next Steps:\n")
    
    if provider == 'twilio':
        print("1. Test the configuration:")
        print("   python test_agent.py")
        print()
        print("2. Join the Twilio Sandbox:")
        print("   - Send 'join <your-code>' to the Twilio number from WhatsApp")
        print("   - Check Twilio Console for your specific join code")
        print()
    else:
        print("1. Test the configuration:")
        print("   python test_agent.py")
        print()
    
    print("2. Start the webhook server:")
    print("   python flask_webhook.py")
    print()
    print("3. For local testing, use ngrok:")
    print("   ngrok http 5000")
    print()
    print("4. Update Google Apps Script with your webhook URL")
    print("   (see google_apps_script_integration.js)")
    print()
    print("5. Deploy to production server (Heroku, Railway, AWS, etc.)")
    print()
    print("📖 For detailed instructions, read:")
    print("   - README.md (Full documentation)")
    print("   - SETUP_GUIDE.md (Step-by-step guide)")
    print()
    print("🆘 Need help? Check the troubleshooting section in README.md")
    print()


def main():
    """Main setup flow"""
    print_header()
    
    # Check if config already exists
    if os.path.exists('config.json'):
        print("⚠️  config.json already exists!")
        choice = input("Overwrite it? (y/n): ").strip().lower()
        if choice != 'y':
            print("Setup cancelled.")
            sys.exit(0)
        print()
    
    # Choose provider
    provider = choose_provider()
    
    # Get credentials based on provider
    print()
    if provider == 'twilio':
        credentials = setup_twilio()
    elif provider == 'green_api':
        credentials = setup_green_api()
    else:
        credentials = setup_whatsapp_business()
    
    # Save configuration
    save_config(provider, credentials)
    
    # Check dependencies
    deps_ok = check_dependencies()
    
    # Run test if user wants
    if deps_ok:
        run_test()
    
    # Show next steps
    show_next_steps(provider)


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
