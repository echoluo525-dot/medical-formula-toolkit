import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getClinicalExplanation = async (
  formulaName: string,
  inputs: Record<string, any>,
  result: string | number,
  unit?: string
): Promise<string> => {
  if (!apiKey) {
    return "AI服务不可用，请检查API密钥配置。";
  }

  try {
    const inputStr = Object.entries(inputs)
      .map(([key, val]) => `${key}: ${val}`)
      .join(', ');

    const prompt = `
      你是一位经验丰富的肿瘤科专家和高级临床顾问。
      
      背景:
      用户刚刚计算了 "${formulaName}"。
      输入参数: ${inputStr}
      计算结果: ${result} ${unit || ''}
      
      任务:
      请用**中文**对该结果提供简明扼要的临床解释。
      1. 解释该具体数值的临床意义（例如：正常、高风险、需要调整剂量等）。
      2. 如果是肿瘤科公式，请提及对化疗或预后的具体影响。
      3. 字数控制在150字以内。
      4. 使用专业的医学术语，但确保表达清晰易懂。
      
      免责声明: 请以“根据常规临床指南...”开头，且不要提供个人医疗建议。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "无法生成临床解释。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "暂时无法获取AI临床建议，请稍后再试。";
  }
};