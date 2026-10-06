/**
 * Saturn Audio Engine (Silenced)
 * Audio has been completely disabled per user request.
 */

class SaturnAudioEngine {
  setMuted(_isMuted: boolean) {}
  isMuted(): boolean {
    return true;
  }
  playDullClank() {}
  playMetalBounceClank() {}
  playLeakSpill() {}
  playBufferJamBuzz() {}
  playWavePowerUp() {}
  playFinalVictoryFanfare() {}
  playLockDeadbolt() {}
}

export const saturnAudio = new SaturnAudioEngine();

export const playDropClank = () => {};
export const playBounceClank = () => {};
export const playLeakSpill = () => {};
export const playBufferJam = () => {};
export const playPowerUpChime = () => {};
export const playVictoryFanfare = () => {};
export const playLockDeadbolt = () => {};
