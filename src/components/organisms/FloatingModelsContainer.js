import React from 'react';
import FloatingCharacterModel from '../molecules/FloatingCharacterModel';
import './FloatingModelsContainer.css';

const characterData = [
  {
    id: 1,
    character: '你',
    modelSrc: '/models/ni.glb',
    position: { top: '30%', left: '20%' },
    size: 300,
    delay: 0,
    className: 'ni-model-enlarged'
  },
  {
    id: 2,
    character: '好',
    modelSrc: '/models/hao.glb',
    position: { top: '70%', left: '75%' },
    size: 180,
    delay: 2
  },
  {
    id: 3,
    character: '中',
    modelSrc: '/models/zhong.glb',
    position: { top: '25%', left: '80%' },
    size: 160,
    delay: 4
  },
  {
    id: 4,
    character: '文',
    modelSrc: '/models/wen.glb',
    position: { top: '65%', left: '25%' },
    size: 170,
    delay: 6
  }
];

const FloatingModelsContainer = ({ className = '' }) => {
  return (
    <div className={`floating-models-container ${className}`}>
      {characterData.map(char => (
        <FloatingCharacterModel
          key={char.id}
          character={char.character}
          modelSrc={char.modelSrc}
          position={char.position}
          size={char.size}
          delay={char.delay}
          className={char.className}
        />
      ))}
    </div>
  );
};

export default FloatingModelsContainer; 