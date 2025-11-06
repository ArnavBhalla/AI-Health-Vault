# AI Health Vault - MVP

> **Your health data, encrypted and explained.**

A privacy-first platform for managing health records with end-to-end encryption and AI-powered explanations.

## Features

### Core MVP Features

- **End-to-End Encryption**: All records encrypted client-side with AES-256-GCM before upload
- **Zero-Knowledge Architecture**: Server never sees unencrypted data
- **AI Explanations**: Plain-language summaries of lab results (mock service for dev)
- **Audit Logging**: Immutable activity trail of all data operations
- **Privacy Dashboard**: Full transparency into data location and access
- **Secure Sharing**: Time-limited encrypted share links (stub implemented)

### Security Architecture

```
Client Browser                  Server (Local Dev)
───────────────                 ──────────────────
1. Generate RSA-2048 keypair
2. Encrypt file with AES-GCM
3. Wrap AES key with RSA
4. Send ciphertext + wrapped key → Store encrypted blob (SQLite + disk)
5. Request AI explanation      → De-identify & mock explain
6. Decrypt locally with private key
```

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + React 18 + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma) - upgrades to Postgres/Supabase for production
- **Storage**: Local filesystem (upgrades to S3 + KMS for production)
- **Encryption**: Web Crypto API (AES-256-GCM + RSA-OAEP-2048)
- **AI**: Mock service (ready for Claude/OpenAI integration)
- **Session**: iron-session (cookie-based)
- **Charts**: Recharts (ready to integrate)

## Project Structure

```
ai-health-vault/
├── app/
│   ├── api/
│   │   ├── auth/          # Register, login, logout, me
│   │   ├── records/       # Upload, list
│   │   ├── ai/            # Explain endpoint
│   │   ├── share/         # Create share links
│   │   └── logs/          # Activity audit log
│   ├── dashboard/         # Main app UI
│   ├── layout.tsx
│   └── page.tsx          # Landing page
├── components/
│   ├── dashboard/         # RecordsList
│   ├── upload/            # UploadPanel
│   └── privacy/           # PrivacyPanel, ActivityLog
├── lib/
│   ├── crypto/            # WebCrypto utilities + React hooks
│   ├── db/                # Prisma client
│   ├── services/          # AI, Storage services
│   ├── auth/              # Session management
│   ├── types/             # TypeScript interfaces
│   └── utils/
├── prisma/
│   └── schema.prisma     # Database models
├── storage/              # Encrypted files (local)
└── public/
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Set up environment variables:**

The `.env` file is already created with local dev defaults. You can modify it if needed:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="dev-secret-change-in-production"
AI_PROVIDER="mock"
```

3. **Initialize the database:**

The database is already initialized. To reset it:

```bash
npm run db:push
```

4. **Run the development server:**

```bash
npm run dev
```

5. **Open your browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Flow

### 1. Landing Page

- See features and privacy promise
- Click "Get Started" to go to dashboard

### 2. Dashboard

Navigate between tabs:
- **My Records**: View uploaded health records with AI insights
- **Upload**: Drag-and-drop file upload with metadata form
- **Privacy**: View encryption status and data controls
- **Activity Log**: See immutable audit trail

### 3. Upload a Lab Report

1. Go to Upload tab
2. First time: Generate encryption keys (stored in browser IndexedDB)
3. Drag & drop a PDF or image
4. Fill in lab metadata (name, value, unit, range, date)
5. Click "Upload Securely"
   - File encrypted in browser with AES-256-GCM
   - Encryption key wrapped with your RSA public key
   - Only ciphertext sent to server

### 4. AI Explanation

1. Go to My Records
2. Click "Explain" on any record
3. Mock AI service generates:
   - Plain-language summary
   - Trend indicator (up/down/stable/normal)
   - Severity assessment (-1/0/1)
   - Educational context

### 5. Privacy Dashboard

- Check encryption status
- View where keys are stored
- Export or delete all data
- See active share links

### 6. Activity Log

- View chronological audit trail
- Each event is hash-chained for integrity
- No PHI stored in logs

## Database Schema

### Tables

- **User**: email, passwordHash, publicKey, encryptedPrivateKey
- **Record**: type, filename, ciphertextUrl, wrappedKey, metadata (JSON)
- **Wearable**: date, steps, sleepHours, restingHR, activeHR
- **AIExplanation**: summary, trend, severity, education, model
- **ShareLink**: token, recordIds, expiresAt, maxViews, isRevoked
- **AuditLog**: event, resourceType, resourceId, previousHash, currentHash

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create account + keys
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Get current user

### Records

- `POST /api/records/upload` - Upload encrypted record
- `GET /api/records/list` - List user's records

### AI

- `POST /api/ai/explain` - Generate AI explanation for record

### Sharing

- `POST /api/share/create` - Create time-limited share link

### Logs

- `GET /api/logs` - Get audit log entries

## Encryption Details

### Client-Side Encryption Flow

1. **Key Generation** (one-time):
   ```typescript
   const keyPair = await generateKeyPair(); // RSA-OAEP 2048
   // Public key → server
   // Private key → encrypted with password → IndexedDB
   ```

2. **File Upload**:
   ```typescript
   const cek = generateRandomKey(); // AES-256-GCM
   const ciphertext = await encrypt(file, cek);
   const wrappedKey = await wrapKey(cek, publicKey);
   // Send: { ciphertext, wrappedKey }
   ```

3. **File Download** (future):
   ```typescript
   const cek = await unwrapKey(wrappedKey, privateKey);
   const plaintext = await decrypt(ciphertext, cek);
   ```

## Development Roadmap

### Current Status (MVP Scaffold)

- ✅ Project structure
- ✅ Database schema
- ✅ Client-side encryption (WebCrypto)
- ✅ API routes (auth, records, AI, share, logs)
- ✅ Core UI components
- ✅ Mock AI service
- ✅ Privacy dashboard
- ✅ Activity logging

### Next Steps

1. **Auth Flow**:
   - Wire up login/register forms
   - Add protected route middleware
   - Implement logout

2. **Real AI Integration**:
   - Add Anthropic SDK for Claude
   - Add OpenAI SDK as fallback
   - Implement de-identification logic

3. **OCR Pipeline**:
   - Integrate pdf-parse for text PDFs
   - Add Tesseract for scanned images
   - Extract lab values with regex/NER

4. **Charts & Trends**:
   - Integrate Recharts for timeline views
   - Show biomarker trends over time
   - Color zones (green/yellow/red)

5. **FHIR Integration**:
   - Add SMART on FHIR connector
   - OAuth flow for MyChart/LabCorp
   - Import observations

6. **Wearable Sync**:
   - Apple HealthKit integration
   - Google Health Connect
   - Daily summaries API

7. **WebAuthn/Passkeys**:
   - Replace password with biometric login
   - Secure enclave key storage

8. **Production Prep**:
   - Migrate to Postgres (Supabase)
   - Deploy to AWS S3 + KMS (HIPAA VPC)
   - Add Confidential VM for AI (GCP/Azure)
   - SOC 2 compliance audit

## Environment Variables

### Development (current)

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="dev-secret"
AI_PROVIDER="mock"
STORAGE_PATH="./storage"
```

### Production (future)

```env
DATABASE_URL="postgresql://..."
SESSION_SECRET="<random-256-bit-string>"
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-..."
OPENAI_API_KEY="sk-..."
AWS_S3_BUCKET="..."
AWS_KMS_KEY_ID="..."
ENABLE_PHI_TO_AI="false"
```

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:push      # Push Prisma schema to DB
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Regenerate Prisma Client
```

## Compliance & Security Notes

### Current Implementation

- End-to-end encryption (AES-256-GCM + RSA-2048)
- Zero-knowledge architecture (server sees only ciphertext)
- Audit logging (immutable, hash-chained)
- De-identified AI processing (no PHI to external models)

### Production Requirements

- HIPAA compliance audit
- SOC 2 Type II certification
- Penetration testing
- Bug bounty program
- Data processing agreement (DPA) with cloud provider
- Business Associate Agreement (BAA) for AI providers

### Legal Disclaimers

All AI summaries include:

> ⚠️ **AI Health Vault does not provide medical advice.** All AI summaries are for educational purposes only. Always consult a qualified healthcare provider for diagnosis or treatment.

## Contributing

This is an MVP scaffold. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT (or your preferred license)

## Acknowledgments

Built following the AI Health Vault MVP Blueprint with:
- Privacy-first architecture
- End-to-end encryption
- Explainable AI
- Transparent audit logging

**Tagline**: "Your health data, encrypted and explained."
