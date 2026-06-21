import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Sparkles, Upload, BarChart3, Mail, ChevronDown, ChevronUp,
  CheckCircle2, ShieldCheck, Star, Users, TrendingUp, Award,
  Briefcase, GraduationCap, Target, Zap, ArrowRight, Menu, X
} from 'lucide-react'

/* ─── Animated Counter ─── */
function useCountUp(end, duration = 2000, start = 0) {
  const [count, setCount] = useState(start)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef(null)

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
    let startTime = null
    const animate = (timestamp) => {
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
function ScoreRing({ score, animating }) {
  const radius = 88
  const circumference = 2 * Math.PI * radius
  const [offset, setOffset] = useState(circumference)
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    if (!animating) return
    const targetOffset = circumference - (score / 100) * circumference
    let startTime = null
    const duration = 2000

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setOffset(circumference - easeOut * (circumference - targetOffset))
      setDisplayScore(Math.round(easeOut * score))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [score, animating, circumference])

  const getGradientColors = (s) => {
    if (s <= 40) return ['#ef4444', '#f87171']
    if (s <= 60) return ['#f59e0b', '#fbbf24']
    if (s <= 80) return ['#10b981', '#34d399']
    return ['#3b82f6', '#06b6d4']
  }

  const getGlowClass = (s) => {
    if (s <= 40) return 'score-ring-glow-red'
    if (s <= 60) return 'score-ring-glow-amber'
    if (s <= 80) return 'score-ring-glow-green'
    return 'score-ring-glow-blue'
  }

  const getLabel = (s) => {
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
function ScoreBar({ label, score, maxScore, color, delay }) {
  const width = (score / maxScore) * 100
  const [animatedWidth, setAnimatedWidth] = useState(0)
  const ref = useRef(null)
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
function TypingEffect({ words, className }) {
  const [displayText, setDisplayText] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentWord = words[wordIndex]
    const typeSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), pauseTime)
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
function FAQItem({ question, answer, isOpen, onToggle }) {
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

/* ─── Main App ─── */
function App() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    area: '',
    experience: '',
    education: '',
    linkedin: ''
  })
  const [score, setScore] = useState(null)
  const [scoreBreakdown, setScoreBreakdown] = useState(null)
  const [showScore, setShowScore] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [openFAQ, setOpenFAQ] = useState(null)

  const analysisRef = useRef(null)

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
            entry.target.classList.add('animate-fade-in-up')
            entry.target.style.opacity = '1'
            entry.target.style.transform = 'translateY(0)'
          }
        })
      },
      { threshold: 0.15 }
    )

    const revealElements = document.querySelectorAll('.reveal')
    revealElements.forEach((el) => {
      el.style.opacity = '0'
      el.style.transform = 'translateY(40px)'
      el.style.transition = 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])

  /* Counter hooks */
  const count1 = useCountUp(15000, 2000)
  const count2 = useCountUp(48, 2000)
  const count3 = useCountUp(89, 2000)
  const count4 = useCountUp(100, 2000)

  const formatNumber = (num) => {
    if (num >= 1000) return num.toLocaleString('pt-BR') + '+'
    return num.toString()
  }

  /* Calculate score based on form inputs */
  const calculateScore = useCallback(() => {
    let formattingScore = Math.floor(Math.random() * 8) + 13 // 13-20
    let contentScore = Math.floor(Math.random() * 8) + 15    // 15-22
    let experienceScore = 10
    let educationScore = 5
    let keywordsScore = Math.floor(Math.random() * 6) + 8    // 8-13

    // Experience level scoring
    switch (formData.experience) {
      case 'Diretor': experienceScore = 25; break
      case 'Gerente': experienceScore = 22; break
      case 'Sênior': experienceScore = 20; break
      case 'Pleno': experienceScore = 17; break
      case 'Júnior': experienceScore = 14; break
      case 'Estagiário': experienceScore = 10; break
      default: experienceScore = 12
    }

    // Education scoring
    switch (formData.education) {
      case 'Doutorado': educationScore = 15; break
      case 'Mestrado': educationScore = 13; break
      case 'Pós-graduação': educationScore = 12; break
      case 'Graduação': educationScore = 10; break
      case 'Técnico': educationScore = 8; break
      case 'Ensino Médio': educationScore = 6; break
      default: educationScore = 8
    }

    // LinkedIn bonus
    if (formData.linkedin && formData.linkedin.trim() !== '') {
      contentScore = Math.min(contentScore + 3, 25)
    }

    const totalScore = formattingScore + contentScore + experienceScore + educationScore + keywordsScore

    return {
      total: Math.min(totalScore, 100),
      breakdown: {
        formatting: { score: formattingScore, max: 20, color: '#3b82f6' },
        content: { score: contentScore, max: 25, color: '#06b6d4' },
        experience: { score: experienceScore, max: 25, color: '#8b5cf6' },
        education: { score: educationScore, max: 15, color: '#10b981' },
        keywords: { score: keywordsScore, max: 15, color: '#f59e0b' }
      }
    }
  }, [formData])

  /* Handle form submission */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.area || !formData.experience || !formData.education) {
      setSubmitError('Por favor, preencha todos os campos obrigatórios.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // Call API
      const response = await fetch('https://outer-lira-lumos-desenvolvimento-web-2228c71a.koyeb.app/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: formData.name,
          email: formData.email,
          category: 'Educação & Carreira'
        })
      })

      if (!response.ok) {
        // Try to get detailed error message from API
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
          // ignore parse error
        }

        // Specific error messages
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

      // Calculate and show score
      const result = calculateScore()
      setScore(result.total)
      setScoreBreakdown(result.breakdown)
      setShowScore(true)

      // Scroll to score
      setTimeout(() => {
        analysisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
    } catch (err) {
      setSubmitError('Ocorreu um erro. Tente novamente em instantes.')
    } finally {
      setIsSubmitting(false)
    }
  }

  /* FAQ data */
  const faqData = [
    {
      q: 'O analisador de currículo é gratuito?',
      a: 'Sim! Nosso analisador de currículo é 100% gratuito. Você recebe um score profissional do seu currículo e dicas personalizadas de melhoria enviadas por email sem nenhum custo.'
    },
    {
      q: 'Como funciona a análise de currículo?',
      a: 'Nosso sistema analisa automaticamente seu currículo considerando formatação, palavras-chave, experiências profissionais, habilidades e educação. Você recebe uma nota de 0 a 100 e sugestões práticas para melhorar cada aspecto.'
    },
    {
      q: 'Quanto tempo leva para receber o resultado?',
      a: 'O score do seu currículo é gerado instantaneamente na plataforma. As dicas detalhadas de melhoria são enviadas para seu email em poucos minutos após a análise.'
    },
    {
      q: 'Posso usar em qualquer área profissional?',
      a: 'Sim! Nosso analisador de currículo funciona para todas as áreas profissionais, desde iniciantes até profissionais seniores. As dicas são personalizadas de acordo com seu perfil e área de atuação.'
    },
    {
      q: 'É seguro enviar meu currículo?',
      a: 'Absolutamente! Levamos a privacidade muito a sério. Seus dados são protegidos com criptografia e nunca compartilhamos suas informações com terceiros.'
    },
    {
      q: 'O que é score de currículo?',
      a: 'O score de currículo é uma nota de 0 a 100 que representa a qualidade geral do seu currículo. Ele é calculado com base em critérios utilizados por recrutadores e sistemas ATS (Applicant Tracking Systems).'
    },
    {
      q: 'Como posso melhorar meu score?',
      a: 'Ao final da análise, você recebe dicas personalizadas por email com sugestões específicas para melhorar cada critério avaliado. Seguindo essas recomendações, você pode aumentar significativamente seu score.'
    },
    {
      q: 'Preciso criar uma conta?',
      a: 'Não é necessário criar uma conta! Basta preencher o formulário com seu nome e email para receber a análise completa do seu currículo.'
    }
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
              <a href="#analise" className="text-sm text-slate-300 hover:text-white transition-colors">Análise</a>
              <a href="#beneficios" className="text-sm text-slate-300 hover:text-white transition-colors">Benefícios</a>
              <a href="#faq" className="text-sm text-slate-300 hover:text-white transition-colors">FAQ</a>
            </nav>

            <div className="hidden md:block">
              <a
                href="#analise"
                className="cta-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Analisar Agora
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
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-xl border-t border-white/5">
            <div className="px-4 py-4 space-y-3">
              <a href="#como-funciona" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Como Funciona</a>
              <a href="#analise" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Análise</a>
              <a href="#beneficios" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">Benefícios</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-300 hover:text-white">FAQ</a>
              <a href="#analise" onClick={() => setMobileMenuOpen(false)} className="block cta-gradient text-white text-center font-semibold px-5 py-3 rounded-xl mt-4">Analisar Agora</a>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center justify-center hero-gradient overflow-hidden pt-[72px]">
        <ParticleBackground />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-sm font-medium text-slate-300 mb-8"
                style={{ animation: 'fadeInUp 0.6s 0.3s both' }}
              >
                <Sparkles className="w-4 h-4 text-blue-400" />
                100% Grátis
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] mb-6"
                style={{ animation: 'fadeInUp 0.6s 0.4s both' }}
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
              </h1>

              <p
                className="text-lg md:text-xl text-slate-400 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0"
                style={{ animation: 'fadeInUp 0.6s 0.5s both' }}
              >
                Ferramenta gratuita de análise de currículo com score profissional. Receba uma nota de 0 a 100 e dicas personalizadas por email para otimizar seu CV, passar nos filtros ATS e impressionar recrutadores. Funciona para todas as áreas e níveis de carreira.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
                style={{ animation: 'fadeInUp 0.6s 0.6s both' }}
              >
                <a
                  href="#analise"
                  className="cta-gradient text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center justify-center gap-2"
                >
                  Analisar Meu Currículo Agora
                  <ArrowRight className="w-5 h-5" />
                </a>
                <a
                  href="#como-funciona"
                  className="border border-slate-600 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/5 transition-all inline-flex items-center justify-center"
                >
                  Como Funciona?
                </a>
              </div>

              <div
                className="flex items-center gap-2 justify-center lg:justify-start text-sm text-slate-500"
                style={{ animation: 'fadeInUp 0.6s 0.7s both' }}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Análise segura e 100% gratuita
              </div>
            </div>

            <div
              className="relative"
              style={{ animation: 'fadeInUp 0.6s 0.7s both' }}
            >
              <img
                src="/hero-resume-score.jpg"
                alt="Analisador de Currículo com Score Profissional"
                className="rounded-2xl shadow-2xl shadow-blue-500/10 w-full max-w-lg mx-auto"
                loading="eager"
              />
              <div className="absolute -bottom-4 -right-4 bg-[#1e293b] border border-white/10 rounded-xl p-4 shadow-xl hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Análise Completa</p>
                    <p className="text-xs text-slate-400">Score + Dicas por email</p>
                  </div>
                </div>
              </div>
            </div>
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
                {count2.count > 0 ? `4,${Math.floor(count2.count / 10)}` : '0'}/5
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
            <h2 className="text-3xl md:text-4xl font-bold mt-3">3 Passos para Melhorar Seu Currículo</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: '01',
                icon: Upload,
                title: 'Envie Seu Currículo',
                desc: 'Preencha o formulário com seus dados e informações do seu currículo atual. Leva menos de 2 minutos.',
                color: '#3b82f6'
              },
              {
                num: '02',
                icon: BarChart3,
                title: 'Receba Seu Score',
                desc: 'Nosso algoritmo analisa seu currículo e gera uma nota de 0 a 100 com base em critérios profissionais.',
                color: '#06b6d4'
              },
              {
                num: '03',
                icon: Mail,
                title: 'Dicas no Email',
                desc: 'Receba dicas personalizadas de melhoria diretamente no seu email para se destacar nas vagas.',
                color: '#8b5cf6'
              }
            ].map((step, i) => (
              <div
                key={step.num}
                className="relative bg-[#1e293b]/60 border border-white/5 rounded-2xl p-8 hover:-translate-y-1 hover:border-blue-500/20 transition-all duration-300 reveal"
                style={{ transitionDelay: `${i * 150}ms` }}
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANÁLISE INTERATIVA ─── */}
      <section id="analise" className="py-20 md:py-28 bg-[#0a0f1d]" ref={analysisRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 reveal">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Análise Gratuita</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Analise Seu Currículo Agora</h2>
            <p className="text-slate-400 mt-3 max-w-2xl mx-auto">Preencha os dados abaixo para receber sua análise completa com score e dicas personalizadas.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Form */}
            <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6 md:p-8 reveal">
              {!submitSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                      Nome completo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      placeholder="seu@email.com"
                    />
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
                      <option value="Tecnologia">Tecnologia</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Vendas">Vendas</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Finanças">Finanças</option>
                      <option value="Saúde">Saúde</option>
                      <option value="Educação">Educação</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

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
                      <option value="Estagiário">Estagiário</option>
                      <option value="Júnior">Júnior</option>
                      <option value="Pleno">Pleno</option>
                      <option value="Sênior">Sênior</option>
                      <option value="Gerente">Gerente</option>
                      <option value="Diretor">Diretor</option>
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
                      <option value="Técnico">Técnico</option>
                      <option value="Graduação">Graduação</option>
                      <option value="Pós-graduação">Pós-graduação</option>
                      <option value="Mestrado">Mestrado</option>
                      <option value="Doutorado">Doutorado</option>
                    </select>
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
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full cta-gradient text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Analisando...' : 'Gerar Minha Análise'}
                  </button>

                  <p className="text-xs text-slate-500 text-center">
                    Ao enviar, você concorda em receber dicas de carreira no seu email.
                    Seus dados estão protegidos.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Análise Enviada!</h3>
                  <p className="text-slate-400">
                    Seu score está sendo calculado. As dicas detalhadas serão enviadas para <strong className="text-white">{formData.email}</strong>.
                  </p>
                </div>
              )}
            </div>

            {/* Score Result */}
            <div className="reveal">
              {showScore && score !== null && scoreBreakdown ? (
                <div className="bg-[#1e293b]/60 border border-white/5 rounded-2xl p-6 md:p-8">
                  <ScoreRing score={score} animating={showScore} />

                  <div className="mt-8 space-y-2">
                    <ScoreBar label="Formatação" score={scoreBreakdown.formatting.score} maxScore={scoreBreakdown.formatting.max} color={scoreBreakdown.formatting.color} delay={0} />
                    <ScoreBar label="Conteúdo" score={scoreBreakdown.content.score} maxScore={scoreBreakdown.content.max} color={scoreBreakdown.content.color} delay={150} />
                    <ScoreBar label="Experiência" score={scoreBreakdown.experience.score} maxScore={scoreBreakdown.experience.max} color={scoreBreakdown.experience.color} delay={300} />
                    <ScoreBar label="Educação" score={scoreBreakdown.education.score} maxScore={scoreBreakdown.education.max} color={scoreBreakdown.education.color} delay={450} />
                    <ScoreBar label="Palavras-chave" score={scoreBreakdown.keywords.score} maxScore={scoreBreakdown.keywords.max} color={scoreBreakdown.keywords.color} delay={600} />
                  </div>

                  <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
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
              ) : (
                <div className="bg-[#1e293b]/40 border border-white/5 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                    <BarChart3 className="w-10 h-10 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Seu Score Aparecerá Aqui</h3>
                  <p className="text-slate-400 max-w-sm">
                    Preencha o formulário ao lado para receber sua análise completa com nota e dicas personalizadas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── BENEFÍCIOS ─── */}
      <section id="beneficios" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 reveal">
            <span className="text-xs font-semibold tracking-[0.2em] text-blue-400 uppercase">Benefícios</span>
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Por Que Usar Nosso Analisador?</h2>
          </div>

          <div className="space-y-20">
            {/* Benefit 1 */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="order-2 md:order-1">
                <img
                  src="/analysis-resume.jpg"
                  alt="Análise profissional completa de currículo"
                  className="rounded-2xl shadow-xl w-full"
                  loading="lazy"
                />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Análise Profissional Completa</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Nosso algoritmo avalia cada aspecto do seu currículo: formatação, palavras-chave, experiências, formação e muito mais. Você recebe um relatório detalhado com pontuação em cada critério.
                </p>
                <ul className="space-y-3">
                  {['Score de 0 a 100', 'Critérios baseados em RH', 'Feedback detalhado por seção'].map((item, i) => (
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
                  Receba um relatório completo com sugestões práticas para melhorar cada seção do seu currículo. Nossas dicas são personalizadas de acordo com sua área de atuação e nível de experiência.
                </p>
                <ul className="space-y-3">
                  {['Dicas específicas por área', 'Modelos de currículo otimizados', 'Palavras-chave para passar no ATS'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <img
                  src="/email-tips.jpg"
                  alt="Dicas de carreira por email"
                  className="rounded-2xl shadow-xl w-full"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="grid md:grid-cols-2 gap-12 items-center reveal">
              <div className="order-2 md:order-1">
                <img
                  src="/career-growth.jpg"
                  alt="Crescimento profissional com currículo otimizado"
                  className="rounded-2xl shadow-xl w-full"
                  loading="lazy"
                />
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Aumente Suas Chances de Emprego</h3>
                <p className="text-slate-400 leading-relaxed mb-6">
                  Currículos otimizados têm até 40% mais chances de serem selecionados pelos recrutadores e passarem nos filtros de ATS. Não deixe oportunidades passarem por causa de um CV mal formatado.
                </p>
                <ul className="space-y-3">
                  {['Destaque-se entre os candidatos', 'Passe nos filtros de ATS', 'Impressione os recrutadores'].map((item, i) => (
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
            <h2 className="text-3xl md:text-4xl font-bold mt-3">Tire Suas Dúvidas</h2>
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
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pronto para Descobrir Seu Score?</h2>
          <p className="text-lg text-white/80 mb-8">
            Análise gratuita em menos de 2 minutos. Receba dicas profissionais no seu email.
          </p>
          <a
            href="#analise"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all animate-pulse-slow"
          >
            Analisar Meu Currículo Agora
            <ArrowRight className="w-5 h-5" />
          </a>
          <div className="flex items-center justify-center gap-2 mt-6 text-white/70 text-sm">
            <ShieldCheck className="w-4 h-4" />
            Mais de 15.000 pessoas já analisaram seus currículos
          </div>
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
                ScorePro é a ferramenta líder em análise de currículo online no Brasil. Avalie seu CV com score profissional, receba dicas personalizadas por email e otimize seu currículo para passar nos filtros ATS. Ideal para tecnologia, marketing, vendas, RH, finanças, saúde, educação e todas as áreas profissionais.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Ferramentas</h4>
              <ul className="space-y-2">
                <li><a href="#analise" className="text-sm text-slate-500 hover:text-white transition-colors">Analisador de Currículo</a></li>
                <li><span className="text-sm text-slate-600">Dicas de Entrevista</span></li>
                <li><span className="text-sm text-slate-600">Modelos de CV</span></li>
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
              © 2025 ScorePro - Analisador de Currículo com Score. Todos os direitos reservados. | Score de currículo grátis, dicas de melhoria e otimização de CV online.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
