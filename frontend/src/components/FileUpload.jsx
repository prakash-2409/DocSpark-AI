import { useState } from 'react';

const FileUpload = ({ onFileSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const validTypes = ['.docx', '.pdf', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      alert(`Please upload a valid file type: ${validTypes.join(', ')}`);
      return;
    }
    
    setFileName(file.name);
    onFileSelect(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className="relative"
      >
        <input
          type="file"
          id="file-upload"
          accept=".docx,.pdf,.txt"
          onChange={handleChange}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-12 h-12 mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">DOCX, PDF, or TXT (MAX. 10MB)</p>
            {fileName && (
              <p className="mt-4 text-sm text-blue-600 font-medium">
                Selected: {fileName}
              </p>
            )}
          </div>
        </label>
      </form>
    </div>
  );
};

export default FileUpload;
