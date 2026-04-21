# 🚀 מדריך התקנה מהיר - WhatsApp Automation

## שלב 1: הכן את הסביבה (5 דקות)

### התקן Python
1. הורד Python מ: https://www.python.org/downloads/
2. בדוק התקנה:
```bash
python --version
```

### התקן חבילות נדרשות
```bash
cd automation
pip install -r requirements.txt
```

## שלב 2: בחר ספק WhatsApp (10-30 דקות)

### 🔵 אפשרות A: Twilio (הכי קל להתחיל)

**יתרונות:**
- ✅ הכי קל להתקין
- ✅ תמיכה מעולה
- ✅ חינם לניסיון
- ✅ אמין מאוד

**חסרונות:**
- ❌ לקוחות צריכים "לאשר" בפעם הראשונה (Sandbox)
- ❌ לייצור צריך לקנות מספר ייעודי

**הוראות:**
1. הירשם: https://www.twilio.com/try-twilio
2. לך ל-Console: https://console.twilio.com
3. מצא את **Account SID** ו-**Auth Token**
4. הפעל WhatsApp Sandbox: Console → Messaging → Try it out → Send a WhatsApp message
5. שלח הודעה למספר Sandbox כדי לאשר את המספר שלך
6. עדכן `config.json`:

```json
{
  "whatsapp_provider": "twilio",
  "twilio": {
    "account_sid": "ACxxxxxxxxxxxxxxx",
    "auth_token": "your_auth_token_here",
    "from_number": "whatsapp:+14155238886"
  }
}
```

**מחיר:** $0.005 להודעה (חצי סנט)

---

### 🟢 אפשרות B: Green API (טוב לישראל)

**יתרונות:**
- ✅ עובד עם WhatsApp רגיל
- ✅ ממשק פשוט
- ✅ תמחור משתלם
- ✅ לא צריך אישורים מיוחדים

**חסרונות:**
- ❌ פחות ידוע
- ❌ איכות תמיכה משתנה

**הוראות:**
1. הירשם: https://green-api.com
2. צור Instance חדש
3. קבל **Instance ID** ו-**API Token**
4. עדכן `config.json`:

```json
{
  "whatsapp_provider": "green_api",
  "green_api": {
    "instance_id": "1234567890",
    "api_token": "your_token_here"
  }
}
```

**מחיר:** מ-$10/חודש (תכניות שונות)

---

### ⚪ אפשרות C: WhatsApp Business API (רק לעסקים גדולים)

**יתרונות:**
- ✅ רשמי מ-Meta
- ✅ הכי מקצועי
- ✅ תכונות מתקדמות

**חסרונות:**
- ❌ דורש אישור מ-Meta
- ❌ מורכב להקים
- ❌ יקר יותר

**זה בשבילך אם:**
- שולח 1000+ הודעות ביום
- צריך branding מלא
- יש תקציב גדול

לא מומלץ למתחילים! התחל עם Twilio או Green API.

---

## שלב 3: בדוק שהכל עובד (5 דקות)

```bash
python test_agent.py
```

הזן את מספר הטלפון שלך וקבל הודעת בדיקה!

אם קיבלת הודעה - **מזל טוב! המערכת עובדת** 🎉

---

## שלב 4: הפעל את השרת (2 דקות)

```bash
python flask_webhook.py
```

השרת רץ על: `http://localhost:5000`

---

## שלב 5: חבר לטופס שלך

### אם השרת רץ על המחשב שלך (לבדיקות):
1. התקן [ngrok](https://ngrok.com/): `ngrok http 5000`
2. קבל URL זמני: `https://xxxx-xx-xxx.ngrok.io`
3. השתמש ב-URL הזה ב-Google Apps Script

### לייצור:
העלה את הקוד לשרת (Heroku, Railway, AWS, וכו')

---

## שלב 6: עדכן Google Apps Script

העתק את הקוד מ-`google_apps_script_integration.js`

שנה את:
```javascript
const WHATSAPP_WEBHOOK_URL = 'http://YOUR_SERVER_URL:5000/webhook/registration';
```

ל-URL האמיתי שלך.

---

## ✅ סיימת!

עכשיו כל הרשמה חדשה תשלח אוטומטית הודעת WhatsApp ללקוח!

---

## 🆘 פתרון בעיות נפוצות

### "לא מקבל הודעות"
1. ✓ בדוק שמספר הטלפון בפורמט +972xxxxxxxxx
2. ✓ ב-Twilio Sandbox - שלח "join <code>" למספר שלהם תחילה
3. ✓ בדוק שה-API credentials נכונים

### "Python לא מזוהה"
- הוסף את Python ל-PATH בהתקנה
- או השתמש ב-`py` במקום `python`

### "אין אינטרנט"
- השרת צריך אינטרנט כדי לשלוח הודעות
- בדוק חומת אש/אנטי וירוס

### "Google Apps Script לא מגיע לשרת"
- ודא שהשרת רץ
- בדוק שה-URL נכון
- השתמש ב-ngrok אם רץ local

---

## 📞 זקוק לעזרה?

1. קרא את `README.md` המלא
2. בדוק את הקוד - יש הערות בעברית
3. חפש בגוגל את השגיאה
4. שאל בקהילת Twilio/Green API

---

**🎉 בהצלחה עם האוטומציה!**
