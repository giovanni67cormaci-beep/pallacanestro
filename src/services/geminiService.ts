
import { GoogleGenAI } from "@google/genai";
import { ShotResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeShot(shot: ShotResult, playerName: string) {
  const prompt = `
    Sei un esperto allenatore di basket e fisico dello sport. 
    Analizza il seguente tiro effettuato da ${playerName}:
    - Distanza: ${shot.distance.toFixed(2)} metri
    - Angolazione: ${shot.angle.toFixed(1)} gradi
    - Potenza stimata: ${shot.power.toFixed(1)}
    - Risultato: ${shot.success ? "CANESTRO!" : "ERRORE"}

    Fornisci una breve spiegazione tecnica (max 3 frasi) in italiano che spieghi come la fisica e la tecnica hanno influenzato questo risultato. 
    Se è entrata, spiega perché la parabola era corretta. Se è uscita, suggerisci come correggere l'angolo o la potenza per la distanza indicata.
    Sii incoraggiante e istruttivo.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return result.text || "Ottimo sforzo! Continua a praticare per perfezionare la tua parabola.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Ottimo sforzo! Continua a praticare per perfezionare la tua parabola.";
  }
}

export async function answerQuestion(question: string, lastShots: ShotResult[]) {
  const prompt = `
    Sei un assistente virtuale per una piattaforma di basket educativa. 
    L'utente ha effettuato questi tiri recentemente: ${JSON.stringify(lastShots.slice(-3))}.
    Rispondi alla seguente domanda dello studente in modo chiaro e scientifico (fisica del basket), restando entro le 4 frasi:
    "${question}"
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return result.text || "Sto ancora analizzando i tuoi movimenti. Prova a chiedermi della parabola di tiro!";
  } catch (error) {
    return "Sto ancora analizzando i tuoi movimenti. Prova a chiedermi della parabola di tiro!";
  }
}
