import logging
from typing import Dict, List, Optional
import pandas as pd
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)


class ExcelSchemaValidator:
    """Validates and maps Excel columns to template variables"""

    @staticmethod
    def parse_excel(file_path: str) -> Optional[pd.DataFrame]:
        """
        Parse Excel file into DataFrame

        Args:
            file_path: Path to Excel file

        Returns:
            DataFrame or None if parsing fails
        """
        try:
            df = pd.read_excel(file_path)
            logger.info(f"Parsed Excel: {len(df)} rows, {len(df.columns)} columns")
            return df
        except Exception as e:
            logger.error(f"Failed to parse Excel: {e}")
            return None

    @staticmethod
    def calculate_similarity(str1: str, str2: str) -> float:
        """Calculate string similarity ratio (0-1)"""
        return SequenceMatcher(None, str1.lower(), str2.lower()).ratio()

    @staticmethod
    def auto_map_columns(
        template_variables: List[str], excel_columns: List[str]
    ) -> Dict[str, str]:
        """
        Auto-map Excel columns to template variables using similarity scoring

        Args:
            template_variables: List of variables like ['{{Name}}', '{{Title}}']
            excel_columns: List of column names from Excel

        Returns:
            Dict mapping template variables to Excel columns
        """
        mappings = {}

        for variable in template_variables:
            # Clean variable name (remove {{ }})
            clean_var = variable.replace("{{", "").replace("}}", "").strip().lower()

            best_match = None
            best_score = 0.0

            for column in excel_columns:
                score = ExcelSchemaValidator.calculate_similarity(clean_var, column)
                if score > best_score:
                    best_score = score
                    best_match = column

            # Only map if similarity > threshold
            if best_match and best_score > 0.3:
                mappings[variable] = best_match
                logger.info(
                    f"Mapped '{variable}' -> '{best_match}' (score: {best_score:.2f})"
                )

        return mappings

    @staticmethod
    def extract_mapped_data(
        df: pd.DataFrame, mappings: Dict[str, str]
    ) -> List[Dict[str, str]]:
        """
        Extract data from DataFrame using column mappings

        Args:
            df: Input DataFrame
            mappings: Variable to column mappings

        Returns:
            List of dictionaries with mapped data
        """
        result = []
        for _, row in df.iterrows():
            mapped_row = {}
            for variable, column in mappings.items():
                if column in df.columns:
                    mapped_row[variable] = str(row[column])
            result.append(mapped_row)
        return result
