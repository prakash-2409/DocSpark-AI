# DocSpark AI 🚀

AI-powered document processing tool that converts files to text, summarizes content, creates bullet points, and enhances text - similar to Notion AI.

## Features ✨

- **Multi-format Support**: Upload and process DOCX, PDF, and TXT files
- **AI-Powered Summarization**: Get concise summaries of your documents
- **Key Point Extraction**: Automatically identify and extract the most important points
- **Content Rewriting**: Transform your text into more polished, professional versions
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Fast Processing**: Efficient text extraction and AI processing

## Tech Stack 🛠️

### Frontend
- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **FastAPI** - Modern Python web framework
- **Python-docx** - DOCX file processing
- **PyPDF2** - PDF text extraction
- **OpenAI API** - AI-powered text processing
- **Uvicorn** - ASGI server

## Project Structure 📁

```
DocSpark-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── text_extractor.py    # File text extraction logic
│   │   └── ai_processor.py      # AI processing logic
│   ├── main.py                  # FastAPI application
│   ├── requirements.txt         # Python dependencies
│   └── .env.example            # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── FileUpload.jsx
│   │   │   ├── ResultDisplay.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── Header.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx
│   │   │   └── About.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   └── index.css          # Global styles
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Installation 🔧

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file from the example:
```bash
cp .env.example .env
```

5. (Optional) Add your OpenAI API key to `.env`:
```
OPENAI_API_KEY=your_actual_api_key_here
```

> **Note**: The application works in demo mode without an API key, but for full AI-powered features, you'll need an OpenAI API key. Get one at https://platform.openai.com/api-keys

6. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage 📖

1. Open your browser and go to `http://localhost:5173`
2. Upload a document (DOCX, PDF, or TXT file)
3. Click "Process Document"
4. View the results:
   - **Original Text**: The extracted text from your document
   - **Summary**: AI-generated concise summary
   - **Key Points**: Bullet points of main ideas
   - **Rewritten Text**: Enhanced version of your content

## API Endpoints 🔌

### `GET /`
Root endpoint - returns welcome message

### `GET /health`
Health check endpoint

### `POST /api/upload`
Upload and process a document file

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (DOCX, PDF, or TXT)

**Response:**
```json
{
  "success": true,
  "filename": "example.pdf",
  "original_text": "...",
  "summary": "...",
  "bullet_points": ["...", "..."],
  "rewritten_text": "..."
}
```

## Development 💻

### Frontend Development

Run the dev server with hot reload:
```bash
cd frontend
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

Lint code:
```bash
npm run lint
```

### Backend Development

Run with auto-reload:
```bash
cd backend
uvicorn main:app --reload
```

## Configuration ⚙️

### Backend Configuration

The backend can be configured through environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key (optional, app works in demo mode without it)

### Frontend Configuration

Update the API base URL in `frontend/src/services/api.js` if deploying to production:

```javascript
const API_BASE_URL = 'http://localhost:8000'; // Change for production
```

## Demo Mode 🎭

The application includes a demo mode that works without an OpenAI API key:
- Generates mock summaries using the first portion of the text
- Extracts sentences as bullet points
- Returns the original text as "rewritten" text with a note

This allows you to test the application structure without API costs.

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- OpenAI for providing powerful AI models
- The FastAPI and React communities for excellent documentation
- All contributors and users of this project

## Support 💬

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for better document processing
