import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import ResultDisplay from '../components/ResultDisplay';
import LoadingSpinner from '../components/LoadingSpinner';
import { uploadAndProcessFile } from '../services/api';

const Home = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await uploadAndProcessFile(file);
      setResult(response);
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'An error occurred while processing the file. Please try again.'
      );
      console.error('Error processing file:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Text-to-AI Docs
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your documents with AI-powered summarization and rewriting. 
            Upload DOCX, PDF, or TXT files and get instant insights.
          </p>
        </div>

        {/* File Upload Section */}
        <div className="mb-8">
          <FileUpload onFileSelect={handleFileSelect} />
        </div>

        {/* Action Buttons */}
        {file && !loading && !result && (
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={handleProcess}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              Process Document
            </button>
            <button
              onClick={handleReset}
              className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && <LoadingSpinner />}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-red-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {result && (
          <>
            <ResultDisplay result={result} />
            <div className="flex justify-center mt-8">
              <button
                onClick={handleReset}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-colors"
              >
                Process Another Document
              </button>
            </div>
          </>
        )}

        {/* Info Cards */}
        {!file && !loading && !result && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-3">📄</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Multiple Formats
              </h3>
              <p className="text-gray-600 text-sm">
                Support for DOCX, PDF, and TXT files
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-600 text-sm">
                Advanced AI for summarization and rewriting
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Fast Processing
              </h3>
              <p className="text-gray-600 text-sm">
                Get results in seconds, not minutes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
