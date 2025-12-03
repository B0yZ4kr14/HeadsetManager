import OpenAI from "openai";

export interface AIAnalysisRequest {
  logs: string[];
  deviceInfo?: {
    manufacturer?: string;
    driver?: string;
    label?: string;
  };
  errorContext?: string;
}

export interface AIAnalysisResponse {
  diagnosis: string;
  suggestedActions: string[];
  severity: "low" | "medium" | "high" | "critical";
  confidence: number;
}

/**
 * Analisa logs de sistema usando OpenAI para fornecer diagnóstico inteligente
 */
export async function analyzeLogsWithAI(
  apiKey: string,
  request: AIAnalysisRequest
): Promise<AIAnalysisResponse> {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API Key da OpenAI não configurada");
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Você é um especialista em diagnóstico de problemas de áudio USB em sistemas Linux.
Analise os logs fornecidos e identifique problemas relacionados a:
- Drivers de áudio USB (snd-usb-audio)
- PulseAudio e ALSA
- Dispositivos USB desconectando ou com falhas
- Problemas de latência ou qualidade de áudio
- Configurações incorretas

Forneça:
1. Um diagnóstico claro e técnico
2. Ações sugeridas (comandos ou configurações)
3. Nível de severidade (low, medium, high, critical)
4. Nível de confiança (0-100%)

Responda SEMPRE em português brasileiro e em formato JSON válido.`;

  const userPrompt = `
**Logs do Sistema:**
${request.logs.join("\n")}

${
  request.deviceInfo
    ? `**Informações do Dispositivo:**
- Fabricante: ${request.deviceInfo.manufacturer || "Desconhecido"}
- Driver: ${request.deviceInfo.driver || "Desconhecido"}
- Label: ${request.deviceInfo.label || "Desconhecido"}`
    : ""
}

${
  request.errorContext
    ? `**Contexto do Erro:**
${request.errorContext}`
    : ""
}

Analise esses logs e forneça um diagnóstico detalhado.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      throw new Error("Resposta vazia da API da OpenAI");
    }

    const parsed = JSON.parse(responseText);

    return {
      diagnosis:
        parsed.diagnosis || parsed.diagnostico || "Diagnóstico não disponível",
      suggestedActions: parsed.suggestedActions || parsed.acoesSugeridas || [],
      severity: parsed.severity || parsed.severidade || "medium",
      confidence: parsed.confidence || parsed.confianca || 50,
    };
  } catch (error: any) {
    console.error("[OpenAI] Erro ao analisar logs:", error);
    throw new Error(`Falha na análise de IA: ${error.message}`);
  }
}

/**
 * Gera sugestões de troubleshooting baseadas em sintomas
 */
export async function suggestTroubleshooting(
  apiKey: string,
  symptoms: string
): Promise<string[]> {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error("API Key da OpenAI não configurada");
  }

  const openai = new OpenAI({ apiKey });

  const systemPrompt = `Você é um assistente técnico especializado em headsets USB e áudio em Linux.
Sugira scripts de troubleshooting específicos baseados nos sintomas relatados.
Retorne APENAS uma lista JSON de comandos shell seguros para executar.`;

  const userPrompt = `Sintomas: ${symptoms}

Sugira comandos de diagnóstico seguros (sem sudo) que podem ajudar a identificar o problema.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 500,
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return [];
    }

    const parsed = JSON.parse(responseText);
    return parsed.commands || parsed.comandos || [];
  } catch (error: any) {
    console.error("[OpenAI] Erro ao sugerir troubleshooting:", error);
    return [];
  }
}
