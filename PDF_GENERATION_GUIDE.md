# PDF Generation Pipeline - Complete Guide

This document outlines the complete PDF generation pipeline that has been implemented using Playwright for server-side rendering at 300 DPI.

## Architecture Overview

The PDF generation system is split into three components:

### 1. Frontend - Export Modal & Hook
- **ExportModal.tsx**: User interface for PDF preview and download
- **usePrinter.ts**: API hook for communicating with backend
- **htmlGenerator.ts**: Serializes templates for backend processing

### 2. Backend - FastAPI Endpoints
- **pdf.py**: Three REST endpoints for PDF generation
- **pdf_engine.py**: Playwright wrapper for rendering HTML to PDF
- **app.py**: Registers PDF router in FastAPI application

### 3. DevOps - Docker Container
- **Dockerfile**: Includes Playwright browsers and system dependencies
- **requirements.txt**: Python package dependencies

## API Endpoints

### POST /api/v1/pdf/generate
**Single PDF Generation**

```
Request:
{
  "template": {
    "name": "Certificate",
    "orientation": "landscape",
    "width": 210,
    "height": 297,
    "backgroundColor": "#ffffff",
    "elements": [
      {
        "id": "elem1",
        "type": "text",
        "content": "Name: {{Name}}",
        "x": 50,
        "y": 50,
        "width": 20,
        "height": 10,
        "fontSize": 24,
        "color": "#000000",
        // ... more properties
      }
    ]
  },
  "data": {
    "{{Name}}": "John Doe",
    "{{Date}}": "2024-01-15",
    "{{Company}}": "ACME Corp"
  }
}

Response:
- Content-Type: application/pdf
- Binary PDF file
```

### POST /api/v1/pdf/preview
**PDF Preview (for iframe display)**

```
Request: Same as /generate

Response:
- Content-Type: application/pdf
- Inline display headers
- Binary PDF file
```

### POST /api/v1/pdf/generate-bulk
**Bulk PDF Generation with ZIP**

```
Request:
{
  "template": { ... same as above ... },
  "dataArray": [
    { "{{Name}}": "John Doe", "{{Date}}": "2024-01-15" },
    { "{{Name}}": "Jane Smith", "{{Date}}": "2024-01-15" },
    { "{{Name}}": "Bob Johnson", "{{Date}}": "2024-01-15" }
  ],
  "fileName": "certificates"
}

Response:
- Content-Type: application/zip
- Binary ZIP file containing all PDFs
```

## Frontend Usage

### Basic PDF Export
```typescript
import { usePrinter } from '@/hooks/usePrinter';

export function MyComponent() {
  const { generatePDF } = usePrinter();
  
  const handleExport = async () => {
    const template = { /* ... template data ... */ };
    const data = { 
      '{{Name}}': 'John Doe',
      '{{Date}}': new Date().toLocaleDateString()
    };
    
    try {
      const result = await generatePDF(template, data, {
        fileName: 'my-certificate.pdf'
      });
      console.log('PDF downloaded:', result.fileName);
    } catch (error) {
      console.error('PDF generation failed:', error);
    }
  };
  
  return <button onClick={handleExport}>Download PDF</button>;
}
```

### Preview before Download
```typescript
const { generatePreview } = usePrinter();

const handlePreview = async () => {
  const { url, blob } = await generatePreview(template, data);
  // Use url in iframe: <iframe src={url} />
  // Or save blob locally: const file = new File([blob], 'preview.pdf');
};
```

### Bulk Generation
```typescript
const { generateBulkPDFs } = usePrinter();

const handleBulkExport = async () => {
  const certificates = [
    { '{{Name}}': 'John Doe', '{{Grade}}': 'A' },
    { '{{Name}}': 'Jane Smith', '{{Grade}}': 'A+' },
  ];
  
  const result = await generateBulkPDFs(template, certificates, {
    fileName: 'certificates_batch'
  });
  console.log(`Generated ${result.count} certificates`);
};
```

## Specifications

### Output Quality
- **Resolution**: 300 DPI (professional print quality)
- **Format**: PDF (A4 or custom dimensions)
- **Rendering Engine**: Playwright with Chromium
- **CSS Support**: Full CSS3 including transforms and filters

### Element Types Supported

**Text Elements**
```json
{
  "type": "text",
  "content": "Name: {{Name}}",
  "fontSize": 24,
  "fontFamily": "Arial, sans-serif",
  "fontWeight": 400,
  "color": "#000000",
  "textAlign": "center",
  "lineHeight": 1.5
}
```

**Image Elements**
```json
{
  "type": "image",
  "src": "data:image/png;base64,...",
  "objectFit": "cover",
  "opacity": 1
}
```

**Shape Elements**
```json
{
  "type": "shape",
  "shapeType": "rectangle",
  "backgroundColor": "#e8e8e8",
  "borderColor": "#000000",
  "borderWidth": 2
}
```

## Positioning & Sizing

All dimensions are specified as **percentages** to maintain aspect ratio:
- **x, y**: Percentage of canvas width/height (0-100)
- **width, height**: Percentage of canvas width/height (0-100)
- **Backend conversion**: Percentages → pixels (3508×2480 for A4 landscape)

Example:
```json
{
  "x": 25,      // 25% from left
  "y": 30,      // 30% from top
  "width": 50,  // 50% of canvas width
  "height": 20  // 20% of canvas height
}
```

## Variable Substitution

Variables are marked with `{{VariableName}}` syntax in text elements:

```json
{
  "type": "text",
  "content": "Certificate presented to {{Name}} on {{Date}}"
}
```

At render time, provide the data object:
```json
{
  "{{Name}}": "John Doe",
  "{{Date}}": "January 15, 2024"
}
```

## Testing the Pipeline

### 1. Start the Backend
```bash
cd backend
python main.py
```

The Playwright browser will initialize on startup (check logs for "Playwright PDF engine initialized").

### 2. Test with cURL
```bash
curl -X POST http://localhost:8000/api/v1/pdf/generate \
  -H "Content-Type: application/json" \
  -d '{
    "template": {
      "name": "Test",
      "orientation": "landscape",
      "backgroundColor": "#ffffff",
      "elements": [{
        "type": "text",
        "content": "Hello {{Name}}",
        "x": 50, "y": 50,
        "width": 30, "height": 15,
        "fontSize": 32,
        "color": "#000000"
      }]
    },
    "data": {"{{Name}}": "World"}
  }' \
  --output test.pdf
```

### 3. Test in Frontend
1. Navigate to /editor/[template-id]
2. Click "Export PDF" button
3. Click "Generate Preview" to see render
4. Click "Download PDF" to save

## Error Handling

### Common Issues

**"Playwright browser not initialized"**
- Check that the app lifespan initialization succeeded
- Review backend logs for Playwright startup errors
- Verify system dependencies are installed (see Dockerfile)

**"Failed to generate PDF"**
- Check that template and data are valid JSON
- Verify elements have required properties
- Check for invalid CSS values in element properties
- Review backend logs for rendering errors

**CORS errors**
- Ensure `NEXT_PUBLIC_API_URL` in frontend `.env.local` is `http://localhost:8000/api/v1`
- Verify CORS middleware is configured in app.py

**Empty PDF generated**
- Check that elements have `visible: true`
- Verify element opacity is > 0
- Ensure x/y coordinates are within canvas bounds

## Performance Considerations

### Single PDF Generation (~0.5-1.5 seconds)
- Playwright page creation: ~300ms
- HTML rendering: ~100ms
- PDF generation: ~200ms

### Bulk PDF Generation (N certificates)
- Process is sequential (can be optimized for parallel in future)
- Typical throughput: 1-2 PDFs per second
- Zip compression reduces final file size by ~60%

## Future Enhancements

- [ ] Parallel bulk processing with Worker pool
- [ ] Template caching for frequently used designs
- [ ] PDF concatenation (merge multiple PDFs)
- [ ] Custom page sizes beyond A4
- [ ] Advanced text formatting (RTL, ligatures)
- [ ] QR code and barcode generation
- [ ] Signature verification
- [ ] Watermarking support

## Debugging

Enable verbose logging:
```python
# In backend app.py
logging.getLogger('app').setLevel(logging.DEBUG)
```

Monitor Playwright:
```python
# Set environment variable
export DEBUG=pw:api
```

Check generated HTML:
```typescript
// In frontend, log before sending to backend
const html = generateTemplateHTML(template, data);
console.log(html);
```

## References

- [Playwright Documentation](https://playwright.dev/python/)
- [A4 Paper Dimensions](https://en.wikipedia.org/wiki/Paper_size#A_series)
- [CSS Print Media](https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries#print)

