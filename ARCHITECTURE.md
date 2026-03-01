# CertifyPro Architecture Guide

## Overview

CertifyPro follows the **CRISPE Framework** principles combined with modern architectural patterns:

- **Frontend**: Next.js 14 + React + TypeScript + Zustand + TailwindCSS
- **Backend**: FastAPI + Python + SQLAlchemy + Playwright
- **Database**: SQLite (lightweight, intranet-optimized)
- **DevOps**: Docker & Docker Compose

## Frontend Architecture

### Directory Structure

```
frontend/src/
├── app/                 # Next.js 14 App Router
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Dashboard
│   ├── editor/         # Editor pages
│   └── [id]/           # Dynamic routes
├── components/
│   ├── editor/         # Certificate editor components
│   │   ├── Canvas.tsx          # Main editing surface
│   │   ├── DraggableItem.tsx   # Memoized element renderer
│   │   ├── Toolbar.tsx         # Canvas controls
│   │   └── PropertyPanel.tsx   # Element properties
│   ├── dashboard/      # Dashboard components
│   │   ├── CertCard.tsx        # Template card
│   │   ├── SearchBar.tsx       # Template search
│   │   └── Stats.tsx           # Dashboard stats
│   └── shared/         # UI Kit
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       └── Spinner.tsx
├── store/              # Zustand stores
│   ├── useEditorStore.ts       # Editor state (SSOT)
│   ├── useAuthStore.ts         # Authentication
│   └── useTemplateStore.ts     # Templates listing
├── hooks/              # Custom React hooks
│   ├── usePrinter.ts           # PDF generation
│   ├── useExcelParser.ts       # Excel parsing & mapping
│   ├── useCanvasScale.ts       # A4 scaling calculations
│   └── useApi.ts               # API communication
├── types/              # TypeScript definitions
│   └── CertificateTemplate.d.ts
├── utils/              # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   └── dom.ts
└── styles/
    └── globals.css     # Tailwind + custom styles
```

### State Management Pattern

All component state flows through **Zustand stores**:

```typescript
// Single Source of Truth
const { elements, scale, selectedElementId } = useEditorStore();

// Update methods
const { addElement, updateElement, deleteElement } = useEditorStore();
```

**Benefits**:
- No prop drilling
- Reactive updates across components
- Easy to debug and test
- Persist to localStorage if needed

### Component Hierarchy

```
RootLayout
├── Dashboard Page
│   ├── SearchBar
│   └── CertCard (many)
│       ├── Button
│       └── [Template Info]
├── Editor Page
│   ├── Toolbar
│   ├── Canvas
│   │   └── DraggableItem (many) [Memoized]
│   └── PropertyPanel
│       └── Input (many)
```

### Memoization Strategy

Components that render list items use `React.memo`:

```typescript
const DraggableItem = React.memo<Props>(({ element, isSelected }) => {
  // Only re-renders when element or isSelected change
  return <div>...</div>;
});
```

This prevents unnecessary re-renders when sibling elements update.

### Canvas Scaling Formula

The canvas maintains A4 aspect ratio across all zoom levels:

$$\text{Scale Factor} = \frac{\text{Current Window Width}}{A4 \text{ Width}}$$

For portrait A4:
- **Editor**: 1240px width × 1754px height (150 DPI)
- **Output**: 3508px width × 2480px height (300 DPI)

All element positions stored as **percentages (0-100%)** to preserve ratio on resize.

### Data Flow Example

```
User clicks element
    ↓
DraggableItem.onClick
    ↓
useEditorStore.setSelectedElementId()
    ↓
Store updates state
    ↓
All components depending on selectedElementId re-render
    ↓
DraggableItem receives new isSelected prop
    ↓
Only that element's border changes
```

## Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── api/            # FastAPI routers
│   │   ├── templates.py        # CRUD endpoints
│   │   ├── certificates.py     # Certificate operations
│   │   └── excel.py            # Excel parsing & mapping
│   ├── core/           # Business logic
│   │   ├── config.py           # Settings & environment
│   │   ├── app.py              # FastAPI app factory
│   │   ├── pdf_engine.py       # Playwright PDF generation
│   │   └── excel_parser.py     # Excel schema validation
│   ├── db/             # Database layer
│   │   ├── session.py          # SQLAlchemy async setup
│   │   └── models.py           # ORM models
│   └── schemas/        # Pydantic models
│       ├── certificate.py
│       └── common.py
├── main.py             # Entry point
├── requirements.txt    # Python dependencies
├── Dockerfile          # Container config
├── .env                # Environment variables
└── .gitignore
```

### Route Organization

All routes prefixed with `/api/v1`:

```
GET    /api/v1/templates              → List all templates
POST   /api/v1/templates              → Create template
GET    /api/v1/templates/{id}         → Get specific template
PUT    /api/v1/templates/{id}         → Update template
DELETE /api/v1/templates/{id}         → Delete template

GET    /api/v1/certificates           → List certificates
POST   /api/v1/certificates           → Create certificate
GET    /api/v1/certificates/{id}      → Get certificate
POST   /api/v1/certificates/generate/bulk  → Bulk generation
DELETE /api/v1/certificates/{id}      → Delete certificate

POST   /api/v1/excel/parse            → Parse Excel file
POST   /api/v1/excel/map              → Auto-map columns
```

### PDF Generation Flow

```
User clicks "Download PDF"
    ↓
Frontend calls POST /api/v1/certificates/generate
    ↓
Backend.render_html_to_pdf()
    ↓
Playwright launches Chromium
    ↓
Renders HTML with CSS print media queries
    ↓
Saves as PDF (300 DPI)
    ↓
Returns PDF URL
    ↓
Frontend downloads file
```

### Excel Processing Flow

```
User uploads Excel file
    ↓
Backend.parse_excel()
    ↓
Pandas reads file → Returns column names & preview
    ↓
Frontend displays preview
    ↓
User confirms column mappings (or auto-map)
    ↓
Frontend calls POST /api/v1/certificates/generate/bulk
    ↓
Backend generates certificate for each Excel row
    ↓
Returns list of certificate IDs
```

### Database Schema

```
CertificateTemplate
├── id (str, primary)
├── name (str)
├── description (str nullable)
├── orientation (str: portrait/landscape)
├── elements (JSON array)
├── variables (JSON array)
├── background_color (str)
├── thumbnail (str)
├── created_at (datetime)
└── updated_at (datetime)

Certificate
├── id (str, primary)
├── template_id (str, fk)
├── data (JSON: variable values)
├── pdf_url (str nullable)
├── status (str: pending/processing/completed/failed)
├── created_at (datetime)
├── completed_at (datetime nullable)
└── error (str nullable)
```

## Communication Patterns

### Frontend → Backend

```typescript
// Using useApi hook
const { post } = useApi();
const { data, error } = await post('/certificates', {
  template_id: '123',
  data: { '{{Name}}': 'John Doe' }
});
```

### Backend → Frontend

All responses follow standard REST format:

```json
{
  "id": "string",
  "name": "string",
  "created_at": "2024-03-01T12:00:00Z"
}
```

Errors use proper HTTP status codes:
- `400`: Bad Request (validation error)
- `404`: Not Found
- `500`: Internal Server Error

## Performance Optimizations

### Frontend

1. **Component Memoization**: `React.memo` for list items
2. **Code Splitting**: Dynamic imports for editor page
3. **Image Optimization**: Next.js Image component
4. **CSS Minification**: Tailwind purges unused styles
5. **State Updates**: Only affected components re-render

### Backend

1. **Async I/O**: All database operations async
2. **GZIP Compression**: Middleware for response compression
3. **Connection Pooling**: SQLAlchemy async session management
4. **Background Tasks**: Use Celery for long-running PDF generation (future)

## Error Handling

### Frontend

```typescript
// Try-catch with typed errors
try {
  const { data } = await api.post('/certificates', {...});
} catch (error) {
  const msg = error?.message || 'Unknown error';
  setError(msg);
}
```

### Backend

```python
# FastAPI automatic validation
from pydantic import BaseModel

class CertificateSchema(BaseModel):
    template_id: str  # Required
    data: dict  # Type checked

# Invalid requests return 422 Unprocessable Entity
```

## Testing Strategy

### Frontend

```typescript
// Unit tests with React Testing Library
describe('Canvas', () => {
  it('renders elements from store', () => {
    // Mock store
    // Render component
    // Assert elements rendered
  });
});
```

### Backend

```python
# Integration tests with FastAPI TestClient
def test_create_template():
    response = client.post(
        "/api/v1/templates",
        json={...}
    )
    assert response.status_code == 201
```

## Security Considerations

1. **CORS**: Restricted to frontend origin
2. **File Upload**: Validate file types and size limits
3. **Input Validation**: Pydantic schemas validate all inputs
4. **Error Messages**: Don't expose internal details in production
5. **Environment Variables**: Sensitive data in `.env`, not in code

## Deployment

### Docker Setup

```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Environment Configuration

**Production** (.env):
```
ENV=production
DEBUG=false
DATABASE_URL=sqlite:///./data/certificator.db
CORS_ORIGINS=["https://yourdomain.com"]
```

## Future Enhancements

1. **Authentication**: JWT tokens + refresh mechanism
2. **Background Jobs**: Celery for async PDF generation
3. **Caching**: Redis for template caching
4. **Real-time Updates**: WebSockets for live editing
5. **Multi-user**: Collaborative editing with conflict resolution
6. **Analytics**: Track template usage and certificate generation
7. **Export**: Support more formats (SVG, PNG, DOCX)
8. **Versioning**: Template version history

## Development Workflow

```bash
# Terminal 1: Backend
cd backend
python main.py     # Runs on localhost:8000

# Terminal 2: Frontend
cd frontend
npm run dev        # Runs on localhost:3000

# Terminal 3: Monitor
docker-compose logs -f
```

**Typical workflow**:
1. Modify component → Auto-refresh in browser
2. Add API endpoint → FastAPI auto-reloads
3. Update store → Real-time in dev tools
4. Test with real API → Use browser DevTools Network tab

## Code Style

### Frontend
- ESLint + Prettier configured
- TypeScript strict mode
- Component docstrings in JSDoc
- Functional components with hooks

### Backend
- Black code formatter
- Type hints throughout
- Docstrings on all functions
- 4-space indentation

---

**Last Updated**: March 2026  
**Architecture Version**: 1.0.0
