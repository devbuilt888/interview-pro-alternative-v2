import React from 'react';
import ModelViewer from '../atoms/ModelViewer';
import './OrbitalCharacterModels.css';

const OrbitalCharacterModels = ({ 
  models = [], 
  centerX = 50, // Center X position as percentage
  centerY = 50, // Center Y position as percentage
}) => {
  return (
    <div className="orbital-container" style={{ '--center-x': `${centerX}%`, '--center-y': `${centerY}%` }}>
      {models.map((model, index) => {
        // Get file name from path
        const fileName = model.src.split('/').pop();
        
        // Custom orbits for specific models
        let orbitSize, orbitDuration, modelSize;
        
        // Check if model has custom orbit configuration
        if (model.customOrbit) {
          orbitSize = model.customOrbit.size;
          orbitDuration = model.customOrbit.duration;
          modelSize = model.customOrbit.modelSize;
        } 
        // Use predefined settings for specific models
        else if (fileName === 'zhong.glb') {
          orbitSize = 700; // Extra wide orbit
          orbitDuration = 120; // Slower rotation
          modelSize = 150;
        } else if (fileName === 'ni.glb') {
          orbitSize = 600; // Very wide orbit
          orbitDuration = 105; // Slower rotation
          modelSize = 150;
        } else {
          // Default orbits for other models
          orbitSize = 400 + (index * 200);
          orbitDuration = 90 + (index * 30);
          modelSize = 150;
        }
        
        // Spread the models evenly around the orbit
        const startOffset = (index * 90) % 360;
        
        // Generate a unique className for this model to aid in debugging
        const uniqueClassName = `model-${fileName.replace('.glb', '')}-${index}`;
        
        return (
          <div 
            key={index}
            className={`orbital-model ${uniqueClassName}`}
            style={{
              '--orbit-size': `${orbitSize}px`,
              '--orbit-duration': `${orbitDuration}s`,
              '--start-offset': `${startOffset}deg`,
            }}
          >
            <ModelViewer
              src={model.src}
              alt={`3D model of ${model.character || 'character'}`}
              width={`${modelSize}px`}
              height={`${modelSize}px`}
              autoRotate={true}
              autoRotateDelay={0}
              rotationPerSecond="30deg"
              cameraControls={false}
              className="model-container"
              // Model orientation settings
              exposure="0.7"
              cameraOrbit="0deg 90deg 105%" 
              fieldOfView="30deg"
              minCameraOrbit="auto auto auto"
              maxCameraOrbit="auto auto auto"
              orientation="0deg 0deg 0deg"
              // Disable all interaction prompts and UI
              interactionPrompt="none"
              interactionPromptStyle="none"
              interactionPromptThreshold="0"
              interactionPolicy="none"
              // Keep the model facing up by adding a skybox and environment
              skybox-image={null}
              environment-image={null}
              disable-zoom={true}
              interaction-prompt={null}
              // Ensure proper rendering
              shadow-intensity="0.5"
              ar={false}
              ar-modes={null}
              // Disable touch/pointer event indicators
              touch-action="none"
              // Disable poster image that shows initially
              poster={null}
              reveal="auto"
              // Disable AR button and other UI controls
              ar-status="none"
              ar-scale="none"
              ar-placement="none"
              camera-target="0m 0m 0m"
              disable-tap={true}
              interpolation-decay="0"
            />
          </div>
        );
      })}
    </div>
  );
};

export default OrbitalCharacterModels; 