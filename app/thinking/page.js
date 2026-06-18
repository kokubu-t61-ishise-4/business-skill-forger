'use client';

import { useState } from 'react';
import Link from 'next/link';

const SUBTYPES = [
  { value: 'general', label: '単純思考力' },
  { value: 'business', label: 'ビジネス思考力' },
  { value: 'it', label: 'IT思考力' }
];

function Skeleton() {
  return (
    <div className="card">
      <div className="skeleton skeleton-title"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text medium"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
    </div>
  );
}

function InputContent({ data }) {
  if (!data) return null;
  return (
    <div className="card">
      <h2 className="content-title">{data.title}</h2>
      <span className="content-category">{data.category}</span>
      <p className="content-description">{data.description}</p>

      <h3 className="section-title">ステップ</h3>
      <ol className="steps-list">
        {data.steps?.map((step, idx) => (
          <li key={idx}>{step}</li>
        ))}
      </ol>

      <h3 className="section-title">具体例</h3>
      <div className="example-box">{data.example}</div>

      <h3 className="section-title">ポイント</h3>
      <div className="tip-box">{data.tip}</div>
    </div>
  );
}

function TrainingContent({ data, onSubmit, feedback, loading }) {
  const [answer, setAnswer] = useState('');

  if (!data) return null;

  const handleSubmit = () => {
    if (answer.trim()) {
      onSubmit(answer);
    }
  };

  const getScoreClass = (score) => {
    if (score >= 80) return 'score-high';
    if (score >= 60) return 'score-medium';
    return 'score-low';
  };

  return (
    <div>
      <div className="card">
        <span className="content-category">{data.category}</span>
        <h2 className="content-title" style={{ marginTop: '0.5rem' }}>お題</h2>
        <p className="content-description">{data.question}</p>

        <div className="hint-box">
          <strong>ヒント：</strong>{data.hint}
        </div>

        <h3 className="section-title">評価ポイント</h3>
        <ul className="points-list">
          {data.points?.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 className="section-title" style={{ marginTop: 0 }}>あなたの回答</h3>
        <div className="textarea-wrapper">
          <textarea
            className="textarea"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="ここに考えを入力してください..."
            disabled={loading}
          />
        </div>
        <button
          className="action-btn"
          onClick={handleSubmit}
          disabled={loading || !answer.trim()}
          style={{ marginBottom: 0 }}
        >
          {loading ? '評価中...' : 'AIに評価してもらう'}
        </button>
      </div>

      {feedback && (
        <div className="card">
          <div className="score-display">
            <div className={`score-number ${getScoreClass(feedback.score)}`}>
              {feedback.score}
            </div>
            <div className="score-label">/ 100点</div>
          </div>

          <p className="content-description">{feedback.summary}</p>

          <div className="feedback-section">
            <h4 className="feedback-title">良かった点</h4>
            <div className="feedback-good">
              <ul className="feedback-list">
                {feedback.good?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="feedback-section">
            <h4 className="feedback-title">改善点</h4>
            <div className="feedback-improve">
              <ul className="feedback-list">
                {feedback.improve?.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <h3 className="section-title">模範解答</h3>
          <div className="model-answer">{feedback.model_answer}</div>
        </div>
      )}
    </div>
  );
}

export default function ThinkingPage() {
  const [subtype, setSubtype] = useState('general');
  const [mode, setMode] = useState('input');
  const [data, setData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState(null);

  const fetchContent = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/thinking?type=${mode}&subtype=${subtype}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (answer) => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch('/api/thinking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: data.question,
          answer,
          subtype
        })
      });
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setFeedback(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setData(null);
    setFeedback(null);
    setError(null);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🧠 思考力トレーニング</h1>
        <Link href="/" className="back-link">← ホームに戻る</Link>
      </header>

      <div className="tabs">
        {SUBTYPES.map((st) => (
          <button
            key={st.value}
            className={`tab-btn ${subtype === st.value ? 'active' : ''}`}
            onClick={() => {
              setSubtype(st.value);
              setData(null);
              setFeedback(null);
            }}
            style={subtype === st.value ? { background: '#6366f1', borderColor: '#6366f1' } : {}}
          >
            {st.label}
          </button>
        ))}
      </div>

      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'input' ? 'active' : ''}`}
          onClick={() => handleModeChange('input')}
          style={mode === 'input' ? { background: '#6366f1', borderColor: '#6366f1' } : {}}
        >
          📚 インプット
        </button>
        <button
          className={`mode-btn ${mode === 'training' ? 'active' : ''}`}
          onClick={() => handleModeChange('training')}
          style={mode === 'training' ? { background: '#6366f1', borderColor: '#6366f1' } : {}}
        >
          💪 トレーニング
        </button>
      </div>

      <button
        className="action-btn"
        onClick={fetchContent}
        disabled={loading}
        style={{ background: '#6366f1' }}
      >
        {loading ? '読み込み中...' : mode === 'input' ? '新しいフレームワークを学ぶ' : 'お題を出す'}
      </button>

      {error && <div className="error-box">エラーが発生しました: {error}</div>}

      {loading && <Skeleton />}

      {!loading && mode === 'input' && <InputContent data={data} />}
      {!loading && mode === 'training' && (
        <TrainingContent
          data={data}
          onSubmit={submitAnswer}
          feedback={feedback}
          loading={evaluating}
        />
      )}
    </div>
  );
}
