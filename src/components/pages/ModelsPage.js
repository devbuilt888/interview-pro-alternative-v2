import React from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterGallery from '../organisms/CharacterGallery';
import Typography from '../atoms/Typography';
import Button from '../atoms/Button';
import SEO from '../atoms/SEO';
import './ModelsPage.css';

const ModelsPage = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/chat');
  };

  return (
    <div className="models-page">
      <SEO 
        title="Chinese Character Models" 
        description="Explore 3D models of Chinese characters to help with your learning." 
      />
      
      <div className="models-header">
        <Button 
          onClick={handleBackClick} 
          variant="secondary"
          className="back-button"
        >
          ← Back to Chat
        </Button>
        <Typography variant="h1" className="page-title" align="center">
          Chinese Character Models
        </Typography>
        <Typography variant="body1" className="page-description" align="center">
          Explore these 3D models to better understand Chinese character structure and meaning
        </Typography>
      </div>
      
      <CharacterGallery />
    </div>
  );
};

export default ModelsPage; 