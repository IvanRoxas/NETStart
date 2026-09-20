import { useState, useCallback } from 'react';

export interface LevelThreeState {
  activeTab: number; // 1 = Oxygen Room, 2 = Shield Room, 3 = Engine Room, 4 = The Cockpit
  isOxygenFixed: boolean;
  isShieldFixed: boolean;
  isEngineFixed: boolean;
  shipPower: number;
}

export function useLevelThreeState() {
  // Player spawns in the Cockpit first (Tab 4) to see the final goal
  const [activeTab, setActiveTab] = useState<number>(4);
  const [isOxygenFixed, setOxygenFixed] = useState<boolean>(false);
  const [isShieldFixed, setShieldFixed] = useState<boolean>(false);
  const [isEngineFixed, setEngineFixed] = useState<boolean>(false);
  const [shipPower, setShipPower] = useState<number>(0);

  const resetState = useCallback(() => {
    setActiveTab(4);
    setOxygenFixed(false);
    setShieldFixed(false);
    setEngineFixed(false);
    setShipPower(0);
  }, []);

  return {
    activeTab,
    setActiveTab,
    isOxygenFixed,
    setOxygenFixed,
    isShieldFixed,
    setShieldFixed,
    isEngineFixed,
    setEngineFixed,
    shipPower,
    setShipPower,
    resetState,
  };
}
