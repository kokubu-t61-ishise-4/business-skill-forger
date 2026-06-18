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
  chat: '雑談',
  meeting: '会議での発言',
  question: '質問力',
  humor: 'ユーモア'
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'input';
    const subtype = searchParams.get('subtype') || 'chat';
    const subtypeLabel = SUBTYPE_LABELS[subtype] || '雑談';

    let prompt;
    if (type === 'input') {
      prompt = `あなたはコミュニケーションの専門コーチです。
以下のカテゴリのテクニックを1つ解説してください。
カテゴリ：${subtypeLabel}（chat=雑談、meeting=会議での発言、question=質問力、humor=ユーモア）

以下のJSON形式のみで返してください：
{
  "title": "テクニック名",
  "category": "カテゴリ名",
  "description": "3〜4文の説明",
  "examples": ["例文1", "例文2", "例文3"],
  "do": ["やるべきこと1", "やるべきこと2"],
  "dont": ["やってはいけないこと1", "やってはいけないこと2"]
}`;
    } else {
      prompt = `あなたはコミュニケーションの専門コーチです。
以下のシナリオを1つ作成してください。
カテゴリ：${subtypeLabel}

AIが話しかける形式で、ユーザーが返答を考えるシナリオを作ってください。

以下のJSON形式のみで返してください：
{
  "scenario": "状況説明（2〜3文）",
  "ai_message": "AIからの話しかけ（自然な日本語で）",
  "category": "カテゴリ名",
  "points": ["良い返答のポイント1", "良い返答のポイント2"]
}`;
    }

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseJsonResponse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Communication API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { ai_message, user_reply, subtype } = body;
    const subtypeLabel = SUBTYPE_LABELS[subtype] || '雑談';

    const prompt = `あなたはコミュニケーションの専門コーチです。
以下の会話に対するユーザーの返答を評価してください。

AIの発言：${ai_message}
ユーザーの返答：${user_reply}
カテゴリ：${subtypeLabel}

以下のJSON形式のみで返してください：
{
  "score": 1〜100の数値,
  "summary": "全体評価（2〜3文）",
  "good": ["良かった点1", "良かった点2"],
  "improve": ["改善点1", "改善点2"],
  "better_reply": "より良い返答の例（自然な日本語で）"
}`;

    const groqResponse = await callGroq(prompt);
    const content = groqResponse.choices[0].message.content;
    const data = parseJsonResponse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Communication API POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
