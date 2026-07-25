/**
 * Web Speech API wrapper for JARVIS text-to-speech and speech recognition
 */

export class SpeechEngine {
  public ttsEnabled: boolean = true;
  private synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  public isSpeaking: boolean = false;
  private onStateChangeCb: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voice list reloaded
      };
    }
  }

  public setOnStateChange(cb: (speaking: boolean) => void) {
    this.onStateChangeCb = cb;
  }

  public speak(text: string, onEnd?: () => void) {
    if (!this.ttsEnabled || !this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    // Clean text of any accidental formatting
    const cleanedText = text
      .replace(/[\*\_~`]/g, '') // remove markdown symbols
      .replace(/https?:\/\/\S+/g, 'link')
      .trim();

    if (!cleanedText) {
      if (onEnd) onEnd();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 1.05; // Sophisticated, articulate velocity
    utterance.pitch = 0.95; // Slightly lower, calm tone

    const voices = this.synth.getVoices();
    // Prefer articulate British or Natural English voice if available
    const preferredVoice = voices.find(v => 
      (v.lang.includes('en-GB') || v.lang.includes('en-US')) && 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Male'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChangeCb) this.onStateChangeCb(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (this.onStateChangeCb) this.onStateChangeCb(false);
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (this.onStateChangeCb) this.onStateChangeCb(false);
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis speak error:', e);
      this.isSpeaking = false;
      if (this.onStateChangeCb) this.onStateChangeCb(false);
      if (onEnd) onEnd();
    }
  }

  public stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {
        console.warn('Speech synthesis cancel error:', e);
      }
    }
    this.isSpeaking = false;
    if (this.onStateChangeCb) this.onStateChangeCb(false);
  }
}

export const speechEngine = new SpeechEngine();
