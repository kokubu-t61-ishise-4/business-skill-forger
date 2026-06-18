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

const SUBTYPE_LABELS = {
  general: '単純思考力',
  business: 'ビジネス思考力',
  it: 'IT的思考力'
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'input';
    const subtype = searchParams.get('subtype') || 'general';
    const subtypeLabel = SUBTYPE_LABELS[subtype] || '単純思考力';

    let prompt;
    if (type === 'input') {
      prompt = `あなたはビジネス思考力の専門コーチです。
以下のカテゴリの思考力フレームワークを1つ選び、解説してください。
カテゴリ：${subtypeLabel}（general=単純思考力、business=ビジネス思考力、it=IT的思考力）

以下のJSON形式のみで返してください：
{
  "title": "フレームワーク名",
  "category": "カテゴリ名",
  "description": "3〜4文の概要説明",
  "steps": ["ステップ1", "ステップ2", "ステップ3"],
  "example": "具体的なビジネスシーンでの使用例（3〜4文）",
  "tip": "実践するうえでの重要なポイント（1〜2文）"
}`;
    } else {
      prompt = `あなたはビジネス思考力の専門コーチです。
以下のカテゴリのお題を1つ出してください。
カテゴリ：${subtypeLabel}

以下のJSON形式のみで返してください：
{
  "question": "思考力を鍛えるお題（具体的なシナリオ形式で）",
  "category": "カテゴリ名",
  "hint": "考えるためのヒント（1〜2文）",
  "points": ["評価ポイント1", "評価ポイント2", "評価ポイント3"]
}`;
    }

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseJsonResponse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Thinking API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { question, answer, subtype } = body;
    const subtypeLabel = SUBTYPE_LABELS[subtype] || '単純思考力';

    const prompt = `あなたはビジネス思考力の専門コーチです。
以下のお題に対するユーザーの回答を評価してフィードバックしてください。

お題：${question}
回答：${answer}
カテゴリ：${subtypeLabel}

以下のJSON形式のみで返してください：
{
  "score": 1〜100の数値,
  "summary": "全体的な評価（2〜3文）",
  "good": ["良かった点1", "良かった点2"],
  "improve": ["改善点1", "改善点2"],
  "model_answer": "模範解答（3〜4文）"
}`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseJsonResponse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Thinking API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
