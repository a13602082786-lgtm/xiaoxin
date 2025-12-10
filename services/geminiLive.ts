import {
  GoogleGenAI,
  LiveServerMessage,
  Modality,
  Type,
  FunctionDeclaration,
} from "@google/genai";

// Tool Definition to control particles
const particleControlTool: FunctionDeclaration = {
  name: 'updateParticleState',
  description: 'Update the particle system expansion based on user hand gestures.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      expansion: {
        type: Type.NUMBER,
        description: '0.0 represents closed hands or small scale. 1.0 represents open arms or large scale.',
      },
    },
    required: ['expansion'],
  },
};

export const connectToGemini = async (
  apiKey: string,
  onExpansionUpdate: (val: number) => void,
  onStatusChange: (connected: boolean) => void
) => {
  const ai = new GoogleGenAI({ apiKey });

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks: {
      onopen: () => {
        console.log("Gemini Live Connected");
        onStatusChange(true);
      },
      onmessage: (message: LiveServerMessage) => {
        // Handle Tool Calls (The primary control mechanism)
        if (message.toolCall) {
            for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'updateParticleState') {
                    const expansion = fc.args['expansion'] as number;
                    // Smooth checking
                    if (typeof expansion === 'number') {
                        onExpansionUpdate(expansion);
                    }

                    // Must respond to tool calls
                     sessionPromise.then((session) => {
                        session.sendToolResponse({
                          functionResponses: {
                            id : fc.id,
                            name: fc.name,
                            response: { result: "ok" },
                          }
                        })
                      });
                }
            }
        }
      },
      onclose: () => {
        console.log("Gemini Live Closed");
        onStatusChange(false);
      },
      onerror: (e) => {
        console.error("Gemini Live Error", e);
        onStatusChange(false);
      }
    },
    config: {
      responseModalities: [Modality.AUDIO], // Audio is required by the API structure even if we focus on tools
      systemInstruction: `
        You are a Vision Controller for a 3D Particle Art installation.
        Your task is to analyze the video stream of the user.
        
        1. Look for the user's hands.
        2. If the user's hands are CLOSE TOGETHER or CLOSED, the 'expansion' value is near 0.1.
        3. If the user's hands are FAR APART or OPEN, the 'expansion' value is near 1.0.
        4. If you see no hands, default to 0.5.
        5. Continuously call the 'updateParticleState' function with the calculated 'expansion' value.
        6. Do not speak. Only use the tool.
      `,
      tools: [{ functionDeclarations: [particleControlTool] }],
    },
  });

  return sessionPromise;
};
