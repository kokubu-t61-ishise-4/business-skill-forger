'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

function Skeleton() {
  return (
    <div className="card">
      <div className="skeleton skeleton-title" style={{ width: '40%' }}></div>
      <div className="skeleton" style={{ height: '100px', marginBottom: '1.5rem' }}></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text medium"></div>
      <div className="skeleton skeleton-text"></div>
      <div className="skeleton skeleton-text short"></div>
    </div>
  );
}

export default function MindsetPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const fetchMindset = async () => {
    setLoading(true);
    setError(null);
    setCheckedItems({});
    try {
      const res = await fetch('/api/mindset');
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMindset();
  }, []);

  const toggleCheck = (idx) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="container">
      <header className="header">
        <h1>🎯 マインドセット</h1>
        <Link href="/" className="back-link">← ホームに戻る</Link>
      </header>

      <button
        className="action-btn"
        onClick={fetchMindset}
        disabled={loading}
        style={{ background: '#10b981' }}
      >
        {loading ? '読み込み中...' : '新しいマインドセットを取得'}
      </button>

      {error && <div className="error-box">エラーが発生しました: {error}</div>}

      {loading && <Skeleton />}

      {!loading && data && (
        <div className="card">
          <h2 className="theme-title">{data.theme}</h2>

          <div className="quote-box">
            <p className="quote-text">「{data.quote}」</p>
            {data.author && (
              <p className="quote-author">— {data.author}</p>
            )}
          </div>

          <p className="content-description">{data.description}</p>

          <h3 className="section-title">今日のアクション</h3>
          <div className="action-box">{data.action}</div>

          <h3 className="section-title">今日のチェックリスト</h3>
          <ul className="checklist">
            {data.checklist?.map((item, idx) => (
              <li key={idx}>
                <input
                  type="checkbox"
                  id={`check-${idx}`}
                  checked={checkedItems[idx] || false}
                  onChange={() => toggleCheck(idx)}
                />
                <label
                  htmlFor={`check-${idx}`}
                  className={checkedItems[idx] ? 'checked' : ''}
                >
                  {item}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
