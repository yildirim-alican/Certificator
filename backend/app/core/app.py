import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZIPMiddleware

from app.core.config import settings
from app.core.pdf_engine import get_pdf_engine
from app.api import templates, certificates, excel, pdf

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for FastAPI startup/shutdown events"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    # Initialize Playwright browser pool on startup
    try:
        pdf_engine = await get_pdf_engine()
        logger.info("Playwright PDF engine initialized")
    except Exception as e:
        logger.error(f"Failed to initialize PDF engine: {e}")
    yield
    logger.info(f"Shutting down {settings.APP_NAME}")


def create_app() -> FastAPI:
    """Application factory"""
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.VERSION,
        debug=settings.DEBUG,
        lifespan=lifespan,
    )

    # Middleware
    app.add_middleware(GZIPMiddleware, minimum_size=1000)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(templates.router, prefix=settings.API_V1_PREFIX)
    app.include_router(certificates.router, prefix=settings.API_V1_PREFIX)
    app.include_router(excel.router, prefix=settings.API_V1_PREFIX)
    app.include_router(pdf.router, prefix=settings.API_V1_PREFIX)

    @app.get("/health")
    async def health_check():
        return {"status": "healthy", "version": settings.VERSION}

    @app.get("/")
    async def root():
        return {"message": f"Welcome to {settings.APP_NAME}"}

    return app


app = create_app()
