from pydantic import BaseModel


class HealthCheckSchema(BaseModel):
    """Health check response"""

    status: str
    version: str
    environment: str


class ErrorSchema(BaseModel):
    """Error response"""

    error: str
    code: str
    details: dict = {}
