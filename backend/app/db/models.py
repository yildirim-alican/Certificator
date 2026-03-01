from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, Integer
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class CertificateTemplate(Base):
    """Certificate Template model"""

    __tablename__ = "certificate_templates"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    orientation = Column(String, default="portrait")
    width = Column(Integer, default=210)  # mm
    height = Column(Integer, default=297)  # mm
    background_color = Column(String, nullable=True)
    elements = Column(JSON, default=[])  # Array of CertificateElement
    variables = Column(JSON, default=[])  # Array of variable names
    thumbnail = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Certificate(Base):
    """Certificate instance model"""

    __tablename__ = "certificates"

    id = Column(String, primary_key=True)
    template_id = Column(String, nullable=False)
    data = Column(JSON, default={})  # Variable values
    pdf_url = Column(String, nullable=True)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error = Column(String, nullable=True)
