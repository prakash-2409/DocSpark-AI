from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from typing import Optional
import tempfile
import shutil
from pathlib import Path

from app.text_extractor import extract_text_from_file
from app.ai_processor import process_text_with_ai

app = FastAPI(title="DocSpark AI API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Welcome to DocSpark AI API"}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.post("/api/upload")
async def upload_and_process(file: UploadFile = File(...)):
    """
    Upload a file (DOCX, PDF, or TXT) and process it with AI
    """
    # Validate file type
    allowed_extensions = {".docx", ".pdf", ".txt"}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type not supported. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Save uploaded file temporarily
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        # Extract text from file
        extracted_text = extract_text_from_file(temp_file_path, file_ext)
        
        if not extracted_text or not extracted_text.strip():
            raise HTTPException(status_code=400, detail="No text could be extracted from the file")
        
        # Process text with AI
        ai_results = await process_text_with_ai(extracted_text)
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "original_text": extracted_text,
            "summary": ai_results["summary"],
            "bullet_points": ai_results["bullet_points"],
            "rewritten_text": ai_results["rewritten_text"]
        })
        
    except Exception as e:
        # Clean up temporary file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
    finally:
        file.file.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
