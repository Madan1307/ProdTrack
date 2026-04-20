import React, { useState, useEffect } from 'react';
import { generateDailyQuestions, analyzeBehavior } from '../ai/geminiEngine';
import { getKeywords, getStreakKeywords, getDistractionKeywords, getSuggestionKeywords, getWeakAreas } from '../store/keywordStore';
import { saveLog, markQuizDoneToday, getTodayDate } from '../store/dailyLogStore';
import { calculateScore, evolveKeywords } from '../engine/scoringEngine';
import ScoreRing from '../components/ScoreRing';

const PHASES = { INTRO: 'intro', LOADING: 'loading', QUIZ: 'quiz', ANALYZING: 'analyzing', RESULTS: 'results' };

export default function QuizPage({ onNavigate }) {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);

  const allKeywords = getKeywords();
  const streakKws = getStreakKeywords();
  const distractKws = getDistractionKeywords();
  const suggKws = getSuggestionKeywords();
  const weakAreas = getWeakAreas();

  async function startQuiz() {
    setPhase(PHASES.LOADING);
    setError('');
    try {
      const qs = await generateDailyQuestions(streakKws, distractKws, suggKws, weakAreas);
      setQuestions(qs);
      setCurrentQ(0);
      setAnswers({});
      setSelectedOption(null);
      setPhase(PHASES.QUIZ);
    } catch (e) {
      setError('Failed to generate questions: ' + e.message + '. Check your API key and internet connection.');
      setPhase(PHASES.INTRO);
    }
  }

  function selectOption(option) {
    setSelectedOption(option);
  }

  function nextQuestion() {
    if (!selectedOption) return;
    const q = questions[currentQ];
    const newAnswers = { ...answers, [currentQ]: { ...q, selectedOption } };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      submitQuiz(newAnswers);
    }
  }

  async function submitQuiz(finalAnswers) {
    setPhase(PHASES.ANALYZING);
    try {
      const qaList = Object.values(finalAnswers);
      const behaviorMap = await analyzeBehavior(qaList, allKeywords);
      const { actualScore, maxScore, productivityPct } = calculateScore(qaList, behaviorMap, allKeywords);
      evolveKeywords(behaviorMap);
      const log = saveLog(getTodayDate(), behaviorMap, { actualScore, maxScore }, productivityPct);
      markQuizDoneToday();
      setResults({ log, behaviorMap, productivityPct, actualScore, maxScore });
      setPhase(PHASES.RESULTS);
    } catch (e) {
      setError('Analysis failed: ' + e.message);
      setPhase(PHASES.QUIZ);
    }
  }

  const progress = questions.length > 0 ? ((currentQ) / questions.length) * 100 : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">🧠 Daily Quiz</h1>
        <p className="page-subtitle">AI-powered adaptive questions based on your habits</p>
      </div>

      <div className="quiz-container">
        {/* INTRO */}
        {phase === PHASES.INTRO && (
          <div className="card card-gradient animate-slide-up" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 80, marginBottom: 24 }} className="animate-float">🎯</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Ready for today's check-in?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, maxWidth: 440, margin: '0 auto 12px' }}>
              The AI will generate <strong style={{ color: 'var(--text-primary)' }}>10 personalized questions</strong> based on your {allKeywords.length} tracked keywords.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 440, margin: '0 auto 32px' }}>
              Be honest. The system isn't here to judge — it's here to help you grow. Your answers shape tomorrow's questions.
            </p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius-md)', padding: '14px 20px', marginBottom: 24,
                color: 'var(--accent-red)', fontSize: 13, textAlign: 'left',
              }}>
                ⚠️ {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
              {['Q1–6: Habits', 'Q7–8: Distractions', 'Q9–10: Growth'].map((label, i) => (
                <span key={i} style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)',
                  fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  {label}
                </span>
              ))}
            </div>

            <button className="btn btn-orange btn-lg" onClick={startQuiz}>
              Generate My Questions 🤖
            </button>
          </div>
        )}

        {/* LOADING */}
        {phase === PHASES.LOADING && (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 24px' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '3px solid rgba(124,58,237,0.2)',
                borderTop: '3px solid var(--accent-purple)',
                animation: 'spin 1s linear infinite',
              }} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>The AI is thinking... 🤖</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              Crafting personalized questions from your keywords
            </p>
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[100, 75, 88].map((w, i) => (
                <div key={i} className="skeleton" style={{ height: 16, width: `${w}%`, margin: '0 auto', borderRadius: 8 }} />
              ))}
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* QUIZ */}
        {phase === PHASES.QUIZ && questions.length > 0 && (
          <div>
            {/* Progress */}
            <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Question {currentQ + 1} of {questions.length}
              </span>
              <span style={{ fontSize: 13, color: 'var(--accent-purple-light)', fontWeight: 600 }}>
                {Math.round(progress)}% complete
              </span>
            </div>
            <div className="quiz-progress-bar">
              <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Question Card */}
            <div className="quiz-card" key={currentQ}>
              <div className="quiz-question-num">
                {questions[currentQ]?.type === 'streak' ? '🔥 HABIT CHECK' :
                 questions[currentQ]?.type === 'distraction' ? '⚠️ FOCUS CHECK' : '💡 GROWTH CHECK'}
                {' — '}QUESTION {currentQ + 1}
              </div>
              <div className="quiz-question-text">
                {questions[currentQ]?.question}
              </div>
              <div className="quiz-options">
                {questions[currentQ]?.options?.map((opt, idx) => (
                  <button
                    key={idx}
                    className={`quiz-option ${selectedOption === opt ? 'selected' : ''}`}
                    onClick={() => selectOption(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>

              {/* Keyword tags */}
              <div style={{ marginTop: 20, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tracking:</span>
                {questions[currentQ]?.keywords?.map(k => (
                  <span key={k} className="keyword-chip streak" style={{ fontSize: 11, padding: '2px 8px' }}>
                    {k.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button
                className="btn btn-primary btn-lg"
                disabled={!selectedOption}
                onClick={nextQuestion}
              >
                {currentQ < questions.length - 1 ? 'Next →' : 'Submit Answers ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ANALYZING */}
        {phase === PHASES.ANALYZING && (
          <div className="card" style={{ textAlign: 'center', padding: 64 }}>
            <div style={{ fontSize: 64, marginBottom: 24 }}>🧠</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Analyzing your behavior...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
              AI is extracting insights from your answers
            </p>
            <div style={{ marginTop: 24 }}>
              {['Extracting behavior patterns...', 'Updating streaks...', 'Calculating productivity score...'].map((text, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 16px', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.03)', marginBottom: 8,
                  animation: `fadeIn ${0.3 + i * 0.2}s ease both`,
                }}>
                  <span style={{ color: 'var(--accent-purple)', fontSize: 16 }}>⟳</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTS */}
        {phase === PHASES.RESULTS && results && (
          <div className="animate-slide-up">
            {/* Score reveal */}
            <div className="card card-glow-purple" style={{ textAlign: 'center', padding: 40, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Today's Result 🎯</h2>
              <ScoreRing percentage={results.productivityPct} size={200} />
              <div style={{ marginTop: 24, fontSize: 14, color: 'var(--text-secondary)' }}>
                Score: <strong style={{ color: 'var(--text-primary)' }}>{results.actualScore} / {results.maxScore}</strong> points
              </div>
            </div>

            {/* Behavior breakdown */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title" style={{ marginBottom: 16 }}>📋 Behavior Analysis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {Object.entries(results.behaviorMap).map(([kw, status]) => {
                  const icon = status === 'done' ? '✅' : status === 'missed' ? '❌' : '⏭️';
                  const color = status === 'done' ? 'var(--accent-green)' : status === 'missed' ? 'var(--accent-red)' : 'var(--text-muted)';
                  return (
                    <div key={kw} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 'var(--radius-md)',
                      background: 'rgba(255,255,255,0.03)',
                    }}>
                      <span style={{ fontSize: 14, fontWeight: 600, textTransform: 'capitalize' }}>
                        {kw.replace(/_/g, ' ')}
                      </span>
                      <span style={{ fontSize: 13, color, fontWeight: 600 }}>
                        {icon} {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-primary w-full" onClick={() => onNavigate('insights')}>
                💡 View Insights
              </button>
              <button className="btn btn-ghost w-full" onClick={() => onNavigate('dashboard')}>
                🏠 Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
