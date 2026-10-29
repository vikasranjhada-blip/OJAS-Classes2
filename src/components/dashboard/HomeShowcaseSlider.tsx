import React, { useState, useEffect } from 'react';
import { PageId } from '../../types';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Video,
  Play,
  ArrowRight,
  Clock,
  Calendar,
  Users,
  GraduationCap,
  Layers,
  Award,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface HomeShowcaseSliderProps {
  onNavigate: (page: PageId) => void;
  onNavigateToCourse?: (courseId: string) => void;
}

interface SlideItem {
  id: string;
  type: 'course' | 'class' | 'batch';
  badgeText: string;
  badgeVariant: 'new' | 'live' | 'featured';
  title: string;
  subtitle: string;
  description: string;
  themeGradient: string;
  accentBorder: string;
  batchCode: string;
  targetExam: string;
  timing: string;
  startDate: string;
  faculty: string;
  seatsInfo: {
    enrolled: number;
    total: number;
    statusText: string;
  };
  price?: {
    current: number;
    original: number;
    discountText: string;
  };
  primaryAction: {
    label: string;
    targetPage: PageId;
    icon: 'play' | 'book' | 'layers';
  };
  secondaryAction?: {
    label: string;
    targetPage: PageId;
  };
}

export const HomeShowcaseSlider: React.FC<HomeShowcaseSliderProps> = ({
  onNavigate,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides: SlideItem[] = [
    {
      id: 'slide-1',
      type: 'course',
      badgeText: 'UPPCL SPECIAL 2026',
      badgeVariant: 'new',
      title: 'UPPCL Assistant Accountant 2026 Complete Selection Batch',
      subtitle: 'Complete Commerce, Auditing, Income Tax + NIELIT O-Level Computer (50 Marks)',
      description:
        'Targeted syllabus for UPPCL Assistant Accountant 2026. Includes Double Entry, BRS, Depreciation, Income Tax provisions, General Hindi, and Part-1 Computer qualifying prep with 3,000+ PYQs.',
      themeGradient: 'from-slate-900 via-blue-950 to-indigo-950',
      accentBorder: 'border-blue-500/40',
      batchCode: 'UPPCL-AA-2026-ALPHA',
      targetExam: 'UPPCL Assistant Accountant',
      timing: '08:00 AM - 11:30 AM (Mon-Sat)',
      startDate: '15 May 2026',
      faculty: 'CA Rakesh Agrawal & Er. Mayank Srivastava',
      seatsInfo: {
        enrolled: 142,
        total: 180,
        statusText: '38 Seats Left (78% Filled)',
      },
      price: {
        current: 3499,
        original: 6999,
        discountText: '50% Govt Aspirant Discount',
      },
      primaryAction: {
        label: 'Explore UPPCL Curriculum',
        targetPage: 'courses',
        icon: 'book',
      },
      secondaryAction: {
        label: 'View Batch Roster',
        targetPage: 'batches',
      },
    },
    {
      id: 'slide-2',
      type: 'class',
      badgeText: 'YOUTUBE PRIVATE LIVE',
      badgeVariant: 'live',
      title: 'YouTube Live: Double Entry System & Ledger Posting Masterclass',
      subtitle: 'Streamed Privately on YouTube · Direct Access for Enrolled Students',
      description:
        'Private unlisted YouTube Live stream embedded directly in OJAS app. Automatic SMS & Push alerts dispatched to enrolled batch students with zero link leaks.',
      themeGradient: 'from-slate-900 via-rose-950 to-slate-950',
      accentBorder: 'border-red-500/40',
      batchCode: 'UPPCL-AA-2026-ALPHA',
      targetExam: 'Accountancy & Bookkeeping',
      timing: 'Today, 10:00 AM - 11:30 AM (In Session)',
      startDate: 'Daily YouTube Private Stream',
      faculty: 'CA Rakesh K. Agrawal (16 Yrs Exp)',
      seatsInfo: {
        enrolled: 142,
        total: 180,
        statusText: '142 Students In App Private Stream',
      },
      primaryAction: {
        label: 'Join YouTube Private Room',
        targetPage: 'live-classes',
        icon: 'play',
      },
      secondaryAction: {
        label: 'Class Schedule',
        targetPage: 'live-classes',
      },
    },
    {
      id: 'slide-3',
      type: 'batch',
      badgeText: 'UPSSSC RECRUITMENT',
      badgeVariant: 'new',
      title: 'UPSSSC Auditor & Assistant Accountant 2026 Special Batch',
      subtitle: 'Accounts, Cost Accounting, UP Financial Rules & UP GK Special',
      description:
        'Comprehensive batch mapped to UPSSSC Auditor recruitment syllabus. Complete coverage of Schedule III Balance Sheet, Treasury rules, Store accounting and Computer.',
      themeGradient: 'from-slate-900 via-teal-950 to-emerald-950',
      accentBorder: 'border-teal-500/40',
      batchCode: 'UPSSSC-AUDIT-2026',
      targetExam: 'UPSSSC Auditor & Accountant',
      timing: '04:00 PM - 07:30 PM (Mon-Sat)',
      startDate: '01 June 2026',
      faculty: 'CA Rakesh Agrawal & Dr. Vijayendra Tripathi',
      seatsInfo: {
        enrolled: 98,
        total: 200,
        statusText: 'Admissions Open (49% Filled)',
      },
      price: {
        current: 2999,
        original: 5999,
        discountText: 'Includes All Chapter Notes & PYQs',
      },
      primaryAction: {
        label: 'Manage Batch Admission',
        targetPage: 'batches',
        icon: 'layers',
      },
      secondaryAction: {
        label: 'Admit Student',
        targetPage: 'students',
      },
    },
    {
      id: 'slide-4',
      type: 'course',
      badgeText: 'ONE-DAY GOVT EXAMS',
      badgeVariant: 'featured',
      title: 'One-Day Govt Exams: SSC CGL, CHSL, UP Police SI & Railway NTPC 2026',
      subtitle: 'Quantitative Shortcuts, Reasoning, Hindi & General Studies All-in-One',
      description:
        'Universal government recruitment course covering SSC Tier-1 & Tier-2, UP Police Sub-Inspector Mool Vidhi & Hindi, and Railway RRB NTPC arithmetic with speed-test drills.',
      themeGradient: 'from-slate-900 via-amber-950 to-orange-950',
      accentBorder: 'border-amber-500/40',
      batchCode: 'SSC-CGL-2026-MASTERY',
      targetExam: 'SSC / UP Police / RRB NTPC',
      timing: '05:00 PM - 07:30 PM (Daily)',
      startDate: '01 May 2026',
      faculty: 'Prof. Sandeep Rawat & Team',
      seatsInfo: {
        enrolled: 185,
        total: 250,
        statusText: 'Hybrid: Online + Center Hall',
      },
      price: {
        current: 2499,
        original: 4999,
        discountText: '30 Full OMR Mock Test Kits Included',
      },
      primaryAction: {
        label: 'View Govt Exam Syllabus',
        targetPage: 'courses',
        icon: 'book',
      },
      secondaryAction: {
        label: 'View Students',
        targetPage: 'students',
      },
    },
  ];

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const slide = slides[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background with animated gradient */}
      <div
        className={`bg-gradient-to-r ${slide.themeGradient} transition-all duration-700 p-6 sm:p-8 text-white relative`}
      >
        {/* Subtle decorative grid background */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Top bar inside slide */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            {/* OJAS Classes Small Logo Badge */}
            <div className="bg-white rounded-md px-2 py-0.5 shadow-xs flex items-center justify-center">
              <img
                src="/assets/aistudio/2141b4f9-0816-4ef1-92ae-3ef08e0d2955_7d83b97c.jpg"
                alt="OJAS Classes"
                className="h-4.5 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="text-[10px] font-black text-slate-900 tracking-wider">
                OJAS
              </span>
            </div>

            {/* Slide Category Badge */}
            <span
              className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                slide.badgeVariant === 'live'
                  ? 'bg-red-500/90 text-white animate-pulse'
                  : slide.badgeVariant === 'new'
                  ? 'bg-teal-500/90 text-white'
                  : 'bg-amber-400 text-slate-950'
              }`}
            >
              {slide.badgeVariant === 'live' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              )}
              {slide.badgeText}
            </span>

            <span className="text-xs text-slate-400 font-mono hidden md:inline">
              · {slide.targetExam}
            </span>
          </div>

          {/* Slide counter & pause indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>
              {currentSlide + 1} / {slides.length}
            </span>
            {isPaused && (
              <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-600/40 px-1.5 py-0.5 rounded">
                Paused
              </span>
            )}
          </div>
        </div>

        {/* Slide Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Title, Subtitle, Description, and CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
              {slide.title}
            </h2>

            <p className="text-xs sm:text-sm font-semibold text-teal-300">
              {slide.subtitle}
            </p>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              {slide.description}
            </p>

            {/* Quick Pricing Strip if available */}
            {slide.price && (
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-extrabold font-mono text-white tabular-nums">
                  ₹{slide.price.current.toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                  ₹{slide.price.original.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded">
                  {slide.price.discountText}
                </span>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => onNavigate(slide.primaryAction.targetPage)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                {slide.primaryAction.icon === 'play' && (
                  <Play className="w-4 h-4 fill-current text-red-600" />
                )}
                {slide.primaryAction.icon === 'book' && (
                  <BookOpen className="w-4 h-4 text-blue-600" />
                )}
                {slide.primaryAction.icon === 'layers' && (
                  <Layers className="w-4 h-4 text-teal-600" />
                )}
                <span>{slide.primaryAction.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {slide.secondaryAction && (
                <button
                  onClick={() => onNavigate(slide.secondaryAction!.targetPage)}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 transition-colors whitespace-nowrap"
                >
                  {slide.secondaryAction.label}
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Live Batch Details Card (5 cols) */}
          <div className="lg:col-span-5">
            <div
              className={`p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border ${slide.accentBorder} shadow-lg space-y-3`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Batch Specifications
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                  {slide.batchCode}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Daily Timing</span>
                  </span>
                  <span className="font-mono text-white text-[11px] font-medium">
                    {slide.timing}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Start Date</span>
                  </span>
                  <span className="font-mono text-white text-[11px] font-medium">
                    {slide.startDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mentor / Faculty</span>
                  </span>
                  <span className="font-medium text-white text-right truncate max-w-[180px]">
                    {slide.faculty}
                  </span>
                </div>

                {/* Seat capacity progress bar */}
                <div className="pt-2 border-t border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Seat Utilization:</span>
                    <span className="font-bold text-teal-300 font-mono">
                      {slide.seatsInfo.statusText}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.round(
                          (slide.seatsInfo.enrolled / slide.seatsInfo.total) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="relative z-10 flex items-center justify-between pt-6 mt-4 border-t border-white/10">
          {/* Slide thumbnail / title pills */}
          <div className="hidden sm:flex items-center gap-2 overflow-x-auto">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  currentSlide === idx
                    ? 'bg-white text-slate-900 font-bold shadow-xs scale-102'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentSlide === idx ? 'bg-blue-600' : 'bg-slate-400'
                  }`}
                />
                <span className="truncate max-w-[130px]">{s.badgeText}</span>
              </button>
            ))}
          </div>

          {/* Dots on mobile */}
          <div className="flex sm:hidden items-center gap-1.5">
            {slides.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentSlide === idx ? 'w-5 bg-white' : 'bg-white/40'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
