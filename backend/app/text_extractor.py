"""
Text extraction module for different file formats
"""
import docx
import PyPDF2
from typing import Optional


def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text.append(paragraph.text)
        return "\n".join(text)
    except Exception as e:
        raise Exception(f"Error extracting text from DOCX: {str(e)}")


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        text = []
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text.strip():
                    text.append(page_text)
        return "\n".join(text)
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")


def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except UnicodeDecodeError:
        # Try with different encoding if UTF-8 fails
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()
        except Exception as e:
            raise Exception(f"Error extracting text from TXT: {str(e)}")
    except Exception as e:
        raise Exception(f"Error extracting text from TXT: {str(e)}")


def extract_text_from_file(file_path: str, file_extension: str) -> str:
    """
    Extract text from file based on its extension
    
    Args:
        file_path: Path to the file
        file_extension: File extension (e.g., '.docx', '.pdf', '.txt')
    
    Returns:
        Extracted text as string
    """
    file_extension = file_extension.lower()
    
    if file_extension == ".docx":
        return extract_text_from_docx(file_path)
    elif file_extension == ".pdf":
        return extract_text_from_pdf(file_path)
    elif file_extension == ".txt":
        return extract_text_from_txt(file_path)
    else:
        raise ValueError(f"Unsupported file extension: {file_extension}")
