import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/Layout';

// Pages
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import TextToPdfPage from './pages/TextToPdfPage';
import ImageToPdfPage from './pages/ImageToPdfPage';
import WordToPdfPage from './pages/WordToPdfPage';
import PdfMergePage from './pages/PdfMergePage';
import PdfSplitPage from './pages/PdfSplitPage';
import CompressPdfPage from './pages/CompressPdfPage';
import EditPdfPage from './pages/EditPdfPage';
import FlashcardsPage from './pages/FlashcardsPage';
import PomodoroPage from './pages/PomodoroPage';
import AssignmentHelperPage from './pages/AssignmentHelperPage';
import CitationPage from './pages/CitationPage';
import TemplatesPage from './pages/TemplatesPage';
import QuickAccessPage from './pages/QuickAccessPage';
import FileViewerPage from './pages/FileViewerPage';
import LocalEditorPage from './pages/LocalEditorPage';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/editor/:fileId" element={<EditorPage />} />
            <Route path="/text-to-pdf" element={<TextToPdfPage />} />
            <Route path="/image-to-pdf" element={<ImageToPdfPage />} />
            <Route path="/word-to-pdf" element={<WordToPdfPage />} />
            <Route path="/pdf-merge" element={<PdfMergePage />} />
            <Route path="/pdf-split" element={<PdfSplitPage />} />
            <Route path="/compress-pdf" element={<CompressPdfPage />} />
            <Route path="/edit-pdf" element={<EditPdfPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/assignment-helper" element={<AssignmentHelperPage />} />
            <Route path="/citations" element={<CitationPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/quick-access" element={<QuickAccessPage />} />
            <Route path="/file-viewer/:fileId" element={<FileViewerPage />} />
            <Route path="/local-editor" element={<LocalEditorPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
