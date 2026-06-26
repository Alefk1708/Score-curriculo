import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url'
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export interface PDFAnalysisResult {
  extractedText: string
  wordCount: number
  charCount: number
  pageCount: number
  hasContactInfo: boolean
  hasEmail: boolean
  hasPhone: boolean
  hasLinkedIn: boolean
  hasPortfolio: boolean
  sections: {
    hasSummary: boolean
    hasExperience: boolean
    hasEducation: boolean
    hasSkills: boolean
    hasLanguages: boolean
    hasCertifications: boolean
    hasProjects: boolean
    hasObjective: boolean
  }
  experienceYears: number
  jobCount: number
  measurableResults: boolean
  actionVerbs: string[]
  keywordMatches: {
    ats: number
    technical: number
    soft: number
    leadership: number
  }
  grammarIssues: string[]
  formattingIssues: string[]
  recommendations: string[]
  categoryScores: {
    atsCompatibility: number
    keywordOptimization: number
    structureCompleteness: number
    contentQuality: number
    measurableImpact: number
    grammarFormatting: number
    professionalPresentation: number
  }
  totalScore: number
  summary: string
}

const ATS_KEYWORDS = [
  'gestão', 'liderança', 'projetos', 'resultados', 'metas', 'kpi', 'indicadores',
  'estratégia', 'planejamento', 'análise', 'desenvolvimento', 'implementação',
  'coordenação', 'supervisão', 'negociação', 'relacionamento', 'comunicação',
  'trabalho em equipe', 'proatividade', 'orientação a resultados', 'analítico',
  'inovação', 'melhoria contínua', 'processos', 'qualidade', 'produtividade',
  'python', 'javascript', 'java', 'react', 'node', 'sql', 'aws', 'azure',
  'google cloud', 'docker', 'kubernetes', 'git', 'agile', 'scrum', 'kanban',
  'excel', 'power bi', 'tableau', 'crm', 'erp', 'sap', 'salesforce',
  'marketing digital', 'seo', 'sem', 'google analytics', 'redes sociais',
  'ui/ux', 'figma', 'photoshop', 'illustrator', 'wordpress',
  'gestão de equipes', 'business intelligence', 'data analytics',
  'machine learning', 'inteligência artificial', 'big data', 'devops',
  'ci/cd', 'terraform', 'ansible', 'jenkins', 'gitlab', 'github actions',
  'rest api', 'graphql', 'microserviços', 'serverless',
  'lgpd', 'gdpr', 'compliance', 'segurança da informação',
  'gestão ágil', 'product owner', 'scrum master', 'pmp', 'itil',
  'design thinking', 'lean', 'six sigma', 'okr',
  'inglês', 'espanhol', 'francês', 'mandarim', 'fluente', 'avançado',
  'intermediário', 'técnico', 'certificação', 'pós-graduação', 'mba'
]

const TECHNICAL_KEYWORDS = [
  'python', 'javascript', 'typescript', 'java', 'c#', 'c++', 'go', 'rust', 'ruby',
  'php', 'swift', 'kotlin', 'scala', 'r', 'matlab',
  'react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'django', 'flask',
  'spring', 'laravel', 'express', 'fastapi', 'rails',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
  'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'firebase', 'heroku', 'vercel', 'netlify',
  'docker', 'kubernetes', 'jenkins', 'github actions', 'gitlab ci',
  'terraform', 'ansible', 'puppet', 'chef',
  'git', 'github', 'gitlab', 'bitbucket',
  'linux', 'ubuntu', 'centos', 'debian', 'windows server',
  'nginx', 'apache', 'iis', 'cdn', 'load balancer',
  'microservices', 'soa', 'rest', 'graphql', 'grpc', 'soap',
  'rabbitmq', 'kafka', 'mqtt', 'websocket',
  'prometheus', 'grafana', 'datadog', 'new relic', 'elastic stack',
  'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
  'hadoop', 'spark', 'airflow', 'dbt', 'snowflake', 'databricks',
  'figma', 'sketch', 'adobe xd', 'invision', 'framer',
  'photoshop', 'illustrator', 'after effects', 'premiere',
  'blender', 'maya', 'cinema 4d', '3ds max',
  'unity', 'unreal engine', 'godot',
  'excel', 'power bi', 'tableau', 'qlikview', 'looker',
  'salesforce', 'hubspot', 'pipedrive', 'zoho',
  'sap', 'oracle', 'dynamics', 'totvs',
  'wordpress', 'shopify', 'magento', 'woocommerce',
  'seo', 'sem', 'google ads', 'facebook ads', 'analytics',
  'flutter', 'react native', 'ionic', 'xamarin', 'cordova',
  'blockchain', 'solidity', 'web3', 'smart contracts',
  'opencv', 'nlp', 'computer vision', 'deep learning',
  'ci/cd', 'devops', 'sre', 'platform engineering',
  'api gateway', 'service mesh', 'istio', 'linkerd'
]

const SOFT_SKILLS = [
  'comunicação', 'trabalho em equipe', 'liderança', 'proatividade',
  'criatividade', 'adaptabilidade', 'resolução de problemas',
  'pensamento crítico', 'inteligência emocional', 'empatia',
  'negociação', 'gestão de conflitos', 'tomada de decisão',
  'organização', 'gestão do tempo', 'multitarefa',
  'resiliência', 'autonomia', 'colaboração',
  'orientação a detalhes', 'foco em resultados',
  'aprendizado contínuo', 'flexibilidade',
  'relacionamento interpessoal', 'networking',
  'apresentação', 'oratória', 'storytelling',
  'mentoria', 'coaching', 'feedback',
  'gestão de stakeholders', 'influência',
  'inovação', 'empreendedorismo', 'visão estratégica'
]

const LEADERSHIP_KEYWORDS = [
  'gestão de equipes', 'liderança de times', 'coordenação',
  'supervisão', 'direção', 'gestão de pessoas',
  'desenvolvimento de talentos', 'gestão de performance',
  'planejamento estratégico', 'gestão de projetos',
  'gestão de orçamento', 'kpis', 'indicadores',
  'melhoria de processos', 'transformação digital',
  'gestão de mudanças', 'cultura organizacional',
  'engajamento de equipe', 'retenção de talentos',
  'recrutamento e seleção', 'onboarding',
  'gestão de conflitos', 'mediação',
  'tomada de decisão', 'delegação',
  'visão de negócio', 'orientação a resultados',
  'inovação', 'empreendedorismo',
  'mentoria', 'coaching', 'desenvolvimento de lideranças'
]

const ACTION_VERBS = [
  'liderou', 'gerenciou', 'coordenou', 'desenvolveu', 'implementou',
  'criou', 'projetou', 'otimizou', 'reduziu', 'aumentou',
  'melhorou', 'transformou', 'automatizou', 'integra',
  'negociou', 'fomentou', 'capacitou', 'mentoriou',
  'conduziu', 'orquestrou', 'estabeleceu', 'estruturou',
  'executou', 'operacionalizou', 'pioneirizou',
  'gestionou', 'dirigiu', 'supervisionou', 'administrou',
  'construiu', 'elaborou', 'planejou', 'organizou',
  'conquistou', 'expandiu', 'consolidou', 'padronizou',
  'liderados', 'gerenciados', 'coordenados', 'desenvolvidos',
  'implementados', 'criados', 'projetados', 'otimizados',
  'reduzidos', 'aumentados', 'melhorados', 'transformados',
  'automatizados', 'integrados', 'negociados',
  'lidar', 'gerenciar', 'coordenar', 'desenvolver',
  'implementar', 'criar', 'projetar', 'otimizar',
  'reduzir', 'aumentar', 'melhorar', 'transformar',
  'automatizar', 'integrar', 'negociar',
  'led', 'managed', 'developed', 'implemented',
  'created', 'designed', 'optimized', 'reduced',
  'increased', 'improved', 'automated', 'negotiated'
]

const GRAMMAR_PATTERNS = [
  { pattern: /\b(eu |me |minha |meu )\b/gi, issue: 'Uso excessivo de primeira pessoa' },
  { pattern: /\.{3,}/g, issue: 'Uso excessivo de reticências' },
  { pattern: /\b(muito|bastante|bastantes|demais)\b/gi, issue: 'Termos vagos ou excessivos' },
  { pattern: /\b(coisa|coisas|algo|alguma coisa)\b/gi, issue: 'Termos genéricos' },
  { pattern: /\b(etc|etc\.)\b/gi, issue: 'Uso de "etc." - seja específico' },
  { pattern: /!{2,}/g, issue: 'Uso excessivo de exclamações' },
  { pattern: /\?{2,}/g, issue: 'Uso excessivo de interrogações' },
]

const FORMATTING_ISSUES = [
  'Texto muito denso sem espaçamento adequado',
  'Uso inconsistente de fontes ou tamanhos',
  'Margens inadequadas',
  'Seções mal definidas ou sem títulos claros',
  'Uso excessivo de negrito ou itálico',
  'Quebras de página inadequadas',
]

function countKeywordMatches(text: string, keywords: string[]): number {
  const lowerText = text.toLowerCase()
  return keywords.filter(kw => lowerText.includes(kw.toLowerCase())).length
}

function findActionVerbs(text: string): string[] {
  const found: string[] = []
  const lowerText = text.toLowerCase()
  ACTION_VERBS.forEach(verb => {
    if (lowerText.includes(verb.toLowerCase()) && !found.includes(verb)) {
      found.push(verb)
    }
  })
  return found.slice(0, 10)
}

function analyzeGrammar(text: string): string[] {
  const issues: string[] = []
  GRAMMAR_PATTERNS.forEach(({ pattern, issue }) => {
    if (pattern.test(text)) {
      const count = (text.match(pattern) || []).length
      if (count > 2) {
        issues.push(`${issue} (${count} ocorrências)`)
      }
    }
  })

  // Check for very long sentences
  const sentences = text.split(/[.!?]+/)
  const longSentences = sentences.filter(s => s.trim().length > 200)
  if (longSentences.length > 0) {
    issues.push(`${longSentences.length} frase(s) muito longa(s) - considere dividir`)
  }

  // Check for all caps sections
  const allCapsMatches = text.match(/\b[A-ZÀ-Ú]{4,}\b/g)
  if (allCapsMatches && allCapsMatches.length > 5) {
    issues.push('Uso excessivo de CAIXA ALTA - pode indicar falta de hierarquia visual')
  }

  return issues
}

function analyzeSections(text: string): PDFAnalysisResult['sections'] {
  return {
    hasSummary: /(resumo|sumario|profile|sobre mim|sobre|apresentação)/i.test(text),
    hasExperience: /(experi[eê]ncia|experiencias|carreira|trajet[oô]ria|atuação|profissional)/i.test(text),
    hasEducation: /(forma[cç][aã]o|educa[cç][aã]o|acad[eê]mico|gradua[cç][aã]o|t[ií]tulo|curso|cursos)/i.test(text),
    hasSkills: /(habilidades|compet[eê]ncias|skills|conhecimentos|tecnologias|ferramentas)/i.test(text),
    hasLanguages: /(idiomas|l[ií]nguas|ingl[eê]s|espanhol|portugu[eê]s|fluente)/i.test(text),
    hasCertifications: /(certifica[cç][oõ]s|certificações|cursos livres|especializa[cç][aã]o|treinamentos)/i.test(text),
    hasProjects: /(projetos|projectos|portf[oó]lio|realiza[cç][oõ]s|conquistas)/i.test(text),
    hasObjective: /(objetivo|objetivos|busco|procuro|cargo pretendido)/i.test(text),
  }
}

function estimateExperienceYears(text: string): number {
  // Look for patterns like "20xx - 20xx" or "20xx a 20xx" or "x anos"
  const yearPattern = /(?:20\d{2})\s*(?:[-–a]\s*(?:20\d{2}|atual|presente|hoje|atualmente|momento))/gi
  const yearMatches = text.match(yearPattern) || []

  const anosPattern = /(\d+)\s*anos?\s*(?:de\s*)?experi[eê]ncia/gi
  const anosMatches = text.match(anosPattern) || []

  let maxYears = 0
  yearMatches.forEach(match => {
    const years = match.match(/20\d{2}/g)
    if (years && years.length >= 2) {
      const start = parseInt(years[0])
      const end = parseInt(years[years.length - 1])
      const diff = end - start
      if (diff > maxYears) maxYears = diff
    }
  })

  anosMatches.forEach(match => {
    const num = parseInt(match.match(/\d+/)?.[0] || '0')
    if (num > maxYears) maxYears = num
  })

  return maxYears
}

function countJobs(text: string): number {
  const jobPatterns = [
    /(?:cargo|função|posição|position|role)\s*[:\-]/gi,
    /(?:empresa|company|organização|instituição)\s*[:\-]/gi,
    /(?:20\d{2})\s*[-–]\s*(?:20\d{2}|atual|presente)/gi,
  ]

  let count = 0
  jobPatterns.forEach(pattern => {
    const matches = text.match(pattern)
    if (matches) count = Math.max(count, matches.length)
  })

  return count
}

function hasMeasurableResults(text: string): boolean {
  const patterns = [
    /\d+[%\s]*(?:aumento|redução|crescimento|melhoria)/i,
    /[Rr$]\s*[\d.,]+\s*(?:milh[oõ]es|mil|k|milhares)/i,
    /\d+\s*(?:x|vezes)/i,
    /\d+%/,
    /(?:aumentou|reduziu|cresceu|melhorou|otimizou).*\d+/i,
  ]
  return patterns.some(p => p.test(text))
}

function generateRecommendations(analysis: PDFAnalysisResult): string[] {
  const recs: string[] = []

  if (!analysis.sections.hasSummary) {
    recs.push('Adicione um resumo profissional no início do currículo para capturar a atenção do recrutador em poucos segundos.')
  }

  if (!analysis.sections.hasSkills) {
    recs.push('Inclua uma seção de habilidades técnicas e comportamentais para facilitar a triagem por ATS e recrutadores.')
  }

  if (!analysis.measurableResults) {
    recs.push('Quantifique suas conquistas com números e porcentagens (ex: "Aumentei as vendas em 30%"). Resultados mensuráveis aumentam significativamente seu impacto.')
  }

  if (analysis.actionVerbs.length < 5) {
    recs.push('Use mais verbos de ação no seu currículo (ex: liderou, implementou, otimizou) para demonstrar protagonismo e resultados.')
  }

  if (analysis.keywordMatches.ats < 3) {
    recs.push('Inclua mais palavras-chave relevantes para sua área para aumentar a compatibilidade com sistemas ATS.')
  }

  if (analysis.grammarIssues.length > 0) {
    recs.push('Revise questões gramaticais e de formatação identificadas na análise para transmitir mais profissionalismo.')
  }

  if (analysis.wordCount < 200) {
    recs.push('Seu currículo está muito curto. Expanda as descrições das suas experiências com mais detalhes sobre responsabilidades e conquistas.')
  } else if (analysis.wordCount > 800) {
    recs.push('Seu currículo está extenso. Considere ser mais conciso, focando nas experiências mais relevantes para a vaga desejada.')
  }

  if (!analysis.sections.hasLanguages) {
    recs.push('Adicione uma seção de idiomas - o domínio de línguas estrangeiras é um diferencial importante no mercado.')
  }

  if (!analysis.sections.hasCertifications && analysis.sections.hasEducation) {
    recs.push('Liste certificações e cursos complementares relevantes - eles demonstram atualização profissional.')
  }

  if (!analysis.hasLinkedIn) {
    recs.push('Adicione seu perfil do LinkedIn - 87% dos recrutadores consultam redes profissionais durante o processo seletivo.')
  }

  if (analysis.experienceYears < 2 && analysis.jobCount === 0) {
    recs.push('Destaque projetos acadêmicos, estágios ou trabalhos voluntários para compensar a falta de experiência formal.')
  }

  return recs
}

function calculateCategoryScores(analysis: Omit<PDFAnalysisResult, 'categoryScores' | 'totalScore' | 'summary' | 'recommendations'>): PDFAnalysisResult['categoryScores'] {
  // ATS Compatibility (0-100)
  const atsScore = Math.min(100,
    (analysis.sections.hasExperience ? 20 : 0) +
    (analysis.sections.hasEducation ? 15 : 0) +
    (analysis.sections.hasSkills ? 20 : 0) +
    (analysis.keywordMatches.ats >= 5 ? 25 : analysis.keywordMatches.ats * 5) +
    (analysis.wordCount >= 200 && analysis.wordCount <= 600 ? 20 : 10)
  )

  // Keyword Optimization (0-100)
  const kwScore = Math.min(100,
    (analysis.keywordMatches.ats >= 5 ? 35 : analysis.keywordMatches.ats * 7) +
    (analysis.keywordMatches.technical >= 3 ? 25 : analysis.keywordMatches.technical * 8) +
    (analysis.keywordMatches.soft >= 2 ? 20 : analysis.keywordMatches.soft * 10) +
    (analysis.keywordMatches.leadership >= 1 ? 20 : 0)
  )

  // Structure Completeness (0-100)
  const structureScore = Math.min(100,
    (analysis.sections.hasSummary || analysis.sections.hasObjective ? 15 : 0) +
    (analysis.sections.hasExperience ? 20 : 0) +
    (analysis.sections.hasEducation ? 15 : 0) +
    (analysis.sections.hasSkills ? 15 : 0) +
    (analysis.sections.hasLanguages ? 10 : 0) +
    (analysis.sections.hasCertifications ? 10 : 0) +
    (analysis.sections.hasProjects ? 10 : 0) +
    (analysis.hasContactInfo ? 5 : 0)
  )

  // Content Quality (0-100)
  const contentScore = Math.min(100,
    (analysis.actionVerbs.length >= 8 ? 30 : analysis.actionVerbs.length * 3.75) +
    (analysis.measurableResults ? 25 : 0) +
    (analysis.wordCount >= 200 && analysis.wordCount <= 700 ? 20 : 10) +
    (analysis.jobCount >= 2 ? 15 : analysis.jobCount * 7.5) +
    (analysis.hasPortfolio ? 10 : 0)
  )

  // Measurable Impact (0-100)
  const impactScore = Math.min(100,
    (analysis.measurableResults ? 40 : 0) +
    (analysis.actionVerbs.length >= 5 ? 25 : analysis.actionVerbs.length * 5) +
    (analysis.experienceYears >= 3 ? 20 : analysis.experienceYears * 6.67) +
    (analysis.keywordMatches.leadership >= 2 ? 15 : analysis.keywordMatches.leadership * 7.5)
  )

  // Grammar & Formatting (0-100)
  const grammarScore = Math.max(0, Math.min(100,
    100 - (analysis.grammarIssues.length * 15)
  ))

  // Professional Presentation (0-100)
  const presentationScore = Math.min(100,
    (analysis.hasEmail ? 15 : 0) +
    (analysis.hasPhone ? 15 : 0) +
    (analysis.hasLinkedIn ? 20 : 0) +
    (analysis.sections.hasSummary ? 15 : 0) +
    (analysis.wordCount >= 150 ? 20 : 10) +
    (!textHasIssues(analysis) ? 15 : 5)
  )

  return {
    atsCompatibility: Math.round(atsScore),
    keywordOptimization: Math.round(kwScore),
    structureCompleteness: Math.round(structureScore),
    contentQuality: Math.round(contentScore),
    measurableImpact: Math.round(impactScore),
    grammarFormatting: Math.round(grammarScore),
    professionalPresentation: Math.round(presentationScore),
  }
}

function textHasIssues(analysis: Omit<PDFAnalysisResult, 'categoryScores' | 'totalScore' | 'summary' | 'recommendations'>): boolean {
  return analysis.grammarIssues.length > 3 || analysis.wordCount < 100
}

function generateSummary(analysis: PDFAnalysisResult): string {
  const scores = [
    analysis.categoryScores.atsCompatibility,
    analysis.categoryScores.keywordOptimization,
    analysis.categoryScores.structureCompleteness,
    analysis.categoryScores.contentQuality,
    analysis.categoryScores.measurableImpact,
    analysis.categoryScores.grammarFormatting,
    analysis.categoryScores.professionalPresentation,
  ]
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length

  if (avg >= 80) {
    return 'Excelente currículo! Seu CV está bem estruturado e otimizado. Pequenos ajustes podem torná-lo ainda mais competitivo.'
  } else if (avg >= 60) {
    return 'Bom currículo com potencial de melhoria. Ajustes nas seções indicadas podem aumentar significativamente suas chances.'
  } else if (avg >= 40) {
    return 'Seu currículo precisa de atenção em várias áreas. Siga as recomendações para melhorar a apresentação e o conteúdo.'
  } else {
    return 'Seu currículo necessita de reformulação significativa. Priorize as recomendações de estrutura e conteúdo.'
  }
}

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

  let fullText = ''
  const pageCount = pdf.numPages

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const pageText = textContent.items.map((item: any) => item.str).join(' ')
    fullText += pageText + '\n'
  }

  return fullText.trim()
}

export async function analyzePDF(file: File): Promise<PDFAnalysisResult> {
  const extractedText = await extractTextFromPDF(file)
  const wordCount = extractedText.split(/\s+/).filter(w => w.length > 0).length
  const charCount = extractedText.length

  // Count pages by loading PDF again
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pageCount = pdf.numPages

  // Contact info
  const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(extractedText)
  const hasPhone = /(?:\(?\d{2}\)?\s*)?\d{4,5}[-.\s]?\d{4}/.test(extractedText)
  const hasLinkedIn = /linkedin\.com\/in\//i.test(extractedText)
  const hasPortfolio = /(?:portfolio|github\.com|behance\.net|medium\.com)/i.test(extractedText)
  const hasContactInfo = hasEmail || hasPhone

  // Sections
  const sections = analyzeSections(extractedText)

  // Experience
  const experienceYears = estimateExperienceYears(extractedText)
  const jobCount = countJobs(extractedText)

  // Measurable results
  const measurableResults = hasMeasurableResults(extractedText)

  // Action verbs
  const actionVerbs = findActionVerbs(extractedText)

  // Keyword matches
  const keywordMatches = {
    ats: countKeywordMatches(extractedText, ATS_KEYWORDS),
    technical: countKeywordMatches(extractedText, TECHNICAL_KEYWORDS),
    soft: countKeywordMatches(extractedText, SOFT_SKILLS),
    leadership: countKeywordMatches(extractedText, LEADERSHIP_KEYWORDS),
  }

  // Grammar issues
  const grammarIssues = analyzeGrammar(extractedText)

  // Formatting issues
  const formattingIssues = pageCount > 2 ? [FORMATTING_ISSUES[0], FORMATTING_ISSUES[3]] :
    wordCount < 100 ? [FORMATTING_ISSUES[0]] : []

  // Build base analysis
  const baseAnalysis = {
    extractedText,
    wordCount,
    charCount,
    pageCount,
    hasContactInfo,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasPortfolio,
    sections,
    experienceYears,
    jobCount,
    measurableResults,
    actionVerbs,
    keywordMatches,
    grammarIssues,
    formattingIssues,
  }

  // Calculate scores
  const categoryScores = calculateCategoryScores(baseAnalysis)

  // Calculate total score (weighted average)
  const weights = {
    atsCompatibility: 0.20,
    keywordOptimization: 0.15,
    structureCompleteness: 0.15,
    contentQuality: 0.20,
    measurableImpact: 0.10,
    grammarFormatting: 0.10,
    professionalPresentation: 0.10,
  }

  const totalScore = Math.round(
    categoryScores.atsCompatibility * weights.atsCompatibility +
    categoryScores.keywordOptimization * weights.keywordOptimization +
    categoryScores.structureCompleteness * weights.structureCompleteness +
    categoryScores.contentQuality * weights.contentQuality +
    categoryScores.measurableImpact * weights.measurableImpact +
    categoryScores.grammarFormatting * weights.grammarFormatting +
    categoryScores.professionalPresentation * weights.professionalPresentation
  )

  // Build full analysis
  const fullAnalysis: PDFAnalysisResult = {
    ...baseAnalysis,
    categoryScores,
    totalScore,
    recommendations: [],
    summary: '',
  }

  // Generate recommendations and summary
  fullAnalysis.recommendations = generateRecommendations(fullAnalysis)
  fullAnalysis.summary = generateSummary(fullAnalysis)

  return fullAnalysis
}
