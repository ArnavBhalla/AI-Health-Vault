# Testing Guide - AI Health Vault

## ✅ UX Improvements Completed

### What's New:
1. **Toast Notifications** - Replaced all `alert()` with elegant toast messages
2. **Loading Skeletons** - Added animated loading states for records list
3. **Better Error Messages** - Clear, actionable error messages throughout
4. **File Validation** - Client-side validation for file type and size

---

## 🧪 Manual Testing Checklist

### 1. Authentication Flow

#### Register New Account
- [ ] Visit http://localhost:3000
- [ ] Click "Get Started" → redirected to `/login`
- [ ] Click "Sign up" link
- [ ] Fill in:
  - Name: Test User
  - Email: test@example.com
  - Password: password123
- [ ] Submit form
- [ ] **Expected:** See toast "Generating encryption keys..." → redirect to `/dashboard`
- [ ] **Verify:** localStorage has user data

#### Login
- [ ] Sign out from dashboard
- [ ] Return to `/login`
- [ ] Enter credentials
- [ ] **Expected:** Successful login with toast → redirect to `/dashboard`

#### Protected Routes
- [ ] While logged out, try to access `/dashboard`
- [ ] **Expected:** Automatic redirect to `/login`

---

### 2. File Upload & Validation

#### Valid Upload
- [ ] Go to "Upload" tab
- [ ] Click "Generate Keys" if needed
- [ ] Upload a PDF file (<10MB)
- [ ] Fill in metadata:
  - Lab Name: ALT
  - Value: 45
  - Unit: U/L
  - Range: 10-40
  - Date: Today's date
- [ ] Click "Upload Securely"
- [ ] **Expected:**
  - Success toast appears
  - Automatically switches to "My Records" tab
  - New record appears in list

#### File Type Validation
- [ ] Try to upload a .txt or .docx file
- [ ] **Expected:** Toast error "Invalid file type. Please upload PDF, JPG, or PNG files only."

#### File Size Validation
- [ ] Try to upload a file >10MB
- [ ] **Expected:** Toast error "File size exceeds 10MB limit."

---

### 3. AI Explanation

#### Mock Mode (Default)
- [ ] Find a record without AI explanation
- [ ] Click "Explain" button
- [ ] **Expected:**
  - Button shows "Analyzing..."
  - Success toast "AI explanation generated!"
  - Blue AI Insight box appears with mock explanation
  - "Explain" button disappears (already explained)

#### Real Claude API
- [ ] Edit `.env` file:
  ```
  AI_PROVIDER=anthropic
  ANTHROPIC_API_KEY=sk-ant-your-key-here
  ```
- [ ] Restart dev server: `npm run dev`
- [ ] Upload a new record with lab data
- [ ] Click "Explain"
- [ ] **Expected:**
  - Real AI explanation from Claude
  - Tailored to your specific lab values
  - Includes trend, severity, and education

---

### 4. Export Functionality

#### Export Record
- [ ] Find any record in the list
- [ ] Click "Export" button
- [ ] **Expected:**
  - Toast "Exporting record..."
  - File downloads: `health-record-[id].json`
  - Success toast "Record exported successfully"
- [ ] Open downloaded JSON file
- [ ] **Verify:** Contains metadata, AI explanation, encrypted data

---

### 5. Delete Functionality

#### Delete Record
- [ ] Find any record in the list
- [ ] Click "Delete" button
- [ ] **Expected:** Browser confirmation dialog
- [ ] Confirm deletion
- [ ] **Expected:**
  - Toast "Deleting record..."
  - Record disappears from list
  - Success toast "Record deleted successfully"

---

### 6. Loading States

#### Records List Loading
- [ ] Refresh the dashboard
- [ ] **Expected:** See 3 animated skeleton cards
- [ ] After loading completes, skeletons replaced with actual records

#### Upload Loading
- [ ] Upload a file
- [ ] **Expected:** Button changes to "Encrypting & Uploading..."
- [ ] Button is disabled during upload

---

### 7. Error Handling

#### Network Errors
- [ ] Stop the dev server
- [ ] Try to upload a file
- [ ] **Expected:** Toast error "Upload failed. Please try again."

#### Invalid Credentials
- [ ] Try to login with wrong password
- [ ] **Expected:** Red error message "Invalid credentials"

#### Missing Fields
- [ ] Try to register without filling all fields
- [ ] **Expected:** Browser validation prevents submission

---

## 🔍 Visual Testing

### Toast Notifications
- [ ] Success toasts are green with checkmark icon
- [ ] Error toasts are red with X icon
- [ ] Toasts appear in top-right corner
- [ ] Toasts auto-dismiss after 3-4 seconds
- [ ] Multiple toasts stack nicely

### Loading Skeletons
- [ ] Skeletons have pulsing animation
- [ ] Match the shape of actual records
- [ ] Respect dark mode colors

### File Validation
- [ ] Error toasts appear immediately (no network call)
- [ ] File input resets after invalid file

---

## 🧠 AI Testing Matrix

| Lab Test | Value | Unit | Range | Expected AI Response |
|----------|-------|------|-------|---------------------|
| ALT | 59 | U/L | 10-40 | "Slightly above normal" severity=1 |
| Glucose | 95 | mg/dL | 70-100 | "Within normal range" severity=0 |
| Cholesterol | 180 | mg/dL | 125-200 | "Healthy result" severity=0 |
| Hemoglobin | 11.5 | g/dL | 12-16 | "Slightly below normal" severity=-1 |

### Test with Claude API:
1. Set `AI_PROVIDER=anthropic` in `.env`
2. Upload each test case above
3. Click "Explain"
4. Verify:
   - Explanation is contextual and accurate
   - Severity matches expected value
   - Trend is logical
   - Education is relevant to the test

---

## 🎨 Dark Mode Testing

- [ ] Toggle system dark mode
- [ ] Verify all pages respect dark mode:
  - Landing page
  - Login/Register
  - Dashboard
  - All tabs
- [ ] Toasts have proper contrast in dark mode
- [ ] Loading skeletons visible in dark mode

---

## 🔐 Security Testing

### Encryption
- [ ] Upload a file
- [ ] Check `storage/records/[userId]/` directory
- [ ] **Verify:** File has `.enc` extension
- [ ] Try to open encrypted file
- [ ] **Expected:** Gibberish/encrypted data

### Session Management
- [ ] Login
- [ ] Check browser cookies
- [ ] **Verify:** `ai-health-vault-session` cookie exists
- [ ] **Verify:** Cookie is HTTP-only
- [ ] Sign out
- [ ] **Verify:** Cookie is cleared

### Password Storage
- [ ] Register with password "test123"
- [ ] Check `prisma/dev.db` using Prisma Studio:
  ```bash
  npx prisma studio
  ```
- [ ] Open User table
- [ ] **Verify:** `passwordHash` is bcrypt hash (starts with `$2b$`)
- [ ] **Verify:** `encryptedPrivateKey` is base64 string (not plain)

---

## 📊 Performance Testing

### Upload Speed
- [ ] Upload 1MB PDF
- [ ] **Expected:** <2 seconds
- [ ] Upload 5MB PDF
- [ ] **Expected:** <5 seconds

### AI Explanation
- [ ] Click "Explain" (mock mode)
- [ ] **Expected:** <1 second
- [ ] Click "Explain" (Claude API)
- [ ] **Expected:** 2-4 seconds

### Page Load
- [ ] Clear browser cache
- [ ] Visit dashboard
- [ ] **Expected:** Records load in <2 seconds

---

## 🐛 Known Issues

1. **Middleware**: Uses server-side session checks (may need optimization)
2. **File Storage**: Local filesystem (not production-ready)
3. **Key Storage**: In localStorage (consider IndexedDB for better security)
4. **No key rotation**: Encryption keys never rotate
5. **Image OCR**: Not implemented client-side yet

---

## ✨ Next Steps

### Immediate Improvements
- [ ] Add confirmation modal for delete (instead of browser confirm)
- [ ] Add search/filter for records list
- [ ] Add pagination for large record lists
- [ ] Show file preview before upload
- [ ] Add drag-and-drop visual feedback

### Phase 5 Production Prep
- [ ] Migrate to PostgreSQL/Supabase
- [ ] Set up AWS S3 + KMS storage
- [ ] Implement WebAuthn/passkeys
- [ ] Add comprehensive monitoring
- [ ] Set up error tracking (Sentry)

---

## 📝 Test Results Log

Date: ___________
Tester: ___________

| Test | Status | Notes |
|------|--------|-------|
| Registration | ☐ Pass ☐ Fail | |
| Login | ☐ Pass ☐ Fail | |
| Upload | ☐ Pass ☐ Fail | |
| AI Explain | ☐ Pass ☐ Fail | |
| Export | ☐ Pass ☐ Fail | |
| Delete | ☐ Pass ☐ Fail | |
| Toast Notifications | ☐ Pass ☐ Fail | |
| Loading States | ☐ Pass ☐ Fail | |
| File Validation | ☐ Pass ☐ Fail | |

---

**Happy Testing!** 🎉
