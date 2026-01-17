# PDFPro Backend

Minimal FastAPI backend for PDFPro platform.

## Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

## Note

This backend is intentionally minimal. All PDF processing happens client-side
in the browser. The backend only provides:

- Static file serving
- API metadata endpoints
- Health monitoring
