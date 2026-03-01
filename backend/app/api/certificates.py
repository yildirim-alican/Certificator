from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
import os

from app.db.session import get_db
from app.db.models import Certificate as CertificateModel
from app.schemas.certificate import CertificateSchema, BulkGenerateCertificatesSchema
from app.core.pdf_engine import get_pdf_engine
from app.core.config import settings

router = APIRouter(prefix="/certificates", tags=["certificates"])


@router.get("", response_model=List[CertificateSchema])
async def list_certificates(db: AsyncSession = Depends(get_db)):
    """Get all certificates"""
    result = await db.execute(select(CertificateModel))
    certificates = result.scalars().all()
    return certificates


@router.post("", response_model=CertificateSchema, status_code=status.HTTP_201_CREATED)
async def create_certificate(
    certificate: CertificateSchema, db: AsyncSession = Depends(get_db)
):
    """Create a new certificate"""
    cert_id = str(uuid.uuid4())
    certificate_data = certificate.dict()
    certificate_data["id"] = cert_id

    db_certificate = CertificateModel(**certificate_data)
    db.add(db_certificate)
    await db.commit()
    await db.refresh(db_certificate)
    return db_certificate


@router.get("/{certificate_id}", response_model=CertificateSchema)
async def get_certificate(certificate_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific certificate"""
    result = await db.execute(select(CertificateModel).where(CertificateModel.id == certificate_id))
    certificate = result.scalar_one_or_none()
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    return certificate


@router.delete("/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(certificate_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a certificate"""
    result = await db.execute(select(CertificateModel).where(CertificateModel.id == certificate_id))
    db_certificate = result.scalar_one_or_none()
    if not db_certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")

    await db.delete(db_certificate)
    await db.commit()
    return None


@router.post("/generate/bulk", status_code=status.HTTP_202_ACCEPTED)
async def bulk_generate_certificates(
    request: BulkGenerateCertificatesSchema, db: AsyncSession = Depends(get_db)
):
    """Bulk generate certificates from Excel data"""
    # TODO: Implement background task for generating multiple certificates
    return {
        "message": "Bulk generation started",
        "template_id": request.template_id,
        "count": len(request.data),
    }
