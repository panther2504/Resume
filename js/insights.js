/* Resume Studio — Insights: resume score / ATS checks and job-description keyword match */

const Insights = (() => {
  /* =====================================================================
     Word lists
     ===================================================================== */

  /* strong action verbs, grouped for the helper (all of them also count as strong openers) */
  const VERBS = {
    Leadership: ['Led', 'Directed', 'Spearheaded', 'Orchestrated', 'Oversaw', 'Mentored', 'Championed', 'Mobilized', 'Supervised', 'Coached', 'Headed', 'Guided', 'Steered', 'Founded', 'Established', 'Hired'],
    Achievement: ['Achieved', 'Exceeded', 'Surpassed', 'Delivered', 'Accelerated', 'Boosted', 'Increased', 'Reduced', 'Improved', 'Maximized', 'Saved', 'Generated', 'Won', 'Outperformed', 'Transformed', 'Expanded'],
    Communication: ['Presented', 'Negotiated', 'Persuaded', 'Authored', 'Articulated', 'Facilitated', 'Collaborated', 'Partnered', 'Advocated', 'Briefed', 'Influenced', 'Published', 'Convinced', 'Mediated', 'Wrote', 'Pitched'],
    Technical: ['Engineered', 'Developed', 'Built', 'Automated', 'Architected', 'Implemented', 'Deployed', 'Programmed', 'Integrated', 'Optimized', 'Debugged', 'Migrated', 'Configured', 'Scaled', 'Refactored', 'Shipped'],
    Creative: ['Designed', 'Created', 'Conceptualized', 'Crafted', 'Illustrated', 'Invented', 'Pioneered', 'Prototyped', 'Revitalized', 'Reimagined', 'Shaped', 'Visualized', 'Composed', 'Curated', 'Launched', 'Introduced'],
    Analytical: ['Analyzed', 'Assessed', 'Evaluated', 'Forecasted', 'Identified', 'Investigated', 'Measured', 'Modeled', 'Quantified', 'Researched', 'Audited', 'Diagnosed', 'Tested', 'Validated', 'Mapped', 'Uncovered'],
    Organization: ['Coordinated', 'Organized', 'Planned', 'Prioritized', 'Scheduled', 'Streamlined', 'Standardized', 'Consolidated', 'Centralized', 'Restructured', 'Systematized', 'Executed', 'Managed', 'Administered', 'Ran', 'Owned'],
    Support: ['Supported', 'Resolved', 'Trained', 'Educated', 'Enabled', 'Empowered', 'Onboarded', 'Advised', 'Counseled', 'Served', 'Fostered', 'Cultivated', 'Clarified', 'Recruited', 'Taught', 'Volunteered'],
  };
  const MORE_VERBS = 'conducted drove grew produced secured raised cut lowered decreased doubled tripled initiated redesigned rebuilt released maintained monitored operated performed prepared processed provided tracked translated updated upgraded unified earned completed defined drafted edited enhanced ensured formulated gathered hosted instituted lifted modernized navigated overhauled piloted promoted proposed ranked recommended reconciled reengineered refined reorganized replaced reported represented revamped reviewed revised simplified solved sourced sparked specified spurred stabilized strengthened structured summarized sustained synthesized transitioned troubleshot verified negotiated converted captured closed co-founded co-led composed constructed customized cofounded deepened documented eliminated expedited fixed harmonized influenced inspired interviewed leveraged localized merged minimized motivated outlined patented planned produced programmed rolled scoped secured shortened sold taught trimmed tuned unlocked authored'.split(' ');
  /* openers that describe duties instead of results */
  const WEAK = [
    ['Responsible for', /^(?:was |were )?responsible for\b/i], ['Helped', /^help(?:ed|ing|s)?\b/i], ['Worked on', /^work(?:ed|ing|s)? (?:on|with|in|as)\b/i],
    ['Duties included', /^duties (?:included|include|were)\b/i], ['Assisted', /^assist(?:ed|ing|s)?\b/i], ['Tasked with', /^(?:was )?tasked with\b/i],
    ['Involved in', /^(?:was )?involved in\b/i], ['Participated in', /^participat(?:ed|ing|es?) in\b/i], ['In charge of', /^(?:was )?in charge of\b/i],
    ['Handled', /^handl(?:ed|ing|es)\b/i], ['Tried', /^tried\b/i], ['Attempted', /^attempt(?:ed|ing)\b/i], ['Was / were', /^(?:was|were)\b/i],
  ];
  /* alternatives offered when an opener is overused */
  const SYNONYMS = {
    manag: 'Directed, Oversaw, Coordinated', lead: 'Spearheaded, Headed, Guided', develop: 'Engineered, Built, Created', creat: 'Designed, Launched, Established',
    design: 'Crafted, Shaped, Prototyped', build: 'Engineered, Assembled, Constructed', improv: 'Boosted, Strengthened, Optimized', increas: 'Grew, Boosted, Expanded',
    reduc: 'Cut, Lowered, Trimmed', implement: 'Rolled out, Deployed, Executed', deliver: 'Shipped, Launched, Completed', support: 'Enabled, Advised, Empowered',
    work: 'Partnered, Collaborated, Contributed', run: 'Led, Facilitated, Hosted', driv: 'Accelerated, Spearheaded, Propelled', own: 'Led, Directed, Championed',
  };
  const CLICHES = ['team player', 'hard worker', 'hard-working', 'hardworking', 'detail-oriented', 'detail oriented', 'go-getter', 'self-starter', 'self starter',
    'think outside the box', 'outside-the-box', 'synergy', 'results-driven', 'results driven', 'results-oriented', 'proven track record', 'go-to person',
    'thought leader', 'value add', 'value-add', 'strategic thinker', 'perfectionist', 'rockstar', 'rock star', 'ninja', 'guru', 'fast learner', 'quick learner',
    'works well under pressure', 'references available upon request', 'dynamic individual', 'highly motivated', 'passionate about'];

  /* ~220 skills / tools: "Display label|alias|alias" */
  const SKILL_DICT = [
    // product, design & research
    'Product Design', 'Product Management', 'Product Strategy', 'Product Discovery', 'Project Management', 'Program Management', 'Stakeholder Management|stakeholder engagement',
    'Design Systems|design system', 'Design Thinking', 'User Research|ux research|design research', 'Usability Testing|usability tests|user testing|usability studies|usability sessions', 'Interaction Design|ixd',
    'Visual Design', 'UI Design|user interface design', 'UX Design|user experience design', 'UX|user experience', 'UI|user interface', 'Information Architecture', 'Wireframing|wireframes|wireframe',
    'Prototyping|prototypes|prototype', 'Journey Mapping|journey maps|customer journeys|user journeys', 'Accessibility|a11y|wcag|accessible design|accessible interfaces', 'Responsive Design', 'Mobile Design', 'Motion Design',
    'Branding|brand identity', 'Typography', 'Illustration', 'Design Critique|design critiques', 'Figma', 'Sketch', 'Adobe XD|xd', 'Photoshop', 'Illustrator', 'InDesign', 'After Effects',
    'Adobe Creative Suite|creative cloud|adobe cc', 'Framer', 'InVision', 'Miro', 'Webflow', 'Personas', 'Content Design|ux writing',
    // engineering
    'JavaScript|js|es6|ecmascript', 'TypeScript|ts', 'React|react.js|reactjs', 'React Native', 'Vue|vue.js|vuejs', 'Angular|angularjs', 'Next.js|nextjs', 'Node.js|nodejs|node',
    'Python', 'Java', 'C++|cpp', 'C#|csharp|.net|dotnet', 'Golang', 'Rust', 'Ruby', 'Ruby on Rails|rails', 'PHP', 'Swift', 'Kotlin', 'Scala', 'HTML|html5', 'CSS|css3', 'Sass|scss',
    'Tailwind|tailwind css', 'REST APIs|rest api|restful apis|restful api', 'APIs|api', 'GraphQL', 'Microservices', 'Distributed Systems', 'System Design', 'Unit Testing|unit tests',
    'Test Automation|automated testing', 'Jest', 'Cypress', 'Selenium', 'Git|github|gitlab', 'CI/CD|continuous integration|continuous delivery|continuous deployment', 'DevOps',
    'Docker|containers|containerization', 'Kubernetes|k8s', 'Terraform|infrastructure as code', 'AWS|amazon web services', 'Azure|microsoft azure', 'GCP|google cloud|google cloud platform',
    'Linux', 'Cloud Computing|cloud', 'Cybersecurity|information security|security', 'iOS', 'Android', 'Flutter', 'Agile', 'Scrum', 'Kanban', 'Jira', 'Confluence',
    // data & analytics
    'SQL', 'NoSQL', 'PostgreSQL|postgres', 'MySQL', 'MongoDB|mongo', 'Redis', 'Snowflake', 'BigQuery', 'Redshift', 'Databricks', 'Apache Spark|spark|pyspark', 'Hadoop',
    'Kafka|apache kafka', 'Airflow|apache airflow', 'dbt', 'ETL|elt', 'Data Pipelines|data pipeline', 'Data Modeling|data modelling|data models', 'Data Warehousing|data warehouse|data warehouses',
    'Data Lakes|data lake|lakehouse', 'Data Engineering', 'Data Analysis|data analytics', 'Data Visualization|data visualisation|dataviz', 'Data Governance', 'Data Quality', 'Big Data',
    'Streaming|stream processing|real-time data', 'Statistics|statistical analysis', 'A/B Testing|ab testing|a/b tests|experimentation', 'Analytics', 'Machine Learning|ml',
    'Deep Learning', 'Artificial Intelligence|ai', 'NLP|natural language processing', 'Computer Vision', 'LLMs|llm|large language models|generative ai', 'Pandas', 'NumPy',
    'scikit-learn|sklearn', 'TensorFlow', 'PyTorch', 'Tableau', 'Power BI|powerbi', 'Looker', 'Excel|microsoft excel|ms excel|spreadsheets', 'Google Analytics', 'Mixpanel', 'Amplitude',
    // business
    'Business Development', 'Account Management', 'Customer Success', 'Customer Service|customer support', 'Sales', 'Lead Generation', 'Marketing', 'Digital Marketing',
    'Growth Marketing', 'Content Marketing', 'Content Strategy', 'Email Marketing', 'Social Media', 'SEO|search engine optimization', 'SEM|ppc|paid search', 'Copywriting',
    'Technical Writing', 'Market Research', 'Competitive Analysis', 'Go-to-Market|gtm|go to market', 'Salesforce', 'HubSpot', 'CRM', 'ERP', 'SAP', 'Budgeting|budget management',
    'Forecasting', 'Financial Modeling|financial modelling', 'Financial Analysis', 'Accounting', 'Risk Management', 'Compliance', 'Operations', 'Supply Chain', 'Logistics',
    'Procurement', 'Lean Six Sigma', 'Six Sigma', 'Process Improvement', 'Change Management', 'Recruiting|recruitment|talent acquisition', 'Onboarding', 'OKRs|okr',
    'KPIs|kpi', 'Roadmapping|roadmap|roadmaps|product roadmap', 'Requirements Gathering', 'SaaS', 'B2B', 'B2C', 'Fintech', 'E-commerce|ecommerce', 'Healthcare', 'Mobile Apps|mobile app',
    // people skills
    'Leadership', 'Mentoring|mentorship|mentor', 'Communication|communication skills', 'Presentation Skills|presentations|presenting', 'Collaboration', 'Cross-functional|cross functional',
    'Problem Solving|problem-solving', 'Critical Thinking', 'Negotiation', 'Time Management', 'Attention to Detail', 'Storytelling', 'Facilitation|workshops|workshop facilitation',
    'Strategic Planning', 'Systems Thinking',
  ];

  /* English stopwords + job-ad filler that is never a useful keyword */
  const STOP = new Set(`a about above across after afterwards again against all almost alone along already also although always am among amongst an and another any anyhow anyone
    anything anyway anywhere are around as at be became because become becomes becoming been before beforehand behind being below beside besides between beyond both but by can
    cannot could did do does doing done down due during each eg either else elsewhere enough etc even ever every everyone everything everywhere except few first for former formerly
    from further get gets getting give given gives go goes going gone got had has have having he hence her here hereafter hereby herein hers herself him himself his how however i ie
    if in inc indeed instead into is it its itself just keep keeps last latter least less let lets like likely ltd made make makes making many may me meanwhile might mine more moreover
    most mostly much must my myself namely neither never nevertheless next no nobody none nor not nothing now nowhere of off often on once one only onto or other others otherwise our
    ours ourselves out over own per perhaps please put rather re really regarding same say see seem seemed seeming seems several she should show side since so some somehow someone
    something sometime sometimes somewhere still such take takes than that the their theirs them themselves then thence there thereafter thereby therefore therein these they this
    those though through throughout thru thus to together too toward towards under unless until up upon us use used uses using very via want wants was we well were what whatever
    when whence whenever where whereas whereby wherein wherever whether which while who whoever whole whom whose why will with within without would yet you your yours yourself
    yourselves ll ve re don doesn didn isn aren won wasn weren hasn haven shouldn couldn wouldn
    ability abilities able applicant applicants apply applying approach approaches background based benefit benefits best better bonus candidate candidates career careers challenge
    challenges challenging closely colleague colleagues company companies competitive compensation contribute contributing core create creating culture customer customers day days
    daily degree demonstrable demonstrated desire desired detail details drive driven drives driving ensure ensuring environment equal equivalent etc everyday excellent exceptional
    excited exciting experience experienced experiences expert expertise familiarity familiar fast field flexible focus focused friendly full fun global good great grow growing
    hands help helping helps high highly hire hiring home hours ideal ideally impact impactful include included includes including individual individuals inform informed insight
    insights interest interested job jobs join joining key kind knowledge large level leverage leveraging life lives looking love loves meaningful members mission month months
    must need needed needs new nice offer offering offers office open opportunities opportunity organization organizations paced part partner partners partnering passion
    passionate people person place plus position positions practice practices preferred previous prior proficiency proficient proven provide providing qualification
    qualifications qualified range related relevant remote requirement requirements required require requires responsibilities responsibility responsible results right
    role roles salary seeking self senior junior mid skill skilled skills small solid someone start started strong stronger success successful support supporting team teams
    thing things think thrive time times today tool tools top understand understanding unique value values variety way ways week weeks well wide work worked working works
    world year years youll were youre whats build building builds deliver delivering own owning collaborate collaborating closely enable enables enabling bring brings
    solve solving grow make shape shaping define defining lead leading manage managing translate translating write writing improve improving develop developing across
    within things including strong passionate join us ideal candidate role ownership end running run runs ship shipping shipped iterate iterating turn turning raise raising advanced basic intermediate extensive broad deep comfortable similar various multiple direct
    clear complex simple seek seeks assess assessing evaluate evaluating implement implementing administer administers administering monitor monitoring
    document documenting educate educating respond responding maintain maintaining coordinate coordinates coordinating collaborates hands`.split(/\s+/).filter(Boolean));
  const SHORT_OK = new Set(['ux', 'ui', 'ai', 'ml', 'qa', 'bi', 'hr', 'pr', 'ar', 'vr', 'ios', 'api', 'sql', 'aws', 'gcp', 'seo', 'sem', 'crm', 'erp', 'etl', 'b2b', 'b2c', 'kpi', 'c++', 'c#', 'r']);
  const ALIAS_TOK = { js: 'javascript', ts: 'typescript', nodejs: 'node', reactjs: 'react', vuejs: 'vue', k8s: 'kubernetes', postgres: 'postgresql', golang: 'go', utilise: 'utilize', organisation: 'organization' };
  /* role nouns that should match their activity ("designer" ~ "design") */
  const DERIV = { designer: 'design', designers: 'design', developer: 'develop', developers: 'develop', researcher: 'research', researchers: 'research', engineering: 'engineer', programming: 'program', analytics: 'analytic', marketer: 'marketing', marketers: 'marketing' };
  const IRREGULAR = { led: 'lead', built: 'build', ran: 'run', won: 'win', wrote: 'write', drove: 'drive', grew: 'grow', taught: 'teach', made: 'make', began: 'begin', brought: 'bring', sold: 'sell', spoke: 'speak', oversaw: 'oversee', undertook: 'undertake', held: 'hold', kept: 'keep', rebuilt: 'rebuild', rewrote: 'rewrite', sped: 'speed', troubleshot: 'troubleshoot', thought: 'think', chose: 'choose', fed: 'feed', met: 'meet', took: 'take', gave: 'give', saw: 'see', found: 'find' };

  /* =====================================================================
     Text helpers (pure)
     ===================================================================== */
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const filled = (v) => !!String(v ?? '').trim();
  const plain = (s) => String(s ?? '').replace(/\*\*(.+?)\*\*/g, '$1').replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1$2').replace(/\*+/g, '');
  const wc = (s) => (plain(s).match(/[\p{L}\p{N}][\p{L}\p{N}'’.+#/-]*/gu) || []).length;
  const escRx = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || `${one}s`)}`;
  const quote = (s) => `“${s}”`;
  const norm = (s) => ` ${String(s ?? '').toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/\*\*|__/g, ' ').replace(/\s+/g, ' ')} `;
  const TOKEN_RX = /[a-z0-9][a-z0-9+#]*/g;
  const toks = (s) => (norm(s).match(TOKEN_RX) || []).map((t) => ALIAS_TOK[t] || t);

  /** light stemmer: plural, -ing, -ed, doubled consonants, British -ise spellings */
  function stem(w) {
    w = String(w).toLowerCase();
    if (DERIV[w]) return DERIV[w];
    w = IRREGULAR[w] || w;
    if (w.length <= 3) return w;
    w = w.replace(/([iy])s(e|ed|es|ing|ation|ations)$/, '$1z$2').replace(/([^l])ll(ing|ed)$/, '$1l$2');
    if (/ies$/.test(w) && w.length > 4) w = `${w.slice(0, -3)}y`;
    else if (/(ss|sh|ch|x|z)es$/.test(w)) w = w.slice(0, -2);
    else if (/s$/.test(w) && !/(ss|us|is)$/.test(w)) w = w.slice(0, -1);
    if (w.length > 5 && /ing$/.test(w)) w = w.slice(0, -3);
    else if (w.length > 4 && /ied$/.test(w)) w = `${w.slice(0, -3)}y`;
    else if (w.length > 4 && /ed$/.test(w) && !/eed$/.test(w)) w = w.slice(0, -2);
    if (w.length > 3 && /([bdfgkmnprt])\1$/.test(w)) w = w.slice(0, -1);
    if (w.length > 3 && /e$/.test(w)) w = w.slice(0, -1);
    return w;
  }
  const stemPhrase = (s) => toks(s).map(stem).join(' ');

  const VERB_STEMS = new Set([...Object.values(VERBS).flat().map((v) => v.toLowerCase()), ...MORE_VERBS].map(stem));
  const VERB_LIST = Object.values(VERBS).flat();
  const firstWords = (s) => (plain(s).trim().match(/[A-Za-z][A-Za-z'’-]*/g) || []).slice(0, 2).map((w) => w.toLowerCase());
  const weakOpener = (s) => { const t = plain(s).trim(); const w = WEAK.find(([, rx]) => rx.test(t)); return w ? w[0] : null; };
  /** the action verb a statement opens with (skips a leading adverb like "Successfully"), or null */
  function openerVerb(s) {
    if (weakOpener(s)) return null;
    let [a, b] = firstWords(s);
    if (a && /ly$/.test(a) && b) a = b;
    if (!a) return null;
    if (VERB_STEMS.has(stem(a)) || (/^[a-z]{4,}ed$/.test(a) && a !== 'need')) return a;
    return null;
  }
  const METRIC = /\d|[%$€£¥₹]|\b(?:two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundreds?|thousands?|millions?|billions?|dozens?|doubled?|doubling|tripled?|tripling|quadrupled|halved|twice|percent)\b/i;
  const OUTCOME = /\b(?:increas|decreas|reduc|improv|grow|grew|boost|cut|saved|saving|rais|lift|doubl|tripl|halv|accelerat|expand|generat|achiev|exceed|surpass|outperform|maximi|minimi|optimi|eliminat|lower|shorten|sped|speed(?:ed)? up|won|earn|result(?:ed|ing)? in|leading to|adopted|adoption|revenue|profit|conversion|retention|engagement|satisfaction|nps|roi|growth|efficien|faster|higher|fewer)\w*|\bby \d|\bfrom \S+ to \S+|\d+(?:\.\d+)?\s?%|\b\d+x\b/i;
  const PRONOUN_RX = /(?:^|[^\w'’])(?:I(?:'m|’m|'ve|’ve|'d|’d)?|[Mm]e|[Mm]y|[Mm]ine|[Mm]yself)(?![\w'’])/;
  const pronounCount = (s) => (plain(s).match(new RegExp(PRONOUN_RX.source, 'g')) || []).length;

  /* section classification */
  const RX = {
    summary: /summary|profile|about|objective|overview|introduction|bio\b|statement/i,
    experience: /experience|employment|work|career|professional|positions?|internships?|jobs?/i,
    education: /education|academic|qualification|degree|school|universit|studies|training|courses?/i,
    noBullets: /education|academic|certific|licen|reference|publication|award|honou?r|language|interest|hobb|course/i,
    notSkills: /language|interest|hobb|reference/i,
    standard: /^\s*(?:professional |career |work |technical |key |core |relevant |selected |additional |personal )?(?:summary|profile|about(?: me)?|objective|overview|experience|employment(?: history)?|work history|education|skills?|competenc(?:y|ies)|expertise|projects?|certifications?|certificates?|licen[cs]es?(?: & certifications)?|languages?|awards?(?: & honou?rs)?|honou?rs|achievements?|accomplishments|publications?|volunteer(?:ing| work| experience)?|interests?|hobbies|references?|training|courses?|coursework|tools?|technolog(?:y|ies)|tech stack|leadership|activities|affiliations|memberships?|research|portfolio|patents?|talks|speaking|conferences|contact|qualifications)\s*(?:&|and)?\s*[\w ]*$/i,
  };
  const isExperience = (s) => s.type === 'entries' && !RX.education.test(s.title || '') && (RX.experience.test(s.title || '') || (s.labels && s.labels.subtitle === 'Company'));
  const isEducation = (s) => s.type === 'entries' && (RX.education.test(s.title || '') || (s.labels && s.labels.title === 'Degree'));
  const entryFilled = (it) => filled(it.title) || filled(it.subtitle) || filled(it.description);
  const itemFilled = (s, it) => (s.type === 'entries' ? entryFilled(it) : filled(it.name));
  const sectionEmpty = (s) => (s.type === 'text' ? !filled(plain(s.content)) : !(s.items || []).some((it) => itemFilled(s, it)));

  /** bullet points + sentences from every achievement-style entries section */
  function statements(sections) {
    const out = [];
    sections.filter((s) => s.type === 'entries' && !RX.noBullets.test(s.title || '')).forEach((s) => (s.items || []).forEach((it) => {
      String(it.description || '').split('\n').map((l) => l.trim()).filter(Boolean).forEach((l) => {
        const m = l.match(/^[-•*]\s+(.*)/);
        const push = (t, bullet) => { t = plain(t).trim(); if (t) out.push({ text: t, bullet, words: wc(t), sectionId: s.id, itemId: it.id }); };
        if (m) push(m[1], true);
        else plain(l).split(/(?<=[.!?])\s+(?=[A-Z0-9])/).forEach((x) => push(x, false));
      });
    }));
    return out;
  }
  const bulletCount = (it) => String(it.description || '').split('\n').filter((l) => /^\s*[-•*]\s+\S/.test(l)).length;

  /** every piece of visible resume text, one string per logical unit */
  function resumeUnits(data) {
    const p = data.personal || {};
    const units = [p.title, p.location, ...(p.extra || []).map((f) => `${f.label || ''} ${f.value || ''}`)];
    (data.sections || []).filter((s) => s.visible !== false).forEach((s) => {
      units.push(s.title);
      if (s.type === 'text') units.push(...plain(s.content).split(/\n|(?<=[.!?])\s+/));
      else (s.items || []).forEach((it) => {
        if (s.type !== 'entries') return units.push(it.name);
        units.push(it.title, it.subtitle, it.location, ...plain(it.description).split('\n'), ...(it.fields || []).map((f) => `${f.label || ''} ${f.value || ''}`));
      });
    });
    return units.map((u) => plain(u).replace(/^\s*[-•*]\s+/, '').trim()).filter(Boolean);
  }
  const resumeWords = (data) => wc([(data.personal || {}).name, ...resumeUnits(data)].join(' \n '));

  /* date formats used in a date string ("Mar 2021 – Present", "2012 - 2016", "01/2020") */
  const MONTHS = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
  const FMT_NAMES = { month: '“Mon YYYY”', numeric: '“MM/YYYY”', iso: '“YYYY-MM”', year: '“YYYY” only', season: '“Season YYYY”' };
  function dateInfo(str) {
    let s = ` ${String(str || '').toLowerCase()} `;
    const fmts = [], styles = [];
    s = s.replace(new RegExp(`\\b(${MONTHS})\\.?,?\\s*(?:\\d{4}|'\\d{2})\\b`, 'g'), (m, mon) => {
      fmts.push('month');
      if (mon !== 'may') styles.push(mon.length > 4 || mon === 'june' || mon === 'july' ? 'long' : 'short');
      return ' § ';
    });
    s = s.replace(/\b(?:spring|summer|fall|autumn|winter)\s+\d{4}\b/g, () => { fmts.push('season'); return ' § '; });
    s = s.replace(/\b(?:0?[1-9]|1[0-2])[/.](?:\d{4}|\d{2})\b/g, () => { fmts.push('numeric'); return ' § '; });
    s = s.replace(/\b\d{4}[-/.](?:0[1-9]|1[0-2])\b/g, () => { fmts.push('iso'); return ' § '; });
    s = s.replace(/\b(?:19|20)\d{2}\b/g, () => { fmts.push('year'); return ' § '; });
    const sep = /§\s*–\s*/.test(s) ? 'en dash' : /§\s*—\s*/.test(s) ? 'em dash' : /§\s*-\s*/.test(s) ? 'hyphen' : /§\s*to\s/.test(s) ? '“to”' : null;
    return { fmts, styles, sep };
  }

  /* =====================================================================
     analyze(data, {design, pages, sidePages, mainPages}) — pure scoring
     ===================================================================== */
  const GRADES = [[85, 'Excellent', 'ok'], [70, 'Good', 'good'], [50, 'Fair', 'warn'], [0, 'Needs work', 'bad']];
  const gradeOf = (score) => GRADES.find(([min]) => score >= min);

  function analyze(data, opts = {}) {
    data = data || {};
    const p = data.personal || {};
    const design = { ...(typeof DEFAULT_DESIGN !== 'undefined' ? DEFAULT_DESIGN : {}), ...(opts.design || {}) };
    const all = data.sections || [];
    const vis = all.filter((s) => s.visible !== false);
    const st = statements(vis);
    const checks = [];
    const add = (c) => {
      c.points = Math.round(c.weight * clamp01(c.ratio ?? (c.status === 'pass' ? 1 : 0)) * 10) / 10;
      delete c.ratio;
      checks.push(c);
    };
    const ex = (x, note) => ({ text: x.text, note, sectionId: x.sectionId, itemId: x.itemId });

    /* --- contact details --- */
    {
      const placeholder = (k) => (k === 'name' && /^your name$/i.test(String(p.name || '').trim())) || (k === 'title' && /^your (professional )?title$/i.test(String(p.title || '').trim()));
      const core = [['name', 'name'], ['title', 'job title'], ['email', 'email'], ['phone', 'phone'], ['location', 'location']];
      const missing = core.filter(([k]) => !filled(p[k]) || placeholder(k)).map(([, l]) => l);
      const emailBad = filled(p.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(p.email).trim());
      const links = [filled(p.linkedin) && 'LinkedIn', filled(p.website) && 'website',
        ...(p.extra || []).filter((f) => filled(f.value) && /github|gitlab|portfolio|behance|dribbble|linkedin|website|blog/i.test(`${f.label} ${f.value}`)).map((f) => f.label || 'link')].filter(Boolean);
      const got = 5 - missing.length;
      const status = missing.length === 0 ? (emailBad ? 'warn' : 'pass') : missing.length <= 2 ? 'warn' : 'fail';
      const parts = [missing.length ? `Missing: ${missing.join(', ')}` : 'Name, title, email, phone and location are all set'];
      if (emailBad) parts.push('email address looks invalid');
      parts.push(links.length ? `${links.slice(0, 2).join(' & ')} linked` : 'add LinkedIn or a portfolio link for a bonus');
      add({ id: 'contact', cat: 'Content', title: 'Contact details', status, weight: 10, ratio: (got / 5) * 0.85 + (links.length ? 0.15 : 0) - (emailBad ? 0.15 : 0), detail: parts.join(' · '), sectionId: 'personal' });
    }

    /* --- professional summary --- */
    const sumSec = vis.find((s) => s.type === 'text' && RX.summary.test(s.title || '')) || vis.find((s) => s.type === 'text');
    const sumText = sumSec ? plain(sumSec.content).trim() : '';
    {
      const n = wc(sumText);
      let status, ratio, detail;
      if (!sumSec || !n) [status, ratio, detail] = ['fail', 0, 'No professional summary — add 2–4 sentences on who you are and the value you bring'];
      else if (n < 15) [status, ratio, detail] = ['fail', 0.3, `Only ${plural(n, 'word')} — expand to 30–120 words`];
      else if (n < 30) [status, ratio, detail] = ['warn', 0.7, `${n} words — a little short, aim for 30–120`];
      else if (n <= 120) [status, ratio, detail] = ['pass', 1, `${n} words — right in the 30–120 sweet spot`];
      else if (n <= 180) [status, ratio, detail] = ['warn', 0.6, `${n} words — trim to 120 or fewer, recruiters skim`];
      else [status, ratio, detail] = ['fail', 0.3, `${n} words — far too long, keep it under 120`];
      add({ id: 'summary', cat: 'Content', title: 'Professional summary', status, weight: 8, ratio, detail, sectionId: sumSec && sumSec.id, add: sumSec ? null : 'profile' });
    }

    /* --- work experience --- */
    const expSecs = vis.filter(isExperience);
    {
      const roles = expSecs.flatMap((s) => (s.items || []).filter(entryFilled).map((it) => ({ s, it, n: bulletCount(it) })));
      const c = { id: 'experience', cat: 'Content', title: 'Work experience', weight: 14 };
      if (!expSecs.length) Object.assign(c, { status: 'fail', ratio: 0, detail: 'No experience section — add your roles with dates and achievements', add: 'experience' });
      else if (!roles.length) Object.assign(c, { status: 'fail', ratio: 0, detail: `${expSecs[0].title || 'Experience'} is empty — add your roles`, sectionId: expSecs[0].id });
      else {
        const noDate = roles.filter((r) => !filled(r.it.date));
        const bad = roles.filter((r) => r.n < 2 || r.n > 6);
        const ratio = 0.4 + 0.3 * (1 - noDate.length / roles.length) + 0.3 * (1 - bad.length / roles.length);
        const ns = roles.map((r) => r.n);
        const lo = Math.min(...ns), hi = Math.max(...ns);
        const parts = [];
        if (noDate.length) parts.push(`${noDate.length} of ${plural(roles.length, 'role')} missing a date`);
        const few = bad.filter((r) => r.n < 2).length, many = bad.length - few;
        if (few) parts.push(`${plural(few, 'role')} with fewer than 2 bullets`);
        if (many) parts.push(`${plural(many, 'role')} with more than 6 bullets`);
        const first = noDate[0] || bad[0];
        Object.assign(c, {
          status: !parts.length ? 'pass' : ratio >= 0.7 ? 'warn' : 'fail', ratio,
          detail: parts.length ? `${parts.join(' · ')} — aim for 2–6 bullets per role` : `${plural(roles.length, 'role')} · all dated · ${lo === hi ? lo : `${lo}–${hi}`} bullets each`,
          sectionId: (first || roles[0]).s.id, itemId: first && first.it.id,
          examples: [...noDate.map((r) => ({ text: r.it.title || r.it.subtitle, note: 'no date', sectionId: r.s.id, itemId: r.it.id })),
            ...bad.map((r) => ({ text: r.it.title || r.it.subtitle, note: `${plural(r.n, 'bullet')}`, sectionId: r.s.id, itemId: r.it.id }))],
        });
      }
      add(c);
    }

    /* --- quantified impact --- */
    {
      const q = st.filter((x) => METRIC.test(x.text));
      const share = st.length ? q.length / st.length : 0;
      const pct = Math.round(share * 100);
      add({
        id: 'impact', cat: 'Impact', title: 'Quantified impact', weight: 12,
        status: !st.length ? 'fail' : share >= 0.5 ? 'pass' : share >= 0.25 ? 'warn' : 'fail', ratio: share / 0.5,
        detail: st.length ? `${q.length} of ${plural(st.length, 'bullet')} (${pct}%) include numbers or metrics — aim for at least half` : 'No bullet points yet — describe results with numbers (%, $, time saved, users)',
        examples: st.filter((x) => !METRIC.test(x.text)).slice(0, 6).map((x) => ex(x, 'add a number: %, $, time, volume')),
        sectionId: (st.find((x) => !METRIC.test(x.text)) || {}).sectionId || (expSecs[0] && expSecs[0].id), itemId: (st.find((x) => !METRIC.test(x.text)) || {}).itemId,
      });
    }

    /* --- results, not just tasks --- */
    {
      const res = st.filter((x) => OUTCOME.test(x.text));
      const share = st.length ? res.length / st.length : 0;
      const first = st.find((x) => !OUTCOME.test(x.text));
      add(st.length ? {
        id: 'outcomes', cat: 'Impact', title: 'Results, not just tasks', weight: 10,
        status: share >= 0.6 ? 'pass' : share >= 0.3 ? 'warn' : 'fail', ratio: share / 0.6,
        detail: `${res.length} of ${plural(st.length, 'bullet')} state an outcome (increased, reduced, from X to Y…) — pair each action with its result`,
        examples: st.filter((x) => !OUTCOME.test(x.text)).slice(0, 6).map((x) => ex(x, 'what changed because of it?')),
        sectionId: first && first.sectionId, itemId: first && first.itemId,
      } : { id: 'outcomes', cat: 'Impact', title: 'Results, not just tasks', weight: 10, status: 'fail', ratio: 0, detail: 'No bullet points yet — show what improved because of your work', sectionId: expSecs[0] && expSecs[0].id });
    }

    /* --- strong action verbs --- */
    {
      const weak = st.map((x) => ({ x, w: weakOpener(x.text) })).filter((o) => o.w);
      const strong = st.filter((x) => openerVerb(x.text));
      const share = st.length ? strong.length / st.length : 0;
      const tally = {};
      weak.forEach((o) => { tally[o.w] = (tally[o.w] || 0) + 1; });
      const weakTxt = Object.entries(tally).map(([w, n]) => `${quote(w)}${n > 1 ? ` ×${n}` : ''}`).join(', ');
      const others = st.filter((x) => !weakOpener(x.text) && !openerVerb(x.text));
      const firstBad = (weak[0] && weak[0].x) || others[0];
      add({
        id: 'verbs', cat: 'Impact', title: 'Strong action verbs', weight: 10,
        status: !st.length ? 'fail' : share >= 0.8 && !weak.length ? 'pass' : share >= 0.5 ? 'warn' : 'fail', ratio: share / 0.8,
        detail: st.length ? `${strong.length} of ${plural(st.length, 'bullet')} open with an action verb${weak.length ? ` · weak openers: ${weakTxt}` : ''}` : 'Start each bullet with a verb like Led, Built, Increased',
        examples: [...weak.map((o) => ex(o.x, `weak opener ${quote(o.w)} — try Led, Delivered, Drove`)), ...others.map((x) => ex(x, 'start with an action verb'))].slice(0, 6),
        sectionId: firstBad ? firstBad.sectionId : expSecs[0] && expSecs[0].id, itemId: firstBad && firstBad.itemId,
      });
    }

    /* --- bullet length --- */
    {
      const long = st.filter((x) => x.words > 30), short = st.filter((x) => x.words < 4);
      const bad = long.length + short.length;
      const avg = st.length ? Math.round(st.reduce((a, x) => a + x.words, 0) / st.length) : 0;
      const parts = [long.length && `${long.length} over 30 words`, short.length && `${short.length} under 4 words`].filter(Boolean);
      const first = long[0] || short[0];
      add(st.length ? {
        id: 'length-bullets', cat: 'Impact', title: 'Bullet length', weight: 6,
        status: !bad ? 'pass' : bad / st.length <= 0.25 ? 'warn' : 'fail', ratio: 1 - (bad / st.length) * 1.5,
        detail: bad ? `${parts.join(', ')} · average ${avg} — keep bullets to 1–2 lines` : `All ${plural(st.length, 'bullet')} are 4–30 words (average ${avg})`,
        examples: [...long.map((x) => ex(x, `${x.words} words — split or tighten`)), ...short.map((x) => ex(x, `${x.words} words — add context or a result`))].slice(0, 6),
        sectionId: first && first.sectionId, itemId: first && first.itemId,
      } : { id: 'length-bullets', cat: 'Impact', title: 'Bullet length', weight: 0, status: 'info', detail: 'Add bullet points to your experience to check their length' });
    }

    /* --- skills --- */
    {
      const secs = vis.filter((s) => (s.type === 'skills' || s.type === 'tags') && !RX.notSkills.test(s.title || ''));
      const n = secs.reduce((a, s) => a + (s.items || []).filter((i) => filled(i.name)).length, 0);
      const c = { id: 'skills', cat: 'Content', title: 'Skills', weight: 8, sectionId: secs[0] && secs[0].id };
      if (!secs.length) Object.assign(c, { status: 'fail', ratio: 0, detail: 'No skills section — ATS filters match on skill keywords', add: 'skills' });
      else if (n >= 5 && n <= 30) Object.assign(c, { status: 'pass', ratio: 1, detail: `${n} skills listed${secs.length > 1 ? ` across ${secs.length} sections` : ''} — enough for keyword matching` });
      else if (n > 30) Object.assign(c, { status: 'warn', ratio: 0.7, detail: `${n} skills — trim to the 10–20 most relevant to the job` });
      else Object.assign(c, { status: n >= 3 ? 'warn' : 'fail', ratio: n >= 3 ? 0.6 : n * 0.15, detail: n ? `${plural(n, 'skill')} listed — add at least ${5 - n} more relevant hard skills` : 'No skills listed yet — add at least 5 relevant hard skills' });
      add(c);
    }

    /* --- education --- */
    {
      const secs = vis.filter(isEducation);
      const items = secs.flatMap((s) => (s.items || []).filter(entryFilled).map((it) => ({ s, it })));
      const incomplete = items.filter((x) => !filled(x.it.subtitle) || !filled(x.it.date));
      const c = { id: 'education', cat: 'Content', title: 'Education', weight: 6, sectionId: secs[0] && secs[0].id };
      if (!secs.length) Object.assign(c, { status: 'fail', ratio: 0, detail: 'No education section — add your degree, school and dates', add: 'education' });
      else if (!items.length) Object.assign(c, { status: 'fail', ratio: 0, detail: `${secs[0].title || 'Education'} is empty — add your degree or training` });
      else if (incomplete.length) Object.assign(c, { status: 'warn', ratio: 0.7, detail: `${plural(incomplete.length, 'entry', 'entries')} missing the school or dates`, sectionId: incomplete[0].s.id, itemId: incomplete[0].it.id });
      else Object.assign(c, { status: 'pass', ratio: 1, detail: `${plural(items.length, 'entry', 'entries')} · ${items[0].it.title || items[0].it.subtitle}` });
      add(c);
    }

    /* --- overall length --- */
    const words = resumeWords(data);
    const pages = opts.pages || Math.max(1, Math.ceil(words / 520));
    {
      const pg = plural(pages, 'page');
      let status, ratio, detail;
      if (words < 150) [status, ratio, detail] = ['fail', 0.15, `${pg} · ${words} words — too thin, aim for 250–800 words`];
      else if (pages > 3) [status, ratio, detail] = ['fail', 0.25, `${pg} · ${words} words — cut to 1–2 pages, focus on the last 10–15 years`];
      else if (pages === 3) [status, ratio, detail] = ['warn', 0.55, `${pg} · ${words} words — most recruiters expect 1–2 pages`];
      else if (words < 200) [status, ratio, detail] = ['warn', 0.6, `${pg} · ${words} words — a bit light, aim for 250–800 words`];
      else if (words > 900) [status, ratio, detail] = ['warn', 0.7, `${pg} · ${words} words — dense, trim older or less relevant detail`];
      else [status, ratio, detail] = ['pass', 1, `${pg} · ${words} words — ideal is 1–2 pages, 250–800 words`];
      add({ id: 'length', cat: 'Format', title: 'Length', status, weight: 8, ratio, detail, pages, words });
    }

    /* --- repeated action verbs --- */
    {
      const counts = {};
      st.forEach((x) => { const v = openerVerb(x.text); if (!v) return; const k = stem(v); (counts[k] = counts[k] || { word: v, n: 0, items: [] }).n++; counts[k].items.push(x); });
      const rep = Object.entries(counts).filter(([, o]) => o.n >= 3).sort((a, b) => b[1].n - a[1].n);
      const cap = (w) => w[0].toUpperCase() + w.slice(1);
      if (st.length < 3) add({ id: 'repetition', cat: 'Impact', title: 'Varied wording', weight: 0, status: 'info', detail: 'Add a few more bullets to check for repeated verbs' });
      else add({
        id: 'repetition', cat: 'Impact', title: 'Varied wording', weight: 4,
        status: rep.length ? 'warn' : 'pass', ratio: 1 - 0.35 * rep.length,
        detail: rep.length ? rep.slice(0, 2).map(([k, o]) => `${quote(cap(o.word))} starts ${o.n} bullets${SYNONYMS[k] ? ` — try ${SYNONYMS[k]}` : ''}`).join(' · ')
          : `No opener is used more than twice (${plural(Object.keys(counts).length, 'different verb')})`,
        examples: rep.flatMap(([, o]) => o.items.map((x) => ex(x, `repeats ${quote(cap(o.word))}`))).slice(0, 6),
        sectionId: rep.length ? rep[0][1].items[0].sectionId : null, itemId: rep.length ? rep[0][1].items[0].itemId : null,
      });
    }

    /* --- date consistency --- */
    {
      const dated = vis.filter((s) => s.type === 'entries').flatMap((s) => (s.items || []).filter((it) => filled(it.date)).map((it) => ({ s, it, info: dateInfo(it.date) })));
      const tally = {}, styles = {}, seps = {};
      dated.forEach((d) => {
        new Set(d.info.fmts).forEach((f) => { (tally[f] = tally[f] || []).push(d); });
        d.info.styles.forEach((x) => { styles[x] = (styles[x] || 0) + 1; });
        if (d.info.sep) (seps[d.info.sep] = seps[d.info.sep] || []).push(d);
      });
      const kinds = Object.keys(tally);
      const issues = [];
      let ratio = 1, culprit = null;
      const minority = (map) => Object.values(map).sort((a, b) => a.length - b.length)[0][0];
      const monthish = kinds.filter((k) => k !== 'year');
      if (monthish.length > 1) { ratio -= 0.6; culprit = minority(Object.fromEntries(monthish.map((k) => [k, tally[k]]))); issues.push(`Mixed month formats: ${monthish.map((k) => `${FMT_NAMES[k]} ×${tally[k].length}`).join(', ')}`); }
      if (tally.year && monthish.length) { ratio -= 0.65; culprit = culprit || minority({ a: tally.year, b: tally[monthish[0]] }); issues.push(`${monthish.length > 1 ? 'Month dates' : `${FMT_NAMES[monthish[0]]} ×${tally[monthish[0]].length}`} mixed with ${FMT_NAMES.year} ×${tally.year.length}`); }
      if (styles.long && styles.short) { ratio -= 0.3; issues.push('Short and full month names mixed'); }
      if (Object.keys(seps).length > 1) { ratio -= 0.3; culprit = culprit || minority(seps); issues.push(`Range separators mixed (${Object.keys(seps).join(', ')})`); }
      if (!dated.length) add({ id: 'dates', cat: 'Format', title: 'Date consistency', weight: 0, status: 'info', detail: 'No dates yet — add a period to each role and degree' });
      else add({
        id: 'dates', cat: 'Format', title: 'Date consistency', weight: 8, status: !issues.length ? 'pass' : ratio > 0.25 ? 'warn' : 'fail', ratio,
        detail: issues.length ? `${issues.join(' · ')} — use one format everywhere` : `All ${plural(dated.length, 'date')} use the ${FMT_NAMES[kinds[0]] || 'same'} format`,
        examples: issues.length ? dated.map((d) => ({ text: `${d.it.date} — ${d.it.title || d.it.subtitle || d.s.title}`, note: d.s.title, sectionId: d.s.id, itemId: d.it.id })).slice(0, 8) : null,
        sectionId: culprit && culprit.s.id, itemId: culprit && culprit.it.id,
      });
    }

    /* --- empty / hidden sections --- */
    {
      const empty = vis.filter(sectionEmpty);
      const blanks = vis.filter((s) => s.type !== 'text' && !sectionEmpty(s)).flatMap((s) => (s.items || []).filter((it) => !itemFilled(s, it)).map((it) => ({ s, it })));
      const hidden = all.filter((s) => s.visible === false);
      const hiddenTxt = hidden.length ? ` · ${plural(hidden.length, 'hidden section')} (${hidden.map((s) => s.title).join(', ')}) won't be printed` : '';
      let c;
      if (!vis.length) c = { status: 'fail', ratio: 0, detail: `No visible sections yet${hiddenTxt}`, sectionId: hidden[0] && hidden[0].id, add: hidden.length ? null : 'profile' };
      else if (empty.length) c = { status: empty.length > 2 ? 'fail' : 'warn', ratio: 1 - 0.3 * empty.length, detail: `Empty: ${empty.map((s) => s.title || 'Untitled').join(', ')} — fill in or delete${hiddenTxt}`, sectionId: empty[0].id };
      else if (blanks.length) c = { status: 'warn', ratio: 0.7, detail: `${plural(blanks.length, 'blank item')} in ${[...new Set(blanks.map((b) => b.s.title))].join(', ')}${hiddenTxt}`, sectionId: blanks[0].s.id };
      else c = { status: hidden.length ? 'info' : 'pass', ratio: 1, detail: `All ${plural(vis.length, 'visible section')} have content${hiddenTxt}`, sectionId: hidden[0] && hidden[0].id };
      add({ id: 'sections', cat: 'Format', title: 'Empty & hidden sections', weight: 4, ...c });
    }

    /* --- personal pronouns --- */
    {
      const bp = st.filter((x) => PRONOUN_RX.test(x.text));
      const sp = pronounCount(sumText);
      if (!st.length && !sumText) add({ id: 'pronouns', cat: 'Impact', title: 'Personal pronouns', weight: 0, status: 'info', detail: 'Nothing to check yet' });
      else {
        const where = [bp.length && plural(bp.length, 'bullet'), sp && 'your summary'].filter(Boolean).join(' and ');
        add({
          id: 'pronouns', cat: 'Impact', title: 'Personal pronouns', weight: 6,
          status: !bp.length && !sp ? 'pass' : bp.length > 2 ? 'fail' : 'warn', ratio: 1 - Math.min(0.75, bp.length * 0.25) - (sp ? 0.6 : 0),
          detail: where ? `“I”, “me” or “my” used in ${where} — write “Led…”, not “I led…”` : 'No “I”, “me” or “my” — crisp, resume-style voice',
          examples: [...(sp ? [{ text: sumText.split(/(?<=[.!?])\s+/).find((x) => PRONOUN_RX.test(x)) || sumText, note: 'summary', sectionId: sumSec.id }] : []), ...bp.map((x) => ex(x, 'drop the pronoun'))].slice(0, 6),
          sectionId: bp.length ? bp[0].sectionId : sp ? sumSec.id : null, itemId: bp.length ? bp[0].itemId : null,
        });
      }
    }

    /* --- clichés --- */
    {
      const text = norm([sumText, ...st.map((x) => x.text), p.title].join(' \n '));
      const found = CLICHES.filter((c) => new RegExp(`(?<![a-z])${escRx(c)}(?![a-z])`).test(text));
      add({
        id: 'cliches', cat: 'Impact', title: 'Buzzwords & clichés', weight: 4,
        status: !found.length ? 'pass' : found.length <= 2 ? 'warn' : 'fail', ratio: !found.length ? 1 : found.length <= 2 ? 0.5 : 0.15,
        detail: found.length ? `Replace with proof: ${found.slice(0, 4).map(quote).join(', ')}` : 'No empty buzzwords like “team player” or “results-driven”',
        sectionId: found.length ? (sumSec && sumSec.id) || (expSecs[0] && expSecs[0].id) : null,
      });
    }

    /* --- ATS: standard headings --- */
    {
      const odd = vis.filter((s) => !RX.standard.test(s.title || '') || /^custom section$/i.test(s.title || ''));
      add({
        id: 'headings', cat: 'ATS', title: 'Standard section headings', weight: 3,
        status: odd.length ? 'warn' : 'pass', ratio: odd.length ? 0.4 : 1,
        detail: odd.length ? `Rename ${odd.slice(0, 3).map((s) => quote(s.title || 'Untitled')).join(', ')} — ATS look for headings like Experience, Education, Skills` : 'Headings use names ATS recognise (Experience, Education, Skills…)',
        sectionId: odd[0] && odd[0].id,
      });
    }

    /* --- ATS: layout & sidebar --- */
    {
      const t = typeof tplById === 'function' ? tplById(design.template) : { layout: 'single', name: '' };
      const c = { id: 'layout', cat: 'ATS', title: 'ATS-friendly layout', weight: 6 };
      if (t.layout === 'single') Object.assign(c, { status: 'pass', ratio: 1, detail: `${t.name} is single-column — the easiest layout for ATS to parse` });
      else {
        const side = vis.filter((s) => s.column === 'side');
        const sideWords = side.reduce((a, s) => a + resumeWords({ sections: [s] }), 0);
        const biggest = side.slice().sort((a, b) => (b.items || []).length - (a.items || []).length)[0];
        const spill = opts.sidePages && opts.mainPages && opts.sidePages > opts.mainPages;
        if (sideWords > 220 || spill) Object.assign(c, {
          status: sideWords > 350 ? 'fail' : 'warn', ratio: sideWords > 350 ? 0.2 : 0.4, sectionId: biggest && biggest.id,
          detail: spill ? `The sidebar runs onto page ${opts.sidePages} while the main column ends on page ${opts.mainPages} — trim sidebar items or move one to the main column`
            : `The sidebar holds ~${sideWords} words — some ATS read columns out of order, keep key content in the main column`,
        });
        else Object.assign(c, { status: 'pass', ratio: 1, detail: `Two-column layout with a light sidebar (~${plural(sideWords, 'word')}) — fine for most ATS` });
      }
      add(c);
    }

    /* --- ATS: photo (informational) --- */
    if (design.showPhoto !== false && filled(p.photo)) {
      add({ id: 'photo', cat: 'ATS', title: 'Photo', weight: 0, status: 'info', detail: 'A photo is shown — many ATS and regions (US, UK, Canada) prefer resumes without one; hide it when applying there', sectionId: 'personal' });
    }

    const total = checks.reduce((a, c) => a + c.weight, 0);
    const got = checks.reduce((a, c) => a + c.points, 0);
    const score = total ? Math.round((got / total) * 100) : 0;
    const [, grade, tone] = gradeOf(score);
    const cats = {};
    checks.forEach((c) => { if (!c.weight) return; const o = (cats[c.cat] = cats[c.cat] || { weight: 0, points: 0 }); o.weight += c.weight; o.points += c.points; });
    Object.values(cats).forEach((o) => { o.percent = Math.round((o.points / o.weight) * 100); });
    return { score, grade, tone, checks, categories: cats, words, pages };
  }

  /* =====================================================================
     match(data, jdText) — pure keyword extraction + comparison
     ===================================================================== */
  const DICT = SKILL_DICT.map((line) => {
    const [label, ...rest] = line.split('|');
    const aliases = [...new Set([label.toLowerCase(), ...rest])];
    const rx = (a) => new RegExp(`(?<![a-z0-9+#])${escRx(a)}${/[a-z]$/.test(a) ? '(?:s|es)?' : ''}${a === 'excel' ? '(?! (?:at|in)\\b)' : ''}(?![a-z0-9+#])`, 'g');
    return { key: label.toLowerCase(), label, aliases, rxs: aliases.map(rx), stems: aliases.map(stemPhrase).filter(Boolean) };
  });
  const DICT_ALIASES = DICT.flatMap((e) => e.aliases.map((a, i) => ({ e, a, rx: e.rxs[i] }))).sort((x, y) => y.a.length - x.a.length);
  const LY_OK = new Set(['family', 'supply', 'assembly', 'anomaly', 'quarterly', 'monthly', 'weekly', 'butterfly', 'italy']);
  const isKeywordToken = (w) => !STOP.has(w) && !/^\d/.test(w) && (w.length >= 3 || SHORT_OK.has(w)) && !STOP.has(w.replace(/s$/, ''))
    && !(w.length > 5 && /ly$/.test(w) && !LY_OK.has(w));

  function extractKeywords(jd, limit = 30) {
    let text = norm(jd);
    const found = new Map();
    for (const { e, rx } of DICT_ALIASES) {
      rx.lastIndex = 0;
      const pos = text.search(rx);
      if (pos < 0) continue;
      let n = 0;
      text = text.replace(rx, () => { n++; return ' ¦ '; });
      const k = found.get(e.key) || { key: e.key, label: e.label, count: 0, dict: true, pos, entry: e };
      k.count += n; k.pos = Math.min(k.pos, pos);
      found.set(e.key, k);
    }
    const uni = new Map(), bi = new Map();
    const bump = (map, key, label, pos) => {
      const o = map.get(key) || { key, count: 0, forms: {}, pos };
      o.count++; o.forms[label] = (o.forms[label] || 0) + 1;
      map.set(key, o);
    };
    let pos = 0;
    text.split(/[.,;:!?()[\]{}"|¦•\n/]+|\s[-–—]+\s/).forEach((clause) => {
      let prev = null;
      (clause.match(TOKEN_RX) || []).forEach((w0) => {
        pos++;
        const w = ALIAS_TOK[w0] || w0;
        if (!isKeywordToken(w)) { prev = null; return; }
        const s = stem(w);
        bump(uni, s, w, pos);
        if (prev) bump(bi, `${prev.s} ${s}`, `${prev.w} ${w}`, pos);
        prev = { s, w };
      });
    });
    const best = (o) => Object.entries(o.forms).sort((a, b) => b[1] - a[1])[0][0];
    const cands = [];
    found.forEach((k) => cands.push({ ...k, score: 4 + k.count * 2, stems: k.entry.stems[0] }));
    bi.forEach((o) => {
      if (o.count >= 2) cands.push({ key: o.key, label: best(o), count: o.count, pos: o.pos, score: 1 + o.count * 2, stems: o.key });
      else if (o.key.split(' ').every((x) => x.length >= 3)) cands.push({ key: o.key, label: best(o), count: 1, pos: o.pos, score: 1.5, stems: o.key });
    });
    uni.forEach((o) => cands.push({ key: o.key, label: best(o), count: o.count, pos: o.pos, score: o.count, stems: o.key }));
    cands.sort((a, b) => b.score - a.score || a.pos - b.pos);
    const out = [];
    let singles = 0, pairs = 0;
    for (const c of cands) {
      if (out.length >= limit) break;
      const isUni = !c.dict && !c.stems.includes(' ');
      if (isUni && out.some((o) => o.stems.includes(' ') && o.stems.split(' ').includes(c.stems) && c.count <= o.count + 1)) continue;
      if (out.some((o) => o.stems === c.stems)) continue;
      if (isUni && c.count === 1) { if (c.label.length < 5 || singles >= 10) continue; singles++; }
      if (!c.dict && !isUni && c.count === 1) { if (pairs >= 8) continue; pairs++; }
      out.push(c);
    }
    return out.map(({ key, label, count, dict, stems, entry }) => ({ key, label, count, dict: !!dict, stems, entry }));
  }

  function resumeIndex(data) {
    const units = resumeUnits(data);
    const stemUnits = units.map((u) => toks(u).map(stem));
    return {
      text: norm(units.join(' \n ')),
      stemStr: ` ${stemUnits.map((a) => a.join(' ')).join(' | ')} `,
      sets: stemUnits.map((a) => new Set(a)),
    };
  }
  function hasKeyword(idx, kw) {
    if (kw.entry && kw.entry.rxs.some((rx) => { rx.lastIndex = 0; return rx.test(idx.text); })) return true;
    const phrases = kw.entry ? kw.entry.stems : [kw.stems];
    return phrases.some((ps) => ps && (idx.stemStr.includes(` ${ps} `) || (ps.includes(' ') && idx.sets.some((set) => ps.split(' ').every((x) => set.has(x))))));
  }

  function match(data, jdText) {
    const kws = extractKeywords(jdText || '');
    const idx = resumeIndex(data || {});
    const keywords = kws.map((k) => ({ term: k.key, label: k.label, count: k.count, dict: k.dict, matched: hasKeyword(idx, k) }));
    const matched = keywords.filter((k) => k.matched).map((k) => k.label);
    const missing = keywords.filter((k) => !k.matched).map((k) => k.label);
    return { percent: keywords.length ? Math.round((matched.length / keywords.length) * 100) : 0, matched, missing, keywords };
  }

  /* =====================================================================
     UI (only touched when the Insights tab is visible)
     ===================================================================== */
  const JD_KEY = 'resume-studio:jd';
  const ST_ICON = {
    pass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9.5 16.5 4 11"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="6" x2="12" y2="13"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    fail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="17" y1="7" x2="7" y2="17"/><line x1="7" y1="7" x2="17" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="11" x2="12" y2="18"/><line x1="12" y1="6" x2="12.01" y2="6"/></svg>',
  };
  const ORDER = { fail: 0, warn: 1, info: 2, pass: 3 };
  const HEADLINES = {
    Excellent: 'Recruiter-ready — polish the last details below.',
    Good: 'Solid foundation — a few fixes will make it stand out.',
    Fair: 'Getting there — work through the issues below.',
    'Needs work': 'Fill in the essentials to get your resume noticed.',
  };
  const ui = {};
  let dirty = true, timer = null, jdTimer = null, host = null;
  let filter = 'all', verbCat = 'Leadership', verbsOpen = false, offer = null;
  const expanded = new Set();

  const visible = () => typeof App !== 'undefined' && App.state && App.state.mode === 'template' && App.state.tab === 'insights';
  function schedule(delay = 300) {
    if (!visible()) { dirty = true; return; }
    clearTimeout(timer);
    timer = setTimeout(refresh, delay);
  }
  const loadJD = () => { try { return localStorage.getItem(JD_KEY) || ''; } catch { return ''; } };
  const saveJD = (v) => { try { v ? localStorage.setItem(JD_KEY, v) : localStorage.removeItem(JD_KEY); } catch { /* storage unavailable */ } };

  function copyText(text, msg) {
    const fallback = () => {
      const ta = h('textarea', { style: { position: 'fixed', left: '-9999px', top: '0' } });
      ta.value = text;
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { /* unsupported */ }
      ta.remove();
      toast(ok ? msg : 'Copy failed — select the text and copy it manually');
    };
    if (navigator.clipboard && window.isSecureContext !== false) navigator.clipboard.writeText(text).then(() => toast(msg), fallback);
    else fallback();
  }

  /** page counts from the live preview (or an off-screen render when it isn't available) */
  function layoutInfo() {
    let wraps = $$('#tplPages > .page-wrap');
    if (App.state.mode !== 'template' || !wraps.length) {
      if (!host) host = document.body.appendChild(h('div', { class: 'pages ins-measure', 'aria-hidden': 'true' }));
      Render.render(host, App.state.data, App.state.design);
      wraps = $$('.page-wrap', host);
    }
    const last = (sel) => wraps.reduce((n, w, i) => ($(sel, w) && $(sel, w).childElementCount ? i + 1 : n), 0);
    const info = { pages: wraps.length, sidePages: last('.col-side'), mainPages: last('.col-main') };
    if (host) host.innerHTML = '';
    return info;
  }

  function ring(id, size) {
    const r = 52, C = 2 * Math.PI * r;
    const el = h('div', { class: `ins-ring ins-ring-${size}`, html:
      `<svg viewBox="0 0 120 120" aria-hidden="true"><defs><linearGradient id="insGrad-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" class="s1"/><stop offset="1" class="s2"/></linearGradient></defs>`
      + `<circle class="trk" cx="60" cy="60" r="${r}"/><circle class="val" cx="60" cy="60" r="${r}" stroke="url(#insGrad-${id})" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${C.toFixed(2)}"/></svg>`
      + `<div class="ins-ring-num"><b>0</b><small>${size === 'lg' ? '/100' : '%'}</small></div>` });
    const arc = $('.val', el), num = $('b', el);
    return {
      el,
      set(v, tone) {
        el.dataset.tone = tone;
        void arc.getBoundingClientRect(); // commit the current offset so the change animates after re-insertion
        requestAnimationFrame(() => { arc.style.strokeDashoffset = (C * (1 - v / 100)).toFixed(2); });
        const from = +num.dataset.v || 0;
        num.dataset.v = v;
        cancelAnimationFrame(num._raf);
        const t0 = performance.now(), dur = from === v ? 0 : 800;
        const step = (t) => {
          const k = dur ? Math.min(1, (t - t0) / dur) : 1;
          num.textContent = Math.round(from + (v - from) * (1 - (1 - k) ** 3));
          if (k < 1) num._raf = requestAnimationFrame(step);
        };
        num._raf = requestAnimationFrame(step);
      },
    };
  }

  function build() {
    const root = $('#insightsPanel');
    if (!root) return false;
    root.innerHTML = '';
    ui.root = root;

    /* score card */
    ui.ring = ring('score', 'lg');
    ui.grade = h('div', { class: 'ins-grade' });
    ui.headline = h('p', { class: 'ins-headline' });
    ui.counts = h('div', { class: 'ins-counts' });
    ui.cats = h('div', { class: 'ins-cats' });
    root.append(h('section', { class: 'ins-card ins-score' },
      h('div', { class: 'ins-score-top' }, ui.ring.el,
        h('div', { class: 'ins-score-txt' }, h('span', { class: 'ins-kicker' }, 'Resume score'), ui.grade, ui.headline, ui.counts)),
      ui.cats));

    /* checks */
    ui.filter = h('div', { class: 'seg ins-filter', role: 'tablist' });
    ui.checks = h('div', { class: 'ins-checks' });
    root.append(h('section', { class: 'ins-card' },
      h('div', { class: 'ins-card-head' }, h('h3', {}, 'Checks'), ui.filter), ui.checks));

    /* job match */
    ui.jd = h('textarea', { class: 'inp ins-jd', rows: 6, placeholder: 'Paste the job description here — responsibilities, requirements, nice-to-haves…', 'aria-label': 'Job description',
      oninput: () => { saveJD(ui.jd.value); offer = null; clearTimeout(jdTimer); jdTimer = setTimeout(renderMatch, 300); } });
    ui.jd.value = loadJD();
    ui.jdMeta = h('div', { class: 'ins-jd-meta' });
    ui.match = h('div', { class: 'ins-match' });
    ui.matchRing = ring('match', 'sm');
    root.append(h('section', { class: 'ins-card' },
      h('div', { class: 'ins-card-head' }, h('h3', {}, 'Job match'), h('span', { class: 'ins-sub' }, 'Keyword comparison')),
      h('p', { class: 'ins-note' }, 'Paste a job ad to see which of its keywords your resume already covers — and which are missing.'),
      ui.jd, ui.jdMeta, ui.match));

    /* action verbs helper */
    ui.verbs = h('section', { class: `ins-card ins-verbs${verbsOpen ? ' open' : ''}` });
    renderVerbs();
    root.append(ui.verbs);
    return true;
  }

  function renderScore(res) {
    ui.ring.set(res.score, res.tone);
    ui.grade.className = `ins-grade t-${res.tone}`;
    ui.grade.textContent = res.grade;
    ui.headline.textContent = HEADLINES[res.grade];
    const n = (s) => res.checks.filter((c) => c.status === s).length;
    ui.counts.innerHTML = '';
    [['fail', 'to fix'], ['warn', 'to improve'], ['pass', 'passed']].forEach(([s, l]) => {
      ui.counts.append(h('span', { class: `ins-count st-${s}` }, h('i', {}), h('b', {}, String(n(s))), ` ${l}`));
    });
    ui.cats.innerHTML = '';
    ['Content', 'Impact', 'Format', 'ATS'].forEach((k) => {
      const c = res.categories[k];
      if (!c) return;
      const tone = c.percent >= 85 ? 'ok' : c.percent >= 65 ? 'good' : c.percent >= 45 ? 'warn' : 'bad';
      const fill = h('i', { class: `t-${tone}` });
      ui.cats.append(h('div', { class: 'ins-cat' }, h('div', { class: 'ins-cat-row' }, h('span', {}, k), h('b', {}, `${c.percent}%`)), h('div', { class: 'ins-bar' }, fill)));
      requestAnimationFrame(() => { fill.style.width = `${c.percent}%`; });
    });
  }

  function doFix(c) {
    const d = App.state.data;
    if (c.add && !d.sections.some((s) => s.id === c.sectionId)) {
      const s = newSection(c.add);
      // keep a sensible order: summary first, experience after it, education after experience
      const after = (pred) => { let i = -1; d.sections.forEach((x, j) => { if (pred(x)) i = j; }); return i; };
      const sum = after((x) => x.type === 'text' && RX.summary.test(x.title || ''));
      const at = { profile: 0, experience: sum + 1, education: Math.max(sum, after(isExperience)) + 1 }[c.add];
      d.sections.splice(at ?? d.sections.length, 0, s);
      App.setTab('content');
      App.structural();
      Editor.focusSection(s.id);
      toast(`Added a “${s.title}” section — fill it in`);
      return;
    }
    jump(c);
  }
  function jump(c) {
    App.setTab('content');
    Editor.focusSection(c.sectionId || 'personal');
    if (c.itemId) Editor.focusSection(c.itemId);
  }
  const trunc = (s, n) => (s.length > n ? `${s.slice(0, n - 1).trim()}…` : s);

  function checkRow(c) {
    const gain = c.status !== 'pass' && c.weight ? Math.round(c.weight - c.points) : 0;
    const hasEx = !!(c.examples && c.examples.length) && c.status !== 'pass';
    const open = hasEx && expanded.has(c.id);
    const fixLabel = c.add ? 'Add' : c.status === 'info' ? 'Review' : 'Fix';
    const canFix = c.status !== 'pass' && !!(c.add || c.sectionId);
    const toggle = () => { expanded.has(c.id) ? expanded.delete(c.id) : expanded.add(c.id); row.classList.toggle('open'); };
    const row = h('div', { class: `ins-check st-${c.status}${open ? ' open' : ''}`, 'data-check': c.id },
      h('span', { class: 'ins-st', html: ST_ICON[c.status], title: { pass: 'Passed', warn: 'Could be improved', fail: 'Needs fixing', info: 'Note' }[c.status] }),
      h('div', { class: 'ins-check-main' },
        h('div', { class: 'ins-check-title' }, h('span', {}, c.title), gain > 0 && h('span', { class: 'ins-gain', title: `Fix this to gain up to ${gain} points` }, `+${gain}`)),
        h('div', { class: 'ins-check-detail' }, c.detail),
        hasEx && h('button', { type: 'button', class: 'ins-more', onclick: toggle, html: `<span>${plural(c.examples.length, 'example')}</span>${icon('chevron', 'ico sm')}` })),
      canFix ? h('button', { type: 'button', class: 'btn xs ins-fix', onclick: () => doFix(c), title: c.add ? 'Add this section' : 'Jump to the form' }, fixLabel) : h('span'),
      hasEx && h('ul', { class: 'ins-ex' }, c.examples.map((x) => h('li', {},
        h('button', { type: 'button', onclick: () => jump(x), title: 'Edit this entry' },
          h('span', { class: 'ins-ex-txt' }, trunc(x.text || '(untitled)', 110)), x.note && h('small', {}, x.note))))));
    return row;
  }

  function renderChecks(res) {
    const sorted = res.checks.slice().sort((a, b) => ORDER[a.status] - ORDER[b.status] || (b.weight - b.points) - (a.weight - a.points));
    const issues = sorted.filter((c) => c.status === 'fail' || c.status === 'warn');
    const passed = sorted.filter((c) => c.status === 'pass');
    const lists = { all: sorted, issues, passed };
    ui.filter.innerHTML = '';
    [['all', 'All', sorted.length], ['issues', 'Issues', issues.length], ['passed', 'Passed', passed.length]].forEach(([k, l, n]) => {
      ui.filter.append(h('button', { type: 'button', role: 'tab', 'aria-selected': String(filter === k), class: filter === k ? 'active' : '', onclick: () => { filter = k; renderChecks(res); } }, l, h('span', { class: 'ins-n' }, String(n))));
    });
    ui.checks.innerHTML = '';
    const list = lists[filter];
    if (!list.length) ui.checks.append(h('p', { class: 'ins-empty' }, filter === 'issues' ? 'Nothing to fix — every check passes.' : 'No passed checks yet.'));
    list.forEach((c) => ui.checks.append(checkRow(c)));
  }

  function skillTarget(d) {
    const vis = d.sections.filter((s) => s.visible !== false && !RX.notSkills.test(s.title || ''));
    return vis.find((s) => s.type === 'skills') || vis.find((s) => s.type === 'tags') || null;
  }
  const titleCase = (s) => s.replace(/\b[a-z]/g, (m) => m.toUpperCase());
  function addKeyword(label) {
    const d = App.state.data;
    const name = /[A-Z]/.test(label) ? label : titleCase(label);
    let sec = skillTarget(d);
    if (!sec) { sec = newSection('skills'); sec.items = []; d.sections.push(sec); }
    if (sec.items.some((i) => String(i.name || '').trim().toLowerCase() === name.toLowerCase())) { toast(`“${name}” is already in ${sec.title}`); return; }
    const blank = sec.items.find((i) => !filled(i.name));
    if (blank) { blank.name = name; if (sec.type === 'skills') blank.level = 3; }
    else sec.items.push(sec.type === 'skills' ? { id: uid(), name, level: 3 } : { id: uid(), name });
    offer = null;
    App.structural();
    toast(`Added “${name}” to ${sec.title}`);
    schedule(60);
  }

  function renderMatch() {
    const jd = ui.jd.value.trim();
    const words = wc(jd);
    ui.jdMeta.innerHTML = '';
    ui.match.innerHTML = '';
    if (!jd) {
      ui.jdMeta.append(h('span', {}, 'Saved in this browser only'));
      ui.match.append(h('div', { class: 'ins-match-empty' },
        ['Copy the full job ad, including requirements', 'Paste it above — the analysis updates as you type', 'Add missing keywords you genuinely have'].map((t, i) => h('div', {}, h('b', {}, String(i + 1)), h('span', {}, t)))));
      return;
    }
    const res = match(App.state.data, jd);
    ui.jdMeta.append(h('span', {}, `${words} words · ${plural(res.keywords.length, 'keyword')} found`),
      h('button', { type: 'button', class: 'link', onclick: () => { ui.jd.value = ''; saveJD(''); offer = null; renderMatch(); ui.jd.focus(); } }, 'Clear'));
    if (!res.keywords.length) { ui.match.append(h('p', { class: 'ins-empty' }, 'No clear keywords yet — paste more of the job description.')); return; }
    const p = res.percent;
    const [label, tone] = p >= 70 ? ['Strong match', 'ok'] : p >= 50 ? ['Good match', 'good'] : p >= 30 ? ['Partial match', 'warn'] : ['Low match', 'bad'];
    ui.match.append(h('div', { class: 'ins-match-top' }, ui.matchRing.el,
      h('div', {}, h('div', { class: `ins-grade sm t-${tone}` }, label),
        h('p', { class: 'ins-headline' }, `${res.matched.length} of ${res.keywords.length} keywords appear in your resume.`),
        h('p', { class: 'ins-tip' }, p >= 70 ? 'Great alignment — tailor your summary to the role title too.' : 'Aim for 60%+. Work true keywords into bullets and skills.'))));
    ui.matchRing.set(p, tone);
    const kwChip = (k, miss) => h('button', {
      type: 'button', class: `ins-chip ${miss ? 'miss' : 'hit'}${offer === k.label ? ' sel' : ''}`,
      title: miss ? 'Click to add to your skills' : 'Found in your resume',
      onclick: miss ? () => { offer = offer === k.label ? null : k.label; renderMatch(); } : null,
    }, h('span', { class: 'ins-chip-ico', html: miss ? icon('plus') : ST_ICON.pass }), k.label, k.count > 1 && h('small', {}, `×${k.count}`));
    const miss = res.keywords.filter((k) => !k.matched), hit = res.keywords.filter((k) => k.matched);
    if (miss.length) {
      ui.match.append(h('div', { class: 'sub-label' }, `Missing · ${miss.length}`,
        h('button', { type: 'button', class: 'btn xs ghost ins-copy', onclick: () => copyText(res.missing.join(', '), `Copied ${plural(miss.length, 'missing keyword')}`), html: `${icon('copy')}<span>Copy missing keywords</span>` })));
      ui.match.append(h('div', { class: 'ins-chips' }, miss.map((k) => kwChip(k, true))));
      if (offer && res.missing.includes(offer)) {
        const t = skillTarget(App.state.data);
        ui.match.append(h('div', { class: 'ins-offer' },
          h('div', {}, h('b', {}, `Add “${offer}” to ${t ? t.title : 'a new Skills section'}?`), h('small', {}, 'Only add keywords that truly describe your experience.')),
          h('div', { class: 'ins-offer-btns' },
            h('button', { type: 'button', class: 'btn xs primary', onclick: () => addKeyword(offer) }, 'Add'),
            h('button', { type: 'button', class: 'btn xs ghost', onclick: () => { offer = null; renderMatch(); } }, 'Cancel'))));
      }
    }
    if (hit.length) {
      ui.match.append(h('div', { class: 'sub-label' }, `Matched · ${hit.length}`));
      ui.match.append(h('div', { class: 'ins-chips' }, hit.map((k) => kwChip(k, false))));
    }
  }

  function renderVerbs() {
    const el = ui.verbs;
    el.innerHTML = '';
    el.classList.toggle('open', verbsOpen);
    const grid = h('div', { class: 'ins-verb-grid' }, VERBS[verbCat].map((v) => h('button', { type: 'button', class: 'ins-verb', title: 'Click to copy', onclick: () => copyText(v, `Copied “${v}”`) }, v)));
    el.append(
      h('button', { type: 'button', class: 'ins-verbs-head', 'aria-expanded': String(verbsOpen), onclick: () => { verbsOpen = !verbsOpen; renderVerbs(); } },
        h('span', { class: 'ins-verbs-ico', html: icon('sparkles') }),
        h('span', { class: 'ins-verbs-title' }, h('b', {}, 'Action verbs'), h('small', {}, `${VERB_LIST.length} strong openers · click a verb to copy`)),
        h('span', { class: 'ins-chev', html: icon('chevron') })));
    if (verbsOpen) {
      el.append(h('div', { class: 'ins-verbs-body' },
        h('div', { class: 'ins-pills' }, Object.keys(VERBS).map((k) => h('button', { type: 'button', class: `ins-pill${k === verbCat ? ' active' : ''}`, onclick: () => { verbCat = k; renderVerbs(); } }, k))),
        grid));
    }
  }

  function refresh() {
    clearTimeout(timer);
    if (typeof App === 'undefined' || !App.state) return;
    if (!ui.root || !document.contains(ui.root)) { if (!build()) return; }
    const res = analyze(App.state.data, { design: App.state.design, ...layoutInfo() });
    renderScore(res);
    renderChecks(res);
    renderMatch();
    dirty = false;
    return res;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('resume:changed', (e) => { const k = e.detail && e.detail.kind; if (k === 'data' || k === 'design') schedule(); });
    document.addEventListener('resume:refresh', () => schedule());
    document.addEventListener('resume:tab', (e) => { if (e.detail && e.detail.tab === 'insights' && dirty) schedule(30); });
    document.addEventListener('resume:mode', (e) => { if (e.detail && e.detail.mode === 'template' && dirty) schedule(150); });
  }

  return { refresh, analyze, match, extractKeywords, stem, VERBS };
})();

if (typeof window !== 'undefined') window.Insights = Insights;
