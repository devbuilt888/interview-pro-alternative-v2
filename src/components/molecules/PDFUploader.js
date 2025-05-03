import React, { useState, useRef } from 'react';
import Button from '../atoms/Button';
import Typography from '../atoms/Typography';
import './PDFUploader.css';

const PDFUploader = ({ onTextExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filename, setFilename] = useState('');
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    // Programmatically click the hidden file input
    if (fileInputRef.current) {
      console.log("Clicking file input");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event) => {
    console.log("File input changed");
    const file = event.target.files[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", file.name, file.type);
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setFilename(file.name);
    setIsLoading(true);
    setError(null);

    try {
      // Load the PDF.js library dynamically
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set the worker source
      const pdfjsVersion = pdfjsLib.version;
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;

      console.log("Reading file...");
      const arrayBuffer = await file.arrayBuffer();
      console.log("File read complete, loading PDF...");
      
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      
      console.log(`PDF loaded with ${pdf.numPages} pages`);
      let extractedText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Processing page ${i}...`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        extractedText += `[Page ${i}] ${pageText}\n\n`;
      }

      console.log("Text extraction complete");
      onTextExtracted(extractedText);
      setIsLoading(false);
    } catch (err) {
      console.error("PDF processing error:", err);
      setError(`Error processing PDF: ${err.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="pdf-uploader">
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <Button
        variant="secondary"
        size="medium"
        disabled={isLoading}
        className="pdf-upload-button"
        onClick={handleButtonClick}
      >
        {isLoading ? 'Extracting text...' : 'Upload PDF'}
      </Button>
      {filename && !error && !isLoading && (
        <Typography variant="body2" color="success" className="success-message">
          Successfully extracted text from {filename}
        </Typography>
      )}
      {error && (
        <Typography variant="body2" color="error" className="error-message">
          {error}
        </Typography>
      )}
      {isLoading && (
        <Typography variant="body2" color="primary" className="loading-message">
          Processing file. This may take a moment...
        </Typography>
      )}
    </div>
  );
};

export default PDFUploader; 