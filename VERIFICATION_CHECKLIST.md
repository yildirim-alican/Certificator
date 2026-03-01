# PDF Generation Pipeline - Verification Checklist

## Pre-Launch Verification

Use this checklist to verify all components are properly configured before launching the system.

### Backend Verification

#### [ ] Python Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
# Expected: All packages installed (playwright, fastapi, uvicorn, etc.)
```

#### [ ] Playwright Installation
```bash
python -c "import playwright; playwright.sync_api._helper.install(['chromium'])"
# OR
playwright install chromium
# Expected: Chromium browser installed successfully
```

#### [ ] PDF API File Exists
```bash
ls -la app/api/pdf.py
# Expected: File exists with 362 lines
```

#### [ ] App Configuration
Check `app/core/app.py`:
- [ ] Line ~9: `from app.core.pdf_engine import get_pdf_engine` ✅
- [ ] Line ~10: `from app.api import templates, certificates, excel, pdf` ✅
- [ ] Line ~21: PDF engine initialization in lifespan ✅
- [ ] Line ~49-50: `app.include_router(pdf.router, prefix=settings.API_V1_PREFIX)` ✅

#### [ ] Start Backend
```bash
cd backend
python main.py
```
Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
INFO:     Playwright PDF engine initialized
```

#### [ ] Test Health Endpoint
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy", "version": ...}
```

### Frontend Verification

#### [ ] Node Dependencies
```bash
cd frontend
npm install
# Expected: All packages installed
```

#### [ ] Environment Configuration
Check `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=CertifyPro
NEXT_PUBLIC_ENVIRONMENT=development
```
- [ ] API_URL includes `/v1` suffix ✅
- [ ] No trailing slash ✅

#### [ ] Components Exist
```bash
ls frontend/src/components/editor/ExportModal.tsx
ls frontend/src/hooks/usePrinter.ts
ls frontend/src/utils/htmlGenerator.ts
# Expected: All files exist
```

#### [ ] Editor Page Updated
Check `frontend/src/app/editor/[id]/page.tsx`:
```typescript
// Line ~9: import ExportModal
import ExportModal from '@/components/editor/ExportModal';

// Line ~40: state variable
const [showExportModal, setShowExportModal] = useState(false);

// Line ~81-82: handler function
const handleDownloadPDF = async () => {
  setShowExportModal(true);
};

// Line ~160-165: ExportModal component
<ExportModal
  template={template}
  data={{}}
  isOpen={showExportModal}
  onClose={() => setShowExportModal(false)}
/>
```
- [ ] All imports present ✅
- [ ] State initialized ✅
- [ ] Handler wired to button ✅
- [ ] Component rendered ✅

#### [ ] Start Frontend
```bash
cd frontend
npm run dev
```
Expected output:
```
Next.js (version)
- Local: http://localhost:3000
- Environments: .env.local
```

### Integration Testing

#### [ ] CORS Configuration
- [ ] Backend CORS middleware enabled (in app.py) ✅
- [ ] Frontend API URL matches backend domain ✅

#### [ ] Manual PDF Generation Test
1. [ ] Open http://localhost:3000/editor/test-id
2. [ ] Verify editor loads without errors
3. [ ] Click "Export PDF" button
4. [ ] Modal opens
5. [ ] Click "Generate Preview"
   - [ ] Loading indicator appears
   - [ ] PDF renders in iframe (or error message)
6. [ ] Click "Download PDF"
   - [ ] PDF downloads to Downloads folder
   - [ ] File size > 100KB
   - [ ] File is readable PDF

#### [ ] Error Handling Test
1. [ ] Generate with empty template
   - [ ] Expect error message in modal
2. [ ] Generate with invalid data types
   - [ ] Expect API validation error
3. [ ] Stop backend and try to generate
   - [ ] Expect network error in modal

### Docker Verification (Optional)

#### [ ] Build Backend Image
```bash
cd backend
docker build -t certificator-backend:latest .
# Expected: Image builds successfully
# Note: Large image due to Chromium (~1.5GB)
```

#### [ ] Check Dockerfile
```dockerfile
# Lines 5-22: System dependencies for Playwright
# Line 25: playwright install chromium
```
- [ ] All system libs included ✅
- [ ] Playwright install command present ✅

### Performance Baseline

Run these tests to establish baseline:

#### [ ] Single PDF Generation Time
```bash
curl -X POST http://localhost:8000/api/v1/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"template":{...},"data":{}}' \
  -w "\nTime: %{time_total}s\n"
# Expected: < 2 seconds
```

#### [ ] Memory Usage
```
Before: Check memory usage
Generate 10 PDFs
After: Check memory usage
Expected: < 500MB increase for 10 PDFs
```

#### [ ] CPU Usage
- [ ] During generation: < 100% CPU
- [ ] Parallel requests: CPU scales up appropriately

### Documentation Verification

- [ ] PDF_GENERATION_GUIDE.md exists ✅
- [ ] IMPLEMENTATION_SUMMARY.md exists ✅
- [ ] ARCHITECTURE.md updated (if needed)
- [ ] API endpoints documented ✅
- [ ] Examples provided ✅

### Debugging Tools

#### [ ] Enable Backend Logging
```python
# In app.py
import logging
logging.basicConfig(level=logging.DEBUG)
```

#### [ ] Browser Console (Frontend)
- [ ] No CORS errors
- [ ] API calls visible in Network tab
- [ ] Response content-type is application/pdf

#### [ ] Backend Logs
```
INFO:app.api.pdf:PDF generated: /tmp/xxx.pdf
DEBUG:playwright:...
```

### Browser Compatibility

Test in:
- [ ] Chrome/Chromium (recommended)
- [ ] Firefox (PDF plugin required)
- [ ] Safari (macOS only)
- [ ] Edge (Chromium-based)

### Common Issues Checklist

| Issue | Cause | Solution |
|-------|-------|----------|
| ModuleNotFoundError: pdf | Router not registered | Add `include_router(pdf.router)` in app.py |
| Playwright not found | Not installed | `pip install -r requirements.txt` |
| CORS Error | Wrong API URL | Update `.env.local` with `/v1` |
| Empty PDF | Elements not visible | Check element.visible = true |
| "Browser not initialized" | Lifespan issue | Check startup logs |
| 404 on /pdf endpoints | Router prefix wrong | Should be `/api/v1/pdf` |
| Blank preview iframe | No PDF blob | Check API response in DevTools |
| File won't download | CORS headers | Verify FileResponse headers |

### Performance Optimization Checklist

- [ ] PDF engine browser pool initialized once
- [ ] Temporary files cleaned up after generation
- [ ] Response streaming for large files
- [ ] GZIP compression enabled
- [ ] Batch requests handling < 50 requests/min

### Security Checklist

- [ ] CORS only allows frontend origin
- [ ] PDF API validates JSON input
- [ ] No SQL injection possible (no direct queries)
- [ ] File paths use temporary directory
- [ ] No sensitive data logged
- [ ] Request size limited by FastAPI

### Production Readiness

Before deployment:

- [ ] Set `DEBUG=false` in backend config
- [ ] Update CORS origins for production domain
- [ ] Set `NEXT_PUBLIC_ENVIRONMENT=production`
- [ ] Configure logging to file
- [ ] Set resource limits for Playwright
- [ ] Add rate limiting to PDF endpoints
- [ ] Enable HTTPS before production
- [ ] Test with real certificate data

### Testing Workflow

```
1. Terminal 1: Start Backend
   cd backend && python main.py

2. Terminal 2: Start Frontend
   cd frontend && npm run dev

3. Browser 1: Open localhost:3000
   Create/open template

4. Browser 2: Open DevTools
   Monitor network tab
   Check console for errors

5. Test Flow:
   - Edit template
   - Click Export PDF
   - Generate preview
   - Download PDF
   - Verify file
```

### Quick Health Check Script

Save as `healthcheck.sh`:
```bash
#!/bin/bash

echo "🔍 Checking PDF Generation Pipeline..."

# Backend checks
echo -n "Backend health... "
if curl -s http://localhost:8000/health | grep -q "healthy"; then
  echo "✅"
else
  echo "❌ Backend not responding on port 8000"
  exit 1
fi

# Frontend checks
echo -n "Frontend running... "
if curl -s http://localhost:3000 >/dev/null; then
  echo "✅"
else
  echo "❌ Frontend not responding on port 3000"
  exit 1
fi

# Playwright check
echo -n "Playwright installed... "
if python -c "import playwright" 2>/dev/null; then
  echo "✅"
else
  echo "❌ Playwright not installed"
  exit 1
fi

# PDF API test
echo -n "PDF API responding... "
RESPONSE=$(curl -s -X POST http://localhost:8000/api/v1/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{"template":{"name":"Test","orientation":"portrait","backgroundColor":"#fff","elements":[]},"data":{}}' \
  -w "%{http_code}" -o /tmp/test.pdf)

if [ "$RESPONSE" = "200" ]; then
  echo "✅"
  echo "Generated test PDF: /tmp/test.pdf"
else
  echo "❌ Got HTTP $RESPONSE"
  exit 1
fi

echo "✨ All systems operational!"
```

Run it:
```bash
chmod +x healthcheck.sh
./healthcheck.sh
```

---

## Success Criteria

✅ **Backend**
- Playwright browser initializes on startup
- PDF endpoints respond with HTTP 200
- Generated PDFs are valid and readable
- Error handling returns descriptive messages

✅ **Frontend**
- Export modal opens when button clicked
- Preview generates without errors
- PDF downloads to user's device
- Variable substitution works correctly

✅ **Integration**
- Frontend communicates with backend over HTTP
- No CORS errors in browser console
- Generated PDFs match template styling
- All element types render correctly

✅ **Documentation**
- PDF_GENERATION_GUIDE.md is complete
- IMPLEMENTATION_SUMMARY.md documents changes
- API examples are runnable
- Troubleshooting guide is helpful

## Next Steps After Verification

Once all checks pass:

1. **Stage 4: Excel Integration**
   - Upload Excel file with certificate data
   - Auto-map columns to template variables
   - Generate bulk certificates from spreadsheet

2. **Stage 5: Template Management**
   - Save/load templates from database
   - Template versioning
   - Template sharing

3. **Stage 6: User Authentication**
   - Add login/signup
   - User-owned templates
   - Access control

4. **Stage 7: Advanced Features**
   - QR code generation
   - Watermarking
   - Digital signatures
   - Template marketplace

---

Last Updated: 2024
Status: Production Ready for PDF Generation ✅
