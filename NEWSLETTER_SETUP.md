# Newsletter Signup — Setup Guide

This document explains how to wire the SKI HERE signup form to a Google Sheet so every submission is captured automatically.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Name it something clear, e.g. **SKI HERE Signups**.
3. Leave the first tab as-is — the Apps Script will create a "Signups" tab with headers automatically on the first submission. (If you prefer a different tab name, edit the `SHEET_NAME` variable at the top of `google-apps-script.js` before pasting.)

---

## Step 2 — Open Apps Script

1. Inside the spreadsheet, click **Extensions → Apps Script**.
2. A new browser tab opens with a default `Code.gs` file.
3. Delete all the default code in that file.

---

## Step 3 — Paste the script

1. Open `google-apps-script.js` from this repo.
2. Copy the entire contents.
3. Paste it into the `Code.gs` editor in Apps Script.
4. Click the floppy-disk icon (or press **Cmd+S / Ctrl+S**) to save. Name the project anything you like, e.g. **SKI HERE Newsletter**.

---

## Step 4 — Deploy as a Web App

1. Click the **Deploy** button (top-right) → **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in the settings:
   - **Description**: `SKI HERE Newsletter v1` (optional but helpful)
   - **Execute as**: `Me` (your Google account)
   - **Who has access**: `Anyone` — this is required so the website can POST to it without authentication
4. Click **Deploy**.
5. Google will ask you to authorize the script to access your spreadsheet. Click **Authorize access** and follow the prompts. You may need to click "Advanced → Go to [project name] (unsafe)" on the consent screen if the app is not verified — this is normal for personal scripts.
6. After authorization, Google shows you the **Web app URL**. It looks like:
   ```
   https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
   Copy this URL.

---

## Step 5 — Update index.html

1. Open `index.html` in your editor.
2. Near the bottom, find this line inside the `<script>` block:
   ```js
   var APPS_SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
   ```
3. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL_HERE` with the URL you copied in Step 4. Keep the surrounding single quotes.
4. Save the file and deploy the site.

---

## Step 6 — Test it

1. Open the live site and click **Stay Informed** to open the modal.
2. Fill in a name and email and submit.
3. Open your Google Sheet — you should see a new "Signups" tab with a header row and your test entry (timestamp, name, email).

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Error message shown on form | Wrong URL or script not deployed | Double-check the URL in `index.html`; redeploy the script |
| No sheet tab created | Script ran but failed silently | Check Apps Script **Executions** log (left sidebar) for errors |
| "Authorization required" error | Script not authorized | Run any function once manually inside the Apps Script editor to trigger authorization |
| CORS error in browser console | "Who has access" not set to Anyone | Create a new deployment with `Anyone` access |

---

## Updating the script later

If you modify `google-apps-script.js` and repaste it, you must create a **new deployment** (Deploy → New deployment) rather than editing the existing one. Each deployment gets its own URL — update `APPS_SCRIPT_URL` in `index.html` accordingly, or use "Manage deployments" to update the existing deployment in-place.
