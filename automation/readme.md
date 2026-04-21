# 🤖 WhatsApp Automation Agent for JUST A SECOND

מערכת אוטומציה לשליחת הודעות WhatsApp ללקוחות שנרשמו לפעילויות.

## 📋 תכונות

- ✅ תמיכה במספר ספקי WhatsApp API (Twilio, Green API, WhatsApp Business)
- 📨 שליחת הודעות אישור הרשמה אוטומטיות
- ⏰ תזכורות לפני אירועים
- 💚 הודעות תודה לאחר אירועים
- 📎 תמיכה בשליחת קבצים ותמונות
- 📊 שליחה קבוצתית לרשימות תפוצה

## 🚀 התקנה

### שלב 1: התקנת Python
ודא שמותקן Python 3.8 ומעלה:
```bash
python --version
```

### שלב 2: התקנת חבילות
```bash
cd automation
pip install -r requirements.txt
```

### שלב 3: הגדרת API

בחר אחד מהאפשרויות הבאות:

#### אפשרות 1: Twilio (מומלץ למתחילים) 🔵
1. הירשם ל-Twilio: https://www.twilio.com/try-twilio
2. הפעל WhatsApp Sandbox: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. קבל את Account SID ו-Auth Token
4. עדכן את `config.json` או צור קובץ `.env`

**עלויות:** חינם לניסיון, אחר כך $0.005 להודעה

#### אפשרות 2: Green API 🟢
1. הירשם ל-Green API: https://green-api.com/
2. צור Instance חדש
3. קבל Instance ID ו-API Token
4. עדכן את `config.json`

**עלויות:** תכניות משתלמות מ-$10/חודש

#### אפשרות 3: WhatsApp Business API ⚪
1. דורש אישור מ-Meta
2. מתאים לעסקים גדולים
3. תהליך הרשמה מורכב יותר

**עלויות:** משתנה לפי מדינה ונפח

### שלב 4: הגדרת Credentials

**שיטה 1: קובץ config.json**
```json
{
  "whatsapp_provider": "twilio",
  "twilio": {
    "account_sid": "ACxxxxxxxxxxxxxxx",
    "auth_token": "your_token_here",
    "from_number": "whatsapp:+14155238886"
  }
}
```

**שיטה 2: קובץ .env**
```bash
cp .env.example .env
# ערוך את .env עם הפרטים שלך
```

## 💻 שימוש

### דוגמה 1: שליחת הודעת אישור הרשמה
```python
from whatsapp_agent import WhatsAppAgent

# אתחול
agent = WhatsAppAgent(provider='twilio')

# שליחת אישור
contact_data = {
    'contact_name': 'דני לוי',
    'contact_phone': '+972501234567',
    'org_type': 'חברה עסקית',
    'visit_dates': '25/12/2024',
    'visit_people': '30'
}

result = agent.send_registration_confirmation(contact_data)
print(result)
```

### דוגמה 2: שליחת הודעה מותאמת אישית
```python
agent = WhatsAppAgent()

result = agent.send_message(
    to='+972501234567',
    message='שלום! זוהי הודעת בדיקה מ-JUST A SECOND 👋'
)
```

### דוגמה 3: שליחת תזכורת
```python
result = agent.send_reminder(contact_data, days_before=1)
```

### דוגמה 4: שליחה קבוצתית
```python
contacts = [
    {'name': 'יוסי', 'phone': '+972501111111'},
    {'name': 'רחל', 'phone': '+972502222222'},
    {'name': 'דוד', 'phone': '+972503333333'}
]

message = "שלום {name}! הזמנה לאירוע המיוחד שלנו 🎉"
results = agent.send_bulk_messages(contacts, message)
```

## 🔗 אינטגרציה עם Google Apps Script

הוסף זאת לסקריפט הקיים שלך (`Google Apps Script`):

```javascript
function sendWhatsAppConfirmation(rowData) {
  // קריאה ל-Python API (דורש deployment של הסקריפט כ-API)
  const webhookUrl = 'YOUR_WEBHOOK_URL_HERE';
  
  const data = {
    contact_name: rowData.contact_name,
    contact_phone: rowData.contact_phone,
    org_type: rowData.org_type,
    visit_dates: rowData.visit_dates,
    visit_people: rowData.visit_people
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data)
  };
  
  UrlFetchApp.fetch(webhookUrl, options);
}

// הוסף זאת לפונקציית doPost שלך
function doPost(e) {
  // ... הקוד הקיים ...
  
  // שלח WhatsApp אוטומטית
  sendWhatsAppConfirmation(formData);
  
  // ... המשך הקוד ...
}
```

## 📱 אפשרויות Deployment

### אפשרות 1: הרצה ידנית
```bash
python whatsapp_agent.py
```

### אפשרות 2: Flask API (לאינטגרציה עם הטופס)
```bash
python flask_webhook.py
```

### אפשרות 3: Scheduled Tasks (משימות מתוזמנות)
השתמש ב-Windows Task Scheduler או cron jobs

## 🛠️ פתרון בעיות

### הודעה לא נשלחת?
1. בדוק שמספר הטלפון בפורמט הנכון: `+972501234567`
2. ודא שה-API credentials נכונים
3. בדוק את ה-logs לשגיאות

### Twilio Sandbox
- לקוחות צריכים לשלוח `join <code>` למספר Twilio לפני שתוכל לשלוח להם הודעות
- לשימוש בייצור, צריך לאשר Twilio Number רשמי

### שגיאות API
```python
# הוסף debug logging
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📊 Template הודעות

ניתן להתאים את התבניות בקוד:
- `send_registration_confirmation()` - הודעת אישור
- `send_reminder()` - תזכורת
- `send_thank_you()` - תודה

## 🔐 אבטחה

⚠️ **חשוב:**
- **לעולם** אל תעלה את `config.json` או `.env` ל-Git
- השתמש ב-`.gitignore` כדי למנוע זאת
- שמור על API tokens במקום מאובטח

## 📞 תמיכה

אם יש שאלות:
- 📧 צור קשר עם המפתח
- 📚 קרא את [Twilio Docs](https://www.twilio.com/docs/whatsapp)
- 🔍 חפש בקוד - יש הרבה הערות מסבירות

## 🎯 המשך פיתוח

רעיונות לעתיד:
- [ ] ממשק ניהול אינטרנטי
- [ ] תזמון תזכורות אוטומטי
- [ ] דוחות סטטיסטיקה
- [ ] תמיכה בשפות נוספות
- [ ] בוט צ'אט אינטראקטיבי

---

**נבנה עבור JUST A SECOND 🏡**
*מרחב שמחבר בין עיצוב, קיימות וקהילה*
