from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum


class ElementType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VARIABLE = "variable"
    SHAPE = "shape"


class CertificateElementSchema(BaseModel):
    """Certificate element schema"""

    id: str
    type: ElementType
    label: str
    x: float  # Percentage 0-100
    y: float  # Percentage 0-100
    width: float  # Percentage 0-100
    height: float  # Percentage 0-100
    rotation: float = 0
    z_index: int = 0
    visible: bool = True

    # Text properties
    content: Optional[str] = None
    font_size: Optional[float] = 16
    font_family: Optional[str] = "Arial"
    font_weight: Optional[str] = "normal"
    color: Optional[str] = "#000000"
    text_align: Optional[str] = "left"
    line_height: Optional[float] = 1.5

    # Image properties
    src: Optional[str] = None
    object_fit: Optional[str] = "contain"
    opacity: Optional[float] = 1.0

    # Shape properties
    shape_type: Optional[str] = None
    border_color: Optional[str] = None
    border_width: Optional[float] = 1
    background_color: Optional[str] = None


class CertificateTemplateSchema(BaseModel):
    """Certificate template schema"""

    id: str
    name: str
    description: Optional[str] = None
    orientation: str = "portrait"
    width: float = 210  # mm
    height: float = 297  # mm
    background_color: Optional[str] = None
    elements: List[CertificateElementSchema] = []
    variables: List[str] = []
    thumbnail: Optional[str] = None

    class Config:
        from_attributes = True


class CertificateSchema(BaseModel):
    """Certificate instance schema"""

    id: str
    template_id: str
    data: Dict[str, str]  # Variable values
    pdf_url: Optional[str] = None
    status: str = "pending"
    error: Optional[str] = None

    class Config:
        from_attributes = True


class ExcelUploadMappingSchema(BaseModel):
    """Excel column to template variable mapping"""

    target_variable: str
    source_column: str
    match_score: float


class ExcelUploadRequestSchema(BaseModel):
    """Excel upload request"""

    template_id: str
    file: str  # Base64 encoded file or file path


class BulkGenerateCertificatesSchema(BaseModel):
    """Bulk generate certificates request"""

    template_id: str
    mappings: List[ExcelUploadMappingSchema]
    data: List[Dict[str, str]]
