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
    utterance.pitch = 1.15; // Pleasant, articulate feminine pitch tone

    const voices = this.synth.getVoices();
    
    // Explicit list of known female voice names across OS/browsers
    const femaleVoiceKeywords = [
      'female', 'samantha', 'victoria', 'karen', 'zira', 'moira', 'fiona', 'kate', 
      'serena', 'ava', 'allison', 'aria', 'jenny', 'ana', 'sonia', 'mia', 'emma', 
      'siri', 'cortana', 'google uk english female', 'google us english', 'susan', 'veena'
    ];

    const maleVoiceKeywords = [
      'male', 'daniel', 'oliver', 'david', 'george', 'james', 'guy', 'stefan', 
      'alex', 'fred', 'arthur', 'tom', 'microsoft mark'
    ];

    // 1. Try to find an English voice matching female keywords
    let preferredVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const isEnglish = v.lang.startsWith('en');
      const isFemale = femaleVoiceKeywords.some(kw => name.includes(kw));
      const isMale = maleVoiceKeywords.some(kw => name.includes(kw));
      return isEnglish && isFemale && !isMale;
    });

    // 2. If not found, find any English voice that does not explicitly match male keywords
    if (!preferredVoice) {
      preferredVoice = voices.find(v => {
        const name = v.name.toLowerCase();
        const isEnglish = v.lang.startsWith('en');
        const isMale = maleVoiceKeywords.some(kw => name.includes(kw));
        return isEnglish && !isMale;
      });
    }

    // 3. Fallback to any English voice or first available voice
    if (!preferredVoice) {
      preferredVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
    }

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
