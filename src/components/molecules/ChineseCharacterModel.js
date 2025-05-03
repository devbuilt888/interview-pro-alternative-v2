import React from 'react';
import ModelViewer from '../atoms/ModelViewer';
import Typography from '../atoms/Typography';
import './ChineseCharacterModel.css';

const ChineseCharacterModel = ({ 
  character, 
  pinyin, 
  meaning, 
  modelSrc, 
  width = "200px", 
  height = "200px", 
  className = "" 
}) => {
  return (
    <div className={`chinese-character-model ${className}`}>
      <div className="character-info">
        <Typography variant="h2" className="character">{character}</Typography>
        <Typography variant="subtitle1" className="pinyin">{pinyin}</Typography>
        <Typography variant="body2" className="meaning">{meaning}</Typography>
      </div>
      
      <ModelViewer
        src={modelSrc}
        alt={`3D model of Chinese character ${character}`}
        width={width}
        height={height}
        autoRotate={true}
        cameraControls={true}
        className="character-model"
      />
    </div>
  );
};

export default ChineseCharacterModel; 