(() => {
  'use strict';

  const app = document.querySelector('#app');
  const nav = document.querySelector('[data-nav]');
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const modal = document.querySelector('[data-modal]');
  const modalBody = document.querySelector('[data-application-body]');
  const toast = document.querySelector('[data-toast]');
  let societies = [];
  let currentCategory = 'All';
  let currentQuery = '';
  let countdownTimer;
  let toastTimer;

  const quizQuestions = [
    {
      prompt: 'What kind of work makes you lose track of time?',
      options: [
        {label: 'Building a useful thing', note: 'Products, code, prototypes', scores: { 'gdg-nsut': 3, 'tds-nsut': 1 }},
        {label: 'Making a room feel alive', note: 'Sound, stage, collective energy', scores: { 'crescendo-nsut': 3, 'ashwamedh-nsut': 2 }},
        {label: 'Making a case', note: 'Arguments, evidence, perspective', scores: { 'debsoc-nsut': 3, 'tds-nsut': 1 }},
        {label: 'Finding the right words', note: 'Poetry, writing, expression', scores: { 'aagaaz-nsut': 3, 'debsoc-nsut': 1 }}
      ]
    },
    {
      prompt: 'Which kind of challenge sounds most like you?',
      options: [
        {label: 'Solve the puzzle', note: 'Logic, systems, edge cases', scores: { 'tds-nsut': 3, 'gdg-nsut': 2 }},
        {label: 'Make the moment', note: 'Performance, feeling, timing', scores: { 'ashwamedh-nsut': 3, 'crescendo-nsut': 2 }},
        {label: 'Change the room', note: 'Speak, persuade, listen', scores: { 'debsoc-nsut': 3, 'ashwamedh-nsut': 1 }},
        {label: 'Say what is hard to say', note: 'Voice, image, inner life', scores: { 'aagaaz-nsut': 3, 'crescendo-nsut': 1 }}
      ]
    },
    {
      prompt: 'What do you want to get better at this year?',
      options: [
        {label: 'Building with others', note: 'Ship, learn, collaborate', scores: { 'gdg-nsut': 3, 'tds-nsut': 2 }},
        {label: 'Performing with presence', note: 'Voice, body, confidence', scores: { 'crescendo-nsut': 2, 'ashwamedh-nsut': 3 }},
        {label: 'Thinking on your feet', note: 'Clarity, rebuttal, research', scores: { 'debsoc-nsut': 3, 'tds-nsut': 1 }},
        {label: 'Making something resonant', note: 'Craft, rhythm, point of view', scores: { 'aagaaz-nsut': 3, 'ashwamedh-nsut': 1 }}
      ]
    },
    {
      prompt: 'Pick a room you would happily return to.',
      options: [
        {label: 'The lab after hours', note: 'Screens, whiteboards, experiments', scores: { 'gdg-nsut': 2, 'tds-nsut': 3 }},
        {label: 'Backstage before lights up', note: 'Rehearsal, instruments, nerves', scores: { 'crescendo-nsut': 3, 'ashwamedh-nsut': 3 }},
        {label: 'A table in a heated discussion', note: 'Questions worth staying for', scores: { 'debsoc-nsut': 3, 'gdg-nsut': 1 }},
        {label: 'A page with a blank margin', note: 'Quiet, honest, unfinished', scores: { 'aagaaz-nsut': 3, 'debsoc-nsut': 1 }}
      ]
    }
  ];

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;'}[char]));
  const societyById = (id) => societies.find((society) => society.id === id);
  const routePath = () => window.location.pathname.replace(/\/+$/, '') || '/';
  const isDark = () => document.documentElement.dataset.theme === 'dark';

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function applyTheme(theme, persist = true) {
    document.documentElement.dataset.theme = theme;
    if (persist) localStorage.setItem('societysphere-theme', theme);
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
    themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☾' : '☼';
    themeToggle.querySelector('.theme-label').textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  function setupTheme() {
    const stored = localStorage.getItem('societysphere-theme');
    const preferred = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    applyTheme(stored || preferred, false);
    themeToggle.addEventListener('click', () => applyTheme(isDark() ? 'light' : 'dark'));
  }

  function closeMenu() {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  function setupNavigation() {
    menuToggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (event) => {
      const link = event.target.closest('[data-route]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http')) return;
      event.preventDefault();
      navigate(href);
    });
    window.addEventListener('popstate', renderRoute);
  }

  function navigate(path) {
    if (path === window.location.pathname) {
      window.scrollTo({top: 0, behavior: 'smooth'});
      closeMenu();
      return renderRoute();
    }
    window.history.pushState({}, '', path);
    closeMenu();
    window.scrollTo({top: 0, behavior: 'smooth'});
    renderRoute();
  }

  function updateActiveNav(path) {
    const key = path.startsWith('/societies/') ? 'societies' : path === '/' ? 'home' : path.startsWith('/find-your-society') ? 'quiz' : path.startsWith('/about') ? 'about' : 'societies';
    document.querySelectorAll('[data-nav-link]').forEach((link) => link.classList.toggle('active', link.dataset.navLink === key));
  }

  function skeleton() {
    return `<div class="page skeleton-page"><div class="skeleton skeleton-title"></div><div class="skeleton skeleton-copy"></div><div class="skeleton skeleton-copy" style="width:35%"></div></div>`;
  }

  function markMarkup(society, large = false) {
    const sizeClass = large ? ' detail-mark' : '';
    if (society.logoImage) {
      return `<img class="fallback-image${sizeClass}" src="${escapeHtml(society.logoImage)}" alt="${escapeHtml(society.imageAlt)}" data-image-fallback="${escapeHtml(society.mark)}" />`;
    }
    return `<span class="cover-mark${sizeClass}" aria-label="Text fallback for ${escapeHtml(society.name)}">${escapeHtml(society.mark)}</span>`;
  }

  function cardMarkup(society) {
    return `<article class="society-card" style="--accent:${society.accent};--accent-soft:${society.accentSoft}">
      <div class="card-cover" aria-label="${escapeHtml(society.imageAlt)} — text fallback shown">
        ${markMarkup(society)}
        <span class="card-cover-label">Public-source fallback</span>
      </div>
      <div class="card-body">
        <div class="card-meta"><span><i class="category-dot"></i>${escapeHtml(society.category)}</span><span>${escapeHtml(society.shortName)}</span></div>
        <h3>${escapeHtml(society.name)}</h3>
        <p class="card-tagline">${escapeHtml(society.tagline)}</p>
        <a class="card-link" href="/societies/${escapeHtml(society.id)}" data-route>Explore society <span class="arrow">→</span></a>
      </div>
    </article>`;
  }

  function discoveryMarkup({compact = false} = {}) {
    const filtered = societies.filter((society) => {
      const haystack = `${society.name} ${society.shortName} ${society.category} ${society.tagline} ${society.description} ${society.roles.join(' ')}`.toLowerCase();
      return (currentCategory === 'All' || society.category === currentCategory) && (!currentQuery || haystack.includes(currentQuery.toLowerCase()));
    });
    const filterButtons = ['All', 'Technical', 'Cultural', 'Literary'].map((category) => `<button type="button" class="filter-tab ${currentCategory === category ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
    return `<section class="section ${compact ? '' : 'discovery-section'}" id="societies">
      <div class="section-head"><div><p class="section-kicker">The index / 01</p><h2>Explore NSUT Societies</h2></div><p>Six communities. Six different ways to create, perform, question and build.</p></div>
      <div class="filters"><label class="search-wrap"><span class="sr-only">Search societies</span><input class="search-input" type="search" value="${escapeHtml(currentQuery)}" placeholder="Search societies..." data-search /></label><div class="filter-tabs" role="group" aria-label="Filter by category">${filterButtons}</div></div>
      <p class="results-line" data-results-line>${filtered.length} ${filtered.length === 1 ? 'society' : 'societies'} in view</p>
      <div class="society-grid" data-society-grid>${filtered.length ? filtered.map(cardMarkup).join('') : emptyStateMarkup()}</div>
    </section>`;
  }

  function emptyStateMarkup() {
    return `<div class="empty-state" style="grid-column:1/-1"><h3>No societies found</h3><p>Try another keyword or clear your filters.</p><button class="btn btn-secondary" type="button" data-clear-filters>Clear Filters</button></div>`;
  }

  function bindDiscovery() {
    const input = document.querySelector('[data-search]');
    if (!input) return;
    input.addEventListener('input', () => {
      currentQuery = input.value.trim();
      refreshDiscovery();
    });
    document.querySelectorAll('[data-category]').forEach((button) => button.addEventListener('click', () => {
      currentCategory = button.dataset.category;
      refreshDiscovery();
    }));
    document.querySelector('[data-clear-filters]')?.addEventListener('click', () => {
      currentCategory = 'All'; currentQuery = ''; refreshDiscovery();
    });
  }

  function refreshDiscovery() {
    const holder = document.querySelector('#societies');
    if (!holder) return;
    const replacement = document.createRange().createContextualFragment(discoveryMarkup({compact: true}));
    holder.replaceWith(replacement);
    bindDiscovery();
  }

  function homeMarkup() {
    return `<div class="page">
      <section class="hero"><div class="hero-copy"><p class="eyebrow">NSUT / Student communities / 2026</p><h1>Find your people.<br /><em>Find your society.</em></h1><p class="hero-lede">Explore NSUT's student communities, discover what drives you, and find where you belong.</p><div class="hero-actions"><a class="btn btn-primary" href="/societies" data-route>Explore Societies <span class="arrow">→</span></a><a class="btn btn-secondary" href="/find-your-society" data-route>Find My Society <span>✦</span></a></div></div><div class="hero-art" aria-label="SocietySphere community signal graphic"><div class="signal-grid"></div><span class="art-label">A living index / NSUT</span><div class="art-core">S·S</div><div class="art-note"><strong>Six points of entry</strong>Build, debug, perform, act, debate or write your way in.</div></div></section>
      ${discoveryMarkup()}
      <section class="section split-feature"><div class="feature-copy"><p class="section-kicker">A small shortcut / 02</p><h2>Not sure where you belong?</h2><p>Let your interests guide you. Four quick questions, a transparent match, and a better starting point than “I’ll figure it out later.”</p><a class="btn btn-quiet" href="/find-your-society" data-route>Take the finder <span class="arrow">→</span></a><div class="feature-note"><strong>No black box here.</strong>The finder uses simple, visible scoring across your answers — not a pretend AI recommendation.</div></div><div class="quiz-teaser"><div class="teaser-tile"><span class="teaser-index">01</span><p>Build something useful</p></div><div class="teaser-tile"><span class="teaser-index">02</span><p>Make the room alive</p></div><div class="teaser-tile"><span class="teaser-index">03</span><p>Ask better questions</p></div><div class="teaser-tile"><span class="teaser-index">04</span><p>Find the right words</p></div></div></section>
    </div>`;
  }

  function societiesPageMarkup() {
    return `<div class="page"><section class="page-intro"><p class="eyebrow">The index / All communities</p><h1 class="page-title">Six different ways to show up.</h1><p>Use the index to browse by instinct, category or the tiny clue you can't quite name yet.</p></section>${discoveryMarkup({compact: true})}</div>`;
  }

  function aboutMarkup() {
    return `<div class="page"><section class="page-intro"><p class="eyebrow">About the project / 00</p><h1 class="page-title">A clearer first step into NSUT life.</h1><p>SocietySphere is a student-facing discovery layer for finding the communities already making campus feel like campus.</p></section><section class="about-grid"><div class="about-copy"><p class="eyebrow">Why it exists</p><h2>Good communities are easier to join when you can see their shape.</h2><p>This prototype turns six real NSUT society profiles into a small, useful index: what they do in public, what you might contribute, and where to learn more.</p><p>It is deliberately not a rankings page. There are no invented awards, inflated numbers or fake testimonials — just a more considered way to start exploring.</p></div><div class="principles"><div class="principle"><span class="principle-num">01</span><div><h3>Public-source first</h3><p>Society summaries and activity areas are grounded in official university, society or public profile sources.</p></div></div><div class="principle"><span class="principle-num">02</span><div><h3>Specific, not cookie-cutter</h3><p>Roles, tone and activity cards change with each community rather than repeating the same recruitment template.</p></div></div><div class="principle"><span class="principle-num">03</span><div><h3>Fallbacks are honest</h3><p>When a stable logo asset or reuse permission is unclear, the interface shows a text/icon treatment instead of a questionable hotlink.</p></div></div><div class="principle"><span class="principle-num">04</span><div><h3>Start with curiosity</h3><p>The finder is a transparent nudge for students who know they want to get involved, but not where to begin.</p></div></div></div></section></div>`;
  }

  function quizMarkup() {
    return `<div class="page quiz-page"><div class="quiz-layout"><aside class="quiz-aside"><p class="eyebrow">Find your society / 02</p><h1>Let your interests guide you.</h1><p>Four questions. No personality-test theatre. Just simple scoring across the things you might want to build, perform, question or write.</p><a class="back-link" href="/societies" data-route>← Browse all societies</a></aside><section class="quiz-card" data-quiz-card>${quizQuestionMarkup(0, {})}</section></div></div>`;
  }

  function quizQuestionMarkup(index, answers) {
    const question = quizQuestions[index];
    const progress = Math.round(((index) / quizQuestions.length) * 100);
    return `<div class="quiz-topline"><span>Question ${index + 1} of ${quizQuestions.length}</span><span>${progress}% mapped</span></div><div class="progress-track"><div class="progress-bar" style="width:${Math.max(25, progress)}%"></div></div><div class="quiz-question"><p class="eyebrow">Choose one</p><h2>${escapeHtml(question.prompt)}</h2><div class="quiz-options">${question.options.map((option, optionIndex) => `<button type="button" class="quiz-option" data-quiz-option="${index}" data-option-index="${optionIndex}"><strong>${escapeHtml(option.label)}</strong><span>${escapeHtml(option.note)}</span></button>`).join('')}</div></div>`;
  }

  function bindQuiz() {
    const card = document.querySelector('[data-quiz-card]');
    if (!card) return;
    const answers = {};
    card.addEventListener('click', (event) => {
      const option = event.target.closest('[data-quiz-option]');
      if (!option) return;
      const index = Number(option.dataset.quizOption);
      answers[index] = Number(option.dataset.optionIndex);
      if (index < quizQuestions.length - 1) {
        card.innerHTML = quizQuestionMarkup(index + 1, answers);
      } else {
        card.innerHTML = quizResultMarkup(answers);
        bindQuizRestart();
      }
    });
  }

  function quizResultMarkup(answers) {
    const totals = Object.fromEntries(societies.map((society) => [society.id, 0]));
    Object.entries(answers).forEach(([questionIndex, optionIndex]) => {
      const scores = quizQuestions[Number(questionIndex)].options[optionIndex].scores;
      Object.entries(scores).forEach(([id, score]) => { totals[id] += score; });
    });
    const matches = [...societies].sort((a, b) => totals[b.id] - totals[a.id]).slice(0, 2);
    const descriptions = {
      'gdg-nsut': 'Your answers point to building, experimenting and making useful technology with other people.',
      'tds-nsut': 'You seem to enjoy the satisfying edge of a problem — then the work of solving it properly.',
      'crescendo-nsut': 'You are drawn to shared energy, practice and the moment a room starts listening.',
      'ashwamedh-nsut': 'Your answers suggest dramatic instinct: empathy, expression and making a moment land.',
      'debsoc-nsut': 'You like ideas with stakes — research them, test them and make them clearer out loud.',
      'aagaaz-nsut': 'You notice language, rhythm and the feeling underneath a sentence. That is a strong place to start.'
    };
    return `<div class="quiz-topline"><span>Finder complete</span><span>Simple score / visible logic</span></div><div class="quiz-result"><p class="eyebrow">Your society matches</p><h2>Start with a room that feels like you.</h2><p>We added the points attached to each answer and ranked the six societies. Here are your top two starting points.</p><div class="match-list">${matches.map((society, index) => `<div class="match" style="--accent:${society.accent};--accent-soft:${society.accentSoft}"><span class="match-mark">${escapeHtml(society.mark)}</span><div><h3>${escapeHtml(society.name)}</h3><p>${escapeHtml(descriptions[society.id])}</p></div><a class="btn btn-secondary" href="/societies/${escapeHtml(society.id)}" data-route>Explore <span class="arrow">→</span></a></div>`).join('')}</div><button type="button" class="btn btn-quiet" data-quiz-restart>Retake the finder <span class="arrow">↻</span></button></div>`;
  }

  function bindQuizRestart() {
    document.querySelector('[data-quiz-restart]')?.addEventListener('click', () => {
      const card = document.querySelector('[data-quiz-card]');
      card.innerHTML = quizQuestionMarkup(0, {});
    });
  }

  function detailMarkup(society) {
    const activityCards = society.activities.map((activity) => `<article class="activity-card"><h3>${escapeHtml(activity.title)}</h3><p>${escapeHtml(activity.text)}</p></article>`).join('');
    const roleChips = society.roles.map((role) => `<span class="role-chip">${escapeHtml(role)}</span>`).join('');
    return `<div class="page" style="--accent:${society.accent};--accent-soft:${society.accentSoft}"><section class="detail-hero"><a class="back-link" href="/societies" data-route>← Back to all societies</a><div class="detail-grid"><div><div class="detail-kicker"><i class="category-dot"></i>${escapeHtml(society.category)} / ${escapeHtml(society.categoryLabel)}</div><h1 class="detail-title">${escapeHtml(society.name)}</h1><p class="detail-tagline">${escapeHtml(society.tagline)}</p><div class="detail-actions"><button class="btn btn-primary" type="button" data-apply="${escapeHtml(society.id)}">Apply Now <span class="arrow">→</span></button><a class="btn btn-secondary" href="${escapeHtml(society.instagram)}" target="_blank" rel="noreferrer">Official Instagram ↗</a></div></div><div class="detail-art" aria-label="${escapeHtml(society.imageAlt)} — text fallback shown"><span class="card-cover-label">Public-source fallback</span>${markMarkup(society, true)}</div></div></section><section class="detail-content"><div><article class="content-block"><p class="eyebrow">About the society</p><h2>Make space for the thing you care about.</h2><p>${escapeHtml(society.description)}</p></article><article class="content-block"><p class="eyebrow">What they do</p><h2>A glimpse of the practice.</h2><div class="activity-grid">${activityCards}</div></article><article class="content-block"><p class="eyebrow">Recruitment roles</p><h2>Bring your angle.</h2><p>These are public-source-informed areas to explore in a recruitment conversation, not a claim of current vacancies.</p><div class="roles">${roleChips}</div></article></div><aside class="detail-side"><div class="side-panel"><h3>Demo recruitment window</h3><p class="deadline-label">Applications close in</p><div class="countdown" data-countdown="${escapeHtml(society.recruitment.deadline)}"><div class="count-box"><span class="count-value" data-days>—</span><span class="count-unit">Days</span></div><div class="count-box"><span class="count-value" data-hours>—</span><span class="count-unit">Hours</span></div><div class="count-box"><span class="count-value" data-minutes>—</span><span class="count-unit">Minutes</span></div></div><p class="demo-note">This is a demo deadline for the prototype, not an official NSUT recruitment deadline.</p></div><div class="side-panel"><h3>Public links</h3><div class="source-links"><a href="${escapeHtml(society.instagram)}" target="_blank" rel="noreferrer">Official Instagram ↗</a><a href="${escapeHtml(society.officialProfile)}" target="_blank" rel="noreferrer">Official / university profile ↗</a></div></div><div class="side-panel"><h3>Asset note</h3><p class="demo-note">${escapeHtml(society.assetNote)}</p></div></aside></section></div>`;
  }

  function startCountdown() {
    clearInterval(countdownTimer);
    const countdown = document.querySelector('[data-countdown]');
    if (!countdown) return;
    const deadline = new Date(countdown.dataset.countdown).getTime();
    const update = () => {
      const distance = Math.max(0, deadline - Date.now());
      const days = Math.floor(distance / 86400000);
      const hours = Math.floor((distance % 86400000) / 3600000);
      const minutes = Math.floor((distance % 3600000) / 60000);
      countdown.querySelector('[data-days]').textContent = String(days).padStart(2, '0');
      countdown.querySelector('[data-hours]').textContent = String(hours).padStart(2, '0');
      countdown.querySelector('[data-minutes]').textContent = String(minutes).padStart(2, '0');
    };
    update();
    countdownTimer = setInterval(update, 30000);
  }

  function openApplication(id) {
    const society = societyById(id);
    if (!society) return;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modalBody.innerHTML = `<div class="modal-head"><p class="eyebrow">Apply / ${escapeHtml(society.shortName)}</p><h2 id="application-title">Join ${escapeHtml(society.name)}</h2><p>Tell the society what you want to bring to the room.</p></div><form class="application-form" data-application-form novalidate><div class="form-grid"><div class="form-field"><label for="full-name">Full name</label><input id="full-name" name="fullName" autocomplete="name" required /><span class="error-text" data-error-for="fullName"></span></div><div class="form-field"><label for="year">Year</label><select id="year" name="year" required><option value="">Select year</option><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select><span class="error-text" data-error-for="year"></span></div><div class="form-field"><label for="branch">Branch</label><input id="branch" name="branch" placeholder="e.g. CSE" required /><span class="error-text" data-error-for="branch"></span></div><div class="form-field"><label for="role">Role</label><select id="role" name="role" required><option value="">Select an area</option>${society.roles.map((role) => `<option>${escapeHtml(role)}</option>`).join('')}</select><span class="error-text" data-error-for="role"></span></div><div class="form-field full"><label for="why">Why do you want to join?</label><textarea id="why" name="why" minlength="20" required placeholder="A few honest lines are enough."></textarea><span class="error-text" data-error-for="why"></span></div></div><div class="form-footer"><span class="form-helper">Demo flow · no backend submission</span><button class="btn btn-primary" type="submit">Submit application <span class="arrow">→</span></button></div></form>`;
    modal.querySelector('[data-application-form]').addEventListener('submit', (event) => submitApplication(event, society));
    modal.querySelector('#full-name').focus();
  }

  function closeApplication() {
    modal.hidden = true;
    document.body.style.overflow = '';
    modalBody.innerHTML = '';
  }

  function submitApplication(event, society) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const object = Object.fromEntries(data.entries());
    const errors = {};
    if (!object.fullName || object.fullName.trim().length < 2) errors.fullName = 'Please add your name.';
    if (!object.year) errors.year = 'Choose your year.';
    if (!object.branch || object.branch.trim().length < 2) errors.branch = 'Add your branch.';
    if (!object.role) errors.role = 'Choose a role area.';
    if (!object.why || object.why.trim().length < 20) errors.why = 'Write at least 20 characters.';
    form.querySelectorAll('.form-field').forEach((field) => field.classList.remove('invalid'));
    form.querySelectorAll('.error-text').forEach((node) => { node.textContent = ''; });
    Object.entries(errors).forEach(([field, message]) => {
      form.querySelector(`[data-error-for="${field}"]`).textContent = message;
      form.querySelector(`[data-error-for="${field}"]`).closest('.form-field').classList.add('invalid');
    });
    if (Object.keys(errors).length) return;
    const submission = { ...object, society: society.name, societyId: society.id, submittedAt: new Date().toISOString() };
    console.log('SocietySphere application submitted:', submission);
    modalBody.innerHTML = `<div class="success-state"><div class="success-icon">✓</div><p class="eyebrow">${escapeHtml(society.shortName)} / Received</p><h2>Application Submitted</h2><p>Your application has been recorded successfully.</p><p>Good luck — we hope to see you on campus!</p><button class="btn btn-secondary" type="button" data-modal-close>Close</button></div>`;
    modal.querySelector('[data-modal-close]').addEventListener('click', closeApplication);
  }

  function bindModal() {
    document.addEventListener('click', (event) => {
      const apply = event.target.closest('[data-apply]');
      if (apply) openApplication(apply.dataset.apply);
      if (event.target.closest('[data-modal-close]')) closeApplication();
      if (event.target === modal) closeApplication();
    });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modal.hidden) closeApplication(); });
  }

  function bindImageFallbacks() {
    document.querySelectorAll('[data-image-fallback]').forEach((image) => image.addEventListener('error', () => {
      const fallback = document.createElement('span');
      fallback.className = image.className;
      fallback.textContent = image.dataset.imageFallback;
      image.replaceWith(fallback);
    }));
  }

  function renderRoute() {
    const path = routePath();
    updateActiveNav(path);
    if (path.startsWith('/societies/') && path.split('/')[2]) {
      const society = societyById(path.split('/')[2]);
      app.innerHTML = society ? detailMarkup(society) : `<div class="page page-intro"><p class="eyebrow">404 / Not in the index</p><h1 class="page-title">That society route does not exist.</h1><a class="btn btn-primary" href="/societies" data-route>Back to societies</a></div>`;
      startCountdown();
    } else if (path === '/societies') {
      app.innerHTML = societiesPageMarkup(); bindDiscovery();
    } else if (path === '/find-your-society') {
      app.innerHTML = quizMarkup(); bindQuiz();
    } else if (path === '/about') {
      app.innerHTML = aboutMarkup();
    } else {
      app.innerHTML = homeMarkup(); bindDiscovery();
    }
    bindImageFallbacks();
    document.title = path.startsWith('/societies/') && societyById(path.split('/')[2]) ? `${societyById(path.split('/')[2]).name} — SocietySphere` : path === '/find-your-society' ? 'Find Your Society — SocietySphere' : path === '/about' ? 'About — SocietySphere' : 'SocietySphere — NSUT';
  }

  async function init() {
    setupTheme();
    setupNavigation();
    bindModal();
    app.innerHTML = skeleton();
    try {
      const response = await fetch('/data/societies.json');
      if (!response.ok) throw new Error('Society data could not be loaded');
      societies = await response.json();
      window.setTimeout(renderRoute, 220);
    } catch (error) {
      console.error(error);
      app.innerHTML = `<div class="page page-intro"><p class="eyebrow">Data connection issue</p><h1 class="page-title">The society index needs a refresh.</h1><p>We couldn't load the public-source society data. Please try again.</p><button class="btn btn-primary" type="button" onclick="location.reload()">Reload index</button></div>`;
    }
  }

  init();
})();
