import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { api, useAuth } from '../../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const QuizSystem = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    // Active Quiz Play states (Student)
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [studentAnswers, setStudentAnswers] = useState([]);
    const [submittingQuiz, setSubmittingQuiz] = useState(false);

    // Result/Scorecard View state
    const [quizResult, setQuizResult] = useState(null);
    const [myResults, setMyResults] = useState([]);
    const [reviewingQuiz, setReviewingQuiz] = useState(null);

    // Faculty/Management review board state
    const [viewingQuizStats, setViewingQuizStats] = useState(null);
    const [quizSubmissions, setQuizSubmissions] = useState([]);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    const isFaculty = user?.role === 'ROLE_FACULTY';
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const isSuperAdmin = user?.role === 'ROLE_SUPER_ADMIN';
    const isManagement = isFaculty || isAdmin || isSuperAdmin;

    const fetchQuizzes = async () => {
        try {
            const endpoint = isManagement ? '/api/quizzes' : '/api/quizzes/my-quizzes';
            const res = await api.get(endpoint);
            setQuizzes(res.data);
        } catch (err) {
            console.error('Error fetching quizzes:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyResults = async () => {
        if (!isManagement) {
            try {
                const res = await api.get('/api/quizzes/my-results');
                setMyResults(res.data);
            } catch (err) {
                console.error('Error loading past scores:', err);
            }
        }
    };

    useEffect(() => {
        if (user) {
            fetchQuizzes();
            fetchMyResults();
        }
    }, [user]);

    const handleStartQuiz = (quiz) => {
        try {
            const parsedQuestions = JSON.parse(quiz.questionsJson);
            setQuestions(parsedQuestions);
            setActiveQuiz(quiz);
            setCurrentQuestionIdx(0);
            setStudentAnswers(new Array(parsedQuestions.length).fill(-1));
            setQuizResult(null);
            setReviewingQuiz(null);
        } catch (e) {
            console.error('Failed to parse quiz schema:', e);
            toast.error('This quiz is corrupt or contains invalid formatting.');
        }
    };

    const handleSelectOption = (optIndex) => {
        const answers = [...studentAnswers];
        answers[currentQuestionIdx] = optIndex;
        setStudentAnswers(answers);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIdx < questions.length - 1) {
            setCurrentQuestionIdx(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIdx > 0) {
            setCurrentQuestionIdx(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        // Verify all answered
        if (studentAnswers.includes(-1)) {
            if (!window.confirm("You have unanswered questions. Are you sure you want to submit?")) {
                return;
            }
        }

        setSubmittingQuiz(true);
        try {
            const res = await api.post(`/api/quizzes/${activeQuiz.id}/submit`, JSON.stringify(studentAnswers));
            toast.success("Quiz completed and graded!");
            setQuizResult(res.data);
            fetchMyResults();
        } catch (err) {
            console.error('Submit quiz error:', err);
            toast.error(err.response?.data?.message || 'Failed to submit quiz.');
        } finally {
            setSubmittingQuiz(false);
        }
    };

    const handleViewSubmissions = async (quiz) => {
        setViewingQuizStats(quiz);
        setReviewingQuiz(null);
        setLoadingSubmissions(true);
        try {
            const res = await api.get(`/api/quizzes/${quiz.id}/results`);
            setQuizSubmissions(res.data);
        } catch (err) {
            console.error('Error loading submissions:', err);
            toast.error('Failed to load scoreboard results.');
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const handleViewQuizDetails = (quiz) => {
        setReviewingQuiz(quiz);
        setViewingQuizStats(null);
    };

    const getQuizScore = (quizId) => {
        const result = myResults.find(r => r.quiz.id === quizId);
        return result ? `${result.score} / ${result.totalQuestions}` : null;
    };

    return (
        <DashboardLayout title="MCQ Online Quiz Desk">
            <ToastContainer theme="dark" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* List View */}
                {!activeQuiz && (
                    <div className={`bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left ${(viewingQuizStats || reviewingQuiz) ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
                        <div className="border-b border-slate-800 pb-3 mb-5">
                            <h3 className="font-bold text-white text-base">Term Quizzes & Exams</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                {isManagement ? 'Management quizzes dashboard' : 'Join scheduled MCQ quizzes and view your score'}
                            </p>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                            </div>
                        ) : quizzes.length === 0 ? (
                            <p className="text-slate-500 text-sm py-4">No quizzes uploaded yet.</p>
                        ) : (
                            <div className="space-y-4">
                                {quizzes.map(quiz => {
                                    const score = getQuizScore(quiz.id);
                                    return (
                                        <div key={quiz.id} className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
                                            <div>
                                                <h4 className="font-bold text-white text-sm">{quiz.title}</h4>
                                                <p className="text-xs text-slate-550 mt-1">
                                                    Batch: {quiz.batch?.name || 'Generic Release'} | Created by: {quiz.createdBy.user.firstName} {quiz.createdBy.user.lastName}
                                                </p>
                                            </div>

                                            <div>
                                                {isManagement ? (
                                                    <button
                                                        onClick={() => handleViewSubmissions(quiz)}
                                                        className="px-3.5 py-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-800 font-bold text-[10px] text-emerald-400 rounded-lg transition-colors"
                                                    >
                                                        📊 View Scoreboard
                                                    </button>
                                                ) : score ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-950/20 text-emerald-400 border border-emerald-900 rounded-lg text-[10px] font-bold font-mono">
                                                            Score: {score}
                                                        </span>
                                                        <button
                                                            onClick={() => handleViewQuizDetails(quiz)}
                                                            className="px-2.5 py-1 bg-slate-900 border border-slate-850 hover:bg-slate-800 font-bold text-[10px] text-slate-300 rounded-lg transition-colors"
                                                        >
                                                            🔍 Details
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleStartQuiz(quiz)}
                                                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-lg transition-colors"
                                                    >
                                                        📝 Start Quiz
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Student Interactive Quiz Taker */}
                {activeQuiz && !isManagement && (
                    <div className="lg:col-span-3 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left flex flex-col h-[550px]">
                        {!quizResult ? (
                            <div className="flex-1 flex flex-col justify-between overflow-hidden">
                                <div className="border-b border-slate-800 pb-3 mb-5 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-white text-base">{activeQuiz.title}</h3>
                                        <p className="text-[10px] text-slate-500 mt-1">Question {currentQuestionIdx + 1} of {questions.length}</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveQuiz(null)}
                                        className="text-xs text-slate-400 hover:text-slate-200"
                                    >
                                        Exit Quiz
                                    </button>
                                </div>

                                {/* Question body */}
                                <div className="flex-1 overflow-y-auto space-y-5">
                                    <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl">
                                        <h4 className="font-semibold text-white text-sm leading-relaxed">
                                            {questions[currentQuestionIdx]?.question}
                                        </h4>
                                    </div>

                                    {/* MCQ choices */}
                                    <div className="space-y-3">
                                        {questions[currentQuestionIdx]?.options.map((opt, oIdx) => (
                                            <button
                                                key={oIdx}
                                                type="button"
                                                onClick={() => handleSelectOption(oIdx)}
                                                className={`w-full p-3.5 text-left text-xs font-medium rounded-xl border transition-all flex items-center gap-3 ${
                                                    studentAnswers[currentQuestionIdx] === oIdx
                                                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold'
                                                        : 'bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                                                }`}
                                            >
                                                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] border font-bold ${
                                                    studentAnswers[currentQuestionIdx] === oIdx
                                                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                                        : 'border-slate-800 text-slate-500'
                                                }`}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </span>
                                                <span>{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Quiz Navigation */}
                                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={handlePrevQuestion}
                                        disabled={currentQuestionIdx === 0}
                                        className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl disabled:opacity-40"
                                    >
                                        ← Previous
                                    </button>
                                    
                                    {currentQuestionIdx === questions.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={handleSubmitQuiz}
                                            disabled={submittingQuiz}
                                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
                                        >
                                            {submittingQuiz ? 'Submitting...' : 'Submit Answers'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleNextQuestion}
                                            className="px-6 py-2 bg-slate-950 border border-slate-800 text-emerald-400 font-bold text-xs rounded-xl hover:bg-slate-850"
                                        >
                                            Next Question →
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Result Scorecard View */
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5">
                                <span className="text-5xl">🏆</span>
                                <h3 className="font-bold text-white text-base">Quiz Completed!</h3>
                                <div className="p-5 bg-slate-950 border border-slate-850 rounded-2xl w-full max-w-sm">
                                    <span className="text-xs text-slate-550 uppercase tracking-widest font-bold">Your Score</span>
                                    <div className="text-4xl font-extrabold text-emerald-400 mt-2 font-mono">
                                        {quizResult.score} / {quizResult.totalQuestions}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-2 font-medium">
                                        Accuracy: {Math.round((quizResult.score / quizResult.totalQuestions) * 100)}%
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setActiveQuiz(null);
                                        setQuizResult(null);
                                    }}
                                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow-lg"
                                >
                                    Return to Desk
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Faculty Submissions Scoreboard */}
                {viewingQuizStats && isManagement && (
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left flex flex-col h-[550px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <div>
                                <h3 className="font-bold text-white text-base">Scoreboard: {viewingQuizStats.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">Review student scorecard entries and auto-grades</p>
                            </div>
                            <button
                                onClick={() => setViewingQuizStats(null)}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                                ❌ Close
                            </button>
                        </div>

                        {loadingSubmissions ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                            </div>
                        ) : quizSubmissions.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center text-slate-500 py-16 text-xs text-center">
                                No students have completed this quiz yet.
                            </div>
                        ) : (
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-xs text-left">
                                    <thead>
                                        <tr className="border-b border-slate-850 text-slate-450 uppercase text-[9px] tracking-wider">
                                            <th className="py-2.5">Student</th>
                                            <th className="py-2.5">Roll Number</th>
                                            <th className="py-2.5 text-center">Score</th>
                                            <th className="py-2.5 text-center">Grade</th>
                                            <th className="py-2.5 text-right">Completion Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-850 text-slate-350">
                                        {quizSubmissions.map(sub => {
                                            const pct = (sub.score / sub.totalQuestions) * 100;
                                            const grade = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : 'F';
                                            return (
                                                <tr key={sub.id}>
                                                    <td className="py-3 font-semibold text-white">
                                                        {sub.student.user.firstName} {sub.student.user.lastName}
                                                    </td>
                                                    <td className="py-3">{sub.student.rollNumber}</td>
                                                    <td className="py-3 text-center font-bold text-emerald-400 font-mono">
                                                        {sub.score} / {sub.totalQuestions}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                                            grade === 'F' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                                                        }`}>
                                                            {grade}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 text-right text-slate-550">
                                                        {new Date(sub.completedAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* Student Quiz Review Details Board */}
                {reviewingQuiz && (
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left flex flex-col h-[550px]">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
                            <div>
                                <h3 className="font-bold text-white text-base">Quiz Review: {reviewingQuiz.title}</h3>
                                <p className="text-xs text-slate-500 mt-1">Review your answers alongside correct solutions</p>
                            </div>
                            <button
                                onClick={() => setReviewingQuiz(null)}
                                className="text-xs text-slate-400 hover:text-slate-200"
                            >
                                ❌ Close Review
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                            {(() => {
                                try {
                                    const questionsList = JSON.parse(reviewingQuiz.questionsJson);
                                    const resultObj = myResults.find(r => r.quiz.id === reviewingQuiz.id);
                                    const studentAnswersList = resultObj ? JSON.parse(resultObj.answersJson) : [];

                                    return questionsList.map((q, idx) => {
                                        const studentAnsIdx = studentAnswersList[idx];
                                        const correctAnsIdx = q.correctIndex;
                                        const isCorrect = studentAnsIdx === correctAnsIdx;

                                        return (
                                            <div key={idx} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <h4 className="font-semibold text-white text-xs leading-relaxed">
                                                        Q{idx + 1}: {q.question}
                                                    </h4>
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                                                        isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {isCorrect ? 'Correct' : 'Incorrect'}
                                                    </span>
                                                </div>

                                                {/* Options list */}
                                                <div className="grid grid-cols-1 gap-2">
                                                    {q.options.map((opt, oIdx) => {
                                                        let optionStyle = 'bg-slate-900 border-slate-800/80 text-slate-400';
                                                        
                                                        if (oIdx === correctAnsIdx) {
                                                            // Correct option (always highlighted green)
                                                            optionStyle = 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 font-bold';
                                                        } else if (oIdx === studentAnsIdx && !isCorrect) {
                                                            // Student's wrong selection (highlighted red)
                                                            optionStyle = 'bg-red-500/10 border-red-500/60 text-red-400 font-bold';
                                                        }

                                                        return (
                                                            <div key={oIdx} className={`p-2.5 rounded-lg border text-[11px] flex items-center gap-2.5 ${optionStyle}`}>
                                                                <span className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[9px] font-bold border ${
                                                                    oIdx === correctAnsIdx ? 'border-emerald-500 text-emerald-400' :
                                                                    oIdx === studentAnsIdx ? 'border-red-500 text-red-400' :
                                                                    'border-slate-800 text-slate-500'
                                                                }`}>
                                                                    {String.fromCharCode(65 + oIdx)}
                                                                </span>
                                                                <span>{opt}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {q.solution && (
                                                    <div className="mt-2 p-2.5 bg-slate-900/50 border border-slate-850 rounded-lg text-[10px] text-slate-400">
                                                        <span className="font-bold text-slate-350 block mb-0.5">Explanation / Solution:</span>
                                                        {q.solution}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    });
                                } catch (e) {
                                    return <p className="text-red-400 text-xs">Error loading quiz solutions review.</p>;
                                }
                            })()}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default QuizSystem;
