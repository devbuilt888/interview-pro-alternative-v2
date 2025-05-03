import React, { useState } from 'react';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import PDFUploader from '../molecules/PDFUploader';
import FloatingModelsContainer from '../organisms/FloatingModelsContainer';
import SimplePdfTest from '../molecules/SimplePdfTest';
import './LandingTemplate.css';

const LandingTemplate = ({ onStartClick, onPdfTextExtracted }) => {
  const [extractedText, setExtractedText] = useState('');
  const [showPdfTest, setShowPdfTest] = useState(false);

  const handleTextExtracted = (text) => {
    setExtractedText(text);
    if (onPdfTextExtracted) {
      onPdfTextExtracted(text);
    }
  };

  return (
    <div className="landing-template">
      <FloatingModelsContainer />
      
      <div className="landing-content glass-card">
        <div className="landing-header">
          <div className="interview-icon">AI</div>
          <Typography variant="h1" color="white" align="center" className="heading-xl landing-title">
            Super Interview Pro
          </Typography>
          <Typography variant="subtitle1" color="dark" align="center" className="landing-subtitle">
            Practice behavioral interviews with our AI-powered interview coach
          </Typography>
          {extractedText && (
            <Typography variant="body2" color="success" align="center" className="pdf-success">
              Resume/job description loaded! Start the interview to begin practicing.
            </Typography>
          )}
        </div>
        
        <PDFUploader onTextExtracted={handleTextExtracted} />
        
        <Button 
          onClick={onStartClick} 
          variant="primary" 
          size="large"
          className="btn btn-primary landing-cta"
          disabled={!extractedText}
        >
          Start Interview
        </Button>
        
        {!extractedText && (
          <Typography variant="caption" color="dark" align="center" className="upload-hint">
            Please upload your resume or job description as PDF to begin
          </Typography>
        )}
      </div>
    </div>
  );
};

export default LandingTemplate; 