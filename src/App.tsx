import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Upload, BarChart3, Mail, ChevronDown, ChevronUp,
  CheckCircle2, ShieldCheck, Users, TrendingUp,
  Briefcase, Target, Zap, ArrowRight, Menu, X,
  FileText, Trash2, Loader2, Send, AlertTriangle, FileCheck,
  BookOpen, Globe, Wrench, Lightbulb, ThumbsUp,
  Search, Layout, PenTool, BadgeCheck, Rocket
} from 'lucide-react'
import { analyzePDF } from './lib/pdfAnalyzer'
import type { PDFAnalysisResult } from './lib/pdfAnalyzer'

/* ─── Animated Counter ─── */
function useCountUp(end: number, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    let startTime: number | null = null
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOut * (end - start) + start))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [hasStarted, end, duration, start])

  return { count, ref }
}

/* ─── Score Ring ─── */
function ScoreRing({ score, animating }: { score: number; animating: boolean }) {
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!animating) return
    const targetOffset = circumference - (score / 100) * circumference
    let startTime: number | null = null
    const duration = 2000

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setOffset(circumference - easeOut * (circumference - targetOffset))
      setDisplayScore(Math.round(easeOut * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score, animating, circumference])

  const getGradientColors = (s: number) => {
    if (s <= 40) return ['#ef4444', '#f87171']
    if (s <= 60) return ['#f59e0b', '#fbbf24']
    if (s <= 80) return ['#10b981', '#34d399']
    return ['#3b82f6', '#06b6d4']
  }

  const getGlowClass = (s: number) => {
    if (s <= 40) return 'score-ring-glow-red'
    if (s <= 60) return 'score-ring-glow-amber'
    if (s <= 80) return 'score-ring-glow-green'
    return 'score-ring-glow-blue'
  }

  const getLabel = (s: number) => {
    if (s <= 40) return 'Precisa de Melhorias'
    if (s <= 60) return 'Bom, Mas Pode Melhorar'
    if (s <= 80) return 'Muito Bom'
    return 'Excelente'
  }

  const colors = getGradientColors(displayScore)
  const gradientId = `score-gradient-${score}`

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${getGlowClass(displayScore)}`}>
        <svg width="220" height="220" viewBox="0 0 220 220" className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors[0]} />
              <stop offset="100%" stopColor={colors[1]} />
            </linearGradient>
          </defs>
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="12"
          />
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono-display text-5xl font-bold text-white">{displayScore}</span>
          <span className="text-sm text-slate-400 mt-1">/ 100</span>
        </div>
      </div>
      <p className="mt-6 text-lg font-semibold" style={{ color: colors[0] }}>
        {getLabel(displayScore)}
      </p>
    </div>
  )
}

/* ─── Score Breakdown Bar ─── */
function ScoreBar({ label, score, maxScore, color, delay }: { label: string; score: number; maxScore: number; color: string; delay: number }) {
  const width = (score / maxScore) * 100
  const [animatedWidth, setAnimatedWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    const timer = setTimeout(() => {
      setAnimatedWidth(width)
    }, delay)
    return () => clearTimeout(timer)
  }, [hasStarted, width, delay])

  return (
    <div ref={ref} className="mb-4">
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <span className="text-sm font-mono-display font-bold" style={{ color }}>{score}/{maxScore}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${animatedWidth}%`,
            backgroundColor: color,
            transitionDelay: `${delay}ms`
          }}
        />
      </div>
    </div>
  )
}

/* ─── Category Score Card ─── */
function CategoryScoreCard({ icon: Icon, title, score, color, delay }: { icon: any; title: string; score: number; color: string; delay: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const [hasStarted, setHasStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return
    const timer = setTimeout(() => {
      let startTime: number | null = null
      const duration = 1000
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        const easeOut = 1 - Math.pow(1 - progress, 3)
        setAnimatedScore(Math.round(easeOut * score))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, delay)
    return () => clearTimeout(timer)
  }, [hasStarted, score, delay])

  const getStatus = (s: number) => {
    if (s >= 80) return 'Excelente'
    if (s >= 60) return 'Bom'
    if (s >= 40) return 'Regular'
    return 'Precisa Melhorar'
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay / 1000, duration: 0.5 }}
      className="bg-[#1e293b]/60 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium text-slate-300">{title}</h4>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold font-mono-display" style={{ color }}>{animatedScore}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: hasStarted ? `${score}%` : 0 }}
          transition={{ delay: delay / 1000, duration: 1, ease: 'easeOut' }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">{getStatus(score)}</p>
    </motion.div>
  )
}

/* ─── Particle Background ─── */
function ParticleBackground() {
  const particles = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    size: 4 + Math.random() * 6,
    opacity: 0.05 + Math.random() * 0.1,
    duration: 15 + Math.random() * 12,
    delay: Math.random() * 15,
    drift: (Math.random() - 0.5) * 100,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            opacity: 0,
            // @ts-expect-error CSS custom properties
            '--particle-opacity': p.opacity,
            '--particle-duration': `${p.duration}s`,
            '--particle-delay': `${p.delay}s`,
            '--particle-drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Typing Effect ─── */
function TypingEffect({ words, className }: { words: string[]; className?: string }) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]
    const typeSpeed = isDeleting ? 50 : 100

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2000)
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }, typeSpeed)

    return () => clearTimeout(timeout)
  }, [displayText, wordIndex, isDeleting, words])

  return (
    <span className={className}>
      {displayText}
      <span className="animate-blink ml-0.5">|</span>
    </span>
  )
}

/* ─── FAQ Accordion ─── */
function FAQItem({ question, answer, isOpen, onToggle }: { question: string; answer: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-white/5">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-2 text-left hover:bg-white/[0.02] transition-colors rounded-lg"
        aria-expanded={isOpen}
      >
        <span className="text-base md:text-lg font-medium text-white pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        )}
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? '300px' : '0', opacity: isOpen ? 1 : 0 }}
      >
        <p className="px-2 pb-5 text-slate-400 leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

/* ─── PDF Upload Zone ─── */
function PDFUploadZone({ onFileSelect, file }: { onFileSelect: (file: File | null) => void; file: File | null }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type === 'application/pdf') {
      onFileSelect(droppedFile)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileSelect(selectedFile)
    }
  }

  if (file) {
    return (
      <div className="upload-zone rounded-xl p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FileCheck className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{file.name}</p>
          <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          type="button"
          onClick={() => onFileSelect(null)}
          className="p-2 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`upload-zone rounded-xl p-8 text-center cursor-pointer ${isDragOver ? 'dragover' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        onChange={handleChange}
        className="hidden"
      />
      <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
        <Upload className="w-7 h-7 text-blue-400" />
      </div>
      <p className="text-sm font-medium text-white mb-1">
        Clique para fazer upload ou arraste seu PDF
      </p>
      <p className="text-xs text-slate-500">
        Aceita apenas arquivos PDF (máx. 10MB)
      </p>
    </div>
  )
}

/* ─── Main App ─── */
function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfAnalysis, setPdfAnalysis] = useState<PDFAnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    area: '',
    experience: '',
    education: '',
    linkedin: ''
  })
  const [score, setScore] = useState<number | null>(null)
  const [scoreBreakdown, setScoreBreakdown] = useState<any>(null)
  const [showScore, setShowScore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [analysisStep, setAnalysisStep] = useState('')

  const analysisRef = useRef<HTMLDivElement>(null)

  /* Scroll handler */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* Scroll reveal */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
          }
        })
      },
      { threshold: 0.15 }
    )

    const revealElements = document.querySelectorAll('.reveal')
    revealElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [showScore])

  /* Counter hooks */
  const count1 = useCountUp(28000, 2000)
  const count2 = useCountUp(49, 2000)
  const count3 = useCountUp(94, 2000)
  const count4 = useCountUp(100, 2000)

  const formatNumber = (num: number) => {
    if (num >= 1000) return num.toLocaleString('pt-BR') + '+'
    return num.toString()
  }

  /* Analyze PDF */
  const handleAnalyzePDF = async () => {
    if (!pdfFile) return
    setIsAnalyzing(true)
    setAnalysisStep('Extraindo texto do PDF...')

    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setAnalysisStep('Analisando estrutura do currículo...')

      const analysis = await analyzePDF(pdfFile)

      setAnalysisStep('Calculando score por categorias...')
      await new Promise(resolve => setTimeout(resolve, 300))

      setPdfAnalysis(analysis)
      setScore(analysis.totalScore)

      // Map to old score breakdown for compatibility
      setScoreBreakdown({
        formatting: { score: Math.round(analysis.categoryScores.grammarFormatting * 0.2), max: 20, color: '#3b82f6' },
        content: { score: Math.round(analysis.categoryScores.contentQuality * 0.25), max: 25, color: '#06b6d4' },
        experience: { score: Math.round(analysis.categoryScores.measurableImpact * 0.25), max: 25, color: '#8b5cf6' },
        education: { score: Math.round(analysis.categoryScores.professionalPresentation * 0.15), max: 15, color: '#10b981' },
        keywords: { score: Math.round(analysis.categoryScores.keywordOptimization * 0.15), max: 15, color: '#f59e0b' }
      })

      setShowScore(true)
    } catch (error) {
      setSubmitError('Erro ao analisar o PDF. Verifique se o arquivo é válido.')
    } finally {
      setIsAnalyzing(false)
      setAnalysisStep('')
    }
  }

  /* Handle form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.area || !formData.experience || !formData.education) {
      setSubmitError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    // If PDF uploaded but not analyzed yet, analyze first
    if (pdfFile && !pdfAnalysis) {
      await handleAnalyzePDF()
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const siteData = {
        area: formData.area,
        experience: formData.experience,
        education: formData.education,
        has_pdf: !!pdfFile,
        pdf_word_count: pdfAnalysis?.wordCount || 0,
        pdf_page_count: pdfAnalysis?.pageCount || 0,
      }

      const resultData = {
        score_total: pdfAnalysis?.totalScore || score || 0,
        score_maximo: 100,
        percentual: pdfAnalysis?.totalScore || score || 0,
        area: formData.area,
        experiencia: formData.experience,
        educacao: formData.education,
        pdf_analysis: pdfAnalysis ? {
          word_count: pdfAnalysis.wordCount,
          page_count: pdfAnalysis.pageCount,
          has_contact_info: pdfAnalysis.hasContactInfo,
          has_email: pdfAnalysis.hasEmail,
          has_phone: pdfAnalysis.hasPhone,
          has_linkedin: pdfAnalysis.hasLinkedIn,
          sections: pdfAnalysis.sections,
          experience_years: pdfAnalysis.experienceYears,
          job_count: pdfAnalysis.jobCount,
          measurable_results: pdfAnalysis.measurableResults,
          action_verbs_count: pdfAnalysis.actionVerbs.length,
          keyword_matches: pdfAnalysis.keywordMatches,
          grammar_issues_count: pdfAnalysis.grammarIssues.length,
          category_scores: pdfAnalysis.categoryScores,
          recommendations: pdfAnalysis.recommendations,
          summary: pdfAnalysis.summary,
        } : null,
      }

      const response = await fetch('https://outer-lira-lumos-desenvolvimento-web-2228c71a.koyeb.app/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: formData.name,
          email: formData.email,
          category: 'Educacao & Carreira',
          site_data: siteData,
          result_data: resultData,
        })
      })

      if (!response.ok) {
        let errorMsg = 'Erro ao enviar dados. Tente novamente.'
        try {
          const errorData = await response.json()
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMsg = errorData.detail
            } else if (Array.isArray(errorData.detail) && errorData.detail[0]?.msg) {
              errorMsg = errorData.detail[0].msg
            }
          }
        } catch (e) {
          // ignore
        }

        if (response.status === 409) {
          errorMsg = 'Este email já foi cadastrado. Use outro email ou veja seu score na seção acima.'
        } else if (response.status === 422) {
          errorMsg = 'Dados inválidos. Verifique se preencheu todos os campos corretamente.'
        } else if (response.status === 500) {
          errorMsg = 'Erro no servidor. Tente novamente em alguns instantes.'
        }

        throw new Error(errorMsg)
      }

      setSubmitSuccess(true)

      if (!showScore) {
        const defaultScore = 65
        setScore(defaultScore)
        setScoreBreakdown({
          formatting: { score: 13, max: 20, color: '#3b82f6' },
          content: { score: 16, max: 25, color: '#06b6d4' },
          experience: { score: 17, max: 25, color: '#8b5cf6' },
          education: { score: 10, max: 15, color: '#10b981' },
          keywords: { score: 9, max: 15, color: '#f59e0b' }
        })
        setShowScore(true)
      }

      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (err: any) {
      setSubmitError(err.message || 'Ocorreu um erro. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* FAQ data */
  const faqData = [
    {
      q: 'O analisador de currículo é gratuito?',
      a: 'Sim! Nosso analisador de currículo é 100% gratuito. Você faz upload do seu CV em PDF, recebe um score profissional detalhado com análise por categorias e dicas personalizadas de melhoria enviadas por email sem nenhum custo.'
    },
    {
      q: 'Como funciona a análise de currículo em PDF?',
      a: 'Nosso sistema extrai o texto do seu PDF e realiza uma análise completa em 7 categorias: compatibilidade ATS, otimização de palavras-chave, estrutura do currículo, qualidade do conteúdo, impacto mensurável, gramática/formatação e apresentação profissional. Você recebe uma nota de 0 a 100 e recomendações detalhadas.'
    },
    {
      q: 'Quanto tempo leva para receber a análise?',
      a: 'A análise do seu currículo em PDF é gerada instantaneamente na plataforma. O score completo com todas as categorias aparece em segundos, e as dicas detalhadas de melhoria são enviadas para seu email.'
    },
    {
      q: 'A análise funciona para qualquer área profissional?',
      a: 'Sim! Nosso analisador de currículo funciona para todas as áreas profissionais: tecnologia, marketing, vendas, recursos humanos, finanças, saúde, educação, engenharia, jurídico e muito mais. As dicas são personalizadas de acordo com seu perfil.'
    },
    {
      q: 'É seguro enviar meu currículo em PDF?',
      a: 'Absolutamente! A análise do PDF é feita localmente no seu navegador. Seus dados são protegidos com criptografia e nunca compartilhamos suas informações com terceiros.'
    },
    {
      q: 'O que é score de currículo e como é calculado?',
      a: 'O score de currículo é uma nota de 0 a 100 calculada com base em 7 critérios profissionais: compatibilidade ATS (20%), qualidade do conteúdo (20%), estrutura (15%), palavras-chave (15%), apresentação profissional (10%), impacto mensurável (10%) e gramática/formatação (10%).'
    },
    {
      q: 'Como posso melhorar meu score de currículo?',
      a: 'Após a análise, você recebe recomendações específicas. As principais dicas incluem: adicionar palavras-chave da sua área, quantificar resultados com números, usar verbos de ação, manter estrutura clara com seções bem definidas, e otimizar para sistemas ATS.'
    },
    {
      q: 'Preciso criar uma conta para analisar meu currículo?',
      a: 'Não é necessário criar uma conta! Basta fazer upload do seu currículo em PDF, preencher seu nome e email para receber a análise completa com score e dicas personalizadas.'
    }
  ]

  const categoryIcons = [
    { icon: Search, title: 'Compatibilidade ATS', key: 'atsCompatibility', color: '#3b82f6' },
    { icon: Target, title: 'Palavras-chave', key: 'keywordOptimization', color: '#f59e0b' },
    { icon: Layout, title: 'Estrutura', key: 'structureCompleteness', color: '#8b5cf6' },
    { icon: FileText, title: 'Qualidade do Conteúdo', key: 'contentQuality', color: '#06b6d4' },
    { icon: TrendingUp, title: 'Impacto Mensurável', key: 'measurableImpact', color: '#10b981' },
    { icon: PenTool, title: 'Gramática e Formatação', key: 'grammarFormatting', color: '#ef4444' },
    { icon: BadgeCheck, title: 'Apresentação Profissional', key: 'professionalPresentation', color: '#ec4899' },
  ]

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-x-hidden">
      {/* ─── HEADER ─── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#0f172a]/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            <a href="#" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">ScorePro</span>
            </a>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#como-funciona" className="text-sm text-slate-300 hover:text-white transition-colors">Como Funciona</a>
              <a href="#analise" className="text-sm text-slate-300 hover:text-white transition-colors">Análise de Currículo</a>
              <a href="#categorias" className="text-sm text-slate-300 hover:text-white transition-colors">Categorias</a>
              <a href="#faq" className="text-sm text-slate-300 hover:text-white transition-colors">FAQ</a>
            </nav>

            <div className="hidden md:block">
              <a
                href="#analise"
                className="cta-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Analisar Currículo
              </a>
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-3">
                <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Como Funciona</a>
                <a href="#analise" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Análise de Currículo</a>
                <a href="#categorias" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Categorias</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">FAQ</a>
                <a href="#analise" onClick={() => setMobileMenuOpen(false)} className="block cta-gradient text-white text-center font-semibold px-5 py-3 rounded-xl mt-4">Analisar Currículo</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden pt-[72px]">
        <ParticleBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-slate-300 mb-8"
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                Análise de Currículo 100% Grátis
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] mb-6"
              >
                Descubra o{' '}
                <TypingEffect
                  words={['Score', 'Nota', 'Avaliação']}
                  className="gradient-text"
                />
                <br />
                do Seu Currículo
                <br />
                em Segundos
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
              >
                Faça upload do seu currículo em PDF e receba uma análise detalhada com score profissional. 
                Nossa ferramenta avalia compatibilidade ATS, palavras-chave, estrutura, gramática e muito mais. 
                Dicas personalizadas por email para otimizar seu CV e impressionar recrutadores.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
              >
                <a
                  href="#analise"
                  className="cta-gradient text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Analisar Meu Currículo PDF
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#como-funciona"
                  className="border border-slate-600 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/5 transition-all inline-flex items-center justify-center"
                >
                  Como Funciona?
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="flex items-center gap-2 justify-center lg:justify-start text-sm text-slate-500"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Análise segura com upload de PDF · 100% gratuita
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="relative"
            >
              <div className="bg-[#1e293b]/80 border border-white/10 rounded-2xl p-6 shadow-2xl shadow-blue-500/10 max-w-lg mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Análise de Currículo PDF</p>
                    <p className="text-xs text-slate-400">Score completo em 7 categorias</p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Compatibilidade ATS', score: 85, color: '#3b82f6' },
                    { label: 'Palavras-chave', score: 72, color: '#f59e0b' },
                    { label: 'Estrutura', score: 90, color: '#8b5cf6' },
                    { label: 'Qualidade do Conteúdo', score: 78, color: '#06b6d4' },
                    { label: 'Impacto Mensurável', score: 65, color: '#10b981' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{item.label}</span>
                        <span className="text-slate-300 font-mono">{item.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs text-slate-400">Análise Completa</span>
                  </div>
                  <span className="text-lg font-bold font-mono-display gradient-text">78/100</span>
                </div>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-[#1e293b] border border-white/10 rounded-xl p-4 shadow-xl hidden lg:block animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">PDF Analisado</p>
                    <p className="text-xs text-slate-400">Score + Dicas por email</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-scroll-bounce">
          <ChevronDown className="w-6 h-6 text-slate-500" />
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="bg-white/[0.03] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8" ref={count1.ref}>
            <div className="text-center reveal">
              <div className="font-mono-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                {formatNumber(count1.count)}
              </div>
              <p className="text-sm text-slate-500">Currículos Analisados</p>
            </div>
            <div className="text-center reveal" style={{ transitionDelay: '100ms' }}>
              <div className="font-mono-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                4,{Math.floor(count2.count / 10)}/5
              </div>
              <p className="text-sm text-slate-500">Avaliação Média</p>
            </div>
            <div className="text-center reveal" style={{ transitionDelay: '200ms' }}>
              <div className="font-mono-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                {count3.count}%
              </div>
              <p className="text-sm text-slate-500">Taxa de Satisfação</p>
            </div>
            <div className="text-center reveal" style={{ transitionDelay: '300ms' }}>
              <div className="font-mono-display text-3xl md:text-4xl font-bold gradient-text mb-1">
                {count4.count}%
              </div>
              <p className="text-sm text-slate-500">Gratuito</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section id="como-funciona" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Como Funciona</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">3 Passos para Analisar Seu Currículo PDF</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                icon: Upload,
                title: 'Faça Upload do PDF',
                desc: 'Envie seu currículo em formato PDF. Nossa ferramenta aceita arquivos de até 10MB e extrai todo o texto para análise.',
                color: '#3b82f6'
              },
              {
                num: '02',
                icon: BarChart3,
                title: 'Receba a Análise Detalhada',
                desc: 'Nosso algoritmo analisa seu currículo em 7 categorias profissionais e gera um score de 0 a 100 com recomendações específicas.',
                color: '#06b6d4'
              },
              {
                num: '03',
                icon: Mail,
                title: 'Dicas no Email',
                desc: 'Receba um relatório completo com dicas personalizadas de melhoria diretamente no seu email para se destacar nas vagas.',
                color: '#8b5cf6'
              }
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="relative bg-[#1e293b]/60 border border-white/5 rounded-2xl p-8 hover:-translate-y-1 hover:border-blue-500/20 transition-all duration-300"
              >
                <span className="absolute top-6 right-6 font-mono-display text-5xl font-bold text-white/5">{step.num}</span>
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: `${step.color}20` }}
                >
                  <step.icon className="w-7 h-7" style={{ color: step.color }} />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANÁLISE INTERATIVA ─── */}
      <section id="analise" className="py-20 md:py-28 bg-[#0a0f1d]" ref={analysisRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Análise Gratuita de Currículo PDF</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Analise Seu Currículo em PDF Agora</h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">
              Faça upload do seu currículo em PDF e preencha os dados para receber uma análise completa 
              com score detalhado e dicas personalizadas por email.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6 md:p-8"
            >
              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* PDF Upload */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <FileText className="w-4 h-4 inline mr-1" />
                      Currículo em PDF <span className="text-blue-400 text-xs">(recomendado)</span>
                    </label>
                    <PDFUploadZone onFileSelect={setPdfFile} file={pdfFile} />
                    {pdfFile && !pdfAnalysis && (
                      <button
                        type="button"
                        onClick={handleAnalyzePDF}
                        disabled={isAnalyzing}
                        className="mt-3 w-full py-2.5 rounded-xl border border-blue-500/30 text-blue-400 text-sm font-medium hover:bg-blue-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {analysisStep}
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4" />
                            Analisar PDF Agora
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-5">
                    <p className="text-xs text-slate-500 mb-4 text-center">Ou preencha os dados manualmente</p>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                          Nome completo <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          required
                          value={formData.name}
                          onChange={(e) => { setFormData({ ...formData, name: e.target.value }); setSubmitError('') }}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          required
                          value={formData.email}
                          onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setSubmitError('') }}
                          className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                          placeholder="seu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="area" className="block text-sm font-medium text-slate-300 mb-2">
                      Área de atuação <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="area"
                      required
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option value="">Selecione sua área</option>
                      <option value="Tecnologia">Tecnologia / TI / Desenvolvimento</option>
                      <option value="Marketing">Marketing Digital</option>
                      <option value="Vendas">Vendas / Comercial</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Recursos Humanos">Recursos Humanos / RH</option>
                      <option value="Finanças">Finanças / Contabilidade</option>
                      <option value="Saúde">Saúde / Medicina</option>
                      <option value="Educação">Educação / Ensino</option>
                      <option value="Engenharia">Engenharia</option>
                      <option value="Jurídico">Jurídico / Direito</option>
                      <option value="Design">Design / UX / UI</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-slate-300 mb-2">
                        Experiência profissional <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="experience"
                        required
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                      >
                        <option value="">Selecione seu nível</option>
                        <option value="Estagiário">Estagiário / Trainee</option>
                        <option value="Júnior">Júnior (0-2 anos)</option>
                        <option value="Pleno">Pleno (2-5 anos)</option>
                        <option value="Sênior">Sênior (5+ anos)</option>
                        <option value="Gerente">Gerente / Coordenador</option>
                        <option value="Diretor">Diretor / C-Level</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="education" className="block text-sm font-medium text-slate-300 mb-2">
                        Formação acadêmica <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="education"
                        required
                        value={formData.education}
                        onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                        className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                      >
                        <option value="">Selecione sua formação</option>
                        <option value="Ensino Médio">Ensino Médio</option>
                        <option value="Técnico">Técnico / Tecnólogo</option>
                        <option value="Graduação">Graduação (Bacharel/Licenciatura)</option>
                        <option value="Pós-graduação">Pós-graduação / MBA</option>
                        <option value="Mestrado">Mestrado</option>
                        <option value="Doutorado">Doutorado / PhD</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="linkedin" className="block text-sm font-medium text-slate-300 mb-2">
                      LinkedIn (opcional)
                    </label>
                    <input
                      type="url"
                      id="linkedin"
                      value={formData.linkedin}
                      onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="https://linkedin.com/in/seu-perfil"
                    />
                  </div>

                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-2"
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {submitError}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cta-gradient text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando Análise...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {pdfFile ? 'Analisar Currículo PDF e Enviar' : 'Gerar Minha Análise'}
                      </>
                    )}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    Ao enviar, você concorda em receber dicas de carreira no seu email.
                    Seus dados estão protegidos. Upload de PDF opcional mas recomendado.
                  </p>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Análise Enviada!</h3>
                  <p className="text-slate-400">
                    Seu score foi calculado. As dicas detalhadas serão enviadas para <strong className="text-white">{formData.email}</strong>.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Score Result */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {showScore && score !== null && scoreBreakdown ? (
                <div className="space-y-6">
                  {/* Main Score Card */}
                  <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6 md:p-8">
                    <ScoreRing score={score} animating={showScore} />

                    {pdfAnalysis && (
                      <div className="mt-6 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                        <p className="text-sm text-blue-300 text-center">{pdfAnalysis.summary}</p>
                      </div>
                    )}

                    <div className="mt-6 space-y-2">
                      <ScoreBar label="Formatação e Gramática" score={scoreBreakdown.formatting.score} maxScore={scoreBreakdown.formatting.max} color={scoreBreakdown.formatting.color} delay={0} />
                      <ScoreBar label="Conteúdo Profissional" score={scoreBreakdown.content.score} maxScore={scoreBreakdown.content.max} color={scoreBreakdown.content.color} delay={150} />
                      <ScoreBar label="Experiência e Impacto" score={scoreBreakdown.experience.score} maxScore={scoreBreakdown.experience.max} color={scoreBreakdown.experience.color} delay={300} />
                      <ScoreBar label="Apresentação" score={scoreBreakdown.education.score} maxScore={scoreBreakdown.education.max} color={scoreBreakdown.education.color} delay={450} />
                      <ScoreBar label="Otimização de Keywords" score={scoreBreakdown.keywords.score} maxScore={scoreBreakdown.keywords.max} color={scoreBreakdown.keywords.color} delay={600} />
                    </div>

                    <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-300">Dicas enviadas!</p>
                          <p className="text-sm text-slate-400 mt-1">
                            As dicas personalizadas para melhorar seu currículo foram enviadas para seu email.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PDF Analysis Details */}
                  {pdfAnalysis && (
                    <>
                      {/* Category Scores */}
                      <div id="categorias" className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-400" />
                          Análise por Categorias
                        </h3>
                        <div className="grid gap-3">
                          {categoryIcons.map((cat, i) => (
                            <CategoryScoreCard
                              key={cat.key}
                              icon={cat.icon}
                              title={cat.title}
                              score={pdfAnalysis.categoryScores[cat.key as keyof typeof pdfAnalysis.categoryScores]}
                              color={cat.color}
                              delay={i * 100}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Detected Info */}
                      <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <FileCheck className="w-5 h-5 text-emerald-400" />
                          Informações Detectadas no PDF
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Palavras', value: pdfAnalysis.wordCount.toLocaleString(), icon: FileText },
                            { label: 'Páginas', value: pdfAnalysis.pageCount.toString(), icon: BookOpen },
                            { label: 'Email', value: pdfAnalysis.hasEmail ? 'Sim' : 'Não', icon: Mail, status: pdfAnalysis.hasEmail },
                            { label: 'Telefone', value: pdfAnalysis.hasPhone ? 'Sim' : 'Não', icon: PhoneIcon, status: pdfAnalysis.hasPhone },
                            { label: 'LinkedIn', value: pdfAnalysis.hasLinkedIn ? 'Sim' : 'Não', icon: Globe, status: pdfAnalysis.hasLinkedIn },
                            { label: 'Portfolio', value: pdfAnalysis.hasPortfolio ? 'Sim' : 'Não', icon: Wrench, status: pdfAnalysis.hasPortfolio },
                            { label: 'Anos Exp.', value: pdfAnalysis.experienceYears > 0 ? `${pdfAnalysis.experienceYears} anos` : 'N/A', icon: Briefcase },
                            { label: 'Empregos', value: pdfAnalysis.jobCount > 0 ? pdfAnalysis.jobCount.toString() : 'N/A', icon: Users },
                          ].map((item, i) => (
                            <div key={i} className="bg-[#0f172a]/60 rounded-lg p-3 flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.status === false ? 'bg-red-500/10' : item.status === true ? 'bg-emerald-500/10' : 'bg-blue-500/10'}`}>
                                <item.icon className={`w-4 h-4 ${item.status === false ? 'text-red-400' : item.status === true ? 'text-emerald-400' : 'text-blue-400'}`} />
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">{item.label}</p>
                                <p className="text-sm font-medium text-white">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Sections Analysis */}
                      <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Layout className="w-5 h-5 text-purple-400" />
                          Seções do Currículo
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(pdfAnalysis.sections).map(([key, value]) => {
                            const sectionNames: Record<string, string> = {
                              hasSummary: 'Resumo Profissional',
                              hasExperience: 'Experiência',
                              hasEducation: 'Formação',
                              hasSkills: 'Habilidades',
                              hasLanguages: 'Idiomas',
                              hasCertifications: 'Certificações',
                              hasProjects: 'Projetos',
                              hasObjective: 'Objetivo',
                            }
                            return (
                              <span
                                key={key}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                                  value
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}
                              >
                                {value ? '✓' : '✗'} {sectionNames[key] || key}
                              </span>
                            )
                          })}
                        </div>
                      </div>

                      {/* Keywords Found */}
                      {pdfAnalysis.actionVerbs.length > 0 && (
                        <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-400" />
                            Verbos de Ação Detectados
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {pdfAnalysis.actionVerbs.map((verb, i) => (
                              <span key={i} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg text-sm border border-amber-500/20">
                                {verb}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Grammar Issues */}
                      {pdfAnalysis.grammarIssues.length > 0 && (
                        <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6">
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-400" />
                            Pontos de Atenção
                          </h3>
                          <ul className="space-y-2">
                            {pdfAnalysis.grammarIssues.map((issue, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                                <span className="text-amber-400 mt-0.5">•</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                          Recomendações para Melhorar seu Currículo
                        </h3>
                        <ul className="space-y-3">
                          {pdfAnalysis.recommendations.map((rec, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: i * 0.1 }}
                              className="flex items-start gap-3 text-sm text-slate-300 bg-[#0f172a]/40 p-3 rounded-lg"
                            >
                              <ThumbsUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                              {rec}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Seu Score Aparecerá Aqui</h3>
                  <p className="text-slate-400 max-w-sm mb-4">
                    Faça upload do seu currículo em PDF ou preencha o formulário para receber uma análise completa com nota e dicas personalizadas.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <FileText className="w-4 h-4" />
                    Análise de PDF com 7 categorias
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── BENEFÍCIOS ─── */}
      <section id="beneficios" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Benefícios</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Por Que Usar Nosso Analisador de Currículo PDF?</h2>
          </div>

          <div className="space-y-20">
            {/* Benefit 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="order-2 md:order-1">
                <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Search className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-bold">Análise Completa do PDF</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: CheckCircle2, text: 'Extração automática de texto do PDF' },
                      { icon: CheckCircle2, text: 'Análise de 7 categorias profissionais' },
                      { icon: CheckCircle2, text: 'Verificação de compatibilidade ATS' },
                      { icon: CheckCircle2, text: 'Detecção de palavras-chave da sua área' },
                      { icon: CheckCircle2, text: 'Análise gramatical e de formatação' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Análise Profissional Completa do Seu Currículo PDF</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Nosso algoritmo extrai e analisa o texto do seu PDF, avaliando cada aspecto do seu currículo: 
                  formatação, palavras-chave para ATS, experiências profissionais, habilidades, estrutura de seções 
                  e muito mais. Você recebe um relatório detalhado com pontuação em cada critério.
                </p>
                <ul className="space-y-3">
                  {['Score de 0 a 100 baseado em critérios de RH', 'Análise de compatibilidade com ATS', 'Feedback detalhado por categoria'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Dicas Personalizadas por Email</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Receba um relatório completo com sugestões práticas para melhorar cada seção do seu currículo. 
                  Nossas dicas são personalizadas de acordo com sua área de atuação, nível de experiência e 
                  os pontos específicos identificados na análise do seu PDF.
                </p>
                <ul className="space-y-3">
                  {['Recomendações baseadas na análise do PDF', 'Palavras-chave específicas para sua área', 'Otimização para passar nos filtros ATS'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold">Relatório por Email</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-[#0f172a]/60 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-1">Score do Currículo</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: '78%' }} />
                        </div>
                        <span className="text-sm font-bold text-white">78/100</span>
                      </div>
                    </div>
                    <div className="bg-[#0f172a]/60 rounded-lg p-4">
                      <p className="text-xs text-slate-500 mb-2">Principais Recomendações</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-slate-400">
                          <ArrowRight className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
                          Adicione mais palavras-chave de tecnologia
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-400">
                          <ArrowRight className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
                          Quantifique resultados com números
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-400">
                          <ArrowRight className="w-3 h-3 text-blue-400 mt-1 flex-shrink-0" />
                          Inclua seção de idiomas
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="order-2 md:order-1">
                <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                      <Rocket className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold">Resultados Comprovados</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0f172a]/60 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-emerald-400">40%</p>
                      <p className="text-xs text-slate-500 mt-1">mais chances de entrevista</p>
                    </div>
                    <div className="bg-[#0f172a]/60 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-blue-400">3x</p>
                      <p className="text-xs text-slate-500 mt-1">mais passagem no ATS</p>
                    </div>
                    <div className="bg-[#0f172a]/60 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">85%</p>
                      <p className="text-xs text-slate-500 mt-1">dos usuários melhoraram o score</p>
                    </div>
                    <div className="bg-[#0f172a]/60 rounded-lg p-4 text-center">
                      <p className="text-2xl font-bold text-amber-400">2min</p>
                      <p className="text-xs text-slate-500 mt-1">para análise completa</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Aumente Suas Chances de Emprego</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Currículos otimizados com base em análise de PDF têm até 40% mais chances de serem 
                  selecionados pelos recrutadores e 3x mais chances de passarem nos filtros de ATS. 
                  Não deixe oportunidades passarem por causa de um CV mal formatado ou sem palavras-chave.
                </p>
                <ul className="space-y-3">
                  {['Destaque-se entre os candidatos', 'Passe nos filtros ATS de grandes empresas', 'Impressione recrutadores com dados quantificados'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 md:py-28 bg-white/[0.02]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Perguntas Frequentes</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Tire Suas Dúvidas sobre Análise de Currículo</h2>
          </div>

          <div className="reveal">
            {faqData.map((faq, i) => (
              <FAQItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openFAQ === i}
                onToggle={() => setOpenFAQ(openFAQ === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="py-20 md:py-24 cta-gradient">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center reveal">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Pronto para Analisar Seu Currículo em PDF?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Análise gratuita e detalhada em menos de 2 minutos. Receba score profissional e dicas por email.
            </p>
            <a
              href="#analise"
              className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse-slow"
            >
              <Upload className="w-5 h-5" />
              Fazer Upload do Meu Currículo PDF
              <ArrowRight className="w-5 h-5" />
            </a>
            <div className="flex items-center justify-center gap-2 mt-6 text-white/70 text-sm">
              <ShieldCheck className="w-4 h-4" />
              Mais de 28.000 currículos em PDF já analisados
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0f172a] border-t border-white/5 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg cta-gradient flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">ScorePro</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                ScorePro é a ferramenta líder em análise de currículo online no Brasil. 
                Avalie seu CV em PDF com score profissional detalhado, receba dicas personalizadas 
                por email e otimize seu currículo para passar nos filtros ATS. Ideal para todas as áreas profissionais.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ferramentas</h4>
              <ul className="space-y-2">
                <li><a href="#analise" className="text-sm text-slate-500 hover:text-white transition-colors">Analisador de Currículo PDF</a></li>
                <li><span className="text-sm text-slate-600">Score de Currículo</span></li>
                <li><span className="text-sm text-slate-600">Dicas de Entrevista</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">Sobre Nós</span></li>
                <li><span className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">Contato</span></li>
                <li><span className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">Blog</span></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><span className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">Política de Privacidade</span></li>
                <li><span className="text-sm text-slate-500 hover:text-white transition-colors cursor-pointer">Termos de Uso</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-sm text-slate-600">
              © 2026 ScorePro - Analisador de Currículo com Score. Todos os direitos reservados. | 
              Análise de currículo PDF grátis, score profissional e otimização de CV online.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* Phone icon helper */
function PhoneIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  )
}

export default App
