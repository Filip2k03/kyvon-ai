# Email Client Setup Guide: contact@yamato-ac.jp
### Complete Step-by-Step IMAP & POP3 Configuration for iOS (iPhone/iPad) and Android

---

## 1. Quick Copy-Paste Parameters (Cheat Sheet)

Use these exact values when adding your account to any mail client (iOS Mail, Android Gmail, Samsung Email, Outlook, Thunderbird, Mac Mail).

| Field | IMAP (Recommended) | POP3 (Alternative) | Outgoing (SMTP - Required for Both) |
| :--- | :--- | :--- | :--- |
| **Email Address** | `contact@yamato-ac.jp` | `contact@yamato-ac.jp` | `contact@yamato-ac.jp` |
| **Username / Account** | `contact@yamato-ac.jp` | `contact@yamato-ac.jp` | `contact@yamato-ac.jp` |
| **Password** | `[Your Mailbox Password]` | `[Your Mailbox Password]` | `[Your Mailbox Password]` |
| **Server Hostname** | `mail.reiwasakura.tech`<br>*(or `mail.yamato-ac.jp`)* | `mail.reiwasakura.tech`<br>*(or `mail.yamato-ac.jp`)* | `mail.reiwasakura.tech`<br>*(or `mail.yamato-ac.jp`)* |
| **Port** | **`993`** | **`995`** | **`465`** *(or `587`)* |
| **Security / Encryption**| **`SSL/TLS`** | **`SSL/TLS`** | **`SSL/TLS`** *(or `STARTTLS` for 587)* |
| **Authentication** | Password / Normal | Password / Normal | Password / Normal (Required) |

> 💡 **Recommendation**: Always select **IMAP** on mobile phones. IMAP keeps your inbox, sent items, read statuses, and folders synchronized across your iPhone, Android, PC, and Webmail. POP3 downloads messages locally to one device and can delete them from the server.

---

## 2. iOS (iPhone / iPad) Step-by-Step Setup Guide

### Method A: IMAP Setup (Recommended)

1. Open **Settings** on your iPhone or iPad.
2. Scroll down and tap **Mail** (or **Apps** > **Mail** on iOS 18+).
3. Tap **Mail Accounts** (or **Accounts**) > **Add Account**.
4. Tap **Other** at the bottom of the list.
5. Tap **Add Mail Account**.
6. **New Account screen**:
   - **Name**: `Yamato Contact` *(or your company/personal name)*
   - **Email**: `contact@yamato-ac.jp`
   - **Password**: `[Your Mailbox Password]`
   - **Description**: `Yamato Contact`
   - Tap **Next** (top right).
7. On the next screen, ensure **IMAP** is highlighted/selected at the top.
8. Fill in **INCOMING MAIL SERVER**:
   - **Host Name**: `mail.reiwasakura.tech`
   - **User Name**: `contact@yamato-ac.jp`
   - **Password**: `[Your Mailbox Password]`
9. Fill in **OUTGOING MAIL SERVER**:
   - **Host Name**: `mail.reiwasakura.tech`
   - **User Name**: `contact@yamato-ac.jp`
   - **Password**: `[Your Mailbox Password]` *(Do not leave blank, even if iOS says Optional!)*
10. Tap **Next**. iOS will verify the connection (approx 10-30 seconds).
11. Leave **Mail** toggled **ON** and tap **Save**.

#### 🔒 Verification of Advanced Settings on iOS:
If iOS does not automatically assign port 993/465, verify:
- Go to **Settings** > **Mail** > **Accounts** > Tap `Yamato Contact`.
- Tap your account email > **Advanced**:
  - **Use SSL**: `ON` (Green)
  - **Authentication**: `Password`
  - **Server Port**: `993`
- Back to previous screen > Tap **SMTP** (`mail.reiwasakura.tech`):
  - **Use SSL**: `ON`
  - **Authentication**: `Password`
  - **Server Port**: `465` (or `587`)

---

### Method B: POP3 Setup on iOS (If specifically required)

1. Follow steps 1–6 above (**Settings** > **Mail** > **Accounts** > **Add Account** > **Other** > **Add Mail Account**).
2. Enter Name, `contact@yamato-ac.jp`, Password, Description. Tap **Next**.
3. Tap **POP** tab at the top.
4. **INCOMING MAIL SERVER**:
   - **Host Name**: `mail.reiwasakura.tech`
   - **User Name**: `contact@yamato-ac.jp`
   - **Password**: `[Your Mailbox Password]`
5. **OUTGOING MAIL SERVER**:
   - **Host Name**: `mail.reiwasakura.tech`
   - **User Name**: `contact@yamato-ac.jp`
   - **Password**: `[Your Mailbox Password]`
6. Tap **Save**.
7. In Account > **Advanced**, verify:
   - **Use SSL**: `ON`
   - **Server Port**: `995`

---

## 3. Android Step-by-Step Setup Guide (Gmail App / Samsung Email)

### Setup in the Default Gmail App on Android:

1. Open the **Gmail app** on your Android device.
2. Tap your profile picture or initial in the top-right corner.
3. Tap **Add another account**.
4. On the **Set up email** screen, tap **Other**.
5. Enter your email address: `contact@yamato-ac.jp`
6. Tap **Manual setup** (in the bottom-left corner).
7. Select account type:
   - Select **Personal (IMAP)** *(Recommended)*
   - Or **Personal (POP3)**
8. Enter your mailbox password and tap **Next**.

9. **Incoming server settings**:
   - **Username**: `contact@yamato-ac.jp` *(make sure it includes the full @yamato-ac.jp)*
   - **Password**: `[Your Mailbox Password]`
   - **Server**: `mail.reiwasakura.tech`
   - **Port**:
     - For IMAP: **`993`**
     - For POP3: **`995`**
   - **Security type**: **`SSL/TLS`** (or `SSL/TLS (accept all certificates)`)
   - Tap **Next**.

10. **Outgoing server settings (SMTP)**:
    - **Require sign-in**: Toggle **ON** (Enabled)
    - **Username**: `contact@yamato-ac.jp`
    - **Password**: `[Your Mailbox Password]`
    - **SMTP server**: `mail.reiwasakura.tech`
    - **Port**: **`465`** *(or `587`)*
    - **Security type**: **`SSL/TLS`** *(or `STARTTLS` if using 587)*
    - Tap **Next**.

11. **Account options**:
    - Sync frequency: Every 15 minutes (or Automatic/Push)
    - Notify me when email arrives: Checked
    - Sync email for this account: Checked
    - Tap **Next**.
12. **Account name & display name**:
    - Your name: `Yamato Contact` *(This is the sender name recipients see)*
    - Tap **Next** to complete.

---

## 4. Setup in Samsung Email App (Galaxy Devices)

1. Open **Samsung Email**.
2. Tap **Add Account** > **Other**.
3. Enter `contact@yamato-ac.jp` and your password.
4. Tap **Manual setup**.
5. Choose **IMAP account** (or **POP3 account**).
6. **Account**:
   - Email: `contact@yamato-ac.jp`
   - User name: `contact@yamato-ac.jp`
   - Password: `[Your Mailbox Password]`
7. **Incoming server**:
   - IMAP server: `mail.reiwasakura.tech`
   - Security type: `SSL`
   - Port: `993` (or `995` for POP3)
8. **Outgoing server**:
   - SMTP server: `mail.reiwasakura.tech`
   - Security type: `SSL`
   - Port: `465` (or `587` with STARTTLS)
   - Authentication required: `ON`
   - User name: `contact@yamato-ac.jp`
   - Password: `[Your Mailbox Password]`
9. Tap **Sign in**.

---

## 5. Troubleshooting & FAQ

### Q1: "Cannot connect using SSL" or Certificate Warning?
- **Root Cause**: If using `mail.yamato-ac.jp`, ensure Let's Encrypt includes `mail.yamato-ac.jp`.
- **Solution**: Set the server hostname strictly to **`mail.reiwasakura.tech`**. The SSL certificate is issued directly to `mail.reiwasakura.tech` and validates with 0 warnings on all iOS and Android devices.

### Q2: "Cannot Send Mail" or Outgoing (SMTP) Error?
- In iOS/Android, the outgoing server fields often say *"Optional"* for username and password. **They are NOT optional on Poste.io**.
- You MUST enter `contact@yamato-ac.jp` as the username and your password under Outgoing Server.
- Ensure Outgoing Port is set to **`465`** with **`SSL/TLS`**, or **`587`** with **`STARTTLS`**.

### Q3: How to test without mobile configuration?
- Open your browser to Webmail:
  ```
  https://mail.reiwasakura.tech
  ```
- Log in with `contact@yamato-ac.jp` to confirm the password and mailbox functionality immediately.
