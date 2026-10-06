# Lead inbox setup (Google Sheet + email)

Website leads are stored in a Google Sheet and you get an email for each one. This takes about 10 minutes.

> **For the demo**, do this in **your own** Google account and set `LEAD_NOTIFY_TO` to your email, so test
> leads don't reach your uncle. **At launch**, repeat it in the humusolver@gmail.com account (or share the
> sheet with it) and change the Railway variables.

1. Go to <https://sheets.new> and name the sheet **Humusolver Leads**.
2. In the sheet, open **Extensions → Apps Script**.
3. Delete the starter code, paste in the full contents of [`Code.gs`](./Code.gs), and click **Save**.
4. Click the gear icon (**Project Settings**). Under **Script properties**, add:
   - Property: `SHARED_SECRET`
   - Value: a long random string. Generate one in Terminal:

     ```bash
     openssl rand -hex 24
     ```

     Save it. You'll paste the same value into Railway as `APPS_SCRIPT_SECRET`.
5. Back in the editor, choose the `setup` function in the toolbar and click **Run**. Google asks for
   permission to edit the sheet and send email as you. Click **Review permissions** and allow it.
   (Google may warn that the app is unverified, because it's your own script. Click **Advanced → Go to …**.)
   A **Leads** tab with headers appears in the sheet.
6. Click **Deploy → New deployment**. Under **Select type**, choose **Web app** and set:
   - Execute as: **Me**
   - Who has access: **Anyone**. The site's server calls it, and it rejects requests that don't
     carry your secret.
7. Click **Deploy**, then copy the **Web app URL** (it ends in `/exec`).
8. In Railway, go to your service → **Variables** and set:
   - `APPS_SCRIPT_URL` = the Web app URL
   - `APPS_SCRIPT_SECRET` = the secret from step 4
   - `LEAD_NOTIFY_TO` = the email that should get notifications

If you edit `Code.gs` later, use **Deploy → Manage deployments → Edit (pencil) → Version: New version**.
This keeps the same URL.

**Limits:** Free Gmail accounts can send about 100 emails a day through Apps Script, which is plenty here.
If the script fails, the website shows the visitor your phone number and logs the full lead in Railway's
**Deploy Logs**, so no lead is lost.
