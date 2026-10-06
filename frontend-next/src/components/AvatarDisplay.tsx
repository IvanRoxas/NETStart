import React from 'react';

export interface AvatarLayers {
  skin?: string;
  face?: string;
  underwear?: string;
  bottom?: string;
  top?: string;
  shoes?: string;
  hair?: string;
  accessory?: string;
}

interface AvatarDisplayProps {
  layers?: AvatarLayers;
  className?: string;
  showShadow?: boolean;
  scale?: number;
  offsetYClass?: string;
}

export const DEFAULT_AVATAR_LAYERS: AvatarLayers = {
  skin: '/assets/global/shop/avatar/base/Skin%201%20Faceless.svg',
  face: '/assets/global/shop/avatar/base/Full%20Face.svg',
  underwear: '/assets/global/shop/avatar/base/Underwear%20(Default).svg',
};

export default function AvatarDisplay({
  layers = DEFAULT_AVATAR_LAYERS,
  className = "w-full h-64 sm:h-72",
  showShadow = true,
  scale = 1.20,
  offsetYClass = "translate-y-4 sm:translate-y-5",
}: AvatarDisplayProps) {
  const activeSkin = layers.skin ?? DEFAULT_AVATAR_LAYERS.skin;
  const activeFace = layers.face ?? DEFAULT_AVATAR_LAYERS.face;
  const activeUnderwear = layers.underwear ?? DEFAULT_AVATAR_LAYERS.underwear;

  // Ground shadow width scaled to frame the feet stance naturally
  const shadowWidthPx = Math.round(96 * scale);

  return (
    <div className={`relative flex items-center justify-center overflow-visible ${className}`}>
      {/* Avatar + Ground Shadow Unit (positioned down to allocate headspace for accessories, hair, hats) */}
      <div className={`relative w-full h-full flex items-center justify-center ${offsetYClass}`}>
        {/* Floor Standing Contact Shadow (positioned directly under feet at bottom 5.5%) */}
        {showShadow && (
          <div 
            className="absolute bottom-[5.5%] left-1/2 -translate-x-1/2 h-3.5 sm:h-4 bg-black/70 rounded-[100%] blur-[2.5px] z-0 pointer-events-none transition-all duration-300" 
            style={{ width: `${shadowWidthPx}px` }}
          />
        )}

        {/* Scaled Avatar Character Wrapper anchored at feet stance bottom center (50% 93%) */}
        <div 
          className="relative w-full h-full flex items-center justify-center pointer-events-none z-10"
          style={{ transform: `scale(${scale})`, transformOrigin: '50% 93%' }}
        >
        {/* Layer 1: Base Skin (Skin 1 Faceless) */}
        {activeSkin && (
          <img
            src={activeSkin}
            alt="Base Skin"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 1 }}
          />
        )}

        {/* Layer 2: Full Face */}
        {activeFace && (
          <img
            src={activeFace}
            alt="Full Face"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 2 }}
          />
        )}

        {/* Layer 3: Underwear (Default base garment) */}
        {activeUnderwear && !layers.bottom && (
          <img
            src={activeUnderwear}
            alt="Underwear"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 3 }}
          />
        )}

        {/* Layer 4: Bottoms (when equipped) */}
        {layers.bottom && (
          <img
            src={layers.bottom}
            alt="Bottom"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 4 }}
          />
        )}

        {/* Layer 5: Tops (when equipped) */}
        {layers.top && (
          <img
            src={layers.top}
            alt="Top"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 5 }}
          />
        )}

        {/* Layer 6: Shoes (when equipped) */}
        {layers.shoes && (
          <img
            src={layers.shoes}
            alt="Shoes"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 6 }}
          />
        )}

        {/* Layer 7: Hair (when equipped) */}
        {layers.hair && (
          <img
            src={layers.hair}
            alt="Hair"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 7 }}
          />
        )}

        {/* Layer 8: Accessories (when equipped) */}
        {layers.accessory && (
          <img
            src={layers.accessory}
            alt="Accessory"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            style={{ zIndex: 8 }}
          />
        )}
        </div>
      </div>
    </div>
  );
}
