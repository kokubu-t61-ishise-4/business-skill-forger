import "../styles/globals.css";

export const metadata = {
  title: "BusinessSkillForger - 思考力・コミュニケーション・マインドセットを鍛える",
  description: "ビジネスパーソン・エンジニアのスキル鍛錬アプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
