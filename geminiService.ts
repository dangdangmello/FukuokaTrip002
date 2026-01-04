
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ItineraryItem } from "../types";

// 定義 AI 可以呼叫的函數
export const itineraryTools: FunctionDeclaration[] = [
  {
    name: 'add_itinerary_item',
    description: '在特定日期的行程中新增一個項目。',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dayIndex: { type: Type.INTEGER, description: '日期的索引（0 是第一天，1 是第二天...）' },
        name: { type: Type.STRING, description: '行程名稱' },
        category: { type: Type.STRING, description: '分類（航班、景點、美食、交通、住宿、購物、其他）' },
        startTime: { type: Type.STRING, description: '開始時間 (HH:mm)' },
        endTime: { type: Type.STRING, description: '結束時間 (HH:mm)' },
        notes: { type: Type.STRING, description: '備註內容' },
        openingHours: { type: Type.STRING, description: '營業時間資訊' },
        bookingLink: { type: Type.STRING, description: '預約官網連結' },
        lat: { type: Type.NUMBER, description: '緯度 (選填)' },
        lng: { type: Type.NUMBER, description: '經度 (選填)' }
      },
      required: ['dayIndex', 'name', 'category', 'startTime', 'endTime']
    }
  },
  {
    name: 'update_itinerary_item',
    description: '修改現有的行程項目。',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dayIndex: { type: Type.INTEGER, description: '日期的索引' },
        itemId: { type: Type.STRING, description: '行程項目的 ID' },
        updates: {
          type: Type.OBJECT,
          description: '要更新的欄位',
          properties: {
            name: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
            category: { type: Type.STRING },
            notes: { type: Type.STRING },
            openingHours: { type: Type.STRING },
            bookingLink: { type: Type.STRING }
          }
        }
      },
      required: ['dayIndex', 'itemId', 'updates']
    }
  },
  {
    name: 'delete_itinerary_item',
    description: '刪除特定行程項目。',
    parameters: {
      type: Type.OBJECT,
      properties: {
        dayIndex: { type: Type.INTEGER, description: '日期的索引' },
        itemId: { type: Type.STRING, description: '行程項目的 ID' }
      },
      required: ['dayIndex', 'itemId']
    }
  }
];

export const getTravelTip = async (itineraryName: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a quick, fun travel tip (under 50 words) in Traditional Chinese for someone visiting "${itineraryName}" in Fukuoka. Focus on hidden gems or local customs.`,
    });
    return response.text;
  } catch (error) {
    return "記得多喝水，享受福岡的美食！";
  }
};

export const optimizeFullDayItinerary = async (items: ItineraryItem[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // 使用 Pro 模型處理複雜邏輯
      contents: `你是一位資深旅遊導遊。請根據以下行程資料，考慮地理位置（經緯度）、營業時間與合理的用餐/交通時間，提供一個更流暢的排序建議：
      
      行程內容：${JSON.stringify(items)}
      
      請確保：
      1. 如果某地點有 openingHours，請確保建議時間在其範圍內。
      2. 鄰近的地點應該盡量排在一起。
      3. 回傳格式必須為 JSON。
      4. 即使不需要變動順序，也可以微調 startTime。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING, description: '優化的理由與邏輯描述 (繁體中文)' },
            optimizedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  transportDetail: { type: Type.STRING, description: '更新後的交通建議' }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("AI Optimization Error:", error);
    return null;
  }
};

export const getChatResponse = async (history: any[], currentItinerary: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: history,
    config: {
      systemInstruction: `你是一位福岡旅遊專家，同時也是使用者的行程管理助理。
      
      目前的完整行程如下：
      ${JSON.stringify(currentItinerary)}
      
      你的權限：
      1. 你可以回答關於福岡旅遊的問題。
      2. 你可以呼叫 add_itinerary_item 來增加行程。
      3. 你可以呼叫 update_itinerary_item 來修改行程（如調整時間、增加營業時間、更新筆記或連結）。
      4. 你可以呼叫 delete_itinerary_item 來刪除行程。
      
      重要規則：
      - 請用繁體中文回答。
      - 如果使用者要求更改行程，請呼叫對應的工具，執行完畢後再給予友好的回覆。
      - 行程分類必須是以下之一：航班、景點、美食、交通、住宿、購物、其他。
      - 時間格式一律為 HH:mm。`,
      tools: [{ functionDeclarations: itineraryTools }]
    },
  });
  
  return response;
};
