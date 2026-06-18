import Link from 'next/link';

export default function Home() {
  return (
    <div className="container">
      <div className="home-header">
        <h1>BusinessSkillForger</h1>
        <p>思考力・コミュニケーション・マインドセットを鍛える</p>
      </div>

      <div className="home-grid">
        <div className="home-card">
          <div className="home-icon">🧠</div>
          <h2 className="home-title">思考力トレーニング</h2>
          <p className="home-desc">
            単純思考力・ビジネス思考力・IT思考力を鍛える
          </p>
          <Link href="/thinking" className="home-btn" style={{ background: '#6366f1' }}>
            トレーニングを始める
          </Link>
        </div>

        <div className="home-card">
          <div className="home-icon">💬</div>
          <h2 className="home-title">コミュニケーション道場</h2>
          <p className="home-desc">
            雑談・会議・質問力・ユーモアを実践形式で鍛える
          </p>
          <Link href="/communication" className="home-btn" style={{ background: '#f59e0b' }}>
            道場に入る
          </Link>
        </div>

        <div className="home-card">
          <div className="home-icon">🎯</div>
          <h2 className="home-title">マインドセット</h2>
          <p className="home-desc">
            成長するための考え方・習慣・今日のアクション
          </p>
          <Link href="/mindset" className="home-btn" style={{ background: '#10b981' }}>
            今日のマインドセット
          </Link>
        </div>
      </div>
    </div>
  );
}
