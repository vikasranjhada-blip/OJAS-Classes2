import React, { useState } from 'react';
import { Question } from '../../types';
import { storage } from '../../services/storage';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';
import { EmptyState } from '../common/EmptyState';
import {
  HelpCircle,
  Plus,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  BookOpen,
  Filter,
} from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>(() => storage.getQuestions());
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // Expanded explanations
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    statement: '',
    subject: 'Accountancy',
    topic: 'Partnership Accounts & Goodwill',
    examType: 'UPPCL' as string,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    marks: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const reloadData = () => {
    setQuestions(storage.getQuestions());
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = subjectFilter === 'All' || q.subject === subjectFilter;
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesSubject && matchesDiff;
  });

  const subjects = ['All', ...Array.from(new Set(questions.map((q) => q.subject)))];

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const openAddModal = () => {
    const nextCode = `Q-${formData.subject.slice(0, 3).toUpperCase()}-${String(questions.length + 2601)}`;
    setFormData({
      code: nextCode,
      statement: '',
      subject: 'Accountancy',
      topic: '',
      examType: 'UPPCL',
      difficulty: 'Medium',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      explanation: '',
      marks: 1,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormData({
      code: q.code,
      statement: q.statement,
      subject: q.subject,
      topic: q.topic,
      examType: q.examType,
      difficulty: q.difficulty,
      optionA: q.options.find((o) => o.id === 'A')?.text || '',
      optionB: q.options.find((o) => o.id === 'B')?.text || '',
      optionC: q.options.find((o) => o.id === 'C')?.text || '',
      optionD: q.options.find((o) => o.id === 'D')?.text || '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      marks: q.marks,
    });
    setFormErrors({});
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.statement.trim()) errs.statement = 'Question statement is required';
    if (!formData.topic.trim()) errs.topic = 'Topic / Chapter name is required';
    if (!formData.optionA.trim()) errs.optionA = 'Option A is required';
    if (!formData.optionB.trim()) errs.optionB = 'Option B is required';
    if (!formData.optionC.trim()) errs.optionC = 'Option C is required';
    if (!formData.optionD.trim()) errs.optionD = 'Option D is required';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const options = [
      { id: 'A' as const, text: formData.optionA },
      { id: 'B' as const, text: formData.optionB },
      { id: 'C' as const, text: formData.optionC },
      { id: 'D' as const, text: formData.optionD },
    ];

    if (editingQuestion) {
      const updated: Question = {
        ...editingQuestion,
        code: formData.code,
        statement: formData.statement,
        subject: formData.subject,
        topic: formData.topic,
        examType: formData.examType,
        difficulty: formData.difficulty,
        options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        marks: Number(formData.marks),
      };
      storage.saveQuestion(updated);
      setEditingQuestion(null);
    } else {
      const newQuestion: Question = {
        id: `q-${Date.now()}`,
        code: formData.code,
        statement: formData.statement,
        subject: formData.subject,
        topic: formData.topic,
        examType: formData.examType,
        difficulty: formData.difficulty,
        options,
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation,
        marks: Number(formData.marks),
      };
      storage.saveQuestion(newQuestion);
      setIsAddModalOpen(false);
    }
    reloadData();
  };

  const handleDelete = (id: string, code: string) => {
    if (confirm(`Delete question ${code}?`)) {
      storage.deleteQuestion(id);
      reloadData();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Question Bank & MCQs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Curated repository of single-choice & numerical problems with detailed pedagogical explanations
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Add Practice Question</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions by keyword, topic, ID..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>

          {/* Difficulty Segmented */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  difficultyFilter === diff
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="No Questions Found"
          description="No questions match your current search and difficulty filters."
          actionLabel="Add Question"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const isExpanded = !!expandedSolutions[q.id];

            return (
              <div
                key={q.id}
                className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row: ID, Topic, Difficulty, Marks, Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono font-bold text-slate-500">{q.code}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {q.subject}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-600 font-medium">{q.topic}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 font-mono text-[11px]">{q.examType}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        q.difficulty === 'Easy'
                          ? 'success'
                          : q.difficulty === 'Medium'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                    >
                      {q.difficulty} ({q.marks} Marks)
                    </Badge>

                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => openEditModal(q)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                        title="Edit Question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id, q.code)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Question Statement */}
                <p className="text-sm font-semibold text-slate-900 leading-relaxed font-sans">
                  {q.statement}
                </p>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctAnswer;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-lg border flex items-start gap-3 transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-slate-50/70 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <div className="flex-1 leading-snug">{opt.text}</div>
                        {isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Expandable Explanation Toggle */}
                <div className="pt-1">
                  <button
                    onClick={() => toggleSolution(q.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Solution & Theory' : 'View Detailed Solution & Explanation'}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-4 rounded-lg bg-blue-50/40 border border-blue-200/80 text-xs text-slate-800 space-y-1.5 leading-relaxed">
                      <div className="font-bold text-blue-950 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span>Step-by-Step Pedagogical Explanation:</span>
                      </div>
                      <p className="whitespace-pre-wrap">{q.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Question Modal */}
      {(isAddModalOpen || editingQuestion) && (
        <Modal
          isOpen={true}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingQuestion(null);
          }}
          title={editingQuestion ? `Edit Question: ${editingQuestion.code}` : 'Add Practice MCQ'}
          subtitle="Define question statement, 4 choices, correct answer key, and pedagogical rationale"
          maxWidth="3xl"
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingQuestion(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
              >
                {editingQuestion ? 'Save Changes' : 'Add to Question Bank'}
              </button>
            </div>
          }
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Q-ACC-2605"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Accountancy">Accountancy</option>
                  <option value="Auditing">Auditing</option>
                  <option value="Income Tax & TDS">Income Tax & TDS</option>
                  <option value="Computer Knowledge">Computer Knowledge (CCC/O-Level)</option>
                  <option value="Samanya Hindi">Samanya Hindi</option>
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="General Studies">General Studies</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Topic / Chapter <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Audit of Depreciation / Section 80C Deductions"
                  className={`w-full px-3 py-2 border rounded-lg ${
                    formErrors.topic ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Exam</label>
                <select
                  value={formData.examType}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      examType: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="UPPCL">UPPCL Assistant Accountant 2026</option>
                  <option value="UPSSSC">UPSSSC Auditor & Assistant Accountant</option>
                  <option value="One-Day Govt">One-Day Govt Exams (SSC / Police / RRB)</option>
                  <option value="General">General / All Exams</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard',
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard / Advanced</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Marks</label>
                <input
                  type="number"
                  value={formData.marks}
                  onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Statement */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Question Statement (LaTeX formulas & Greek symbols supported){' '}
                <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                value={formData.statement}
                onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                placeholder="Write clear, unambiguous problem statement with given parameters..."
                className={`w-full px-3 py-2 border rounded-lg ${
                  formErrors.statement ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
            </div>

            {/* 4 Options with Correct Answer Selector */}
            <div className="space-y-2">
              <label className="block font-semibold text-slate-700">
                Four Options & Correct Answer Radio:
              </label>

              {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                const formField = `option${optKey}` as 'optionA' | 'optionB' | 'optionC' | 'optionD';
                const isSelected = formData.correctAnswer === optKey;

                return (
                  <div key={optKey} className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer font-bold shrink-0">
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={isSelected}
                        onChange={() => setFormData({ ...formData, correctAnswer: optKey })}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {optKey}
                      </span>
                    </label>

                    <input
                      type="text"
                      value={formData[formField]}
                      onChange={(e) => setFormData({ ...formData, [formField]: e.target.value })}
                      placeholder={`Choice ${optKey} statement or value...`}
                      className={`w-full px-3 py-2 border rounded-lg ${
                        formErrors[formField] ? 'border-rose-500' : 'border-slate-200'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Explanation */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Solution & Conceptual Explanation
              </label>
              <textarea
                rows={3}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Explain the step-by-step derivation, trap answers, and why the other choices are incorrect..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
