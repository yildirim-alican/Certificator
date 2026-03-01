"""
PDF Generation API Endpoints

Endpoints:
- POST /pdf/generate - Generate single PDF
- POST /pdf/preview - Generate PDF for preview
- POST /pdf/generate-bulk - Generate multiple PDFs with zip export
"""

import io
import json
import logging
import tempfile
import zipfile
from pathlib import Path
from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel

from app.core.pdf_engine import get_pdf_engine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/pdf", tags=["pdf"])


class PDFGenerateRequest(BaseModel):
    """Request model for single PDF generation"""

    template: Dict[str, Any]
    data: Dict[str, str] = {}


class PDFBulkGenerateRequest(BaseModel):
    """Request model for bulk PDF generation"""

    template: Dict[str, Any]
    dataArray: List[Dict[str, str]]
    fileName: str = "certificates"


def generate_template_html(template: dict, data: dict) -> str:
    """
    Generate pixel-perfect HTML from certificate template

    Args:
        template: CertificateTemplate dict with elements, backgroundColor, orientation
        data: Dictionary with variable substitutions (e.g., {'{{Name}}': 'John Doe'})

    Returns:
        Complete HTML document with inline CSS
    """
    # Get template dimensions (in pixels, 300 DPI)
    # A4: 210mm x 297mm = 2480px x 3508px @ 300DPI
    # A4 Landscape: 297mm x 210mm = 3508px x 2480px @ 300DPI
    width = 3508 if template.get("orientation") == "landscape" else 2480
    height = 2480 if template.get("orientation") == "landscape" else 3508

    bg_color = template.get("backgroundColor", "#ffffff")
    elements = template.get("elements", [])

    # Generate CSS for elements
    css_styles = f"""
    * {{
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }}
    html, body {{
        width: {width}px;
        height: {height}px;
        background: {bg_color};
        font-family: 'Arial', sans-serif;
    }}
    #certificate {{
        position: relative;
        width: {width}px;
        height: {height}px;
        background: {bg_color};
        overflow: hidden;
    }}
    .element {{
        position: absolute;
        transform: translate(-50%, -50%);
    }}
    .text-element {{
        white-space: nowrap;
        font-size: 16px;
    }}
    .image-element {{
        max-width: 100%;
        max-height: 100%;
    }}
    .shape-element {{
        border-style: solid;
    }}
    @media print {{
        body {{ margin: 0; padding: 0; }}
    }}
    """

    # Generate element HTML
    elements_html = ""
    for element in elements:
        # Calculate pixel positions from percentages
        left = (element.get("x", 0) / 100) * width
        top = (element.get("y", 0) / 100) * height
        elem_width = (element.get("width", 10) / 100) * width
        elem_height = (element.get("height", 10) / 100) * height

        elem_type = element.get("type", "text")
        visibility = "visible" if element.get("visible", True) else "hidden"
        rotation = element.get("rotation", 0)

        style = f"""
            left: {left}px;
            top: {top}px;
            width: {elem_width}px;
            height: {elem_height}px;
            visibility: {visibility};
            transform: translate(-50%, -50%) rotate({rotation}deg);
            opacity: {element.get('opacity', 1)};
            z-index: {element.get('zIndex', 0)};
        """

        if elem_type == "text":
            content = element.get("content", "")

            # Substitute variables
            for key, value in data.items():
                content = content.replace(key, str(value))

            font_size = element.get("fontSize", 16)
            font_weight = element.get("fontWeight", 400)
            text_style = f"""
                {style}
                font-size: {font_size}px;
                color: {element.get('color', '#000000')};
                font-weight: {font_weight};
                font-family: {element.get('fontFamily', 'Arial, sans-serif')};
                text-align: {element.get('textAlign', 'left')};
                line-height: {element.get('lineHeight', 1.2)};
            """
            elements_html += f"""
            <div class="element text-element" style="{text_style}">
                {content}
            </div>
            """

        elif elem_type == "image":
            src = element.get("src", "")
            object_fit = element.get("objectFit", "cover")
            opacity = element.get("opacity", 1)
            image_style = f"""
                {style}
                object-fit: {object_fit};
                opacity: {opacity};
            """
            elements_html += f"""
            <img class="element image-element" src="{src}" style="{image_style}" alt="Image" />
            """

        elif elem_type == "shape":
            shape_type = element.get("shapeType", "rectangle")
            border_color = element.get("borderColor", "#000000")
            border_width = element.get("borderWidth", 1)
            bg_color = element.get("backgroundColor", "transparent")
            shape_style = f"""
                {style}
                background-color: {bg_color};
                border: {border_width}px solid {border_color};
                border-radius: {0 if shape_type == 'rectangle' else 50}%;
            """
            elements_html += f"""
            <div class="element shape-element" style="{shape_style}"></div>
            """

    # Build complete HTML
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate PDF</title>
        <style>
            {css_styles}
        </style>
    </head>
    <body>
        <div id="certificate">
            {elements_html}
        </div>
    </body>
    </html>
    """

    return html


@router.post("/generate")
async def generate_pdf(request: PDFGenerateRequest) -> FileResponse:
    """
    Generate a single PDF from template and data

    Returns:
        PDF file as binary response
    """
    try:
        template = request.template
        data = request.data

        if not template:
            raise HTTPException(status_code=400, detail="Template is required")

        # Generate HTML
        html_content = generate_template_html(template, data)

        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            output_path = tmp_file.name

        # Render to PDF
        pdf_engine = await get_pdf_engine()
        success = await pdf_engine.render_html_to_pdf(html_content, output_path)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")

        # Return PDF file
        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename="certificate.pdf",
            headers={"Content-Disposition": "attachment; filename=certificate.pdf"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.post("/preview")
async def generate_pdf_preview(request: PDFGenerateRequest) -> StreamingResponse:
    """
    Generate PDF for preview (inline display in iframe)

    Returns:
        PDF file as streaming response for iframe display
    """
    try:
        template = request.template
        data = request.data

        if not template:
            raise HTTPException(status_code=400, detail="Template is required")

        # Generate HTML
        html_content = generate_template_html(template, data)

        # Create temporary file
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp_file:
            output_path = tmp_file.name

        # Render to PDF
        pdf_engine = await get_pdf_engine()
        success = await pdf_engine.render_html_to_pdf(html_content, output_path)

        if not success:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")

        # Read file and return as streaming response
        def iter_file():
            with open(output_path, "rb") as f:
                yield f.read()
            # Clean up temp file after sending
            Path(output_path).unlink(missing_ok=True)

        return StreamingResponse(
            iter_file(),
            media_type="application/pdf",
            headers={
                "Content-Disposition": "inline",
                "Cache-Control": "no-cache, no-store, must-revalidate",
            },
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF preview generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Preview generation failed: {str(e)}")


@router.post("/generate-bulk")
async def generate_bulk_pdfs(request: PDFBulkGenerateRequest) -> FileResponse:
    """
    Generate multiple PDFs and return as ZIP file

    Returns:
        ZIP file containing all generated PDFs
    """
    try:
        template = request.template
        data_array = request.dataArray
        file_name_prefix = request.fileName

        if not template:
            raise HTTPException(status_code=400, detail="Template is required")

        if not data_array:
            raise HTTPException(status_code=400, detail="dataArray is required")

        if not isinstance(data_array, list):
            raise HTTPException(status_code=400, detail="dataArray must be a list")

        pdf_engine = await get_pdf_engine()

        # Create temporary zip file
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as zip_tmp:
            zip_path = zip_tmp.name

        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            for idx, data in enumerate(data_array, 1):
                # Generate HTML
                html_content = generate_template_html(template, data)

                # Create temporary PDF file
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as pdf_tmp:
                    pdf_output_path = pdf_tmp.name

                # Render to PDF
                success = await pdf_engine.render_html_to_pdf(html_content, pdf_output_path)

                if success:
                    # Get name from data if available
                    name = data.get("{{Name}}", f"Certificate_{idx}")
                    pdf_filename = f"{file_name_prefix}_{idx:03d}_{name}.pdf"

                    # Add to ZIP
                    zf.write(pdf_output_path, arcname=pdf_filename)

                # Clean up PDF temp file
                Path(pdf_output_path).unlink(missing_ok=True)

        # Return ZIP file
        return FileResponse(
            zip_path,
            media_type="application/zip",
            filename=f"{file_name_prefix}_batch.zip",
            headers={"Content-Disposition": f"attachment; filename={file_name_prefix}_batch.zip"},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Bulk PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"Bulk generation failed: {str(e)}")
