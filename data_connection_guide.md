# How to Connect Admin Dashboard to Real Data

Follow these steps to stop using "Mock Data" and start seeing real registrations from your Google Sheet.

## Step 1: Update Google Apps Script
1. Go to your [Google Apps Script Editor](https://script.google.com/).
2. Open your project (the one connected to your form).
3. Open the file `automation/ADMIN_SCRIPT_SNIPPET.js` from this project (I created it for you earlier).
4. **Copy** the entire content of that file.
5. In your Google Script Editor, find the `doGet(e)` function.
6. **Replace** the existing `doGet` function (and `getAdminDataAsJSON` / `jsonError` helpers if you are pasting the whole snippet) with the code you copied.
   - *Note: Make sure you don't delete your `doPost` function! That handles the form submissions.*
7. Save the script (Ctrl+S).

## Step 2: Deploy as Web App
1. Click the blue **Deploy** button > **New deployment**.
2. Select type: **Web app**.
3. **Description**: "Admin API Update".
4. **Execute as**: "Me" (your email).
5. **Who has access**: **"Anyone"**. (This is important so the admin page can fetch data without complex OAuth, security is handled by our API Key).
6. Click **Deploy**.
7. **Copy** the **Web App URL** (it ends with `/exec`).

## Step 3: Update `admin.js`
1. Open the file `admin.js` in your editor.
2. Look for the `CONFIG` object at the top of the file:

```javascript
const CONFIG = {
    // Paste your new Web App URL below:
    API_URL: 'YOUR_WEB_APP_URL_HERE', 
    
    // ... other settings ...
    
    // Toggle this to FALSE when you are ready to use real data
    USE_MOCK: false  <-- CHANGE THIS TO FALSE
};
```
3. Paste your URL into `API_URL`.
4. Change `USE_MOCK: true` to `USE_MOCK: false`.
5. Save the file.

## Step 4: Test
1. Go back to your Admin Dashboard browser tab.
2. Refresh the page.
3. Login again (`admin123`).
4. If everything is correct, the "Refresh Data" button will now pull real rows from your Google Sheet!

## Troubleshooting
- **CORS Errors/Network Error**: Make sure you deployed as "Who has access: Anyone".
- **No Data**: Check if your Google Sheet has data and that the column indices in `getAdminDataAsJSON` match your real sheet columns.
