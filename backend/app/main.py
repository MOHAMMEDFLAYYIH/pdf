from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="PDFPro API",
    description="Minimal backend for PDFPro - a privacy-first PDF platform",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "PDFPro API",
        "version": "1.0.0",
        "description": "Privacy-first PDF platform backend",
        "note": "All PDF processing happens client-side. This server only provides metadata and static files.",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return JSONResponse(
        status_code=200,
        content={
            "status": "healthy",
            "message": "PDFPro API is running",
        },
    )


@app.get("/api/v1/tools")
async def list_tools():
    """List all available PDF tools."""
    return {
        "tools": [
            {
                "id": "merge-pdf",
                "name": "Merge PDF",
                "description": "Combine multiple PDFs into a single document",
                "category": "pdf",
                "clientSide": True,
            },
            {
                "id": "split-pdf",
                "name": "Split PDF",
                "description": "Extract specific pages from a PDF",
                "category": "pdf",
                "clientSide": True,
            },
            {
                "id": "compress-pdf",
                "name": "Compress PDF",
                "description": "Reduce PDF file size while maintaining quality",
                "category": "pdf",
                "clientSide": True,
            },
            {
                "id": "pdf-to-image",
                "name": "PDF to Image",
                "description": "Convert PDF pages to JPG or PNG images",
                "category": "convert",
                "clientSide": True,
            },
            {
                "id": "image-to-pdf",
                "name": "Image to PDF",
                "description": "Create PDF documents from images",
                "category": "convert",
                "clientSide": True,
            },
            {
                "id": "chat-pdf",
                "name": "Chat with PDF",
                "description": "AI-powered document analysis and Q&A",
                "category": "ai",
                "clientSide": True,
            },
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
