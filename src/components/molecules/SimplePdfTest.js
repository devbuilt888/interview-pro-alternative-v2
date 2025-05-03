import React, { useEffect, useState } from 'react';

// Simple test component to verify if pdf.js is working
const SimplePdfTest = () => {
  const [status, setStatus] = useState('Not started');
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    async function testPdfJs() {
      try {
        setStatus('Loading...');
        
        // Dynamically import to avoid issues
        const pdfjsLib = await import('pdfjs-dist');
        setStatus('Library loaded');
        
        // Get version
        const version = pdfjsLib.version;
        setStatus(`PDF.js version: ${version}`);
        
        // Set worker source
        const workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
        setStatus(`Worker set to: ${workerSrc}`);
        
        // Load a sample PDF from a URL
        const pdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/test/pdfs/tracemonkey.pdf';
        setStatus(`Loading PDF from: ${pdfUrl}`);
        
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        
        setStatus(`Success! PDF has ${pdf.numPages} pages`);
      } catch (err) {
        console.error('PDF.js test error:', err);
        setErrorMsg(err.message || 'Unknown error');
        setStatus('Failed');
      }
    }
    
    testPdfJs();
  }, []);
  
  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px', margin: '10px 0' }}>
      <h3>Simple PDF.js Test</h3>
      <p><strong>Status:</strong> {status}</p>
      {errorMsg && <p style={{ color: 'red' }}><strong>Error:</strong> {errorMsg}</p>}
    </div>
  );
};

export default SimplePdfTest; 