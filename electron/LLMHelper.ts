import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"
import fs from "fs"

export class LLMHelper {
  private model: GenerativeModel
  private readonly systemPrompt = `あなたは職場環境セキュリティ分析AIです。提供された内容から具体的な言葉・表現・状況を特定し、それらに特化したハラスメント・職場環境セキュリティ分析を行います。必ず入力内容の特定部分を引用・参照して分析してください。回答は以下の3つの要素で構成し、各項目で具体的な内容に言及してください：
1. 状況分析（具体的な言葉・表現・状況を引用して分析・1文）
2. フィードバック（特定された内容への直接的な評価・1文）  
3. 改善点（引用した具体例に基づく具体的な改善提案・1文）`

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey)
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  }

  private async fileToGenerativePart(imagePath: string) {
    const imageData = await fs.promises.readFile(imagePath)
    return {
      inlineData: {
        data: imageData.toString("base64"),
        mimeType: "image/png"
      }
    }
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code block syntax if present
    text = text.replace(/^```(?:json)?\n/, '').replace(/\n```$/, '');
    // Remove any leading/trailing whitespace
    text = text.trim();
    return text;
  }

  public async extractProblemFromImages(imagePaths: string[]) {
    try {
      const imageParts = await Promise.all(imagePaths.map(path => this.fileToGenerativePart(path)))
      
      const prompt = `${this.systemPrompt}

画像内容をハラスメント・職場環境セキュリティの観点から分析し、以下のJSON形式で簡潔に回答してください：

{
  "problem_statement": "状況分析（1文）",
  "context": "フィードバック（1文）",
  "suggested_responses": ["改善点（1文）"],
  "reasoning": "総合評価（1文）"
}

重要：各項目は1文のみで簡潔にまとめてください。`

      const result = await this.model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const text = this.cleanJsonResponse(response.text())
      return JSON.parse(text)
    } catch (error) {
      console.error("Error extracting problem from images:", error)
      throw error
    }
  }

  public async generateSolution(problemInfo: any) {
    const prompt = `${this.systemPrompt}

以下の職場コミュニケーション問題を分析し、簡潔なJSON形式で回答してください：
${JSON.stringify(problemInfo, null, 2)}

{
  "solution": {
    "code": "改善案（1文）",
    "problem_statement": "状況分析（1文）",
    "context": "フィードバック（1文）",
    "suggested_responses": ["改善点（1文）"],
    "reasoning": "総合評価（1文）"
  }
}

重要：各項目は1文のみで簡潔にまとめてください。`

    console.log("[LLMHelper] Calling Gemini LLM for solution...");
    try {
      const result = await this.model.generateContent(prompt)
      console.log("[LLMHelper] Gemini LLM returned result.");
      const response = await result.response
      const text = this.cleanJsonResponse(response.text())
      const parsed = JSON.parse(text)
      console.log("[LLMHelper] Parsed LLM response:", parsed)
      return parsed
    } catch (error) {
      console.error("[LLMHelper] Error in generateSolution:", error);
      throw error;
    }
  }

  public async debugSolutionWithImages(problemInfo: any, currentCode: string, debugImagePaths: string[]) {
    try {
      const imageParts = await Promise.all(debugImagePaths.map(path => this.fileToGenerativePart(path)))
      
      const prompt = `${this.systemPrompt}

追加画像を含む詳細分析を行い、簡潔なJSON形式で回答してください：
元の問題: ${JSON.stringify(problemInfo, null, 2)}
現在の対応: ${currentCode}

{
  "solution": {
    "code": "改善された対処法（1文）",
    "problem_statement": "詳細状況分析（1文）",
    "context": "フィードバック（1文）",
    "suggested_responses": ["改善点（1文）"],
    "reasoning": "総合評価（1文）"
  }
}

重要：各項目は1文のみで簡潔にまとめてください。`

      const result = await this.model.generateContent([prompt, ...imageParts])
      const response = await result.response
      const text = this.cleanJsonResponse(response.text())
      const parsed = JSON.parse(text)
      console.log("[LLMHelper] Parsed debug LLM response:", parsed)
      return parsed
    } catch (error) {
      console.error("Error debugging solution with images:", error)
      throw error
    }
  }

  public async analyzeAudioFile(audioPath: string) {
    try {
      const audioData = await fs.promises.readFile(audioPath);
      const audioPart = {
        inlineData: {
          data: audioData.toString("base64"),
          mimeType: "audio/mp3"
        }
      };
      const prompt = `${this.systemPrompt}

音声内容をハラスメント・職場環境セキュリティの観点から分析し、以下の形式で簡潔に回答してください：

**状況分析：**（1文）

**フィードバック：**（1文）

**改善点：**（1文）`;
      const result = await this.model.generateContent([prompt, audioPart]);
      const response = await result.response;
      const text = response.text();
      return { text, timestamp: Date.now() };
    } catch (error) {
      console.error("Error analyzing audio file:", error);
      throw error;
    }
  }

  public async analyzeAudioFromBase64(data: string, mimeType: string) {
    try {
      const audioPart = {
        inlineData: {
          data,
          mimeType
        }
      };
      const prompt = `${this.systemPrompt}

音声内容をハラスメント・職場環境セキュリティの観点から分析し、以下の形式で簡潔に回答してください：

**状況分析：**（1文）

**フィードバック：**（1文）

**改善点：**（1文）`;
      const result = await this.model.generateContent([prompt, audioPart]);
      const response = await result.response;
      const text = response.text();
      return { text, timestamp: Date.now() };
    } catch (error) {
      console.error("Error analyzing audio from base64:", error);
      throw error;
    }
  }

  public async analyzeImageFile(imagePath: string) {
    try {
      const imageData = await fs.promises.readFile(imagePath);
      const imagePart = {
        inlineData: {
          data: imageData.toString("base64"),
          mimeType: "image/png"
        }
      };
      const prompt = `${this.systemPrompt}

画像内容をハラスメント・職場環境セキュリティの観点から分析し、以下の形式で簡潔に回答してください：

**状況分析：**（1文）

**フィードバック：**（1文）

**改善点：**（1文）`;
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      return { text, timestamp: Date.now() };
    } catch (error) {
      console.error("Error analyzing image file:", error);
      throw error;
    }
  }
} 