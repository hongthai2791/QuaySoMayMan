// Simple synthesizer for sound effects and music manager
class SoundManager {
  private ctx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private bgMusic: HTMLAudioElement | null = null;
  private currentMusicUrl: string = '';

  constructor() {
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.gainNode = this.ctx.createGain();
      this.gainNode.connect(this.ctx.destination);
      
      // Initialize background music element
      this.bgMusic = new Audio();
      this.bgMusic.loop = true;
    } catch (e) {
      console.error("Web Audio API not supported", e);
    }
  }

  private ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // --- Sound Effects (Web Audio API) ---

  public playTick(volume: number) {
    if (!this.ctx || !this.gainNode || volume <= 0) return;
    this.ensureContext();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.gainNode);
    
    // Short high pitched tick
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(volume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  public playWin(volume: number) {
    if (!this.ctx || !this.gainNode || volume <= 0) return;
    this.ensureContext();

    const now = this.ctx.currentTime;
    
    // Major chord arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      
      osc.connect(gain);
      gain.connect(this.gainNode!);
      
      osc.type = 'triangle';
      osc.frequency.value = freq;
      
      const startTime = now + (i * 0.1);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
      
      osc.start(startTime);
      osc.stop(startTime + 1);
    });
  }

  // --- Background Music (HTML5 Audio) ---

  public setMusic(url: string) {
    if (this.currentMusicUrl !== url) {
      this.currentMusicUrl = url;
      if (this.bgMusic) {
        this.bgMusic.src = url;
      }
    }
  }

  public playMusic(volume: number) {
    if (this.bgMusic && this.currentMusicUrl) {
      this.bgMusic.volume = volume;
      // Promise handling to avoid "play() failed because the user didn't interact" errors
      const playPromise = this.bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Auto-play prevented (user must interact first):", error);
        });
      }
    }
  }

  public pauseMusic() {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  public setMusicVolume(volume: number) {
    if (this.bgMusic) {
      this.bgMusic.volume = volume;
    }
  }
}

export const soundManager = new SoundManager();