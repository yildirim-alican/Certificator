# CertifyPro: Certificate Asset Management System

Enterprise-grade certificate generation platform with a modern tech stack combining Next.js 14, Zustand, FastAPI, and Playwright.

## Architecture Overview

```
CertifyPro/
├── frontend/              # Next.js 14 + React + TypeScript
│   ├── src/
│   │   ├── app/          # App Router (Pages & Layouts)
│   │   ├── components/   # Atomic Design
│   │   │   ├── editor/   # Certificate Editor
│   │   │   ├── dashboard/# Dashboard Components
│   │   │   └── shared/   # Reusable UI Kit
│   │   ├── store/        # Zustand Stores
│   │   ├── hooks/        # Custom Hooks
│   │   ├── types/        # TypeScript Definitions
│   │   └── utils/        # Utilities
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── backend/               # FastAPI + Python
│   ├── app/
│   │   ├── api/          # FastAPI Routes
│   │   │   ├── templates.py
│   │   │   ├── certificates.py
│   │   │   └── excel.py
│   │   ├── core/         # Business Logic
│   │   │   ├── config.py
│   │   │   ├── pdf_engine.py (Playwright)
│   │   │   └── excel_parser.py
│   │   ├── db/           # Database
│   │   │   ├── session.py
│   │   │   └── models.py
│   │   └── schemas/      # Pydantic Schemas
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml
└── README.md
```

## Key Features

### Frontend (Next.js 14)
- **Atomic Design Pattern**: Organized component hierarchy
- **State Management**: Zustand for editor and auth state
- **Editor Engine**: Drag-and-drop certificate designer with pixel-perfect rendering
- **Canvas Scaling**: A4 ratio preservation across all screen sizes
- **Excel Integration**: Auto-mapping of columns to template variables

### Backend (FastAPI)
- **PDF Generation**: Playwright + Chromium for 300 DPI output
- **Excel Processing**: Pandas-based schema validation and bulk operations
- **Async Processing**: FastAPI for concurrent certificate generation
- **SQLite Database**: Lightweight, intranet-ready persistence
- **REST API**: Clean v1 routes with proper error handling

## Development Setup

### Quick Start with Docker

```bash
docker-compose up --build
```

Frontend: http://localhost:3000
Backend: http://localhost:8000/api/v1

### Manual Setup

> Recommended Python versions: **3.12.x or 3.14.x**

#### Backend
```bash
# Run from project root (certificator/)
cd backend
py -3.12 -m venv venv
# Git Bash (inside backend/):
source venv/Scripts/activate
# PowerShell (inside backend/):
# .\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
python -m playwright install chromium
python main.py
```

If you are already inside `backend/`, do **not** run `cd backend` again.

#### Frontend
```bash
# Open a NEW terminal in project root (certificator/)
cd frontend
npm install
npm run dev
```

If your current terminal is still inside `backend/`, use:

```bash
cd ../frontend
npm install
npm run dev
```

## Core Modules

### 1. Editor Store (`useEditorStore`)
Single source of truth for canvas elements with memoization support.

```typescript
const { elements, addElement, updateElement, scale } = useEditorStore();
```

### 2. Canvas Scaling Hook (`useCanvasScale`)
Maintains A4 aspect ratio across zoom levels.

```typescript
const { getScaleFactor, percentToPixel } = useCanvasScale('portrait');
```

### 3. Excel Parser Hook (`useExcelParser`)
Auto-maps Excel columns using Levenshtein distance similarity.

```typescript
const { parseExcel, calculateMappings } = useExcelParser();
```

### 4. PDF Engine (`pdf_engine.py`)
Playwright-based PDF generation with CSS print media queries.

```python
await pdf_engine.render_html_to_pdf(html_content, output_path)
```

### 5. Excel Schema Validator (`excel_parser.py`)
Validates and maps Excel data to template variables.

```python
mappings = ExcelSchemaValidator.auto_map_columns(template_vars, excel_cols)
```

## 20 Golden Rules (CRISPE Framework)

### State Management
1. **Single Source of Truth**: All editor state in `useEditorStore`
2. **No Prop Drilling**: Use Zustand for cross-component communication

### Performance
3. **Memoization**: Wrap draggable elements with `React.memo`
4. **Lazy Loading**: Code split dashboard and editor routes

### PDF Precision
5. **Viewport Scaling**: Editor 1240x1754px (A4 @ 150 DPI)
6. **Output Scaling**: Generate at 3508x2480px (300 DPI)
7. **Percentage Positioning**: Store all coordinates as percentages (0-100)

### Styling & UX
8. **Utility-First**: Use Tailwind CSS for all styling
9. **Dynamic Classes**: Use `style` props for element-specific colors/fonts
10. **Error Boundaries**: Wrap critical sections with error handlers

### Type Safety
11. **Full TypeScript**: Strict mode enabled across the project
12. **Shared Types**: Define types in `frontend/src/types/`
13. **Pydantic Validation**: All API requests validated on backend

### Excel Processing
14. **Schema Validation**: Validate Excel structure before processing
15. **Auto-Mapping**: Use Levenshtein distance for column matching
16. **Bulk Operations**: Process Excel data asynchronously

### DatabaseA
17. **SQLite for Intranet**: Lightweight, no server maintenance
18. **Async ORM**: Use SQLAlchemy async for non-blocking I/O

### Security & Reliability
19. **CORS Protection**: Restrict origins from frontend env
20. **Logging & Monitoring**: Structured logging for debugging

## API Endpoints

### Templates
- `GET /api/v1/templates` - List all templates
- `POST /api/v1/templates` - Create template
- `GET /api/v1/templates/{id}` - Get template
- `PUT /api/v1/templates/{id}` - Update template
- `DELETE /api/v1/templates/{id}` - Delete template

### Certificates
- `GET /api/v1/certificates` - List certificates
- `POST /api/v1/certificates` - Create certificate
- `GET /api/v1/certificates/{id}` - Get certificate
- `DELETE /api/v1/certificates/{id}` - Delete certificate
- `POST /api/v1/certificates/generate/bulk` - Bulk generation

### Excel
- `POST /api/v1/excel/parse` - Parse Excel file
- `POST /api/v1/excel/map` - Auto-map columns

## Development Workflow

1. **Start both servers** (Docker or manual)
2. **Create a certificate template** in the editor
3. **Upload Excel data** with recipient information
4. **Map columns** to template variables automatically
5. **Generate certificates** in bulk (async)
6. **Download PDFs** with pixel-perfect rendering

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=CertifyPro
NEXT_PUBLIC_ENVIRONMENT=development
```

### Backend (`.env`)
```
ENV=development
DATABASE_URL=sqlite+aiosqlite:///./certificator.db
API_V1_PREFIX=/api/v1
DEBUG=true
PDF_OUTPUT_DPI=300
```

## Technologies

- **Frontend**: Next.js 14, React 18, TypeScript, Zustand, TailwindCSS, React-RnD
- **Backend**: FastAPI, Playwright, Pandas, SQLAlchemy, SQLite
- **DevOps**: Docker, Docker Compose
- **Quality**: ESLint, Type Checking

## Next Steps

1. Implement certificate editor UI components
2. Add drag-and-drop element management
3. Build template preview system
4. Create bulk certificate generation queue
5. Add authentication & user management
6. Implement PDF download/email functionality

## Support

For issues and questions, please review the code comments and docstrings throughout the project.

---

**Version**: 1.0.0  
**Last Updated**: March 2026
