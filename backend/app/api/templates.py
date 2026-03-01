from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid

from app.db.session import get_db
from app.db.models import CertificateTemplate as CertificateTemplateModel
from app.schemas.certificate import CertificateTemplateSchema

router = APIRouter(prefix="/templates", tags=["templates"])


@router.get("", response_model=List[CertificateTemplateSchema])
async def list_templates(db: AsyncSession = Depends(get_db)):
    """Get all certificate templates"""
    result = await db.execute(select(CertificateTemplateModel))
    templates = result.scalars().all()
    return templates


@router.post("", response_model=CertificateTemplateSchema, status_code=status.HTTP_201_CREATED)
async def create_template(
    template: CertificateTemplateSchema, db: AsyncSession = Depends(get_db)
):
    """Create a new certificate template"""
    template_id = str(uuid.uuid4())
    template_data = template.dict()
    template_data["id"] = template_id

    db_template = CertificateTemplateModel(**template_data)
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return db_template


@router.get("/{template_id}", response_model=CertificateTemplateSchema)
async def get_template(template_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific certificate template"""
    result = await db.execute(select(CertificateTemplateModel).where(CertificateTemplateModel.id == template_id))
    template = result.scalar_one_or_none()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template


@router.put("/{template_id}", response_model=CertificateTemplateSchema)
async def update_template(
    template_id: str, template: CertificateTemplateSchema, db: AsyncSession = Depends(get_db)
):
    """Update a certificate template"""
    result = await db.execute(select(CertificateTemplateModel).where(CertificateTemplateModel.id == template_id))
    db_template = result.scalar_one_or_none()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    for key, value in template.dict().items():
        setattr(db_template, key, value)

    await db.commit()
    await db.refresh(db_template)
    return db_template


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(template_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a certificate template"""
    result = await db.execute(select(CertificateTemplateModel).where(CertificateTemplateModel.id == template_id))
    db_template = result.scalar_one_or_none()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")

    await db.delete(db_template)
    await db.commit()
    return None
