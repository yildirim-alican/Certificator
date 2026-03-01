from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import List
import tempfile
import os

from app.schemas.certificate import ExcelUploadMappingSchema
from app.core.excel_parser import ExcelSchemaValidator

router = APIRouter(prefix="/excel", tags=["excel"])


@router.post("/parse", response_model=dict)
async def parse_excel(file: UploadFile = File(...)):
    """Parse Excel file and extract columns"""
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be Excel (.xlsx, .xls) or CSV",
        )

    try:
        # Save temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Parse
        df = ExcelSchemaValidator.parse_excel(tmp_path)
        if df is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to parse Excel file",
            )

        os.unlink(tmp_path)

        return {
            "columns": list(df.columns),
            "row_count": len(df),
            "preview": df.head(5).to_dict("records"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@router.post("/map", response_model=List[ExcelUploadMappingSchema])
async def map_columns(
    template_variables: List[str], excel_columns: List[str]
):
    """Auto-map Excel columns to template variables"""
    try:
        mappings = ExcelSchemaValidator.auto_map_columns(
            template_variables, excel_columns
        )

        result = []
        for variable, column in mappings.items():
            score = ExcelSchemaValidator.calculate_similarity(variable, column)
            result.append(
                ExcelUploadMappingSchema(
                    target_variable=variable,
                    source_column=column,
                    match_score=score,
                )
            )

        return sorted(result, key=lambda x: x.match_score, reverse=True)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
