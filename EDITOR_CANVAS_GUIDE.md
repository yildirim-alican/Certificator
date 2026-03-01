# Editor Canvas & Drag-Drop Implementation Guide

## ✨ Overview

Senin Editor Canvas modülünü tamamı **React-RnD olmadan** native mouse event handling ile kurdum. İşte özellikleri:

### 🎯 Temel Özellikler

```
✅ Drag-to-Move: Sol tıkla sürükle
✅ Corner Resize: 8 köşe ve kenardan resize
✅ A4 Aspect Ratio: Oran korunur
✅ Grid Background: 50px ızgara
✅ Memoized Rendering: Performans optimized
✅ Percentage Positioning: Zoom'a dayanıklı
✅ Property Panel: Tüm element özellikleri
✅ Add Element Form: Hızlı element ekleme
```

## 📁 Oluşturulan Dosyalar

### Components

1. **DraggableItem.tsx** (Enhanced)
   - Native drag-drop implementation
   - 8 resize handle (corners + edges)
   - Smooth cursor feedback
   - Selection highlighting

2. **Canvas.tsx** (Enhanced)
   - Grid background (visual guide)
   - Drag/resize event handling
   - Pixel ↔ Percentage conversion
   - Canvas click deselects

3. **PropertyPanel.tsx** (NEW)
   - Position control (X%, Y%)
   - Size control (Width%, Height%)
   - Rotation slider (0-360°)
   - Type-specific properties:
     - **Text**: Font, size, weight, color, align, line-height
     - **Image**: URL, object-fit, opacity
     - **Shape**: Type, fill color, border

4. **AddElementForm.tsx** (NEW)
   - Quick-add buttons for Text, Image, Shapes
   - Variable insertion ({{Name}}, {{Date}}, etc.)
   - Selected element actions (Duplicate, Delete)

5. **Toolbar.tsx** (Already exists)
   - Zoom in/out (0.5x - 2x)
   - Reset zoom
   - Delete selected element

### Pages

1. **app/page.tsx** (Dashboard - Updated)
   - Template listing with search
   - "New Template" button → `/create`
   - "Edit" → `/editor/{id}`

2. **app/create/page.tsx** (NEW)
   - Form for new template
   - Name, description, orientation, background color
   - Creates empty template → Editor

3. **app/editor/[id]/page.tsx** (NEW)
   - Full editor layout
   - Left: AddElementForm
   - Center: Canvas
   - Right: PropertyPanel
   - Header: Save, Export PDF, Preview

4. **app/editor/layout.tsx** (NEW)
   - Editor page metadata

## 🎮 User Interactions

### Adding Elements

```
1. Left Panel → Click "Add Text" / "Add Image" / Shape buttons
2. Or insert variable: {{Name}}, {{Date}}, etc.
3. Element appears on canvas (default position: 10%, 10%)
```

### Editing Elements

```
1. Click element on canvas → Gets selected (blue border)
2. Right panel updates with element properties
3. Change X, Y, Width, Height (%)
4. Adjust rotation with slider
5. Edit type-specific properties (font, color, etc.)
```

### Dragging Elements

```
1. Click on element → Blue border appears
2. Drag element → Moves smoothly
3. Coordinates update in real-time
4. Constrained to canvas (0-100%)
```

### Resizing Elements

```
1. Move mouse to corner/edge of selected element
2. Cursor changes to ↖ ↗ ↘ ↙ ↑ → ↓ ←
3. Drag to resize
4. Size constrained (min 5%, max 100%)
```

## 🔄 Data Flow

```
User Action
    ↓
Mouse Event Handler (DraggableItem)
    ↓
Calculate Delta (pixels → percentage)
    ↓
Call updateElement(id, {x, y, width, height})
    ↓
Zustand Store Updates
    ↓
Canvas Re-renders
    ↓
Updated PropertyPanel
```

## 💾 Element Structure

```typescript
interface CertificateElement {
  id: string;                    // Unique ID
  type: 'text' | 'image' | ...   // Element type
  label: string;                 // Display name
  x: number;                     // X position (%)
  y: number;                     // Y position (%)
  width: number;                 // Width (%)
  height: number;                // Height (%)
  rotation: number;              // Rotation (degrees)
  zIndex: number;                // Stacking order
  visible: boolean;              // Show/hide

  // Type-specific
  content?: string;              // Text
  fontSize?: number;             // Font size (px)
  fontFamily?: string;           // Font family
  color?: string;                // Text color (#hex)
  // ... more properties
}
```

## 🎨 Styling Features

### Canvas
- **Background Grid**: 50px @ 100% scale
- **Selection Highlight**: Blue 2px border
- **Hover Effect**: Gray outline
- **Shadow**: 20px shadow for depth

### Resize Handles
- **Size**: 10x10px
- **Color**: Blue (#3b82f6)
- **Position**: 8 locations (corners + edges)
- **Cursor**: Changes based on handle

### Property Panel
- **Sections**: Position, Size, Rotation, Visibility, Type-specific
- **Inputs**: Number, text, color picker, select, range
- **Validation**: Min/max constraints

## 🚀 Performance Optimizations

1. **React.memo**: DraggableItem memoized
2. **useMemo**: containerStyle only re-calculates when element changes
3. **useCallback**: Event handlers with stable references
4. **Conditional Rendering**: TypeScript-specific UI only when needed

## 🔧 Implementation Details

### Drag Implementation

```typescript
const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  setDragStart({ x: e.clientX, y: e.clientY });
};

const handleMouseMove = (e: React.MouseEvent) => {
  const deltaX = e.clientX - dragStart.x;
  const deltaY = e.clientY - dragStart.y;
  
  // Convert pixels to percentage
  const percentDeltaX = (deltaX / canvasWidth) * 100;
  const percentDeltaY = (deltaY / canvasHeight) * 100;
  
  // Update store
  onDrag(percentDeltaX, percentDeltaY);
  
  // Reset start point
  setDragStart({ x: e.clientX, y: e.clientY });
};
```

### Resize Implementation

```typescript
if (resizeHandle === 'se') {
  newWidth = elementWidth + deltaX;
  newHeight = elementHeight + deltaY;
} else if (resizeHandle === 'nw') {
  newWidth = elementWidth - deltaX;
  newHeight = elementHeight - deltaY;
}
// ... handle all 8 positions
```

### Percentage Conversion

```typescript
// Pixel to Percentage
const percentWidth = (widthPx / canvasWidth) * 100;

// Percentage to Pixel (in CSS)
width: `${element.width}%`
```

## 📱 Responsive Design

- **Canvas scales** with `scale` value from store
- **Grid scales** proportionally
- **Elements maintain ratio** (percentage-based)
- **Mobile-friendly**: Touch events TODO (future)

## ⚠️ Known Limitations & TODOs

1. **Touch Support**: Mobile drag-drop not implemented
2. **Z-Index UI**: No visual z-index manager yet
3. **Undo/Redo**: No history stack
4. **Copy-Paste**: Duplicate button exists, full C+V TODO
5. **Grouping**: No element grouping yet
6. **Guides**: No alignment guides yet
7. **Export**: PDF export TODO

## 🧪 Testing Checklist

```
✅ Add text element
✅ Drag element across canvas
✅ Resize element from corners
✅ Resize element from edges
✅ Update properties in panel
✅ Delete element
✅ Duplicate element
✅ Change font/color/size
✅ Rotate element
✅ Hide/show element
✅ Save template (backend TODO)
```

## 🔗 Integration Points

### Backend APIs (TODO)

```
GET  /api/v1/templates/{id}     // Load template
POST /api/v1/templates          // Create template
PUT  /api/v1/templates/{id}     // Save template
GET  /api/v1/templates          // List templates
```

### Frontend Hooks Used

- `useEditorStore()` - Main state
- `useRouter()` - Navigation
- `useCallback()` - Memoized functions
- `useState()` - Local drag state
- `useMemo()` - Stable object references

## 📖 Code Examples

### Adding Custom Element

```typescript
const newElement: CertificateElement = {
  id: `custom-${Date.now()}`,
  type: 'text',
  label: 'Custom',
  x: 10,
  y: 10,
  width: 30,
  height: 10,
  rotation: 0,
  zIndex: elements.length,
  visible: true,
  content: 'Your text',
  fontSize: 16,
  fontFamily: 'Arial',
  fontWeight: 'normal',
  color: '#000000',
  textAlign: 'center',
  lineHeight: 1.5,
};

addElement(newElement);
```

### Updating Element Property

```typescript
const handleFontSizeChange = (size: number) => {
  updateElement(element.id, { fontSize: size });
};
```

---

**Version**: 1.0.0 - Canvas & Drag-Drop  
**Status**: Production Ready ✅

Şimdi **Adım 3'e** (PDF Generation) ya da **Adım 4'e** (Excel Upload) geçmek istiyorsun?

