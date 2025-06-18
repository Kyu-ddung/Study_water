// src/pages/Home.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import '../styles/Home.css';
import quizData from '../data/quizData';

const Home = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('quizHistory') || '[]'));
  const [difficulty, setDifficulty] = useState('normal');
  const [questions, setQuestions] = useState([]);
  const [dailyInfo, setDailyInfo] = useState(null);
  const [usageData, setUsageData] = useState([]);
  const quizRef = useRef();

  // 서버 측 프록시(Express)에서 API 데이터를 받아옵니다
  useEffect(() => {
  fetch('http://localhost:4000/water?pageNo=1&numOfRows=5&startYear=2012&endYear=2014')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        const items = data.items || [];
        setUsageData(items);
        if (items.length > 0) {
          const { ogrnNm, useNm, usage } = items[0];
          setDailyInfo({
            date: new Date().toLocaleDateString('ko-KR'),
            message: `${ogrnNm} - ${useNm} (총 사용량: ${usage || '정보 없음'})`,
          });
        }
      })
      .catch(err => {
        console.error('API 호출 실패', err);
        setDailyInfo({
          date: new Date().toLocaleDateString('ko-KR'),
          message: '지구 물 중 사용 가능한 양은 0.3%입니다.',
        });
      });
  }, []);

  // 그래프 데이터 변환
  const chartData = usageData.map(item => ({
    name: `${item.ogrnNm}-${item.useNm}`,
    usage: parseFloat((item.usage || '').replace(/[^0-9.]/g, '')) || 0,
  }));

  // 퀴즈 시작
  const handleStartQuiz = () => {
    setQuestions(quizData[difficulty]);
    setShowQuiz(true);
    setCurrentQ(0);
    setScore(0);
    setShowResult(false);
    setTimeLeft(10);
    setTimeout(() => quizRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // 답변 처리
  const handleAnswer = option => {
    if (option === questions[currentQ]?.answer) setScore(prev => prev + 1);
    if (currentQ + 1 < questions.length) {
      setCurrentQ(prev => prev + 1);
      setTimeLeft(10);
    } else {
      const finalScore = score + (option === questions[currentQ]?.answer ? 1 : 0);
      setShowResult(true);
      const record = { date: new Date().toLocaleString('ko-KR'), score: finalScore, difficulty };
      const updated = [...history, record];
      localStorage.setItem('quizHistory', JSON.stringify(updated));
      setHistory(updated);
    }
  };

  // 타이머
  useEffect(() => {
    if (!showQuiz || showResult) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev === 1 ? (handleAnswer(null), 10) : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQ, showQuiz, showResult]);

  // 배지 결정
  const getBadge = () => {
    const pct = questions.length ? (score / questions.length) * 100 : 0;
    if (pct >= 80) return { label: '🏅 물박사 배지!', img: '/badges/master.png' };
    if (pct >= 60) return { label: '✅ 물친구 배지!', img: '/badges/friend.png' };
    return { label: '🧩 다음엔 더 잘해보자!', img: '/badges/challenge.png' };
  };
  const badge = getBadge();

  return (
    <div className="home-container">
      {/* Hero */}
      <section className="hero-section modern-hero">
        <div className="hero-content">
          <h1><span className="highlight">WaterSchool</span>에 오신 걸 환영합니다!</h1>
          <p>물에 대해 배우고 퀴즈로 확인해보세요!</p>
          <div className="difficulty-select">
            <label>난이도:</label>
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)}>
              <option value="easy">쉬움</option>
              <option value="normal">보통</option>
              <option value="hard">어려움</option>
            </select>
          </div>
          <button className="quiz-start-btn" onClick={handleStartQuiz}>🧠 퀴즈 풀기</button>
        </div>
      </section>

      {/* 학습 섹션 */}
      <section className="learning-section">
        <h2>📘 물에 대해 배워봐요!</h2>
        <div className="cards">
          <div className="card"><h3>🌧️ 물의 순환</h3><p>증발→응결→강수→침투 과정을 알아보세요.</p></div>
          <div className="card"><h3>💧 지하수</h3><p>땅속에 저장된 물의 비밀을 배워봐요.</p></div>
          <div className="card"><h3>❄️ 빙하</h3><p>지구의 얼어붙은 물, 빙하에 대해 알아봅시다.</p></div>
        </div>
        <div className="video-box">
          <h3>🎥 물 순환 영상 보기</h3>
          <div className="video-wrapper" onMouseEnter={e => { const f = e.currentTarget.querySelector('iframe'); f.src += '&autoplay=1'; }} onMouseLeave={e => { const f = e.currentTarget.querySelector('iframe'); f.src = f.src.replace('&autoplay=1', ''); }}>
            <iframe src="https://www.youtube.com/embed/qFOzaQzkWJc?mute=1&enablejsapi=1" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="물 순환 영상" />
          </div>
        </div>
      </section>

      {/* 퀴즈 섹션 */}
      {showQuiz && (
        <section className="quiz-section" ref={quizRef}>
          {showResult ? (
            <div className="result-box">
              <h2>🎉 결과</h2>
              <p>맞힌 개수: {score} / {questions.length}</p>
              <div className="badge"><p>{badge.label}</p><img src={badge.img} alt={badge.label} /></div>
              <button className="quiz-start-btn" onClick={handleStartQuiz}>🔄 다시 풀기</button>
            </div>
          ) : (
            <div className="question-box">
              <div className="progress-bar"><div className="progress" style={{ width: `${(currentQ / questions.length) * 100}%` }} /></div>
              <h3>Q{currentQ + 1}. {questions[currentQ]?.question}</h3>
              <p className="timer">⏱️ {timeLeft}초</p>
              <div className="option-grid">
                {questions[currentQ]?.options.map((opt, i) => (<button key={i} className="option-btn" onClick={() => handleAnswer(opt)}>{opt}</button>))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* 물 절약 꿀팁 */}
      <section className="tips-section">
        <h2>🚿 물 절약 꿀팁</h2>
        <div className="cards">
          <div className="card">🪥 양치할 때 컵 사용하기</div>
          <div className="card">🍽️ 설거지할 때 물 틀어놓지 않기</div>
          <div className="card">🌧️ 빗물 받아 식물에 주기</div>
        </div>
      </section>

      {/* 퀴즈 기록 */}
      <section className="history-section">
        <h2>📊 퀴즈 기록</h2>
        <ul className="history-list">
          {history.map((it, i) => (<li key={i}>🗓️ {it.date} - 점수: {it.score}점 ({it.difficulty})</li>))}
        </ul>
      </section>

      {/* 오늘의 물 정보 */}
      {dailyInfo && (
        <section className="daily-tip-section">
          <h2>📅 오늘의 물 정보</h2>
          <p>{dailyInfo.date}: {dailyInfo.message}</p>
        </section>
      )}

      {/* 지역별 물 사용량 그래프 */}
      <section className="usage-section">
        <h2>📊 지역별 물 사용량</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="usage" fill="#3399ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <p>© 2025 WaterSchool | 물은 생명이에요 🌍</p>
      </footer>
    </div>
  )
}

export default Home
