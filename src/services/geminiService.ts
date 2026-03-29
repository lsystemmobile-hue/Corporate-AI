import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateCorporatePortrait(
  base64Image: string,
  options: {
    style: string;
    clothing: string;
    clothingColor: string;
    environment: string;
    pose: string;
    fidelity: 'Alta' | 'Máxima';
    hasTie: boolean;
    companyLogoBase64?: string;
  }
) {
  const { style, clothing, clothingColor, environment, pose, fidelity, hasTie } = options;
  
  const prompt = `
    Transform this person's photo into a professional corporate portrait.
    
    CRITICAL INSTRUCTION: 
    - The person's identity MUST be 100% identical to the original photo.
    - DO NOT alter facial features, bone structure, eye color, nose shape, or mouth.
    - KEEP all unique characteristics: moles, freckles, wrinkles, and skin texture.
    - The face must be EXACTLY the same as in the source image.
    - ONLY change the clothing, background, and lighting to a professional studio quality.
    
    Style: ${style}
    Clothing: ${clothing} in ${clothingColor} color${hasTie ? ' with a professional tie' : ' without a tie, open collar'}
    Environment: ${environment}
    Pose: ${pose === 'Original' ? 'Maintain the EXACT SAME pose, head orientation, and body posture as in the original photo.' : pose}
    Fidelity Level: ${fidelity === 'Máxima' ? 'STRICTEST possible adherence to original facial details. No beautification or smoothing.' : 'High professional quality.'}
    
    The final image MUST be a photorealistic, high-end professional corporate headshot.
    Use studio-quality lighting (softbox, Rembrandt lighting) and professional camera settings (shallow depth of field, sharp focus on eyes).
    ${pose === 'Original' ? '' : 'The composition should be a standard professional headshot (shoulders up, centered).'}
    The textures of the clothing and skin must look natural and high-resolution.
    ${options.companyLogoBase64 ? 'Subtly and professionally incorporate a company logo in the background or as a small, elegant pin on the lapel.' : ''}
  `;

  try {
    const parts: any[] = [
      {
        inlineData: {
          data: base64Image.split(',')[1] || base64Image,
          mimeType: 'image/png',
        },
      },
    ];

    if (options.companyLogoBase64) {
      parts.push({
        inlineData: {
          data: options.companyLogoBase64.split(',')[1] || options.companyLogoBase64,
          mimeType: 'image/png',
        },
      });
    }

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("A IA não retornou nenhum resultado. Tente novamente.");
    }

    if (candidate.finishReason === 'SAFETY') {
      throw new Error("A imagem foi bloqueada pelos filtros de segurança. Por favor, tente outra foto ou mude as configurações.");
    }

    const responseParts = candidate.content?.parts;
    if (responseParts) {
      for (const part of responseParts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }

    // Check if there's a text response explaining why it didn't generate an image
    if (response.text) {
      throw new Error(`A IA não gerou uma imagem. Resposta: ${response.text}`);
    }

    throw new Error("Não foi possível encontrar uma imagem na resposta da IA.");
  } catch (error) {
    console.error("Error generating portrait:", error);
    throw error;
  }
}
