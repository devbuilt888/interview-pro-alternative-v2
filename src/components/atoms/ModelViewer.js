import React, { useEffect, useRef, useState } from 'react';
import './ModelViewer.css';

const ModelViewer = ({ 
  src, 
  alt = "3D model", 
  width = "300px", 
  height = "300px", 
  autoRotate = true,
  autoRotateDelay = 3000,
  rotationPerSecond = "30deg",
  cameraControls = true,
  className = "",
  exposure = "0.5",
  cameraOrbit = null,
  fieldOfView = "auto",
  orientation = null,
  minCameraOrbit = null,
  maxCameraOrbit = null,
  interactionPrompt = "auto",
  interactionPromptStyle = "basic",
  interactionPromptThreshold = null,
  interactionPolicy = null,
  disableTap = false,
  disableZoom = false,
  touchAction = null,
  poster = null,
  reveal = null,
  ...otherProps
}) => {
  const modelRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the model-viewer web component script if it's not already loaded
    if (!window.customElements.get('model-viewer')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
      script.type = 'module';
      document.body.appendChild(script);
      
      return () => {
        document.body.removeChild(script);
      };
    }
  }, []);

  useEffect(() => {
    // Set up the load event listener for the model-viewer
    const modelViewer = modelRef.current;
    if (modelViewer) {
      const handleLoaded = () => {
        setIsLoading(false);
      };
      
      modelViewer.addEventListener('load', handleLoaded);
      
      // Check if already loaded
      if (modelViewer.loaded) {
        setIsLoading(false);
      }
      
      return () => {
        modelViewer.removeEventListener('load', handleLoaded);
      };
    }
  }, [modelRef]);

  return (
    <div className={`model-viewer-container ${className}`} style={{ width, height }}>
      <model-viewer
        ref={modelRef}
        src={src}
        alt={alt}
        auto-rotate={autoRotate}
        auto-rotate-delay={autoRotateDelay}
        rotation-per-second={rotationPerSecond}
        camera-controls={cameraControls}
        shadow-intensity="1"
        exposure={exposure}
        camera-orbit={cameraOrbit}
        field-of-view={fieldOfView}
        orientation={orientation}
        min-camera-orbit={minCameraOrbit}
        max-camera-orbit={maxCameraOrbit}
        interaction-prompt={interactionPrompt}
        interaction-prompt-style={interactionPromptStyle}
        interaction-prompt-threshold={interactionPromptThreshold}
        interaction-policy={interactionPolicy}
        touch-action={touchAction}
        disable-tap={disableTap}
        disable-zoom={disableZoom}
        poster={poster}
        reveal={reveal}
        style={{ width: "100%", height: "100%" }}
        {...otherProps}
      >
        {isLoading && (
          <div className="model-viewer-loading">
            <div className="spinner"></div>
          </div>
        )}
      </model-viewer>
    </div>
  );
};

export default ModelViewer; 