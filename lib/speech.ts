// Web Speech API wrapper for browser use only
// This module should only be imported in "use client" components

export type SpeechRecognitionResult = {
  transcript: string;
  confidence: number;
};

export function isSpeechSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)
  );
}

export function isTtsSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function createSpeechRecognition(
  onResult: (result: SpeechRecognitionResult) => void,
  onError: (error: string) => void,
  onEnd: () => void
): SpeechRecognition | null {
  const SpeechRecognition =
    (window as unknown as Record<string, unknown>).SpeechRecognition ||
    (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

  if (!SpeechRecognition || typeof SpeechRecognition !== "function") {
    onError("SpeechRecognition is not supported in this browser.");
    return null;
  }

  const recognition = new (SpeechRecognition as new () => SpeechRecognition)();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const result = event.results[0][0];
    onResult({
      transcript: result.transcript,
      confidence: result.confidence,
    });
  };

  recognition.onerror = (event: Event) => {
    const errorEvent = event as SpeechRecognitionErrorEvent;
    onError(errorEvent.error);
  };

  recognition.onend = onEnd;

  return recognition;
}

export async function speakText(text: string): Promise<void> {
  if (!isTtsSupported()) return;

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Load voices if needed
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const englishVoice =
        voices.find(
          (v) => v.lang.startsWith("en") && v.name.includes("Google")
        ) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    };

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.getVoices().length > 0) {
      setVoice();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoice();
      };
    }
  });
}

export function stopSpeaking(): void {
  if (isTtsSupported()) {
    window.speechSynthesis.cancel();
  }
}
