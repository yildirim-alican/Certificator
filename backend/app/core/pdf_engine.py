import asyncio
import logging
from typing import Optional
from playwright.async_api import async_playwright, Browser, Page

logger = logging.getLogger(__name__)


class PlaywrightPDFEngine:
    """PDF generation engine using Playwright"""

    def __init__(self):
        self.browser: Optional[Browser] = None

    async def initialize(self):
        """Initialize Playwright browser"""
        try:
            playwright = await async_playwright().start()
            self.browser = await playwright.chromium.launch(headless=True)
            logger.info("Playwright browser initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Playwright: {e}")
            raise

    async def close(self):
        """Close Playwright browser"""
        if self.browser:
            await self.browser.close()
            logger.info("Playwright browser closed")

    async def render_html_to_pdf(
        self,
        html_content: str,
        output_path: str,
        scale: float = 2.0,
        margin: dict = None,
    ) -> bool:
        """
        Render HTML to PDF with 300 DPI output

        Args:
            html_content: HTML to render
            output_path: Path to save PDF
            scale: Scale factor for output quality (2.0 = 300 DPI)
            margin: Margins in mm

        Returns:
            bool: Success status
        """
        if not self.browser:
            raise RuntimeError("Playwright browser not initialized")

        if margin is None:
            margin = {"top": "10mm", "bottom": "10mm", "left": "10mm", "right": "10mm"}

        try:
            page: Page = await self.browser.new_page()
            await page.set_content(html_content)

            # Apply CSS for print
            await page.add_style_tag(
                content="""
                @media print {
                    body { margin: 0; padding: 0; }
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                }
            """
            )

            await page.pdf(
                path=output_path,
                format="A4",
                margin=margin,
                scale=scale,
                print_background=True,
            )

            await page.close()
            logger.info(f"PDF generated: {output_path}")
            return True

        except Exception as e:
            logger.error(f"Failed to generate PDF: {e}")
            return False


# Singleton instance
pdf_engine: Optional[PlaywrightPDFEngine] = None


async def get_pdf_engine() -> PlaywrightPDFEngine:
    """Get or create PDF engine instance"""
    global pdf_engine
    if pdf_engine is None:
        pdf_engine = PlaywrightPDFEngine()
        await pdf_engine.initialize()
    return pdf_engine
