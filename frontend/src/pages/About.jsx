const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About DocSpark AI</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              DocSpark AI is a powerful document processing tool that leverages artificial intelligence 
              to help you understand and transform your documents quickly and efficiently.
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Features</h2>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">
                  <strong>Multi-format Support:</strong> Upload DOCX, PDF, or TXT files
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">
                  <strong>AI-Powered Summarization:</strong> Get concise summaries of your documents
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">
                  <strong>Key Point Extraction:</strong> Automatically identify the most important points
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span className="text-gray-700">
                  <strong>Content Rewriting:</strong> Transform your text into more polished versions
                </span>
              </li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">How It Works</h2>
            <ol className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-3">1.</span>
                <span className="text-gray-700">Upload your document (DOCX, PDF, or TXT)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-3">2.</span>
                <span className="text-gray-700">Our system extracts the text from your file</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-3">3.</span>
                <span className="text-gray-700">AI processes the content to generate insights</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-semibold mr-3">4.</span>
                <span className="text-gray-700">View your results: summary, key points, and rewritten text</span>
              </li>
            </ol>

            <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Technology Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-800 mb-2">Frontend</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• React</li>
                  <li>• Vite</li>
                  <li>• Tailwind CSS</li>
                  <li>• React Router</li>
                </ul>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-semibold text-gray-800 mb-2">Backend</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• FastAPI</li>
                  <li>• Python</li>
                  <li>• OpenAI API</li>
                  <li>• PyPDF2 & python-docx</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> This application can work in demo mode without an OpenAI API key, 
                providing basic text processing. For full AI-powered features, configure your OpenAI API key 
                in the backend.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
