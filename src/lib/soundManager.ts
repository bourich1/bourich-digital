import { Howl, Howler } from 'howler';

class SoundManager {
  private static instance: SoundManager;
  private sounds: Record<string, Howl>;
  private isMuted: boolean = false;
  private loopId: number | null = null;

  private constructor() {
    // Initialize sounds with reliable URLs
    this.sounds = {
      send: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3'], // Soft click/pop
        volume: 0.2,
      }),
      aiStart: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3'], // Gentle notification
        volume: 0.1,
        rate: 1.5, // Faster playback for a shorter "blip"
      }),
      imageStart: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], // Sci-fi sweep
        volume: 0.2,
      }),
      loop: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/212/212-preview.mp3'], // Low hum/drone
        volume: 0.05,
        loop: true,
      }),
      success: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'], // Success chime
        volume: 0.2,
        rate: 1.2, // Higher pitch for success
      }),
      error: new Howl({
        src: ['https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'], // Soft error/alert
        volume: 0.2,
      }),
    };
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public play(soundName: string) {
    if (this.isMuted || !this.sounds[soundName]) return;
    
    const sound = this.sounds[soundName];

    // Stop loop if playing loop sound again (restart it)
    if (soundName === 'loop') {
      if (this.loopId !== null) {
        sound.stop(this.loopId);
      }
      this.loopId = sound.play();
    } else {
      sound.play();
    }
  }

  public stop(soundName: string) {
    const sound = this.sounds[soundName];
    if (sound) {
      sound.stop();
    }
    if (soundName === 'loop') {
      this.loopId = null;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);
    return this.isMuted;
  }

  public getMuteState() {
    return this.isMuted;
  }
}

export const soundManager = SoundManager.getInstance();
