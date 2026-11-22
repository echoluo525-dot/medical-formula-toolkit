import { GoogleGenAI } from '@google/genai';
import { getApiKey } from './aiKey';

export const AI_UNAVAILABLE_HINT = '未配置 API Key，AI 解读暂不可用。';

/**
 * 用访客自己的 Key 调 Gemini，对计算结果做一段临床语境解读。
 * Key 只从浏览器本地读取，不经过任何第三方服务器。
 */
export async function getClinicalExplanation(
  formulaName: string,
  formulaDescription: string,
  inputs: { label: string; value: unknown }[],
  result: string | number,
  unit?: string
): Promise<string> {
  const apiKey = getApiKey();
  if (!apiKey) return AI_UNAVAILABLE_HINT;

  const inputLines = inputs
    .map(item => `- ${item.label}: ${item.value}`)
    .join('\n');

  const prompt = `你是一位肿瘤科临床药师，正在帮医生复核一次公式计算。

公式: ${formulaName}
公式用途: ${formulaDescription}
输入参数:
${inputLines}
计算结果: ${result} ${unit ?? ''}

请用中文给出 3 句话以内的解读，要求：
1. 说明这个数值在临床上的含义（正常 / 偏高 / 需要调整剂量等），只基于上面给出的信息；
2. 指出一个使用时最容易出错的前提（例如体重选择、肾功能估算方式、单位换算）；
3. 不要给出具体用药医嘱，不要编造未提供的患者信息。

用「根据公式本身的计算逻辑」开头。`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text?.trim() || '模型没有返回内容，请重试。';
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/API key|API_KEY|permission|401|403/i.test(message)) {
      return 'API Key 无效或没有权限，请重新配置后重试。';
    }
    console.error('Gemini API 调用失败:', error);
    return '暂时无法获取 AI 解读，请稍后再试。';
  }
}
