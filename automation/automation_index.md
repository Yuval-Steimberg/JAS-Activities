# 🤖 מערכות האוטומציה של JUST A SECOND

מדריך מרכזי לכל מערכות האוטומציה שיצרנו.

---

## 📋 תוכן העניינים

1. [סקירה כללית](#overview)
2. [תזכורות WhatsApp](#whatsapp-reminders)
3. [תזכורות Email](#email-reminders)
4. [חשבוניות אוטומטיות](#billing-emails)
5. [אינטגרציה מלאה](#full-integration)

---

## 🎯 סקירה כללית {#overview}

מערכת אוטומציה מלאה לניהול הרשמות ותקשורת עם לקוחות:

```
טופס הרשמה (index.html)
         ↓
   Google Sheets ← Google Apps Script
         ↓
    ┌────┴────┐
    ↓         ↓
WhatsApp   Email
תזכורות    תזכורות
```

### קבצים במערכת

| קובץ | תיאור |
|------|-------|
| `whatsapp_agent.py` | סוכן WhatsApp - שליחת הודעות אוטומטית |
| `email_reminder_agent.py` | סוכן Email - תזכורות יומיות (Python) |
| `email_reminder_google_script.js` | סוכן Email - תזכורות יומיות (Google) |
| `billing_email_script.js` | חשבוניות אוטומטיות - שליחת הצעות מחיר |
| `flask_webhook.py` | שרת API לאינטגרציות |
| `google_apps_script_integration.js` | קוד Google Apps Script |
| `scheduler.py` | תזמון משימות (Python) |
| `quickstart.py` | אשף התקנה |
| `test_agent.py` | בדיקות WhatsApp |

---

## 📱 תזכורות WhatsApp {#whatsapp-reminders}

### מה זה עושה?

- ✅ שולח הודעות WhatsApp אוטומטיות
- ✅ אישור הרשמה מיידי
- ✅ תזכורות לפני אירועים
- ✅ הודעות תודה לאחר אירועים
- ✅ שליחה קבוצתית

### קבצים רלוונטיים

- 📄 `whatsapp_agent.py` - הקוד הראשי
- 📄 `SETUP_GUIDE.md` - מדריך התקנה
- 📄 `README.md` - תיעוד מלא

### התקנה מהירה

```bash
cd automation
pip install -r requirements.txt
python quickstart.py
```

### ספקים נתמכים

1. **Twilio** 🔵 - מומלץ למתחילים
2. **Green API** 🟢 - טוב לישראל
3. **WhatsApp Business API** ⚪ - Enterprise

### שימוש

```python
from whatsapp_agent import WhatsAppAgent

agent = WhatsAppAgent(provider='twilio')
agent.send_registration_confirmation(contact_data)
```

📖 **קרא עוד:** `README.md`, `SETUP_GUIDE.md`

---

## 📧 תזכורות Email {#email-reminders}

### מה זה עושה?

- ✅ בודק Google Sheets מדי יום
- ✅ מוצא לקוחות עם פעילויות קרובות
- ✅ שולח מייל תזכורת מעוצב
- ✅ מסמן שהתזכורת נשלחה

### שתי גישות

#### אפשרות 1: Google Apps Script (מומלץ)

**יתרונות:**
- ✅ חינם לגמרי
- ✅ לא צריך שרת
- ✅ קל להתקנה
- ✅ אינטגרציה מושלמת

**קובץ:** `email_reminder_google_script.js`

**התקנה:**
1. Extensions → Apps Script
2. העתק את הקוד
3. הרץ `setupDailyTrigger()`
4. זהו!

#### אפשרות 2: Python

**יתרונות:**
- ✅ שליטה מלאה
- ✅ אינטגרציה עם מערכות אחרות
- ✅ לוגיקה מורכבת

**חסרונות:**
- ❌ צריך שרת
- ❌ Google API credentials

**קובץ:** `email_reminder_agent.py`

**התקנה:**
```bash
pip install -r requirements.txt
# הגדר credentials.json ו-.env
python email_reminder_agent.py
```

### דוגמת מייל

המערכת שולחת מייל HTML מעוצב בעברית עם:
- 📅 תאריך ושעה
- 👥 מספר משתתפים
- 🏢 שם הארגון
- 📞 פרטי יצירת קשר
- 🎨 עיצוב מותאם למותג

📖 **קרא עוד:** `EMAIL_REMINDER_SETUP.md`

---

## 💰 חשבוניות אוטומטיות {#billing-emails}

### מה זה עושה?

- ✅ שולח חשבונית מפורטת אחרי הרשמה
- ✅ חישוב אוטומטי של מחירים
- ✅ הנחה 20% אוטומטית
- ✅ פרטי תשלום מלאים
- ✅ עיצוב מקצועי ומותאם למותג

### מה הלקוח מקבל?

**מייל HTML מעוצב עם:**

1. **פרטי הלקוח**
   - שם איש קשר
   - שם ארגון
   - תאריך ושעות ביקור
   - מספר משתתפים

2. **טבלת חשבונית מפורטת**
   - כל פעילות שנבחרה
   - כמות (מספר אנשים)
   - מחיר ליחידה
   - סה"כ לפריט

3. **סיכום עלויות**
   - סכום ביניים
   - הנחה 20%
   - **סה"כ לתשלום**

4. **פרטי תשלום**
   - מספר חשבון בנק
   - שם בנק וסניף
   - שם המוטב

### מבנה מחירים

| שירות | מחיר |
|-------|------|
| סיור והרצאת השראה | ₪1,000 (קבוע) |
| סדנת מיחדוש | ₪2,400 למשתתף |
| כיבוד קל | ₪40 למשתתף |
| שי ייחודי (רוטא) | ₪60 למשתתף |
| **הנחה** | **20%** |

### דוגמה לחישוב

**15 משתתפים:**
```
סיור:           ₪1,000
סדנה:           ₪36,000  (15 × ₪2,400)
שי:             ₪900     (15 × ₪60)
כיבוד:          ₪600     (15 × ₪40)
────────────────────────
סכום ביניים:    ₪38,500
הנחה 20%:       -₪7,700
────────────────────────
סה"כ לתשלום:    ₪30,800
```

### קובץ רלוונטי

- 📄 `billing_email_script.js` - הקוד הראשי
- 📄 `BILLING_EMAIL_SETUP.md` - מדריך התקנה מלא
- 📄 `PRICING_REFERENCE.md` - מבנה מחירים מפורט

### התקנה מהירה

1. פתח Google Apps Script
2. צור קובץ חדש: `BillingEmail.gs`
3. העתק את הקוד מ-`billing_email_script.js`
4. הוסף קריאה ל-`sendBillingEmail()` ב-`doPost`
5. בדוק עם `testBillingEmail()`

### אינטגרציה עם doPost

```javascript
function doPost(e) {
  // שמור ב-Sheets
  saveToSheet(e.parameter);
  
  // שלח חשבונית אוטומטית
  sendBillingEmail(e.parameter);
  
  return success();
}
```

### התאמה אישית

**שינוי מחירים:**
```javascript
PRICING: {
  tour: { pricePerPerson: 0 },
  workshop_team: { pricePerPerson: 2400 },
  // ...
}
```

**שינוי הנחה:**
```javascript
DISCOUNT_PERCENTAGE: 20,  // שנה ל-15, 25, וכו'
```

**עדכון פרטי בנק:**
```javascript
PAYMENT_INFO: {
  accountNumber: '580138122',
  bankName: 'בנק הפועלים',
  branch: '549'
}
```

📖 **קרא עוד:** `BILLING_EMAIL_SETUP.md`, `PRICING_REFERENCE.md`

---

## 🔗 אינטגרציה מלאה {#full-integration}

### זרימת עבודה אוטומטית מלאה

```
1. לקוח ממלא טופס → index.html
         ↓
2. נשלח ל-Google Apps Script
         ↓
3. נשמר ב-Google Sheets
         ↓
4. חשבונית מפורטת מיידית ← billing_email_script.js
         ↓
5. WhatsApp אישור מיידי ← whatsapp_agent.py
         ↓
6. בוקר למחרת: Email reminder ← email_reminder_google_script.js
         ↓
7. יום לפני: WhatsApp reminder
         ↓
8. אחרי האירוע: תודה WhatsApp
```

### הקמת זרימה מלאה

#### שלב 1: הגדר Google Apps Script

בקובץ `google_apps_script_integration.js`:

```javascript
function doPost(e) {
  // שמור ב-Sheets
  saveToSheet(e.parameter);
  
  // שלח חשבונית מפורטת
  sendBillingEmail(e.parameter);
  
  // שלח WhatsApp מיידית
  sendWhatsAppOnSubmit(e.parameter);
  
  return success();
}
```

#### שלב 2: הפעל WhatsApp Webhook

```bash
python flask_webhook.py
# רץ על http://localhost:5000
```

עם ngrok:
```bash
ngrok http 5000
```

#### שלב 3: הפעל Email Reminders

**Google Apps Script:**
```javascript
setupDailyTrigger()  // רץ פעם אחת
```

**או Python:**
```bash
python scheduler.py  # רץ תמיד
```

---

## 🛠️ קונפיגורציה

### WhatsApp

קובץ: `config.json` או `.env`

```json
{
  "whatsapp_provider": "twilio",
  "twilio": {
    "account_sid": "ACxxxxx",
    "auth_token": "xxxxx",
    "from_number": "whatsapp:+14155238886"
  }
}
```

### Email

קובץ: `.env.email.example` → `.env`

```bash
SMTP_SERVER=smtp.gmail.com
SENDER_EMAIL=your@email.com
SENDER_PASSWORD=app-password
REMINDER_DAYS_BEFORE=1
```

### Google Sheets

```python
# Python
SPREADSHEET_NAME=JUST A SECOND Registrations
SHEET_NAME=Responses
```

```javascript
// Google Apps Script
SHEET_NAME: 'Responses'
```

---

## 🚀 התחלה מהירה

### רק WhatsApp

```bash
python quickstart.py
python test_agent.py
```

### רק Email

**Google Apps Script:**
1. Extensions → Apps Script
2. העתק `email_reminder_google_script.js`
3. `setupDailyTrigger()`

### הכל ביחד

1. הגדר WhatsApp: `python quickstart.py`
2. הרץ Webhook: `python flask_webhook.py`
3. הוסף Email: Google Apps Script
4. בדוק!

---

## 📊 ניטור ובדיקות

### בדיקות WhatsApp

```bash
python test_agent.py
```

### בדיקות Email

**Google Apps Script:**
```javascript
sendTestEmail()
testReminderSystem()
```

**Python:**
```bash
python email_reminder_agent.py
```

### לוגים

- **Google Apps Script:** View → Executions
- **Python:** `scheduler.log`
- **Flask:** Terminal output

---

## 🔐 אבטחה

### ⚠️ חשוב!

אף פעם אל תעלה ל-Git:
- ❌ `config.json`
- ❌ `.env`
- ❌ `credentials.json`
- ❌ API keys/tokens

כבר ב-`.gitignore` ✅

### Best Practices

1. השתמש ב-environment variables
2. App Passwords (לא סיסמה רגילה)
3. Service Accounts ל-Google API
4. Rotate tokens מדי פעם

---

## 💰 עלויות

### WhatsApp

| ספק | עלות |
|-----|------|
| Twilio | $0.005/הודעה |
| Green API | $10-50/חודש |
| WhatsApp Business | משתנה |

### Email

| שיטה | עלות |
|------|------|
| Google Apps Script | **חינם!** |
| Gmail SMTP | **חינם!** (עד 500/יום) |
| SendGrid | Free tier זמין |

### Google Sheets API

**חינם!** (עד 60 קריאות/דקה)

---

## 🆘 פתרון בעיות

### WhatsApp לא נשלח?

1. בדוק API credentials
2. מספר טלפון בפורמט +972xxxxxxxxx
3. Sandbox approval (Twilio)

### Email לא נשלח?

1. App Password (לא סיסמה רגילה!)
2. 2FA מופעל?
3. בדוק SMTP settings

### Google Sheets לא מתחבר?

1. Service Account משותף ב-Sheet?
2. APIs מופעלים?
3. credentials.json נכון?

---

## 📚 תיעוד נוסף

| מסמך | תיאור |
|------|-------|
| `README.md` | WhatsApp - מדריך מלא |
| `SETUP_GUIDE.md` | WhatsApp - התקנה מהירה |
| `EMAIL_REMINDER_SETUP.md` | Email - מדריך מלא |
| `BILLING_EMAIL_SETUP.md` | חשבוניות - מדריך התקנה |
| `PRICING_REFERENCE.md` | מבנה מחירים מפורט |
| `AUTOMATION_INDEX.md` | המסמך הזה |

---

## 🎯 רעיונות להרחבה

- [ ] SMS fallback (אם WhatsApp נכשל)
- [ ] Dashboard ניהול אינטרנטי
- [ ] דוחות סטטיסטיקה
- [ ] AI chatbot לשאלות
- [ ] תזכורות מותאמות אישית
- [ ] אינטגרציה עם CRM
- [ ] תשלומים אוטומטיים

---

## 🎉 סיכום

יש לך עכשיו מערכת אוטומציה מלאה!

✅ WhatsApp אוטומטי
✅ Email תזכורות
✅ חשבוניות אוטומטיות
✅ Google Sheets integration
✅ Webhook API
✅ תזמון אוטומטי

**הכל קוד פתוח, מתועד בעברית, ומוכן לשימוש!**

---

**נבנה עבור JUST A SECOND 🏡**
*מרחב שמחבר בין עיצוב, קיימות וקהילה*
