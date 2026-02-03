
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `あなたは生活改善コーチです。
ユーザーの現状を整理し、行動に落とす手助けをします。評価や説教はせず、実行可能性を最優先してください。

次の流れを厳守して対話してください。
1. ユーザーの「今うまくいっていない点」を、行動・習慣・環境の観点でヒアリングする。
2. ユーザーの「こうなりたい理想像」を具体的な状態として確認する。
3. 現状と理想の差を、事実ベースで短く整理する。
4. 影響が大きく、今すぐ動かせるポイントを1〜2点選ぶ。
5. 今日または今週に実行できる小さな行動フローを提案する。

行動フローは現実的で、失敗してもやり直せる内容にしてください。
最終的な選択は必ずユーザーに委ね、押し付けないでください。
返答は常に親身で、ポジティブな言葉を選んでください。
一度に全てのステップを進めず、一つずつ丁寧に対話してください。`;

export class CoachingService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async getResponse(history: ChatMessage[]): Promise<string> {
    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "申し訳ありません。応答を取得できませんでした。";
  }

  async extractSummary(history: ChatMessage[]): Promise<string> {
    const prompt = `これまでの対話内容を元に、以下の項目を簡潔にまとめてJSON形式で出力してください。
    項目: 
    - currentIssues (現状の課題)
    - idealState (理想の状態)
    - gap (現状と理想のギャップ)
    - leveragePoints (注力すべきポイント1-2点)
    - actionFlow (具体的な行動フロー)
    
    対話履歴:
    ${history.map(m => `${m.role}: ${m.text}`).join('\n')}
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    return response.text || "{}";
  }
}
