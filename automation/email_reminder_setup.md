# 📧 מדריך הקמה - אוטומציה לשליחת תזכורות במייל

מערכת אוטומטית שבודקת את Google Sheets מדי יום ושולחת תזכורות במייל ללקוחות עם פעילויות מתוכננות.

---

## 🎯 מה המערכת עושה?

1. ✅ **בודקת מדי יום** את ה-Google Sheet שלך
2. ✅ **מזהה לקוחות** עם פעילויות שמתוכננות למחרת (או מספר ימים מראש)
3. ✅ **שולחת מייל תזכורת** אוטומטי עם כל הפרטים
4. ✅ **מסמנת** שהתזכורת נשלחה (כדי לא לשלוח פעמיים)
5. ✅ **מייל HTML מעוצב** בעברית עם כל פרטי הביקור

---

## 🔀 שתי אפשרויות יישום

### אפשרות 1: Google Apps Script (מומלץ - הכי קל!)

**יתרונות:**
- ✅ לא צריך שרת
- ✅ חינם לגמרי
- ✅ אינטגרציה מושלמת עם Google Sheets
- ✅ קל להתקנה (5 דקות)
- ✅ רץ אוטומטית בענן של Google

**חסרונות:**
- ❌ פחות גמישות
- ❌ קשור ל-Google ecosystem

**👉 קפוץ ל[הקמה עם Google Apps Script](#google-apps-script-setup)**

---

### אפשרות 2: Python Script (למתקדמים)

**יתרונות:**
- ✅ שליטה מלאה
- ✅ אפשר להוסיף לוגיקות מורכבות
- ✅ אינטגרציה עם מערכות אחרות
- ✅ אפשרות לשימוש ב-SMTP servers שונים

**חסרונות:**
- ❌ צריך שרת או מחשב שרץ תמיד
- ❌ יותר מורכב להתקנה
- ❌ צריך credentials של Google API

**👉 קפוץ ל[הקמה עם Python](#python-setup)**

---

## 🟢 Google Apps Script Setup

### שלב 1: פתח את Google Sheets שלך

1. לך ל-Google Sheets עם נתוני ההרשמות
2. **Extensions → Apps Script**

### שלב 2: העתק את הקוד

1. מחק את הקוד הקיים
2. העתק את כל התוכן מ: `email_reminder_google_script.js`
3. הדבק ב-Apps Script editor
4. **File → Save** (או Ctrl+S)

### שלב 3: התאם את ההגדרות

בתחילת הקוד יש `CONFIG` object. עדכן אותו לפי ה-Sheet שלך:

```javascript
const CONFIG = {
  SHEET_NAME: 'Responses', // שם הגיליון שלך
  
  COLUMNS: {
    // התאם את מספרי העמודות לפי המבנה שלך
    CONTACT_NAME: 3,    // עמודה D
    CONTACT_EMAIL: 4,   // עמודה E
    VISIT_DATE: 6,      // עמודה G
    // ... וכו'
  },
  
  EMAIL: {
    DAYS_BEFORE: 1,  // כמה ימים לפני לשלוח תזכורת
  },
  
  TRIGGER_HOUR: 9, // באיזו שעה להריץ (9 בבוקר)
};
```

### שלב 4: בדוק שהכל עובד

1. **בחר בתפריט:** `sendTestEmail`
2. **לחץ Run** (▶️)
3. **אשר הרשאות** (בפעם הראשונה Google יבקש אישור)
4. בדוק את המייל שלך - אמורה להגיע הודעת בדיקה!

### שלב 5: הפעל אוטומציה

1. **בחר בתפריט:** `setupDailyTrigger`
2. **לחץ Run** (▶️)
3. זהו! המערכת תרוץ אוטומטית מדי יום בשעה שהגדרת

### שלב 6: בדוק Triggers

1. לך ל: **Triggers** (שעון בצד שמאל)
2. תראה trigger חדש עם השם `checkAndSendDailyReminders`
3. זה מאשר שהאוטומציה פעילה!

---

## 🐍 Python Setup

### דרישות מקדימות

- Python 3.8+
- Google Sheets API credentials
- SMTP email account (Gmail מומלץ)

### שלב 1: התקן חבילות

```bash
cd automation
pip install gspread google-auth google-auth-oauthlib google-auth-httplib2
```

### שלב 2: הגדר Google Sheets API

#### 2.1 צור Google Cloud Project

1. לך ל: https://console.cloud.google.com
2. צור project חדש או בחר קיים
3. **APIs & Services → Library**
4. חפש והפעל:
   - Google Sheets API
   - Google Drive API

#### 2.2 צור Service Account

1. **APIs & Services → Credentials**
2. **Create Credentials → Service Account**
3. תן לו שם (למשל: "email-reminder-bot")
4. **Create and Continue → Done**

#### 2.3 הורד Credentials JSON

1. לחץ על ה-Service Account שיצרת
2. **Keys → Add Key → Create New Key**
3. בחר **JSON**
4. שמור הקובץ בשם `credentials.json` בתיקיית `automation/`

#### 2.4 שתף את ה-Sheet

1. פתח את הקובץ `credentials.json`
2. מצא את השדה `"client_email"` (נראה כמו `xxx@xxx.iam.gserviceaccount.com`)
3. חזור ל-Google Sheet שלך
4. **Share** ושתף עם המייל הזה (עם הרשאות Editor)

### שלב 3: הגדר SMTP (Gmail)

#### אם משתמש ב-Gmail:

1. לך ל: https://myaccount.google.com/security
2. הפעל **2-Step Verification**
3. חזור ל-Security
4. **App passwords** (תחת 2-Step Verification)
5. צור App Password חדש עבור "Mail"
6. שמור את הסיסמה!

### שלב 4: צור קובץ .env

צור קובץ `.env` בתיקיית `automation/`:

```bash
# Google Sheets
GOOGLE_SHEETS_CREDENTIALS=credentials.json
SPREADSHEET_NAME=JUST A SECOND Registrations
SHEET_NAME=Responses

# Email Settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-app-password-here
SENDER_NAME=JUST A SECOND

# Reminder Settings
REMINDER_DAYS_BEFORE=1
```

### שלב 5: בדוק שהכל עובד

```bash
python email_reminder_agent.py
```

אם זה עובד, תראה:
```
✅ Connected to Google Sheet
Fetched X rows from sheet
=== Reminder Check Complete ===
```

### שלב 6: הגדר תזמון אוטומטי

#### Windows - Task Scheduler:

1. פתח **Task Scheduler**
2. **Create Basic Task**
3. Name: "Email Reminder Bot"
4. Trigger: **Daily** בשעה 9:00
5. Action: **Start a Program**
   - Program: `python`
   - Arguments: `C:\path\to\automation\email_reminder_agent.py`
   - Start in: `C:\path\to\automation\`
6. **Finish**

#### Linux/Mac - Crontab:

```bash
crontab -e
```

הוסף:
```
0 9 * * * cd /path/to/automation && python email_reminder_agent.py
```

---

## 📊 מבנה Google Sheet הנדרש

הסקריפט מצפה למבנה הבא (התאם את מספרי העמודות):

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Org Type | Org Name | Contact Name | **Email** | Phone | **Visit Date** | People | Hours | Activities | Reminder Sent |

**חובה:**
- עמודת **Email** - כתובת מייל של איש הקשר
- עמודת **Visit Date** - תאריך הביקור (פורמט: DD/MM/YYYY)

---

## 🎨 התאמת המייל

### Google Apps Script:

ערוך את הפונקציה `createEmailBody()` בקוד כדי לשנות עיצוב/תוכן.

### Python:

ערוך את הפונקציה `_create_email_html()` ב-`email_reminder_agent.py`.

---

## 🧪 בדיקות

### Google Apps Script:

```javascript
// שלח מייל בדיקה לעצמך
sendTestEmail()

// הרץ בדיקה מלאה (ללא שליחת מיילים)
testReminderSystem()

// הרץ בדיקה מלאה (עם שליחת מיילים אמיתיים!)
checkAndSendDailyReminders()
```

### Python:

```bash
# הרץ ידנית
python email_reminder_agent.py

# בדוק חיבור ל-Google Sheets
python -c "from email_reminder_agent import EmailReminderAgent; agent = EmailReminderAgent(); agent.connect_to_sheet()"
```

---

## 🔧 פתרון בעיות

### Google Apps Script:

**"Sheet not found"**
- בדוק ש-`SHEET_NAME` בקוד תואם לשם הגיליון

**"אין הרשאות"**
- הרץ שוב ואשר את כל ההרשאות
- אם Google חוסם: Advanced → Go to [project name] (unsafe)

**"מיילים לא נשלחים"**
- בדוק ב-**Execution log** (View → Executions) אם יש שגיאות
- ודא שהמיילים תקינים בגיליון

### Python:

**"credentials.json not found"**
- ודא שהקובץ נמצא בתיקייה הנכונה
- בדוק את הנתיב ב-`.env`

**"Permission denied on Google Sheets"**
- ודא ששיתפת את ה-Sheet עם ה-service account email
- בדוק שיש הרשאות Editor

**"SMTP Authentication failed"**
- ודא שהשתמשת ב-App Password ולא בסיסמה הרגילה
- בדוק שה-2FA מופעל בחשבון Google

---

## 📅 לוח זמנים מומלץ

- **09:00** - הסקריפט רץ ובודק את הגיליון
- **09:00-09:05** - שליחת מיילים ללקוחות עם פעילויות למחרת
- **09:10** - מייל סיכום למנהל (אופציונלי)

---

## 💡 טיפים

### שלח מוקדם יותר

שנה `DAYS_BEFORE: 2` כדי לשלוח יומיים לפני במקום יום אחד.

### שלח מספר תזכורות

הרץ את הסקריפט פעמיים ביום (עם `DAYS_BEFORE` שונה):
- בוקר: תזכורת למחרת
- ערב: תזכורת לעוד 3 ימים

### בדוק לוגים

- **Google Apps Script:** View → Executions
- **Python:** הוסף `> logs.txt` לפקודת ההרצה

---

## 🎉 סיימת!

המערכת תפעל אוטומטית מדי יום ותשלח תזכורות מעוצבות ללקוחות!

### בדיקת תקינות

1. הוסף שורה חדשה ל-Sheet עם:
   - המייל שלך
   - תאריך למחרת
2. הרץ את הסקריפט ידנית
3. בדוק שקיבלת מייל

---

## 🆘 צריך עזרה?

- קרא את ההערות בקוד (הכל מתועד בעברית)
- בדוק את ה-logs לשגיאות
- Google: "Google Apps Script send email" / "Python gspread tutorial"

**בהצלחה! 🚀**
