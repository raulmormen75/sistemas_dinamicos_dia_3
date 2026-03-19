import { useEffect, useMemo, useState } from 'react';
import MathMarkdown from './components/MathMarkdown';
import VisualizationPanel from './components/Visualizers';
import { courseMeta, exerciseGroups, introSection, sections } from './content/day3Content';

function getInitialTheme() {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const stored = window.localStorage.getItem('day3-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function useActiveSection(navItems) {
  const [activeId, setActiveId] = useState(navItems[0]?.id ?? '');
  const [lockedId, setLockedId] = useState('');

  useEffect(() => {
    if (!lockedId) {
      return undefined;
    }

    const target = document.getElementById(lockedId);

    if (!target) {
      setLockedId('');
      return undefined;
    }

    const releaseLock = () => {
      const rect = target.getBoundingClientRect();
      const threshold = Math.max(96, window.innerHeight * 0.24);

      if (rect.top <= threshold) {
        setActiveId(lockedId);
        setLockedId('');
      }
    };

    releaseLock();
    const timeoutId = window.setTimeout(() => setLockedId(''), 1400);
    window.addEventListener('scroll', releaseLock, { passive: true });
    window.addEventListener('resize', releaseLock);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', releaseLock);
      window.removeEventListener('resize', releaseLock);
    };
  }, [lockedId]);

  useEffect(() => {
    const elements = navItems.map((item) => document.getElementById(item.id)).filter(Boolean);

    if (elements.length === 0) {
      return undefined;
    }

    const commitActiveId = (nextId) => {
      if (!nextId) {
        return;
      }

      if (lockedId) {
        if (nextId === lockedId) {
          setActiveId(nextId);
          setLockedId('');
        }

        return;
      }

      setActiveId(nextId);
    };

    if (typeof IntersectionObserver === 'undefined') {
      const handleScroll = () => {
        const threshold = window.innerHeight * 0.35;
        let nextId = elements[0]?.id ?? '';

        for (const element of elements) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= threshold) {
            nextId = element.id;
          }
        }

        commitActiveId(nextId);
      };

      handleScroll();
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll);
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);

        if (visible.length === 0) {
          return;
        }

        visible.sort((left, right) => left.boundingClientRect.top - right.boundingClientRect.top);

        let next = visible[0];
        for (const entry of visible) {
          if (entry.boundingClientRect.top <= window.innerHeight * 0.35) {
            next = entry;
          }
        }

        if (next?.target?.id) {
          commitActiveId(next.target.id);
        }
      },
      {
        rootMargin: '-18% 0px -48% 0px',
        threshold: [0, 0.15, 0.35, 0.6],
      },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [lockedId, navItems]);

  const navigateToSection = (id) => {
    setLockedId(id);
    setActiveId(id);
    scrollToSection(id);
  };

  return [activeId, navigateToSection];
}

function ThemeToggle({ theme, onToggle }) {
  const nextTheme = theme === 'light' ? 'oscuro' : 'claro';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Cambiar a modo ${nextTheme}`}
      title={`Cambiar a modo ${nextTheme}`}
    >
      <span className="theme-toggle__icon" aria-hidden="true">
        {theme === 'light' ? '◐' : '◑'}
      </span>
      <span className="theme-toggle__text">Modo {nextTheme}</span>
    </button>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 20 20" className="button-icon" aria-hidden="true">
      <path
        d="M3.5 15.5h13M5.5 12.2l2.8-2.9 2.5 1.9 3.7-4.3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="5.5" cy="12.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="8.3" cy="9.3" r="1" fill="currentColor" stroke="none" />
      <circle cx="10.8" cy="11.2" r="1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="6.9" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function VisualizationLabel({ children }) {
  return (
    <span className="button-with-icon">
      <ChartIcon />
      <span>{children}</span>
    </span>
  );
}

function BlockRail({ navItems, activeId, onNavigate }) {
  return (
    <nav className="block-rail" aria-label="Navegación por secciones">
      {navItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={item.id === activeId ? 'block-rail__dot is-active' : 'block-rail__dot'}
          title={item.title}
          data-tooltip={item.title}
          aria-label={item.title}
          aria-pressed={item.id === activeId}
          onClick={() => onNavigate(item.id)}
        >
          <span className="sr-only">{item.title}</span>
        </button>
      ))}
    </nav>
  );
}

function ScrollTopButton({ visible }) {
  return (
    <button
      type="button"
      className={visible ? 'scroll-top-button is-visible' : 'scroll-top-button'}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
    >
      ↑
    </button>
  );
}

function Sidebar({ navItems, activeId, onNavigate }) {
  return (
    <>
      <aside className="sidebar" aria-hidden="true" />
      <nav className="mobile-nav" aria-label="Navegación de la lección">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === activeId ? 'nav-chip is-active' : 'nav-chip'}
            aria-pressed={item.id === activeId}
            onClick={() => onNavigate(item.id)}
          >
            {item.navLabel}
          </button>
        ))}
      </nav>
    </>
  );
}

function IntroSection() {
  return (
    <section id={introSection.id} className="page-section intro-section">
      <div className="hero-card hero-card--intro">
        <div className="hero-card__copy">
          <p className="eyebrow">Curso · Día 3</p>
          <h1>{courseMeta.title}</h1>
          <p className="hero-card__subtitle">{courseMeta.subtitle}</p>
          <div className="hero-card__description rich-text">
            <MathMarkdown content={introSection.usageIntro} />
          </div>
        </div>
        <div className="hero-card__panel hero-card__panel--guide">
          <div className="hero-guide">
            <p className="prompt-label">Cómo usar la lección</p>
            <div className="hero-guide__list">
              {introSection.guideItems.map((item) => (
                <article key={item.title} className="hero-guide__item">
                  <h3 className="hero-guide__title">
                    {item.kind === 'segundo' ? <VisualizationLabel>{item.title}</VisualizationLabel> : item.title}
                  </h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
            <div className="hero-guide__note rich-text">
              <MathMarkdown content={introSection.usageNote} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepNavigator({ steps }) {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="step-accordion" role="list" aria-label="Desarrollo paso a paso">
      {steps.map((step, index) => {
        const isOpen = index === activeStep;
        const panelId = `step-panel-${index + 1}`;
        const triggerId = `step-trigger-${index + 1}`;

        return (
          <article key={`step-item-${index + 1}`} className={isOpen ? 'step-item is-open' : 'step-item'} role="listitem">
            <h4 className="step-item__heading">
              <button
                id={triggerId}
                type="button"
                className="step-item__trigger"
                onClick={() => setActiveStep(isOpen ? -1 : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="step-item__label">
                  <span className="step-card__number">{index + 1}</span>
                  <span className="step-item__title">Paso {index + 1}</span>
                </span>
                <span className={isOpen ? 'step-item__chevron is-open' : 'step-item__chevron'} aria-hidden="true">
                  ▾
                </span>
              </button>
            </h4>
            <div
              id={panelId}
              className={isOpen ? 'step-item__content is-open' : 'step-item__content'}
              role="region"
              aria-labelledby={triggerId}
              hidden={!isOpen}
            >
              <MathMarkdown content={step} className="rich-text" />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ExampleCard({ example, onOpenVisual }) {
  return (
    <article className="surface-card surface-card--example">
      <div className="section-card__header">
        <div>
          <p className="eyebrow">Ejemplo resuelto {example.number}</p>
          <h3>{example.title}</h3>
        </div>
        <div className="card-actions">
          <button type="button" className="secondary-button" onClick={onOpenVisual}>
            <VisualizationLabel>Abrir visualización</VisualizationLabel>
          </button>
        </div>
      </div>
      <div className="prompt-row">
        <div>
          <p className="prompt-label">Planteamiento</p>
          <MathMarkdown content={example.statement} className="rich-text" />
        </div>
        <div>
          <p className="prompt-label">Qué se busca</p>
          <MathMarkdown content={example.ask} className="rich-text rich-text--compact" />
        </div>
      </div>
      <div className="solution-block">
        <p className="prompt-label">Desarrollo paso a paso</p>
        <StepNavigator steps={example.steps} />
      </div>
      <div className="result-grid">
        <div className="result-card">
          <p className="prompt-label">Resultado</p>
          <MathMarkdown content={example.result} className="rich-text" />
        </div>
        <div className="result-card">
          <p className="prompt-label">Interpretación</p>
          <MathMarkdown content={example.interpretation} className="rich-text" />
        </div>
      </div>
      <div className="error-box">
        <p className="error-box__title">Errores a evitar</p>
        <ul className="plain-list">
          {example.errors.map((item) => (
            <li key={item}>
              <MathMarkdown content={item} className="rich-text rich-text--compact" />
            </li>
          ))}
        </ul>
      </div>
      <div className="mini-note mini-note--soft">
        <strong>Visualización sugerida.</strong>{' '}
        <MathMarkdown content={example.visualPrompt} className="rich-text rich-text--compact" />
      </div>
    </article>
  );
}

function LessonSection({ section, theme }) {
  const [tab, setTab] = useState('desarrollo');

  return (
    <section id={section.id} className="page-section lesson-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{section.badge}</p>
          <h2>{section.title}</h2>
        </div>
      </div>
      <div className="info-grid">
        <article className="surface-card">
          <h3>Qué significa</h3>
          <MathMarkdown content={section.meaning} className="rich-text" />
        </article>
        <article className="surface-card">
          <h3>Para qué sirve</h3>
          <MathMarkdown content={section.economyUse} className="rich-text" />
        </article>
      </div>
      <div className="tab-row">
        <button type="button" className={tab === 'desarrollo' ? 'tab-button is-active' : 'tab-button'} onClick={() => setTab('desarrollo')}>
          Desarrollo
        </button>
        <button type="button" className={tab === 'ejemplo' ? 'tab-button is-active' : 'tab-button'} onClick={() => setTab('ejemplo')}>
          Ejemplo
        </button>
        <button type="button" className={tab === 'visualizacion' ? 'tab-button is-active' : 'tab-button'} onClick={() => setTab('visualizacion')}>
          <VisualizationLabel>Visualización</VisualizationLabel>
        </button>
      </div>
      {tab === 'desarrollo' ? (
        <div className="stacked-panels">
          {section.explanationParts.map((part) => (
            <article key={part.title} className="surface-card surface-card--lesson">
              <h3>{part.title}</h3>
              <MathMarkdown content={part.content} className="rich-text" />
            </article>
          ))}
        </div>
      ) : null}
      {tab === 'ejemplo' ? <ExampleCard example={section.example} onOpenVisual={() => setTab('visualizacion')} /> : null}
      {tab === 'visualizacion' && section.visual ? <VisualizationPanel visual={section.visual} theme={theme} /> : null}
      <div className="mini-note mini-note--soft">
        <strong>Cierre breve.</strong> <MathMarkdown content={section.recap} className="rich-text rich-text--compact" />
      </div>
    </section>
  );
}

function ExerciseCard({ exercise, theme }) {
  const [showVisual, setShowVisual] = useState(false);

  return (
    <article className="surface-card surface-card--exercise">
      <div className="section-card__header">
        <div>
          <p className="eyebrow">
            Ejercicio {exercise.number} · {exercise.type}
          </p>
          <h3>{exercise.title}</h3>
        </div>
        <div className="card-actions">
          <button type="button" className="secondary-button" onClick={() => setShowVisual(!showVisual)}>
            <VisualizationLabel>Abrir visualización</VisualizationLabel>
          </button>
        </div>
      </div>
      <div className="prompt-row">
        <div>
          <p className="prompt-label">Planteamiento</p>
          <MathMarkdown content={exercise.statement} className="rich-text" />
        </div>
        <div>
          <p className="prompt-label">Qué se pide</p>
          <MathMarkdown content={exercise.ask} className="rich-text rich-text--compact" />
        </div>
      </div>
      <div className="solution-block">
        <p className="prompt-label">Desarrollo paso a paso</p>
        <StepNavigator steps={exercise.steps} />
      </div>
      <div className="result-grid">
        <div className="result-card">
          <p className="prompt-label">Resultado</p>
          <MathMarkdown content={exercise.result} className="rich-text" />
        </div>
        <div className="result-card">
          <p className="prompt-label">Interpretación</p>
          <MathMarkdown content={exercise.interpretation} className="rich-text" />
        </div>
      </div>
      <div className="error-box">
        <p className="error-box__title">Errores a evitar</p>
        <ul className="plain-list">
          {exercise.errors.map((item) => (
            <li key={item}>
              <MathMarkdown content={item} className="rich-text rich-text--compact" />
            </li>
          ))}
        </ul>
      </div>
      <div className="mini-note mini-note--soft">
        <strong>Visualización sugerida.</strong>{' '}
        <MathMarkdown content={exercise.visualHint} className="rich-text rich-text--compact" />
      </div>
      {showVisual ? <VisualizationPanel visual={exercise.visual} theme={theme} /> : null}
    </article>
  );
}

function ExerciseSection({ group, theme }) {
  return (
    <section id={group.id} className="page-section lesson-section">
      <div className="section-head">
        <div>
          <p className="eyebrow">{group.badge}</p>
          <h2>{group.title}</h2>
        </div>
      </div>
      <article className="surface-card">
        <MathMarkdown content={group.intro} className="rich-text" />
      </article>
      <div className="exercise-stack">
        {group.exercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} theme={theme} />
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const navItems = useMemo(
    () => [introSection, ...sections, ...exerciseGroups].map(({ id, navLabel, badge, title }) => ({ id, navLabel, badge, title })),
    [],
  );
  const [activeId, navigateToSection] = useActiveSection(navItems);
  const [theme, setTheme] = useState(getInitialTheme);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem('day3-theme', theme);
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.setAttribute('content', theme === 'light' ? '#f2f2ee' : '#0d1218');
    }
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 420);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-shell">
      <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} />
      <BlockRail navItems={navItems} activeId={activeId} onNavigate={navigateToSection} />
      <ScrollTopButton visible={showScrollTop} />
      <Sidebar navItems={navItems} activeId={activeId} onNavigate={navigateToSection} />
      <main className="main-content">
        <IntroSection />
        {sections.map((section) => (
          <LessonSection key={section.id} section={section} theme={theme} />
        ))}
        {exerciseGroups.map((group) => (
          <ExerciseSection key={group.id} group={group} theme={theme} />
        ))}
        <footer className="footer-note">{courseMeta.footerText}</footer>
      </main>
    </div>
  );
}
