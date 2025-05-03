import React from 'react';
import ModelViewer from '../atoms/ModelViewer';
import './FloatingCharacterModel.css';

const FloatingCharacterModel = ({ 
  character, 
  modelSrc, 
  size = 200,
  position = { top: '50%', left: '50%' },
  delay = 0,
  className = "" 
}) => {
  const style = {
    ...position,
    animationDelay: `${delay}s`
  };

  return (
    <div className={`floating-character-model ${className}`} style={style}>
      <ModelViewer
        src={modelSrc}
        alt={`3D model of Chinese character ${character}`}
        width={`${size}px`}
        height={`${size}px`}
        autoRotate={true}
        cameraControls={false}
        className="floating-model"
      />
    </div>
  );
};

export default FloatingCharacterModel; 