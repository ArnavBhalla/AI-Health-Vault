# Quick Start Guide

## Get Running in 3 Steps

### 1. Start the Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

### 2. Explore the Landing Page

- Visit http://localhost:3000
- See the feature overview and privacy promise
- Click "Get Started" to go to the dashboard

### 3. Try the Dashboard (Demo Mode)

The dashboard is accessible directly at http://localhost:3000/dashboard

**Available Tabs:**
- **My Records** - Will show uploaded health records (empty initially)
- **Upload** - Upload encrypted files (requires key generation first)
- **Privacy** - View encryption status and data controls
- **Activity Log** - See audit trail of activities

## Current State & Known Limitations

### What Works Now

✅ **Full Project Scaffold**
- Complete Next.js project structure
- All folders, configs, and dependencies set up
- Database schema created (SQLite)
- Local storage directories ready

✅ **Client-Side Encryption**
- WebCrypto utilities fully implemented
- AES-256-GCM for content encryption
- RSA-2048-OAEP for key wrapping
- React hooks for key management

✅ **API Routes (Backend)**
- Auth endpoints (register, login, logout, me)
- Records endpoints (upload, list)
- AI explanation endpoint (mock service)
- Share link creation
- Audit logging

✅ **UI Components**
- Landing page with disclaimer
- Dashboard with 4 tabs
- Upload panel with drag-and-drop
- Records list with AI insights display
- Privacy dashboard
- Activity log viewer

✅ **Mock AI Service**
- Generates realistic lab explanations
- Determines severity based on range
- Provides educational context
- Ready to swap for real Claude/OpenAI

### What Needs Wiring Up

⚠️ **Auth Flow Not Connected**
- Login/register forms not created yet
- Dashboard accessible without authentication
- Need to add protected route middleware

**Quick Fix**: The dashboard currently loads without auth. To test upload:
1. Open browser console
2. The crypto hooks will auto-generate keys on first use

⚠️ **Explain Button Not Wired**
- "Explain" button in RecordsList needs onClick handler
- Should call `/api/ai/explain` endpoint

**Quick Fix**: Add this to RecordCard component:
```typescript
async function handleExplain(recordId: string) {
  const response = await fetch('/api/ai/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recordId }),
  });
  // Refresh records list
}
```

⚠️ **Sign Out Button Not Wired**
- Header "Sign Out" button needs onClick handler

**Quick Fix**: Add logout handler in dashboard page.tsx

## Next Development Steps

### Phase 1: Complete Auth Flow (1-2 hours)

1. Create login/register forms
2. Add protected route middleware
3. Wire up logout button
4. Add session persistence check

### Phase 2: Wire Interactive Features (2-3 hours)

1. Connect "Explain" button to API
2. Add refresh after upload
3. Implement delete record
4. Add export functionality
5. Wire share link creation

### Phase 3: Real AI Integration (3-4 hours)

1. Install Anthropic SDK: `npm install @anthropic-ai/sdk`
2. Update `lib/services/ai.ts` to call Claude API
3. Add OpenAI as fallback
4. Implement de-identification logic
5. Add token usage tracking

### Phase 4: OCR Pipeline (4-6 hours)

1. Add pdf-parse integration
2. Add Tesseract.js for scanned images
3. Create lab value extraction (regex/NER)
4. Auto-populate metadata from parsed content
5. Add confidence scoring

### Phase 5: Charts & Trends (2-3 hours)

1. Create ChartView component with Recharts
2. Show biomarker trends over time
3. Add color zones (green/yellow/red)
4. Implement date range filtering

### Phase 6: FHIR Integration (5-8 hours)

1. Research SMART on FHIR OAuth flow
2. Add FHIR client library
3. Implement MyChart/LabCorp connectors
4. Map FHIR Observations to Record schema
5. Handle refresh tokens

### Phase 7: Production Prep (1-2 weeks)

1. Migrate to Postgres (Supabase)
2. Set up S3 + KMS (HIPAA VPC)
3. Deploy to production infrastructure
4. Add Confidential VM for AI processing
5. Security audit
6. HIPAA compliance certification

## Testing the Upload Flow

### Manual Test (No Auth Required for Dev)

1. Go to http://localhost:3000/dashboard
2. Click "Upload" tab
3. Click "Generate Keys" (first time only)
   - Keys stored in browser IndexedDB
   - Check browser console for confirmation
4. Drag and drop any PDF/image file
5. Fill in lab metadata:
   - Lab Name: "ALT"
   - Value: 59
   - Unit: "U/L"
   - Range: "10-40"
   - Date: (today's date)
6. Click "Upload Securely"
   - File encrypted in browser
   - Sent to `/api/records/upload`
   - Stored in `./storage/records/[userId]/`
7. Go to "My Records" tab
8. Should see uploaded record
9. Click "Explain" to generate AI summary (mock)

## File Locations

### Encrypted Files

```
storage/
├── records/
│   └── [userId]/
│       └── [fileId].pdf.enc
└── temp/
```

### Database

```
prisma/dev.db  (SQLite file)
```

### Logs

Check server console for:
- Upload events
- AI explanation generation
- Audit log creation

## Troubleshooting

### Port 3000 Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Prisma Client Not Generated

```bash
npm run db:generate
```

### Database Out of Sync

```bash
npm run db:push
```

### Clear All Data

```bash
rm -rf prisma/dev.db storage/records/* storage/temp/*
npm run db:push
```

### View Database

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555

## Environment Variables

All defaults are set in `.env` for local development:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="dev-secret-change-in-production"
AI_PROVIDER="mock"
STORAGE_PATH="./storage"
```

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  Browser (localhost:3000)                   │
│  ┌─────────────────────────────────────┐   │
│  │ IndexedDB: User Keys (encrypted)    │   │
│  │ - Public Key (RSA-2048)             │   │
│  │ - Private Key (encrypted w/ pwd)    │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Encrypt File (AES-256-GCM)          │   │
│  │ Wrap Key (RSA-OAEP)                 │   │
│  │ Send Ciphertext Only →              │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  Server (Next.js API Routes)                │
│  ┌─────────────────────────────────────┐   │
│  │ Receive Encrypted Blob              │   │
│  │ Store: ./storage/records/[userId]/  │   │
│  │ DB: metadata + path only            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ AI Service (Mock)                   │   │
│  │ - Reads metadata only (no PHI)      │   │
│  │ - Generates explanation             │   │
│  │ - Stores in AIExplanation table     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Audit Log                           │   │
│  │ - Append-only immutable log         │   │
│  │ - Hash-chained entries              │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://www.prisma.io/docs
- **Web Crypto API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Recharts**: https://recharts.org/

## Support

For issues or questions:
1. Check the README.md for full documentation
2. Review the code comments in `lib/` for implementation details
3. Check browser console and server logs for errors

---

**You're all set!** Run `npm run dev` and start exploring the AI Health Vault MVP. 🚀
