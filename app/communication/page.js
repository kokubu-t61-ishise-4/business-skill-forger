'use client';

import { useState } from 'react';
import Link from 'next/link';

const SUBTYPES = [
  { value: 'chat', label: '雑談' },
  { value: 'meeting', label: '会議での発言' },
  { value: 'question', label: '質問力' },
  { value: 'humor', label: 'ユーモア' }
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

      <h3 className="section-title">例文</h3>
      <ul className="examples-list">
        {data.examples?.map((ex, idx) => (
          <li key={idx}>{ex}</li>
        ))}
      </ul>

      <h3 className="section-title">やるべきこと</h3>
      <ul className="do-list">
        {data.do?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>

      <h3 className="section-title">やってはいけないこと</h3>
      <ul className="dont-list">
        {data.dont?.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TrainingContent({ data, onSubmit, feedback, loading }) {
  const [reply, setReply] = useState('');

  if (!data) return null;

  const handleSubmit = () => {
    if (reply.trim()) {
      onSubmit(reply);
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
        <div className="scenario-box" style={{ marginTop: '1rem' }}>
          <strong>状況：</strong>{data.scenario}
        </div>

        <h3 className="section-title">AIからの話しかけ</h3>
        <div className="chat-bubble ai">
          {data.ai_message}
        </div>

        <h3 className="section-title">良い返答のポイント</h3>
        <ul className="points-list">
          {data.points?.map((point, idx) => (
            <li key={idx}>{point}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 className="section-title" style={{ marginTop: 0 }}>あなたの返答</h3>
        <div className="textarea-wrapper">
          <textarea
            className="textarea"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="返答を入力してください..."
            disabled={loading}
          />
        </div>
        <button
          className="action-btn"
          onClick={handleSubmit}
          disabled={loading || !reply.trim()}
          style={{ marginBottom: 0, background: '#f59e0b' }}
        >
          {loading ? '評価中...' : '送信して評価'}
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

          <h3 className="section-title">より良い返答の例</h3>
          <div className="chat-bubble" style={{ background: '#dcfce7', maxWidth: '100%' }}>
            {feedback.better_reply}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunicationPage() {
  const [subtype, setSubtype] = useState('chat');
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
      const res = await fetch(`/api/communication?type=${mode}&subtype=${subtype}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitReply = async (reply) => {
    setEvaluating(true);
    setError(null);
    try {
      const res = await fetch('/api/communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ai_message: data.ai_message,
          user_reply: reply,
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
        <h1>💬 コミュニケーション道場</h1>
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
            style={subtype === st.value ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}
          >
            {st.label}
          </button>
        ))}
      </div>

      <div className="mode-toggle">
        <button
          className={`mode-btn ${mode === 'input' ? 'active' : ''}`}
          onClick={() => handleModeChange('input')}
          style={mode === 'input' ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}
        >
          📚 インプット
        </button>
        <button
          className={`mode-btn ${mode === 'training' ? 'active' : ''}`}
          onClick={() => handleModeChange('training')}
          style={mode === 'training' ? { background: '#f59e0b', borderColor: '#f59e0b' } : {}}
        >
          💪 トレーニング
        </button>
      </div>

      <button
        className="action-btn"
        onClick={fetchContent}
        disabled={loading}
        style={{ background: '#f59e0b' }}
      >
        {loading ? '読み込み中...' : mode === 'input' ? 'テクニックを学ぶ' : 'シナリオ開始'}
      </button>

      {error && <div className="error-box">エラーが発生しました: {error}</div>}

      {loading && <Skeleton />}

      {!loading && mode === 'input' && <InputContent data={data} />}
      {!loading && mode === 'training' && (
        <TrainingContent
          data={data}
          onSubmit={submitReply}
          feedback={feedback}
          loading={evaluating}
        />
      )}
    </div>
  );
}
