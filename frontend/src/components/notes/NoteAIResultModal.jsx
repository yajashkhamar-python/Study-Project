import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, Sparkles, BookOpen, Brain, CreditCard, Copy, Check, RefreshCw, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const NoteAIResultModal = ({
  isOpen,
  onClose,
  action,
  result,
  truncated,
  onRegenerate,
  loading,
}) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Flashcards state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!isOpen || !result) return null;

  const handleCopy = (textToCopy) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast('Result copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const getModalTitle = () => {
    switch (action) {
      case 'summarize':
        return '✨ AI Exam Summary';
      case 'explain':
        return '📖 Beginner Explanation';
      case 'quiz':
        return '🧠 Practice Quiz';
      case 'flashcards':
        return '🃏 Revision Flashcards';
      default:
        return '✨ AI Result';
    }
  };

  // Render Quiz View
  const renderQuizView = () => {
    const questions = result.questions || [];
    if (questions.length === 0) {
      return <div className="text-center py-6 text-xs text-slate-400">No quiz questions generated.</div>;
    }

    const answeredCount = Object.keys(selectedAnswers).length;
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) correctCount++;
    });

    const quizText = questions
      .map(
        (q, idx) =>
          `Q${idx + 1}: ${q.question}\nOptions:\n${q.options.map((o, i) => `${String.fromCharCode(65 + i)}. ${o}`).join('\n')}\nCorrect: ${q.options[q.correctAnswer]}\nExplanation: ${q.explanation}\n`
      )
      .join('\n---\n');

    return (
      <div className="space-y-6">
        {/* Score Header */}
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-300">
            Progress: <strong className="text-white">{answeredCount}</strong> / {questions.length} Answered
          </div>
          {answeredCount > 0 && (
            <div className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
              Score: {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, qIdx) => {
            const hasAnswered = selectedAnswers[qIdx] !== undefined;
            const selectedOpt = selectedAnswers[qIdx];

            return (
              <div
                key={qIdx}
                className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 space-y-3"
              >
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-start gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[10px] font-mono">
                    Q{qIdx + 1}
                  </span>
                  <span>{q.question}</span>
                </div>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {(q.options || []).map((opt, oIdx) => {
                    const isSelected = selectedOpt === oIdx;
                    const isCorrect = q.correctAnswer === oIdx;

                    let btnStyle =
                      'bg-slate-200/60 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-800 hover:border-indigo-500/40';

                    if (hasAnswered) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold';
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        onClick={() =>
                          setSelectedAnswers({ ...selectedAnswers, [qIdx]: oIdx })
                        }
                        className={`p-3 rounded-xl border text-xs text-left transition-all flex items-center gap-2 ${btnStyle}`}
                      >
                        <span className="font-mono text-[10px] opacity-60">
                          {String.fromCharCode(65 + oIdx)}.
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation text when answered */}
                {hasAnswered && (
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 font-medium">
                    <strong className="text-indigo-400 block mb-0.5">Explanation:</strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => handleCopy(quizText)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>Copy Quiz</span>
          </button>
        </div>
      </div>
    );
  };

  // Render Flashcards View
  const renderFlashcardsView = () => {
    const flashcards = result.flashcards || [];
    if (flashcards.length === 0) {
      return <div className="text-center py-6 text-xs text-slate-400">No flashcards generated.</div>;
    }

    const currentCard = flashcards[cardIndex] || flashcards[0];
    const total = flashcards.length;

    const flashcardsText = flashcards
      .map((f, i) => `Card ${i + 1}\nFront: ${f.front}\nBack: ${f.back}\n`)
      .join('\n---\n');

    return (
      <div className="space-y-6">
        {/* Flashcard Counter */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-400">
          <span>Card {cardIndex + 1} of {total}</span>
          <span>Click card to flip</span>
        </div>

        {/* 3D Flip Flashcard Box */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="h-64 sm:h-72 w-full rounded-3xl glass-card border border-indigo-500/30 p-8 flex flex-col justify-between items-center text-center cursor-pointer shadow-2xl transition-all duration-300 hover:scale-[1.01] bg-gradient-to-br from-indigo-900/30 via-slate-900/80 to-purple-900/30 relative overflow-hidden"
        >
          <div className="w-full flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
            <span>{isFlipped ? 'ANSWER (BACK)' : 'QUESTION (FRONT)'}</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
              {isFlipped ? 'Click to show front' : 'Click to flip'}
            </span>
          </div>

          <div className="my-auto px-4">
            <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight leading-relaxed">
              {isFlipped ? currentCard.back : currentCard.front}
            </h3>
          </div>

          <div className="text-[10px] text-slate-500 font-medium">
            StudyPulse Interactive Flashcard
          </div>
        </div>

        {/* Flashcard Nav Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={() => {
              setIsFlipped(false);
              setCardIndex((prev) => (prev > 0 ? prev - 1 : total - 1));
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={() => {
              setIsFlipped(false);
              setCardIndex(0);
            }}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            title="Restart Deck"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart
          </button>

          <button
            onClick={() => handleCopy(flashcardsText)}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
            title="Copy Deck"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => {
              setIsFlipped(false);
              setCardIndex((prev) => (prev < total - 1 ? prev + 1 : 0));
            }}
            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="glass-card w-full max-w-3xl rounded-3xl border border-purple-500/30 flex flex-col shadow-2xl overflow-hidden my-6 max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900/60">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-pink-400 animate-pulse" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {getModalTitle()}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {(action === 'summarize' || action === 'explain') && (
              <button
                onClick={() => onRegenerate(action)}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-bold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Regenerate</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Truncation Warning */}
        {truncated && (
          <div className="px-6 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2 text-amber-400 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>This note is very long, so content was safely truncated for AI processing.</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1">
          {action === 'quiz' ? (
            renderQuizView()
          ) : action === 'flashcards' ? (
            renderFlashcardsView()
          ) : (
            <div className="space-y-4">
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm font-medium leading-relaxed bg-slate-100/50 dark:bg-slate-900/40 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/60 overflow-x-auto">
                <ReactMarkdown>{typeof result === 'string' ? result : JSON.stringify(result, null, 2)}</ReactMarkdown>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleCopy(typeof result === 'string' ? result : JSON.stringify(result, null, 2))}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/80 flex justify-end bg-slate-900/40">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
