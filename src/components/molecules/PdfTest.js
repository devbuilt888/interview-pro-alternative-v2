import React, { useEffect, useState } from 'react';
import * as pdfjs from 'pdfjs-dist';

// Use a static PDF URL for testing
const TEST_PDF_URL = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

const PdfTest = () => {
  const [status, setStatus] = useState('Not started');
  const [error, setError] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [text, setText] = useState('');

  useEffect(() => {
    async function testPdfJs() {
      try {
        setStatus('Loading worker...');
        
        // Set worker source
        const pdfjsVersion = pdfjs.version;
        console.log('PDF.js version:', pdfjsVersion);
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
        
        setStatus('Fetching test PDF...');
        const loadingTask = pdfjs.getDocument(TEST_PDF_URL);
        
        setStatus('Processing PDF...');
        const pdf = await loadingTask.promise;
        
        setPageCount(pdf.numPages);
        setStatus(`PDF loaded with ${pdf.numPages} pages`);
        
        // Get text from first page as a test
        const page = await pdf.getPage(1);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        setText(pageText.substring(0, 200) + '...');
        
        setStatus('Test completed successfully');
      } catch (err) {
        console.error('PDF.js test error:', err);
        setError(err.message);
        setStatus('Test failed');
      }
    }
    
    testPdfJs();
  }, []);
  
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>PDF.js Test</h2>
      <div style={{ marginBottom: '10px' }}>
        <strong>Status:</strong> {status}
      </div>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {pageCount > 0 && (
        <div style={{ marginBottom: '10px' }}>
          <strong>Pages found:</strong> {pageCount}
        </div>
      )}
      
      {text && (
        <div>
          <strong>Sample text from first page:</strong>
          <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            {text}
          </div>
        </div>
      )}
    </div>
  );
};

export default PdfTest; 