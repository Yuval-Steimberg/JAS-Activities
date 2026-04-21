# ⚡ Quick Start - התחלה מהירה

בחר את מה שאתה רוצה להפעיל:

---

## 🚀 אפשרות 1: רק Email Reminders (הכי קל!)

**זמן:** 5 דקות | **עלות:** חינם | **דרישות:** Google Account בלבד

### שלבים:

1. **פתח את Google Sheets שלך**
   
2. **Extensions → Apps Script**

3. **העתק את הקוד מהקובץ:**
   ```
   email_reminder_google_script.js
   ```

4. **התאם הגדרות בתחילת הקוד:**
   ```javascript
   SHEET_NAME: 'Responses'  // שם הגיליון שלך
   DAYS_BEFORE: 1  // כמה ימים לפני לשלוח
   TRIGGER_HOUR: 9  // באיזו שעה להריץ
   ```

5. **הרץ בתפריט:**
   - בחר: `sendTestEmail`
   - לחץ ▶️ Run
   - אשר הרשאות
   - בדוק מייל!

6. **הפעל אוטומציה:**
   - בחר: `setupDailyTrigger`
   - לחץ ▶️ Run
   - **זהו! המערכת תרוץ אוטומטית מדי יום**

✅ **סיימת!** המערכת תשלח תזכורות מדי יום בשעה שקבעת.

---

## 📱 אפשרות 2: רק WhatsApp Automation

**זמן:** 10 דקות | **עלות:** ~$0.005/הודעה | **דרישות:** Python

### שלבים:

1. **התקן:**
   ```bash
   cd automation
   pip install -r requirements.txt
   ```

2. **הרץ אשף התקנה:**
   ```bash
   python quickstart.py
   ```
   הוא ידריך אותך לבחור ספק והזנת credentials

3. **בדוק שעובד:**
   ```bash
   python test_agent.py
   ```
   הזן את המספר שלך וקבל הודעת בדיקה!

✅ **סיימת!** עכשיו תוכל לשלוח הודעות מהקוד.

---

## 🎯 אפשרות 3: הכל ביחד (Full Automation!)

**זמן:** 30 דקות | **רמה:** בינוני

### חלק A: Email (5 דקות)

עקוב אחרי **אפשרות 1** למעלה ↑

### חלק B: WhatsApp (15 דקות)

1. **התקן:**
   ```bash
   cd automation
   pip install -r requirements.txt
   python quickstart.py
   ```

2. **הרץ שרת:**
   ```bash
   python flask_webhook.py
   ```

3. **חשוף לאינטרנט (ngrok):**
   ```bash
   ngrok http 5000
   ```
   שמור את ה-URL: `https://xxxx.ngrok.io`

### חלק C: חיבור לטופס (10 דקות)

1. **לך ל-Google Sheets → Extensions → Apps Script**

2. **העתק קוד מ:** `google_apps_script_integration.js`

3. **עדכן את ה-URL:**
   ```javascript
   const WHATSAPP_WEBHOOK_URL = 'https://your-ngrok-url.ngrok.io/webhook/registration';
   ```

4. **שמור והפעל**

✅ **סיימת!** עכשיו כל הרשמה:
- ✅ נשמרת ב-Google Sheets
- ✅ שולחת WhatsApp אוטומטי
- ✅ שולחת Email תזכורת למחרת

---

## 🧪 בדיקות

### בדיקת Email

**Google Apps Script:**
```javascript
sendTestEmail()  // שולח מייל בדיקה לעצמך
```

### בדיקת WhatsApp

**Python:**
```bash
python test_agent.py
```

### בדיקה מלאה

1. מלא את הטופס בעצמך (index.html)
2. בדוק ש:
   - השורה הופיעה ב-Sheets ✅
   - קיבלת WhatsApp ✅
   - למחרת תקבל Email ✅

---

## 📖 לקריאה נוספת

| אם רוצה... | קרא... |
|------------|--------|
| הסבר מפורט על WhatsApp | `README.md` |
| התקנה מפורטת WhatsApp | `SETUP_GUIDE.md` |
| הסבר מפורט על Email | `EMAIL_REMINDER_SETUP.md` |
| תיעוד כללי של הכל | `AUTOMATION_INDEX.md` |

---

## 🆘 עזרה מהירה

### WhatsApp לא עובד?

```bash
# בדוק config
python quickstart.py

# הרץ בדיקה
python test_agent.py
```

### Email לא נשלח?

**Google Apps Script:**
1. View → Executions
2. בדוק שגיאות בלוג
3. ודא שהמיילים תקינים ב-Sheet

### הטופס לא שולח ל-WhatsApp?

1. ודא ש-flask רץ: `python flask_webhook.py`
2. בדוק שה-URL נכון ב-Google Apps Script
3. אם local - צריך ngrok!

---

## 💡 טיפ

**התחל עם Email בלבד!**

זה הכי קל ועובד מצוין. אחר כך אם רוצה תוסיף WhatsApp.

---

## 🎉 בהצלחה!

יש שאלות? כל הקוד מתועד בעברית עם הרבה הערות!
