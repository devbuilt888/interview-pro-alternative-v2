import React from 'react';
import ChineseCharacterModel from '../molecules/ChineseCharacterModel';
import './CharacterGallery.css';

const characterData = [
  {
    id: 1,
    character: '你',
    pinyin: 'nǐ',
    meaning: 'you',
    modelSrc: '/models/ni.glb'
  },
  {
    id: 2,
    character: '好',
    pinyin: 'hǎo',
    meaning: 'good',
    modelSrc: '/models/hao.glb'
  },
  {
    id: 3,
    character: '中',
    pinyin: 'zhōng',
    meaning: 'middle',
    modelSrc: '/models/zhong.glb'
  },
  {
    id: 4,
    character: '文',
    pinyin: 'wén',
    meaning: 'language, culture',
    modelSrc: '/models/wen.glb'
  }
];

const CharacterGallery = ({ className = '' }) => {
  return (
    <div className={`character-gallery ${className}`}>
      <div className="gallery-grid">
        {characterData.map(char => (
          <ChineseCharacterModel
            key={char.id}
            character={char.character}
            pinyin={char.pinyin}
            meaning={char.meaning}
            modelSrc={char.modelSrc}
          />
        ))}
      </div>
    </div>
  );
};

export default CharacterGallery; 