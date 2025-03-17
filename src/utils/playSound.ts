let audioContext: AudioContext | null = null; // Variabile globale per l'AudioContext

const playSound = (barHeight: number, intensity: number, isMuted: boolean) => {
  
    if (isMuted) {
        return; // Interrompi l'esecuzione se isMuted è true
    }

    try {
        // Inizializza l'AudioContext se non esiste ancora
        if (!audioContext) {
            audioContext = new (window.AudioContext)();
        }

        // Calcola la frequenza in base all'altezza della barra
        const frequency = 400 + (barHeight / 310) * 800;

        // Crea un oscillatore di tipo 'square'
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

        // Crea un nodo gain per controllare il volume
        const gainNode = audioContext.createGain();

        // Normalizza l'intensità (intensity) tra 0 e 1
        const normalizedIntensity = Math.min(1, Math.max(0, intensity / 100)); // Assumendo che intensity sia tra 0 e 100

        // Calcola il volume in base all'intensità
        const volume = 0.1 * normalizedIntensity; // Volume massimo di 0.1

        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(volume * 0.1, audioContext.currentTime + 0.1); // Decay proporzionale al volume

        // Collega l'oscillatore al gain e poi all'output
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Avvia e ferma l'oscillatore
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        console.error("Error playing sound:", error);
    }
};

export default playSound;