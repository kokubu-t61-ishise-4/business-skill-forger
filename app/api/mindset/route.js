import { NextResponse } from 'next/server';

async function callGroq(prompt) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }
  return response.json();
}

function parseJsonResponse(content) {
  let jsonText = content.trim();
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(jsonText);
}

export async function GET() {
  try {
    const prompt = `あなたはビジネス成長を支援するメンターです。
エンジニアやビジネスパーソンの成長に役立つマインドセットを1つ提供してください。
思考力・コミュニケーション・継続・挑戦・自己成長などのテーマからランダムに選んでください。

以下のJSON形式のみで返してください：
{
  "theme": "テーマ名",
  "quote": "名言または核心となる一文",
  "author": "名言の出典または著者（なければ空文字）",
  "description": "このマインドセットの意味と重要性（3〜4文）",
  "action": "今日からできる具体的なアクション（2〜3文）",
  "checklist": ["今日確認すべき項目1", "今日確認すべき項目2", "今日確認すべき項目3"]
}`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseJsonResponse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Mindset API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
