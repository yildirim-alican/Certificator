# CertifyPro User Manual (For Non-Technical Users)

This guide is for everyday users who want to create and generate certificates quickly.
No technical background is needed.

---

## 1) What You Can Do in CertifyPro

With CertifyPro, you can:
- Create a certificate template
- Add text fields (like Name, Date, Course)
- Generate one PDF certificate
- Generate many certificates at once from an Excel file
- Download all generated certificates as a ZIP file

---

## 2) Before You Start

Please prepare:
- A web browser (Chrome, Edge, or Firefox)
- Your certificate text/content
- (Optional) An Excel file for bulk generation

### Excel tips (important)
- First row must be column titles (example: Name, Department, Date)
- One person per row
- Keep data clean (no empty required cells)
- Save as `.xlsx` or `.xls`

---

## 3) Installation and First Launch

Choose one setup option below.

### Option A (Recommended): Docker Compose

Use this if Docker Desktop is already installed.

1. Open a terminal in the project folder.
2. Run:

```bash
docker-compose up --build
```

3. Wait until both services are ready.
4. Open your browser:
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000/api/v1`

To stop the app:

```bash
docker-compose down
```

### Option B: Manual Start (Without Docker)

Use this if you prefer running frontend/backend manually.

#### Start Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
python main.py
```

#### Start Frontend (new terminal window)

```bash
cd frontend
npm install
npm run dev
```

Then open: `http://localhost:3000`

### Quick Health Check

- If homepage opens, frontend is working.
- If bulk generation works, backend is connected.
- If not, restart both services and try again.

---

## 4) Main Screen Overview

When you open CertifyPro, you will see:
- **Search templates...** box
- **New Template** button
- Existing templates (if any)

If this is your first time, click **Create First Template** or **New Template**.

---

## 5) Create a New Template (Step-by-Step)

1. Click **New Template**.
2. Fill in:
   - **Template Name** (required)
   - **Description** (optional)
   - **Orientation** (Portrait or Landscape)
   - **Background Color**
3. Click **Create Template**.
4. You will be taken to the editor screen.

---

## 6) Design Your Certificate in the Editor

On the editor screen, you can:
- Add certificate elements from the left panel
- Select an element and edit its properties on the right panel
- Move/resize items on the canvas

Top buttons:
- **Preview**: switch between editing and preview
- **Export PDF**: create one certificate PDF
- **Bulk Generate**: create many certificates from Excel
- **Save**: save your current template

### Recommended workflow
1. Add all fields and text
2. Check alignment and spacing
3. Click **Preview** to review
4. Click **Save**

---

## 7) Generate a Single Certificate (Quick Way)

1. Open your template in the editor.
2. Click **Export PDF**.
3. Enter certificate data if asked.
4. Download the generated PDF.

---

## 8) Bulk Generate Certificates from Excel

1. Open your template.
2. Click **Bulk Generate**.
3. Follow the 4 steps shown on screen:

### Step 1: Upload
- Upload your Excel file.

### Step 2: Map
- Match Excel columns to template variables.
- Example: Excel "Name" → Template "name"

### Step 3: Review
- Check sample rows carefully.
- Confirm names, dates, and spelling.

### Step 4: Generate
- Click generate.
- Wait while the system creates your files.

When complete:
- A celebration effect appears (confetti)
- A **Success** modal opens
- Your ZIP file downloads automatically

In the success modal, you can:
- **Download ZIP** (confirmation action)
- **New Batch** (start another Excel run)
- **Done** (finish and return)

---

## 9) File Naming and Output

- Bulk output is downloaded as: `template-name_batch.zip`
- ZIP contains one PDF per person/row

Tip: Move and rename your ZIP file right after download to keep records organized.

---

## 10) Common Problems and Easy Fixes

### Problem: "No Template Selected"
Fix:
1. Go back to home page
2. Create or open a template
3. Try bulk generation again

### Problem: Excel upload fails
Fix:
1. Check file is `.xlsx` or `.xls`
2. Ensure first row has column titles
3. Remove empty/merged header cells
4. Save and upload again

### Problem: Wrong names on certificates
Fix:
1. In **Map** step, verify each column mapping
2. In **Review** step, check sample rows before generating

### Problem: Download did not start
Fix:
1. Check browser pop-up/download permissions
2. Try again once
3. If needed, use the success modal action

---

## 11) Best Practices (Highly Recommended)

- Keep template names clear (example: "Employee_Award_2026")
- Test with 2–3 rows before generating 500+ rows
- Always review sample data before final generation
- Save your template after major edits
- Keep your Excel headers consistent across batches

---

## 12) Quick Checklist (Daily Use)

Use this short checklist each time:
- [ ] Open correct template
- [ ] Confirm template text/layout
- [ ] Upload correct Excel file
- [ ] Verify column mapping
- [ ] Review sample records
- [ ] Generate and download ZIP
- [ ] Archive output file

---

## 13) Need Help?

If something looks wrong:
- Take a screenshot of the error message
- Keep your Excel sample file ready
- Share template name + what step failed

This helps support teams solve your issue much faster.

---

## Quick Start (1-Minute Version)

1. Click **New Template** and create template.
2. Design and **Save** template.
3. Click **Bulk Generate**.
4. Upload Excel, map columns, review data.
5. Generate, download ZIP, done.

You are ready to use CertifyPro confidently.
