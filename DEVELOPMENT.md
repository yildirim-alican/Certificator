# Development Guide - CertifyPro

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start both services
docker-compose up --build

# Services will be available at:
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000/api/v1
# Health:   http://localhost:8000/health
```

### Option 2: Manual Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium

# Create .env file (already exists with defaults)
# Modify if needed

# Run server
python main.py
```

Backend will be available at `http://localhost:8000`

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

Frontend will be available at `http://localhost:3000`

## Project Structure Overview

### Frontend (`frontend/`)

Key files to understand:
- `src/store/useEditorStore.ts` - Main state management
- `src/components/editor/Canvas.tsx` - Editor canvas
- `src/hooks/useCanvasScale.ts` - A4 scaling logic
- `tailwind.config.ts` - Styling configuration

Key commands:
```bash
npm run dev         # Development server with hot reload
npm run build       # Production build
npm run lint        # ESLint check
npm run type-check  # TypeScript check
```

### Backend (`backend/`)

Key files to understand:
- `app/core/config.py` - Configuration management
- `app/core/pdf_engine.py` - PDF generation
- `app/core/excel_parser.py` - Excel processing
- `app/api/` - API endpoint definitions
- `app/db/models.py` - Database models

Key commands:
```bash
python main.py              # Start server
pytest                      # Run tests (after setup)
python -m black app/        # Format code
python -m mypy app/         # Type checking
```

## API Usage Examples

### Create a Certificate Template

```bash
curl -X POST http://localhost:8000/api/v1/templates \
  -H "Content-Type: application/json" \
  -d '{
    "id": "template-1",
    "name": "Employee Certificate",
    "description": "Annual achievement certificate",
    "orientation": "landscape",
    "elements": [],
    "variables": ["{{Name}}", "{{Title}}", "{{Date}}"]
  }'
```

### Parse Excel File

```bash
curl -X POST http://localhost:8000/api/v1/excel/parse \
  -F "file=@employees.xlsx"
```

### Auto-Map Columns

```bash
curl -X POST http://localhost:8000/api/v1/excel/map \
  -H "Content-Type: application/json" \
  -d '{
    "template_variables": ["{{Name}}", "{{Title}}"],
    "excel_columns": ["Employee Name", "Job Title", "Email"]
  }'
```

## Database

### Reset Database

```bash
# Remove SQLite file
rm backend/certificator.db

# Recreate on next run (automatic)
```

### Inspect Database

```bash
# Using sqlite3
sqlite3 backend/certificator.db

# List tables
.tables

# View schema
.schema

# Query data
SELECT * FROM certificate_templates;
```

## Debugging Tips

### Frontend

1. **DevTools**: Open browser DevTools (F12)
   - Console for logs
   - Network tab for API calls
   - React DevTools extension for component inspection

2. **State Debugging**:
   ```typescript
   // In any component
   useEffect(() => {
     console.log('Editor state:', useEditorStore.getState());
   }, []);
   ```

3. **Hot Reload**: Changes auto-reload in development

### Backend

1. **Logging**: Check console output when running
2. **API Testing**: Use Postman or Thunder Client
3. **Database Inspection**: Use sqlite3 CLI
4. **Uvicorn Reload**: Auto-restarts on file changes

## Common Tasks

### Add a New Component

1. Create file in `frontend/src/components/{category}/MyComponent.tsx`
2. Import and use in page
3. Use Zustand for state if needed

Example:
```typescript
'use client';

import React from 'react';

interface MyComponentProps {
  title: string;
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>;
};

export default MyComponent;
```

### Add a New API Endpoint

1. Create/update file in `backend/app/api/`
2. Define route with FastAPI
3. Import in `backend/app/core/app.py`

Example:
```python
from fastapi import APIRouter

router = APIRouter(prefix="/myroute", tags=["mytag"])

@router.get("/{id}")
async def get_item(id: str):
    return {"id": id, "name": "Item"}
```

### Add a New Zustand Store

1. Create file in `frontend/src/store/useMyStore.ts`
2. Define interface and store
3. Use in components

Example:
```typescript
import { create } from 'zustand';

interface MyStoreState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### Add a New Hook

1. Create file in `frontend/src/hooks/useMyHook.ts`
2. Define hook function
3. Use in components

Example:
```typescript
import { useCallback, useState } from 'react';

export const useMyHook = () => {
  const [state, setState] = useState(null);
  
  const doSomething = useCallback(() => {
    setState('value');
  }, []);
  
  return { state, doSomething };
};
```

## Environment Variables

### Frontend (`.env.local`)

Available to browser (must start with `NEXT_PUBLIC_`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=CertifyPro
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend (`.env`)

Server-side only:
```
ENV=development
DATABASE_URL=sqlite:///./certificator.db
API_V1_PREFIX=/api/v1
DEBUG=true
CORS_ORIGINS=["http://localhost:3000"]
PDF_OUTPUT_DPI=300
```

## Performance Monitoring

### Frontend

```bash
# Analyze bundle size
npm run build
npm install -g serve
serve out/
```

### Backend

```bash
# Monitor with uvicorn stats
# Logs in console show request timing
```

## Troubleshooting

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000
# Kill process
kill -9 <PID>

# Or use different port:
# Frontend: npm run dev -- -p 3001
# Backend: python main.py --port 8001
```

### Dependencies Issues

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install

# Backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### SQLite Lock Error

```bash
# Remove lock file
rm backend/*.db-wal
rm backend/*.db-shm

# Reset database
rm backend/certificator.db
```

### Playwright Issues

```bash
# Reinstall browsers
playwright install chromium
playwright install-deps
```

## Testing

### Frontend Unit Tests

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test
```

### Backend Unit Tests

```bash
pip install pytest pytest-asyncio httpx

# Run tests
pytest

# With coverage
pytest --cov=app tests/
```

## Git Workflow

```bash
# Before committing
cd frontend && npm run lint
cd backend && black app/

# Commit changes
git add .
git commit -m "feat: add new feature"
git push
```

## Production Deployment

### Docker Build

```bash
# Build specific image
docker build -t certificator-backend:1.0 backend/
docker build -t certificator-frontend:1.0 frontend/

# Push to registry
docker push your-registry/certificator-backend:1.0
docker push your-registry/certificator-frontend:1.0
```

### Environment for Production

Create `.env` files:

**backend/.env.prod**:
```
ENV=production
DEBUG=false
DATABASE_URL=sqlite:///./data/certificator.db
CORS_ORIGINS=["https://yourdomain.com"]
```

**frontend/.env.production**:
```
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXT_PUBLIC_ENVIRONMENT=production
```

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Zustand Docs**: https://github.com/pmndrs/zustand
- **Tailwind CSS**: https://tailwindcss.com/
- **Playwright**: https://playwright.dev/

## Need Help?

1. Check the `ARCHITECTURE.md` for overview
2. Review existing code for patterns
3. Check browser/server console for errors
4. See git history for examples: `git log --oneline`

---

**Happy Coding!** 🚀
