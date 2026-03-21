import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import MathMarkdown from './MathMarkdown';

const Plot = lazy(async () => {
  const [{ default: createPlotlyComponent }, plotlyModule] = await Promise.all([
    import('react-plotly.js/factory.js'),
    import('plotly.js-dist-min'),
  ]);
  const plotly = plotlyModule.default ?? plotlyModule;
  return { default: createPlotlyComponent(plotly) };
});

const LIGHT_COLORS = {
  ink: '#0B0B0B',
  graphite: '#2E2E2E',
  navy: '#1C2A3A',
  ivory: '#F2F2EE',
  gold: '#C6A75E',
  wine: '#6E1F28',
  mist: '#d9d5cb',
  accent: '#6f8196',
  surface: '#ffffff',
  surfaceSoft: '#f8f5ef',
  grid: '#ece6dc',
  border: 'rgba(28, 42, 58, 0.08)',
  textMuted: 'rgba(46, 46, 46, 0.72)',
};

const plotConfig = {
  displayModeBar: false,
  responsive: true,
};

const DARK_COLORS = {
  ink: '#F5F1E8',
  graphite: '#E5DED0',
  navy: '#88A0B7',
  ivory: '#0E141B',
  gold: '#D5B470',
  wine: '#C78088',
  mist: '#24313d',
  accent: '#5E7488',
  surface: '#121B24',
  surfaceSoft: '#0d141b',
  grid: '#283542',
  border: 'rgba(255, 255, 255, 0.08)',
  textMuted: 'rgba(229, 222, 208, 0.78)',
};

function getPalette(theme) {
  return theme === 'dark' ? DARK_COLORS : LIGHT_COLORS;
}

function getBaseLayout(palette) {
  return {
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: palette.surface,
    font: {
      family: 'Manrope, sans-serif',
      color: palette.graphite,
    },
    margin: { l: 48, r: 24, t: 24, b: 124 },
  };
}

function getBottomLegendLayout() {
  return {
    orientation: 'h',
    x: 0,
    xanchor: 'left',
    y: -0.24,
    yanchor: 'top',
  };
}

function range(start, end, count) {
  const step = (end - start) / (count - 1);
  return Array.from({ length: count }, (_, index) => start + step * index);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function slopeFieldTrace(fn, xMin, xMax, yMin, yMax, palette, xSteps = 15, ySteps = 15) {
  const xs = [];
  const ys = [];
  const dxBase = (xMax - xMin) / xSteps;
  const dyBase = (yMax - yMin) / ySteps;
  const length = Math.min(dxBase, dyBase) * 0.36;

  for (let ix = 0; ix <= xSteps; ix += 1) {
    for (let iy = 0; iy <= ySteps; iy += 1) {
      const x = xMin + (ix / xSteps) * (xMax - xMin);
      const y = yMin + (iy / ySteps) * (yMax - yMin);
      const slope = fn(x, y);
      const norm = Math.sqrt(1 + slope * slope);
      const dx = length / norm;
      const dy = (length * slope) / norm;
      xs.push(x - dx, x + dx, null);
      ys.push(y - dy, y + dy, null);
    }
  }

  return {
    type: 'scatter',
    mode: 'lines',
    x: xs,
    y: ys,
    line: { color: palette.mist, width: 1.4 },
    hoverinfo: 'skip',
    name: 'Campo',
  };
}

function useAnimatedCursor(max, initial = 0, duration = 7000) {
  const [value, setValue] = useState(initial);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    let frameId;
    const offset = (value / max) * duration;
    const start = performance.now() - offset;

    const step = (timestamp) => {
      const elapsed = (timestamp - start) % duration;
      setValue((elapsed / duration) * max);
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [duration, max, playing]);

  return { value, setValue, playing, setPlaying };
}

function VisualizationShell({ title, summary, children }) {
  return (
    <div className="visual-shell">
      <div className="visual-shell__header">
        <div>
          <p className="eyebrow">Visualización interactiva</p>
          <h4>{title}</h4>
        </div>
        <div className="visual-shell__summary">
          <MathMarkdown content={summary} />
        </div>
      </div>
      {children}
    </div>
  );
}

function PlotFigure({ data, layout, style, theme }) {
  const palette = getPalette(theme);

  return (
    <Suspense
      fallback={
        <div className="plot-loading">
          <span />
          <p>Cargando gráfica…</p>
        </div>
      }
    >
      <Plot
        data={data}
        layout={{
          ...getBaseLayout(palette),
          ...layout,
        }}
        config={plotConfig}
        style={style ?? { width: '100%', height: '380px' }}
        useResizeHandler
      />
    </Suspense>
  );
}

function Control({ label, value, min, max, step = 0.1, onChange, hint }) {
  return (
    <label className="control-group" title={hint}>
      <div className="control-group__label">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function PhaseLine({ xMin, xMax, equilibria, slopeFn, label, palette }) {
  const width = 420;
  const height = 112;
  const sorted = [...equilibria].sort((left, right) => left - right);
  const boundaries = [xMin, ...sorted, xMax];
  const toPx = (value) => 36 + ((value - xMin) / (xMax - xMin)) * (width - 72);

  return (
    <div className="phase-line">
      <div className="phase-line__title">
        <span>{label}</span>
        <small title="La dirección depende del signo de la tasa de cambio.">Lectura por signos</small>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Línea de fase de ${label}`}>
        <line x1="36" y1="58" x2={width - 36} y2="58" stroke={palette.navy} strokeWidth="2" />
        {sorted.map((value) => (
          <g key={value} transform={`translate(${toPx(value)},58)`}>
            <circle r="6" fill={palette.surface} stroke={palette.gold} strokeWidth="2.5" />
            <text y="24" textAnchor="middle" fontSize="12" fill={palette.graphite}>
              {value.toFixed(2).replace(/\.00$/, '')}
            </text>
          </g>
        ))}
        {boundaries.slice(0, -1).map((left, index) => {
          const right = boundaries[index + 1];
          const midpoint = left + (right - left) / 2;
          const sign = Math.sign(slopeFn(midpoint));
          const arrow = sign >= 0 ? '→' : '←';
          return (
            <text
              key={`${left}-${right}`}
              x={toPx(midpoint)}
              y="49"
              textAnchor="middle"
              fontSize="20"
              fill={sign >= 0 ? palette.gold : palette.wine}
            >
              {arrow}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function polynomialValue(coefficients, x) {
  const [c0, c1, c2, c3] = coefficients;
  return c0 + c1 * x + c2 * x ** 2 + c3 * x ** 3;
}

function polynomialDerivative(coefficients, x) {
  const [, c1, c2, c3] = coefficients;
  return c1 + 2 * c2 * x + 3 * c3 * x ** 2;
}

function LinearRelationVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [xValue, setXValue] = useState(props.activeX);
  const [intercept, setIntercept] = useState(props.intercept);
  const [slope, setSlope] = useState(props.slope);
  const xs = useMemo(() => range(props.xMin, props.xMax, 160), [props.xMax, props.xMin]);
  const ys = xs.map((value) => intercept - slope * value);
  const yValue = intercept - slope * xValue;

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid">
        <Control
          label={props.labelX}
          value={xValue.toFixed(1)}
          min={props.xMin}
          max={props.xMax}
          step={0.5}
          onChange={setXValue}
          hint="Mueve la variable independiente para leer el valor correspondiente."
        />
        {props.allowParameterTweaks ? (
          <>
            <Control
              label="Intercepto"
              value={intercept.toFixed(1)}
              min={20}
              max={120}
              step={1}
              onChange={setIntercept}
              hint="Controla el corte con el eje vertical."
            />
            <Control
              label="Pendiente"
              value={slope.toFixed(1)}
              min={1}
              max={8}
              step={0.5}
              onChange={setSlope}
              hint="Controla cuánto cambia la variable dependiente cuando cambia la independiente."
            />
          </>
        ) : null}
      </div>
      <div className="chart-grid chart-grid--single">
        <div className="plot-card">
          <PlotFigure
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                x: xs,
                y: ys,
                name: 'Recta',
                line: { color: palette.navy, width: 3 },
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [xValue],
                y: [yValue],
                name: 'Punto activo',
                marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
              },
            ]}
            layout={{
              xaxis: { title: props.labelX, gridcolor: palette.grid, color: palette.graphite },
              yaxis: { title: props.labelY, gridcolor: palette.grid, color: palette.graphite },
              showlegend: false,
            }}
            theme={theme}
          />
        </div>
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> Cuando {props.labelX.toLowerCase()} = {xValue.toFixed(1)}, entonces{' '}
        {props.labelY.toLowerCase()} = {yValue.toFixed(1)}.
      </div>
    </VisualizationShell>
  );
}

function RationalHoleVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [a, setA] = useState(props.a);
  const [xValue, setXValue] = useState(props.a + 1);
  const effectiveX = Math.abs(xValue - a) < 0.15 ? a + 0.4 : xValue;
  const xs = useMemo(() => range(a - 8, a + 8, 220), [a]);
  const filteredXs = xs.filter((value) => Math.abs(value - a) > 0.05);
  const originalYs = filteredXs.map((value) => value + a);
  const lineYs = xs.map((value) => value + a);
  const activeY = effectiveX + a;

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid">
        <Control
          label="Punto de lectura"
          value={effectiveX.toFixed(1)}
          min={a - 6}
          max={a + 6}
          step={0.1}
          onChange={setXValue}
          hint="Evita el valor restringido para inspeccionar la función."
        />
        {props.interactiveA ? (
          <Control
            label="Factor común"
            value={a.toFixed(1)}
            min={2}
            max={8}
            step={1}
            onChange={setA}
            hint="Cambia el valor que genera el hueco removible."
          />
        ) : null}
      </div>
      <div className="plot-card">
        <PlotFigure
          data={[
            {
              type: 'scatter',
              mode: 'lines',
              x: filteredXs,
              y: originalYs,
              name: 'Original',
              line: { color: palette.navy, width: 3 },
            },
            {
              type: 'scatter',
              mode: 'lines',
              x: xs,
              y: lineYs,
              name: 'Simplificada',
              line: { color: palette.gold, width: 2, dash: 'dash' },
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: [a],
              y: [2 * a],
              name: 'Hueco',
              marker: { size: 14, color: palette.surface, line: { color: palette.wine, width: 3 } },
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: [effectiveX],
              y: [activeY],
              name: 'Punto',
              marker: { size: 11, color: palette.gold, line: { color: palette.surface, width: 2 } },
            },
          ]}
          layout={{
            xaxis: { title: 'x', gridcolor: palette.grid, color: palette.graphite },
            yaxis: { title: 'y', gridcolor: palette.grid, color: palette.graphite },
            legend: getBottomLegendLayout(),
          }}
          theme={theme}
        />
      </div>
      <div className="mini-note">
        <strong>Restricción vigente.</strong> La forma simplificada coincide con la recta salvo en{' '}
        <span>{`x = ${a.toFixed(0)}`}</span>, donde la expresión original no está definida.
      </div>
    </VisualizationShell>
  );
}

function DerivativeVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [xValue, setXValue] = useState(props.activeX);
  const xs = useMemo(() => range(props.xMin, props.xMax, 200), [props.xMax, props.xMin]);
  const functionYs = xs.map((value) => polynomialValue(props.coefficients, value));
  const derivativeYs = xs.map((value) => polynomialDerivative(props.coefficients, value));
  const yValue = polynomialValue(props.coefficients, xValue);
  const slope = polynomialDerivative(props.coefficients, xValue);
  const tangentXs = [xValue - 1.1, xValue + 1.1];
  const tangentYs = tangentXs.map((value) => yValue + slope * (value - xValue));

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid">
        <Control
          label="Tiempo activo"
          value={xValue.toFixed(2)}
          min={props.xMin}
          max={props.xMax}
          step={0.05}
          onChange={setXValue}
          hint="Mueve el punto para comparar pendiente y derivada."
        />
      </div>
      <div className="chart-grid">
        <div className="plot-card">
          <PlotFigure
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                x: xs,
                y: functionYs,
                name: 'Función original',
                line: { color: palette.navy, width: 3 },
              },
              {
                type: 'scatter',
                mode: 'lines',
                x: tangentXs,
                y: tangentYs,
                name: 'Pendiente local',
                line: { color: palette.gold, width: 2, dash: 'dot' },
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [xValue],
                y: [yValue],
                name: 'Punto activo',
                marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
              },
            ]}
            layout={{
              xaxis: { title: props.xLabel, gridcolor: palette.grid, color: palette.graphite },
              yaxis: { title: props.yLabel, gridcolor: palette.grid, color: palette.graphite },
              legend: getBottomLegendLayout(),
            }}
            theme={theme}
          />
        </div>
        <div className="plot-card">
          <PlotFigure
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                x: xs,
                y: derivativeYs,
                name: 'Derivada',
                line: { color: palette.wine, width: 3 },
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [xValue],
                y: [slope],
                name: 'Valor actual',
                marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
              },
            ]}
            layout={{
              xaxis: { title: props.xLabel, gridcolor: palette.grid, color: palette.graphite },
              yaxis: { title: 'Derivada', gridcolor: palette.grid, color: palette.graphite },
              showlegend: false,
            }}
            theme={theme}
          />
        </div>
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> En {props.xLabel.toLowerCase()} = {xValue.toFixed(2)}, la pendiente vale{' '}
        {slope.toFixed(2)}. Si la derivada es positiva, la función sube; si es negativa, baja.
      </div>
    </VisualizationShell>
  );
}

function LinearAutonomousVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [view, setView] = useState('trayectorias');
  const [initial, setInitial] = useState(props.activeInitial);
  const cursor = useAnimatedCursor(props.tMax, props.tMax / 3);
  const equilibrium = props.a / props.b;
  const times = useMemo(() => range(0, props.tMax, 180), [props.tMax]);
  const stateRange = useMemo(() => range(props.xMin, props.xMax, 180), [props.xMax, props.xMin]);
  const slopeFn = (value) => props.a - props.b * value;
  const solution = (time, x0) => equilibrium + (x0 - equilibrium) * Math.exp(-props.b * time);
  const activePoint = solution(cursor.value, initial);
  const initialSlope = slopeFn(initial);
  const displacement = initial - equilibrium;
  const directionText =
    Math.abs(displacement) < 1e-6
      ? 'La condición inicial ya coincide con el equilibrio.'
      : displacement > 0
        ? 'El valor inicial está por encima del equilibrio y la trayectoria desciende.'
        : 'El valor inicial está por debajo del equilibrio y la trayectoria asciende.';
  const activeTrajectory = {
    type: 'scatter',
    mode: 'lines',
    x: times,
    y: times.map((time) => solution(time, initial)),
    line: { color: palette.gold, width: 3.5 },
    hovertemplate: `${props.label}(0)=${initial.toFixed(2)}<extra></extra>`,
    name: 'Trayectoria activa',
  };

  const familyTraces = props.initials.map((x0) => ({
    type: 'scatter',
    mode: 'lines',
    x: times,
    y: times.map((time) => solution(time, x0)),
    line: {
      color: Math.abs(x0 - initial) < 0.01 ? palette.gold : palette.accent,
      width: Math.abs(x0 - initial) < 0.01 ? 3.5 : 1.8,
    },
    opacity: Math.abs(x0 - initial) < 0.01 ? 1 : 0.56,
    hovertemplate: `${props.label}(0)=${x0}<extra></extra>`,
    name: `${props.label}(0)=${x0}`,
  }));

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid controls-grid--wide">
        <Control
          label={`Condición inicial de ${props.label}`}
          value={initial.toFixed(1)}
          min={props.xMin}
          max={props.xMax}
          step={0.1}
          onChange={setInitial}
          hint="Mueve el valor inicial para comparar trayectorias."
        />
        <Control
          label="Tiempo observado"
          value={cursor.value.toFixed(2)}
          min={0}
          max={props.tMax}
          step={0.05}
          onChange={cursor.setValue}
          hint="El punto activo se mueve sobre la trayectoria resaltada."
        />
        <div className="toggle-row">
          <button
            type="button"
            className={view === 'trayectorias' ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setView('trayectorias')}
          >
            Trayectorias
          </button>
          <button
            type="button"
            className={view === 'campo' ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setView('campo')}
          >
            Campo
          </button>
          <button type="button" className="toggle-button" onClick={() => cursor.setPlaying(!cursor.playing)}>
            {cursor.playing ? 'Pausar' : 'Animar'}
          </button>
        </div>
      </div>
      <div className="chart-grid">
        <div className="plot-card">
          {view === 'trayectorias' ? (
            <PlotFigure
      data={[
        ...familyTraces,
        activeTrajectory,
        {
          type: 'scatter',
          mode: 'lines',
          x: [0, props.tMax],
          y: [equilibrium, equilibrium],
          name: 'Equilibrio',
          line: { color: palette.wine, width: 2, dash: 'dash' },
        },
        {
          type: 'scatter',
          mode: 'markers',
          x: [cursor.value],
          y: [activePoint],
          name: 'Punto activo',
          marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
        },
        {
          type: 'scatter',
          mode: 'markers',
          x: [0],
          y: [initial],
          name: 'Condición inicial',
          marker: { size: 11, color: palette.wine, line: { color: palette.surface, width: 2 } },
        },
      ]}
      layout={{
        xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
        yaxis: { title: props.variableName, gridcolor: palette.grid, color: palette.graphite },
        legend: getBottomLegendLayout(),
        annotations: [
          {
            x: props.tMax * 0.92,
            y: equilibrium,
            text: `p* = ${formatNumber(equilibrium, 2)}`,
            showarrow: false,
            xanchor: 'right',
            yanchor: 'bottom',
            font: { color: palette.wine, size: 12 },
            bgcolor: 'rgba(0,0,0,0)',
          },
        ],
      }}
      theme={theme}
    />
          ) : (
            <PlotFigure
              data={[
                slopeFieldTrace((time, y) => props.a - props.b * y, 0, props.tMax, props.xMin, props.xMax, palette),
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: times,
                  y: times.map((time) => solution(time, initial)),
                  name: 'Solución activa',
                  line: { color: palette.gold, width: 3.5 },
                },
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [cursor.value],
                  y: [activePoint],
                  name: 'Punto activo',
                  marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: [0, props.tMax],
                  y: [equilibrium, equilibrium],
                  name: 'Equilibrio',
                  line: { color: palette.wine, width: 2, dash: 'dash' },
                },
              ]}
              layout={{
                xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
                yaxis: { title: props.variableName, gridcolor: palette.grid, color: palette.graphite },
                legend: getBottomLegendLayout(),
              }}
              theme={theme}
            />
          )}
        </div>
        <div className="plot-card">
          <PlotFigure
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                x: stateRange,
                y: stateRange.map((value) => slopeFn(value)),
                name: 'f(x)',
                line: { color: palette.navy, width: 3 },
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [equilibrium],
                y: [0],
                name: 'Equilibrio',
                marker: { size: 12, color: palette.wine, line: { color: palette.surface, width: 2 } },
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [initial],
                y: [initialSlope],
                name: 'Estado inicial',
                marker: { size: 11, color: palette.gold, line: { color: palette.surface, width: 2 } },
              },
            ]}
            layout={{
              xaxis: { title: props.label, gridcolor: palette.grid, color: palette.graphite },
              yaxis: { title: 'Tasa de cambio', gridcolor: palette.grid, color: palette.graphite },
              legend: getBottomLegendLayout(),
            }}
            theme={theme}
          />
          <PhaseLine
            xMin={props.xMin}
            xMax={props.xMax}
            equilibria={[equilibrium]}
            slopeFn={slopeFn}
            label={`Línea de fase de ${props.label}`}
            palette={palette}
          />
        </div>
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> El equilibrio es {equilibrium.toFixed(2)} y la ecuación evoluciona con{' '}
        <code>{`${props.label}' = ${formatNumber(props.a, 2)} - ${formatNumber(props.b, 2)}${props.label}`}</code>.{' '}
        {directionText} En el tiempo {cursor.value.toFixed(2)}, la trayectoria vale {activePoint.toFixed(2)} y su tasa
        de cambio es {formatNumber(slopeFn(activePoint), 2)}.
      </div>
    </VisualizationShell>
  );
}

function SeparableVisualizer({ title, summary, theme }) {
  const palette = getPalette(theme);
  const models = {
    proportional: {
      label: String.raw`$$\frac{dy}{dt}=2y$$`,
      description: 'Crecimiento proporcional al nivel de la variable.',
      paramRange: [-2, 2],
      paramStep: 0.1,
      paramLabel: 'Constante C',
      tMax: 2.2,
      yMin: -8,
      yMax: 8,
      slopeFn: (_time, y) => 2 * y,
      solution: (time, c) => c * Math.exp(2 * time),
      family: [-1.5, -0.75, 0.5, 1.2, 2],
    },
    timeDriven: {
      label: String.raw`$$\frac{dy}{dt}=3t$$`,
      description: 'La pendiente depende del tiempo y no del nivel de la variable.',
      paramRange: [-4, 4],
      paramStep: 0.1,
      paramLabel: 'Constante C',
      tMax: 3.2,
      yMin: -6,
      yMax: 12,
      slopeFn: (time) => 3 * time,
      solution: (time, c) => 1.5 * time ** 2 + c,
      family: [-3, -1, 0, 2, 4],
    },
  };

  const [modelKey, setModelKey] = useState('proportional');
  const [parameter, setParameter] = useState(1);
  const model = models[modelKey];
  const cursor = useAnimatedCursor(model.tMax, model.tMax / 3);
  const times = useMemo(() => range(0, model.tMax, 200), [model.tMax]);
  const activePoint = model.solution(cursor.value, parameter);
  const activeTrajectory = {
    type: 'scatter',
    mode: 'lines',
    x: times,
    y: times.map((time) => model.solution(time, parameter)),
    line: { color: palette.gold, width: 3.5 },
    hovertemplate: `C=${parameter.toFixed(2)}<extra></extra>`,
    name: 'Solución activa',
  };

  useEffect(() => {
    setParameter(modelKey === 'proportional' ? 1 : 0);
  }, [modelKey]);

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid controls-grid--wide">
        <div className="toggle-row">
          <button
            type="button"
            className={modelKey === 'proportional' ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setModelKey('proportional')}
          >
            Proporcional
          </button>
          <button
            type="button"
            className={modelKey === 'timeDriven' ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setModelKey('timeDriven')}
          >
            Dependiente del tiempo
          </button>
          <button type="button" className="toggle-button" onClick={() => cursor.setPlaying(!cursor.playing)}>
            {cursor.playing ? 'Pausar' : 'Animar'}
          </button>
        </div>
        <Control
          label={model.paramLabel}
          value={parameter.toFixed(2)}
          min={model.paramRange[0]}
          max={model.paramRange[1]}
          step={model.paramStep}
          onChange={setParameter}
          hint="Elige una solución particular dentro de la familia."
        />
        <Control
          label="Tiempo observado"
          value={cursor.value.toFixed(2)}
          min={0}
          max={model.tMax}
          step={0.05}
          onChange={cursor.setValue}
          hint="Sigue el punto activo sobre la curva resaltada."
        />
      </div>
      <div className="mini-note mini-note--soft">
        <MathMarkdown content={model.label} />
        <p>{model.description}</p>
      </div>
      <div className="plot-card">
        <PlotFigure
          data={[
            slopeFieldTrace(model.slopeFn, 0, model.tMax, model.yMin, model.yMax, palette, 16, 16),
            ...model.family.map((value) => ({
              type: 'scatter',
              mode: 'lines',
              x: times,
              y: times.map((time) => model.solution(time, value)),
              line: {
                color: Math.abs(value - parameter) < 0.001 ? palette.gold : palette.accent,
                width: Math.abs(value - parameter) < 0.001 ? 3.4 : 1.7,
              },
              opacity: Math.abs(value - parameter) < 0.001 ? 1 : 0.55,
              hovertemplate: `C=${value}<extra></extra>`,
              name: `C=${value}`,
            })),
            activeTrajectory,
            {
              type: 'scatter',
              mode: 'markers',
              x: [cursor.value],
              y: [activePoint],
              marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
              showlegend: false,
            },
          ]}
          layout={{
            xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
            yaxis: { title: 'y', gridcolor: palette.grid, color: palette.graphite },
            legend: getBottomLegendLayout(),
          }}
          theme={theme}
        />
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> Para {model.paramLabel.toLowerCase()} = {parameter.toFixed(2)}, la solución vale{' '}
        {activePoint.toFixed(2)} cuando el tiempo es {cursor.value.toFixed(2)}.
      </div>
    </VisualizationShell>
  );
}

function GrowthFieldVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [initial, setInitial] = useState(props.initial);
  const cursor = useAnimatedCursor(props.tMax, props.tMax / 4);
  const times = useMemo(() => range(0, props.tMax, 200), [props.tMax]);
  const solution = (time, x0) => x0 * Math.exp(props.rate * time);
  const activePoint = solution(cursor.value, initial);
  const activeTrajectory = {
    type: 'scatter',
    mode: 'lines',
    x: times,
    y: times.map((time) => solution(time, initial)),
    line: { color: palette.gold, width: 3.5 },
    hovertemplate: `y(0)=${initial.toFixed(2)}<extra></extra>`,
    name: 'Trayectoria activa',
  };

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid controls-grid--wide">
        <Control
          label="Condición inicial"
          value={initial.toFixed(2)}
          min={0.5}
          max={5}
          step={0.1}
          onChange={setInitial}
          hint="Selecciona la trayectoria particular que quieres seguir."
        />
        <Control
          label="Tiempo observado"
          value={cursor.value.toFixed(2)}
          min={0}
          max={props.tMax}
          step={0.02}
          onChange={cursor.setValue}
          hint="El punto activo recorre la trayectoria exponencial."
        />
        <button type="button" className="toggle-button" onClick={() => cursor.setPlaying(!cursor.playing)}>
          {cursor.playing ? 'Pausar' : 'Animar'}
        </button>
      </div>
      <div className="plot-card">
        <PlotFigure
          data={[
            slopeFieldTrace((_time, y) => props.rate * y, 0, props.tMax, 0, props.yMax, palette, 16, 14),
            ...[1, 2, 3, 4.2].map((value) => ({
              type: 'scatter',
              mode: 'lines',
              x: times,
              y: times.map((time) => solution(time, value)),
              line: {
                color: Math.abs(value - initial) < 0.01 ? palette.gold : palette.accent,
                width: Math.abs(value - initial) < 0.01 ? 3.4 : 1.8,
              },
              opacity: Math.abs(value - initial) < 0.01 ? 1 : 0.55,
              hovertemplate: `y(0)=${value}<extra></extra>`,
              name: `y(0)=${value}`,
            })),
            activeTrajectory,
            {
              type: 'scatter',
              mode: 'markers',
              x: [cursor.value],
              y: [activePoint],
              marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
              showlegend: false,
            },
          ]}
          layout={{
            xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
            yaxis: { title: 'y', gridcolor: palette.grid, color: palette.graphite, range: [0, props.yMax] },
            legend: getBottomLegendLayout(),
          }}
          theme={theme}
        />
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> La trayectoria particular parte de {initial.toFixed(2)} y alcanza{' '}
        {activePoint.toFixed(2)} en el tiempo {cursor.value.toFixed(2)}.
      </div>
    </VisualizationShell>
  );
}

function BernoulliVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [constant, setConstant] = useState(props.activeC);
  const cursor = useAnimatedCursor(4.5, 1.4);
  const times = useMemo(() => range(0, 4.5, 180), []);
  const bernoulli = (time, c) => 1 / (1 + c * Math.exp(time));
  const linearReference = (time, c) => 1 + c * Math.exp(-time);
  const activePoint = bernoulli(cursor.value, constant);
  const activeTrajectory = {
    type: 'scatter',
    mode: 'lines',
    x: times,
    y: times.map((time) => bernoulli(time, constant)),
    line: { color: palette.gold, width: 3.5 },
    hovertemplate: `C=${constant.toFixed(2)}<extra></extra>`,
    name: 'Bernoulli activa',
  };

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid controls-grid--wide">
        <Control
          label="Constante C"
          value={constant.toFixed(2)}
          min={0.05}
          max={2}
          step={0.05}
          onChange={setConstant}
          hint="Controla la forma inicial de la solución de Bernoulli."
        />
        <Control
          label="Tiempo observado"
          value={cursor.value.toFixed(2)}
          min={0}
          max={4.5}
          step={0.05}
          onChange={cursor.setValue}
          hint="Sigue la solución no lineal en el tiempo."
        />
        <button type="button" className="toggle-button" onClick={() => cursor.setPlaying(!cursor.playing)}>
          {cursor.playing ? 'Pausar' : 'Animar'}
        </button>
      </div>
      <div className="plot-card">
        <PlotFigure
          data={[
            ...[0.2, 0.5, 1, 1.5].map((value) => ({
              type: 'scatter',
              mode: 'lines',
              x: times,
              y: times.map((time) => bernoulli(time, value)),
              line: {
                color: Math.abs(value - constant) < 0.01 ? palette.gold : palette.accent,
                width: Math.abs(value - constant) < 0.01 ? 3.4 : 1.8,
              },
              opacity: Math.abs(value - constant) < 0.01 ? 1 : 0.5,
              hovertemplate: `C=${value}<extra></extra>`,
              name: `Bernoulli C=${value}`,
            })),
            activeTrajectory,
            {
              type: 'scatter',
              mode: 'lines',
              x: times,
              y: times.map((time) => linearReference(time, 0.6)),
              line: { color: palette.wine, width: 2.4, dash: 'dash' },
              name: 'Referencia lineal',
            },
            {
              type: 'scatter',
              mode: 'markers',
              x: [cursor.value],
              y: [activePoint],
              marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
              showlegend: false,
            },
          ]}
          layout={{
            xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
            yaxis: { title: 'y', gridcolor: palette.grid, color: palette.graphite },
            legend: getBottomLegendLayout(),
          }}
          theme={theme}
        />
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> Con C = {constant.toFixed(2)}, la solución vale {activePoint.toFixed(3)} en el tiempo{' '}
        {cursor.value.toFixed(2)}. La curva punteada sirve como referencia lineal para comparar la forma.
      </div>
    </VisualizationShell>
  );
}

function logisticSolution(time, x0, capacity) {
  const safeX0 = clamp(x0, 0.15, capacity * 1.7);
  const factor = (capacity - safeX0) / safeX0;
  return capacity / (1 + factor * Math.exp(-capacity * time));
}

function LogisticVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [initial, setInitial] = useState(props.activeInitial);
  const [showSurface, setShowSurface] = useState(false);
  const cursor = useAnimatedCursor(props.tMax, props.tMax / 3);
  const times = useMemo(() => range(0, props.tMax, 160), [props.tMax]);
  const stateRange = useMemo(() => range(props.xMin, props.xMax, 220), [props.xMax, props.xMin]);
  const capacity = props.carryingCapacity;
  const activePoint = logisticSolution(cursor.value, initial, capacity);
  const slopeFn = (value) => value * (capacity - value);
  const familyInitials = [0.4, 1.2, capacity - 1, capacity + 1.4];
  const activeTrajectory = {
    type: 'scatter',
    mode: 'lines',
    x: times,
    y: times.map((time) => logisticSolution(time, initial, capacity)),
    line: { color: palette.gold, width: 3.5 },
    hovertemplate: `x(0)=${initial.toFixed(2)}<extra></extra>`,
    name: 'Trayectoria activa',
  };

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid controls-grid--wide">
        <Control
          label="Condición inicial"
          value={initial.toFixed(2)}
          min={0.2}
          max={capacity * 1.5}
          step={0.05}
          onChange={setInitial}
          hint="La superficie 3D usa condiciones iniciales positivas para resaltar el ajuste económico."
        />
        <Control
          label="Tiempo observado"
          value={cursor.value.toFixed(2)}
          min={0}
          max={props.tMax}
          step={0.05}
          onChange={cursor.setValue}
          hint="El punto activo recorre la trayectoria logística."
        />
        <div className="toggle-row">
          <button type="button" className="toggle-button" onClick={() => cursor.setPlaying(!cursor.playing)}>
            {cursor.playing ? 'Pausar' : 'Animar'}
          </button>
          <button
            type="button"
            className={showSurface ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setShowSurface(!showSurface)}
          >
            {showSurface ? 'Ocultar 3D' : 'Ver 3D'}
          </button>
        </div>
      </div>
      <div className="chart-grid">
        <div className="plot-card">
          <PlotFigure
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                x: stateRange,
                y: stateRange.map((value) => slopeFn(value)),
                line: { color: palette.navy, width: 3 },
                name: 'f(x)',
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [0, capacity],
                y: [0, 0],
                marker: { size: 12, color: [palette.wine, palette.gold], line: { color: palette.surface, width: 2 } },
                name: 'Equilibrios',
              },
            ]}
            layout={{
              xaxis: { title: 'x', gridcolor: palette.grid, color: palette.graphite },
              yaxis: { title: 'dx/dt', gridcolor: palette.grid, color: palette.graphite },
              showlegend: false,
            }}
            theme={theme}
          />
          <PhaseLine
            xMin={props.xMin}
            xMax={props.xMax}
            equilibria={[0, capacity]}
            slopeFn={slopeFn}
            label="Línea de fase"
            palette={palette}
          />
        </div>
        <div className="plot-card">
          <PlotFigure
            data={[
              ...familyInitials.map((value) => ({
                type: 'scatter',
                mode: 'lines',
                x: times,
                y: times.map((time) => logisticSolution(time, value, capacity)),
                line: {
                  color: Math.abs(value - initial) < 0.05 ? palette.gold : palette.accent,
                  width: Math.abs(value - initial) < 0.05 ? 3.4 : 1.8,
                },
                opacity: Math.abs(value - initial) < 0.05 ? 1 : 0.55,
                hovertemplate: `x(0)=${value.toFixed(2)}<extra></extra>`,
                name: `x(0)=${value.toFixed(2)}`,
              })),
              activeTrajectory,
              {
                type: 'scatter',
                mode: 'lines',
                x: [0, props.tMax],
                y: [capacity, capacity],
                line: { color: palette.wine, width: 2, dash: 'dash' },
                name: 'Equilibrio estable',
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [cursor.value],
                y: [activePoint],
                marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
                showlegend: false,
              },
            ]}
            layout={{
              xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
              yaxis: { title: 'x(t)', gridcolor: palette.grid, color: palette.graphite },
              legend: getBottomLegendLayout(),
            }}
            theme={theme}
          />
        </div>
      </div>
      {showSurface ? (
        <div className="plot-card plot-card--wide">
          <PlotFigure
            data={[
              {
                type: 'surface',
                x: range(0.2, capacity * 1.5, 22),
                y: range(0, props.tMax, 28),
                z: range(0, props.tMax, 28).map((time) =>
                  range(0.2, capacity * 1.5, 22).map((x0) => logisticSolution(time, x0, capacity)),
                ),
                colorscale: [
                  [0, palette.surfaceSoft],
                  [0.5, palette.accent],
                  [1, palette.gold],
                ],
                showscale: false,
              },
            ]}
            layout={{
              height: 420,
              margin: { l: 0, r: 0, t: 12, b: 0 },
              scene: {
                xaxis: { title: 'x₀', color: palette.graphite, gridcolor: palette.grid, zerolinecolor: palette.grid },
                yaxis: { title: 'Tiempo', color: palette.graphite, gridcolor: palette.grid, zerolinecolor: palette.grid },
                zaxis: { title: 'x(t;x₀)', color: palette.graphite, gridcolor: palette.grid, zerolinecolor: palette.grid },
                bgcolor: 'rgba(0,0,0,0)',
                camera: { eye: { x: 1.3, y: 1.25, z: 0.8 } },
              },
            }}
            style={{ width: '100%', height: '400px' }}
            theme={theme}
          />
        </div>
      ) : null}
      <div className="mini-note">
        <strong>Lectura actual.</strong> El equilibrio inestable está en 0 y el estable en {capacity}. Con condición inicial{' '}
        {initial.toFixed(2)}, la trayectoria vale {activePoint.toFixed(2)} en el tiempo {cursor.value.toFixed(2)}.
      </div>
    </VisualizationShell>
  );
}

function formatNumber(value, digits = 2) {
  const rounded = Number.parseFloat(Number(value).toFixed(digits));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

function SummaryConceptMap({ palette, cards }) {
  const [priceCard = {}, marketCard = {}, balanceCard = {}] = cards;

  return (
    <div className="concept-map-card">
      <div className="concept-map-card__header">
        <div>
          <p className="eyebrow" style={{ color: palette.gold }}>
            Ruta visual
          </p>
          <h5>Mapa para leer el modelo</h5>
        </div>
        <p>
          Primero se identifica el precio y sus derivadas. Luego se revisa el exceso de demanda. Al final se ubica el
          equilibrio y el sentido del ajuste.
        </p>
      </div>
      <svg viewBox="0 0 760 450" className="concept-map" role="img" aria-label="Mapa conceptual de lectura del modelo">
        {/* Definiciones para sombras y gradientes */}
        <defs>
          <filter id="shadow-soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.14" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.gold} stopOpacity="0.12" />
            <stop offset="100%" stopColor={palette.gold} stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.accent} stopOpacity="0.12" />
            <stop offset="100%" stopColor={palette.accent} stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="grad-wine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.wine} stopOpacity="0.08" />
            <stop offset="100%" stopColor={palette.wine} stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Conexiones curvas refinadas */}
        <path
          d="M380 185 C280 185 200 160 150 118"
          fill="none"
          stroke={palette.gold}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.5"
        />
        <path
          d="M380 185 C490 185 560 155 600 118"
          fill="none"
          stroke={palette.accent}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.5"
        />
        <path
          d="M380 250 L380 320"
          fill="none"
          stroke={palette.wine}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray="4 6"
          opacity="0.5"
        />

        {/* Flechas de dirección */}
        <path d="M140 108 L155 125 L160 105 Z" fill={palette.gold} opacity="0.8" />
        <path d="M610 108 L595 125 L590 105 Z" fill={palette.accent} opacity="0.8" />
        <path d="M380 334 L372 320 H388 Z" fill={palette.wine} opacity="0.8" />

        {/* Bloque: Variables de Estado (Izquierda) */}
        <g filter="url(#shadow-soft)">
          <rect x="30" y="32" width="240" height="106" rx="22" fill={palette.surface} stroke={palette.gold} strokeWidth="2.2" />
          <rect x="30" y="32" width="240" height="106" rx="22" fill="url(#grad-gold)" stroke="none" />
          <text x="54" y="62" fontSize="12" fontWeight="800" fill={palette.gold} letterSpacing="0.08em" textTransform="uppercase">
            {priceCard.title ?? 'Dinámica'}
          </text>
          <text x="54" y="90" fontSize="17" fontWeight="800" fill={palette.graphite}>
            Estado y Tendencia
          </text>
          <text x="54" y="112" fontSize="13.5" fill={palette.textMuted}>
            Nivel: p, Cambio: p', Inercia: p''
          </text>
        </g>

        {/* Bloque: Señal de Mercado (Derecha) */}
        <g filter="url(#shadow-soft)">
          <rect x="470" y="32" width="270" height="106" rx="22" fill={palette.surface} stroke={palette.accent} strokeWidth="2.2" />
          <rect x="470" y="32" width="270" height="106" rx="22" fill="url(#grad-accent)" stroke="none" />
          <text x="496" y="62" fontSize="12" fontWeight="800" fill={palette.accent} letterSpacing="0.08em" textTransform="uppercase">
            {marketCard.title ?? 'Demanda y oferta'}
          </text>
          <text x="496" y="90" fontSize="17" fontWeight="800" fill={palette.graphite}>
            Exceso de demanda
          </text>
          <text x="496" y="112" fontSize="13.5" fill={palette.textMuted}>
            Si E(p){'>'} 0 sube; si {'<'} 0 baja.
          </text>
        </g>

        {/* Bloque Central: Núcleo del Modelo */}
        <g filter="url(#shadow-soft)">
          <rect x="250" y="152" width="260" height="126" rx="30" fill={palette.surface} stroke={palette.gold} strokeWidth="3.6" />
          <text x="380" y="186" textAnchor="middle" fontSize="14" fontWeight="800" fill={palette.gold} letterSpacing="0.1em" textTransform="uppercase">
            Lectura Central
          </text>
          <text x="380" y="220" textAnchor="middle" fontSize="29" fontWeight="800" fill={palette.graphite}>
            Precio y Ajuste
          </text>
          <text x="380" y="248" textAnchor="middle" fontSize="16" fontWeight="600" fill={palette.textMuted} opacity="0.8">
            p(t) → Trayectoria Dinámica
          </text>
        </g>

        {/* Bloque: Resultados (Abajo) */}
        <g filter="url(#shadow-soft)">
          <rect x="210" y="334" width="340" height="92" rx="22" fill={palette.surface} stroke={palette.wine} strokeWidth="2.2" />
          <rect x="210" y="334" width="340" height="92" rx="22" fill="url(#grad-wine)" stroke="none" />
          <text x="380" y="362" textAnchor="middle" fontSize="12" fontWeight="800" fill={palette.wine} letterSpacing="0.08em" textTransform="uppercase">
            {balanceCard.title ?? 'Fines del Sistema'}
          </text>
          <text x="380" y="388" textAnchor="middle" fontSize="16" fontWeight="800" fill={palette.graphite}>
            La condición inicial fija el arranque,
          </text>
          <text x="380" y="410" textAnchor="middle" fontSize="16" fontWeight="800" fill={palette.graphite}>
            mientras el equilibrio fija el destino.
          </text>
        </g>
      </svg>
      <div className="concept-map-band">
        <article className="concept-map-band__item">
          <span>1</span>
          <div>
            <strong>Arranque</strong>
            <p>La condición inicial dice desde dónde comienza la trayectoria.</p>
          </div>
        </article>
        <article className="concept-map-band__item">
          <span>2</span>
          <div>
            <strong>Dirección</strong>
            <p>El signo del exceso de demanda indica si el precio sube o baja.</p>
          </div>
        </article>
        <article className="concept-map-band__item">
          <span>3</span>
          <div>
            <strong>Destino</strong>
            <p>El equilibrio marca el nivel hacia el que tiende el sistema.</p>
          </div>
        </article>
      </div>
    </div>
  );
}

function SummaryGridVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const cards = props?.cards ?? [];

  return (
    <VisualizationShell title={title} summary={summary}>
      <SummaryConceptMap palette={palette} cards={cards} />
      <div className="summary-grid">
        {cards.map((card) => (
          <article key={card.title} className="summary-card">
            <p className="prompt-label" style={{ color: palette.gold }}>
              {card.title}
            </p>
            <MathMarkdown content={card.content} className="rich-text" />
          </article>
        ))}
      </div>
      {props?.note ? (
        <div className="mini-note">
          {props.noteTitle ? <strong>{props.noteTitle}.</strong> : <strong>Lectura rápida.</strong>}{' '}
          <MathMarkdown content={props.note} className="rich-text rich-text--compact" />
        </div>
      ) : null}
    </VisualizationShell>
  );
}

function solveSecondOrderPrice({ a, b, c, p0, v0 }) {
  const equilibrium = c / b;
  const y0 = p0 - equilibrium;
  const discriminant = a * a - 4 * b;
  const sharedPrefix = `$$p^*=${formatNumber(equilibrium)}$$`;

  if (Math.abs(discriminant) < 1e-8) {
    const r = -a / 2;
    const c1 = y0;
    const c2 = v0 - r * c1;

    return {
      equilibrium,
      type: 'repeated',
      alpha: r,
      amplitude0: Math.abs(c1),
      rootMarkdown: `$$r=${formatNumber(r)}$$`,
      behavior: 'Ajuste crítico sin oscilación',
      equationMarkdown: `$$p''(t)+${formatNumber(a)}p'(t)+${formatNumber(b)}p(t)=${formatNumber(c)}$$`,
      solution: (t) => equilibrium + (c1 + c2 * t) * Math.exp(r * t),
      velocity: (t) => (c2 + r * (c1 + c2 * t)) * Math.exp(r * t),
      equilibriumMarkdown: sharedPrefix,
    };
  }

  if (discriminant > 0) {
    const root = Math.sqrt(discriminant);
    const r1 = (-a + root) / 2;
    const r2 = (-a - root) / 2;
    const c2 = (v0 - r1 * y0) / (r2 - r1);
    const c1 = y0 - c2;

    return {
      equilibrium,
      type: 'real',
      amplitude0: Math.abs(c1) + Math.abs(c2),
      rootMarkdown: `$$r_1=${formatNumber(r1)},\\qquad r_2=${formatNumber(r2)}$$`,
      behavior: 'Ajuste estable sin oscilación',
      equationMarkdown: `$$p''(t)+${formatNumber(a)}p'(t)+${formatNumber(b)}p(t)=${formatNumber(c)}$$`,
      solution: (t) => equilibrium + c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t),
      velocity: (t) => c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t),
      equilibriumMarkdown: sharedPrefix,
    };
  }

  const alpha = -a / 2;
  const beta = Math.sqrt(4 * b - a * a) / 2;
  const c1 = y0;
  const c2 = (v0 - alpha * c1) / beta;

  return {
    equilibrium,
    type: 'complex',
    alpha,
    beta,
    amplitude0: Math.sqrt(c1 * c1 + c2 * c2),
    rootMarkdown: `$$r=${formatNumber(alpha)}\\pm ${formatNumber(beta)}i$$`,
    behavior: 'Oscilación amortiguada',
    equationMarkdown: `$$p''(t)+${formatNumber(a)}p'(t)+${formatNumber(b)}p(t)=${formatNumber(c)}$$`,
    solution: (t) => equilibrium + Math.exp(alpha * t) * (c1 * Math.cos(beta * t) + c2 * Math.sin(beta * t)),
    velocity: (t) =>
      Math.exp(alpha * t) *
      (alpha * (c1 * Math.cos(beta * t) + c2 * Math.sin(beta * t)) - beta * c1 * Math.sin(beta * t) +
        beta * c2 * Math.cos(beta * t)),
    equilibriumMarkdown: sharedPrefix,
  };
}

function SecondOrderPriceVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const [view, setView] = useState('trayectoria');
  const cursor = useAnimatedCursor(props.tMax, props.tMax / 3);
  const solver = useMemo(() => solveSecondOrderPrice(props), [props.a, props.b, props.c, props.p0, props.v0]);
  const times = useMemo(() => range(0, props.tMax, 220), [props.tMax]);
  const prices = times.map((time) => solver.solution(time));
  const velocities = times.map((time) => solver.velocity(time));
  const activePrice = solver.solution(cursor.value);
  const activeVelocity = solver.velocity(cursor.value);
  const envelope = solver.type === 'complex' ? times.map((time) => solver.amplitude0 * Math.exp(solver.alpha * time)) : null;

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="controls-grid controls-grid--wide">
        <div className="toggle-row">
          <button
            type="button"
            className={view === 'trayectoria' ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setView('trayectoria')}
          >
            Trayectoria
          </button>
          <button
            type="button"
            className={view === 'fase' ? 'toggle-button is-active' : 'toggle-button'}
            onClick={() => setView('fase')}
          >
            Plano de fase
          </button>
          <button type="button" className="toggle-button" onClick={() => cursor.setPlaying(!cursor.playing)}>
            {cursor.playing ? 'Pausar' : 'Animar'}
          </button>
        </div>
        <Control
          label="Tiempo observado"
          value={cursor.value.toFixed(2)}
          min={0}
          max={props.tMax}
          step={0.05}
          onChange={cursor.setValue}
          hint="Mueve el cursor para seguir la trayectoria y ver el punto activo."
        />
      </div>
      <div className="chart-grid">
        <div className="plot-card">
          {view === 'trayectoria' ? (
            <PlotFigure
              data={[
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: times,
                  y: prices,
                  name: 'Precio',
                  line: { color: palette.navy, width: 3.2 },
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: [0, props.tMax],
                  y: [solver.equilibrium, solver.equilibrium],
                  name: 'Equilibrio',
                  line: { color: palette.wine, width: 2, dash: 'dash' },
                },
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [cursor.value],
                  y: [activePrice],
                  name: 'Punto activo',
                  marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
                },
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [0],
                  y: [props.p0],
                  name: 'Condición inicial',
                  marker: { size: 11, color: palette.wine, line: { color: palette.surface, width: 2 } },
                },
                ...(solver.type === 'complex'
                  ? [
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: times,
                        y: times.map((time, index) => solver.equilibrium + envelope[index]),
                        name: 'Banda superior',
                        line: { color: palette.accent, width: 1.8, dash: 'dot' },
                        hoverinfo: 'skip',
                      },
                      {
                        type: 'scatter',
                        mode: 'lines',
                        x: times,
                        y: times.map((time, index) => solver.equilibrium - envelope[index]),
                        name: 'Banda inferior',
                        line: { color: palette.accent, width: 1.8, dash: 'dot' },
                        hoverinfo: 'skip',
                      },
                    ]
                  : []),
              ]}
              layout={{
                xaxis: { title: 'Tiempo', gridcolor: palette.grid, color: palette.graphite },
                yaxis: { title: props.variableName ?? 'Precio', gridcolor: palette.grid, color: palette.graphite },
                legend: getBottomLegendLayout(),
                annotations: [
                  {
                    x: props.tMax * 0.92,
                    y: solver.equilibrium,
                    text: `p* = ${formatNumber(solver.equilibrium, 2)}`,
                    showarrow: false,
                    xanchor: 'right',
                    yanchor: 'bottom',
                    font: { color: palette.wine, size: 12 },
                  },
                ],
              }}
              theme={theme}
            />
          ) : (
            <PlotFigure
              data={[
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: prices,
                  y: velocities,
                  name: 'Plano de fase',
                  line: { color: palette.navy, width: 3.2 },
                },
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [solver.equilibrium],
                  y: [0],
                  name: 'Equilibrio',
                  marker: { size: 12, color: palette.wine, line: { color: palette.surface, width: 2 } },
                },
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [props.p0],
                  y: [props.v0],
                  name: 'Estado inicial',
                  marker: { size: 11, color: palette.accent, line: { color: palette.surface, width: 2 } },
                },
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [activePrice],
                  y: [activeVelocity],
                  name: 'Punto activo',
                  marker: { size: 12, color: palette.gold, line: { color: palette.surface, width: 2 } },
                },
              ]}
              layout={{
                xaxis: { title: props.variableName ?? 'Precio', gridcolor: palette.grid, color: palette.graphite },
                yaxis: { title: 'Velocidad', gridcolor: palette.grid, color: palette.graphite },
                legend: getBottomLegendLayout(),
              }}
              theme={theme}
            />
          )}
        </div>
        <div className="plot-card plot-card--info">
          <div className="summary-grid summary-grid--stacked">
            <article className="summary-card">
              <p className="prompt-label">Ecuación</p>
              <MathMarkdown content={solver.equationMarkdown} className="rich-text" />
            </article>
            <article className="summary-card">
              <p className="prompt-label">Equilibrio</p>
              <MathMarkdown content={solver.equilibriumMarkdown} className="rich-text" />
            </article>
            <article className="summary-card">
              <p className="prompt-label">Raíces</p>
              <MathMarkdown content={solver.rootMarkdown} className="rich-text" />
            </article>
            <article className="summary-card">
              <p className="prompt-label">Tipo de respuesta</p>
              <p className="rich-text">{solver.behavior}</p>
            </article>
            <article className="summary-card">
              <p className="prompt-label">Datos iniciales</p>
              <p className="rich-text">
                {`${props.variableName ?? 'Precio'}(0) = ${formatNumber(props.p0, 2)},  ${props.label ?? 'p'}'(0) = ${formatNumber(props.v0, 2)}`}
              </p>
            </article>
          </div>
        </div>
      </div>
      <div className="mini-note">
        <strong>Lectura actual.</strong> En {props.variableName?.toLowerCase() ?? 'precio'} = {formatNumber(activePrice, 2)}, la velocidad vale{' '}
        {formatNumber(activeVelocity, 2)} cuando el tiempo es {formatNumber(cursor.value, 2)}.{' '}
        {solver.type === 'complex'
          ? 'La banda punteada muestra cómo se reduce la amplitud de oscilación alrededor del equilibrio.'
          : 'La trayectoria converge al equilibrio sin oscilaciones sostenidas.'}
      </div>
    </VisualizationShell>
  );
}

function getAppliedSecondOrderInterpretation({ time, price, velocity, acceleration, distance, equilibrium }) {
  if (time <= 0.08) {
    return `El precio inicia en 4, por debajo del equilibrio ${formatNumber(equilibrium)}.`;
  }

  if (distance <= 0.04) {
    return 'El precio ya está prácticamente en equilibrio.';
  }

  if (distance <= 0.16 || Math.abs(velocity) <= 0.08) {
    return 'El sistema está muy cerca del equilibrio y la velocidad de ajuste ya es pequeña.';
  }

  if (price < equilibrium && velocity > 0 && acceleration > 0.06) {
    return 'El precio sigue por debajo del equilibrio y la corrección hacia arriba todavía gana impulso.';
  }

  if (price < equilibrium && velocity > 0) {
    return 'El precio se está corrigiendo hacia arriba.';
  }

  if (velocity > 0 && acceleration < 0) {
    return 'El precio aún sube, pero la velocidad se va frenando conforme se acerca al equilibrio.';
  }

  if (price > equilibrium && velocity < 0) {
    return 'El precio ya rebasó el equilibrio y ahora corrige hacia abajo.';
  }

  if (Math.abs(acceleration) <= 0.05) {
    return 'El ritmo del ajuste ya casi no cambia y la trayectoria se estabiliza.';
  }

  return 'La trayectoria mantiene el ajuste hacia el equilibrio.';
}

function SecondOrderAppliedVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const tMax = props?.tMax ?? 8;
  const equilibrium = props?.equilibrium ?? 6;
  const startValue = props?.startValue ?? 4;
  const initialDistance = Math.abs(startValue - equilibrium) || 1;
  const [timeValue, setTimeValue] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const times = useMemo(() => range(0, tMax, 260), [tMax]);
  const prices = useMemo(() => times.map((time) => -4 * Math.exp(-time) + 2 * Math.exp(-2 * time) + 6), [times]);

  useEffect(() => {
    if (!playing) {
      return undefined;
    }

    let frameId;
    let lastTime = performance.now();

    const step = (now) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;

      setTimeValue((previous) => {
        const next = previous + delta * speed;
        if (next >= tMax) {
          setPlaying(false);
          return tMax;
        }

        return next;
      });

      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [playing, speed, tMax]);

  const price = -4 * Math.exp(-timeValue) + 2 * Math.exp(-2 * timeValue) + 6;
  const velocity = 4 * Math.exp(-timeValue) - 4 * Math.exp(-2 * timeValue);
  const acceleration = -4 * Math.exp(-timeValue) + 8 * Math.exp(-2 * timeValue);
  const distance = Math.abs(price - equilibrium);
  const progress = clamp((1 - distance / initialDistance) * 100, 0, 100);
  const interpretation = getAppliedSecondOrderInterpretation({
    time: timeValue,
    price,
    velocity,
    acceleration,
    distance,
    equilibrium,
  });

  const handlePlay = () => {
    if (timeValue >= tMax) {
      setTimeValue(0);
    }
    setPlaying(true);
  };

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="mini-note">
        <strong>Qué estás observando.</strong> Esta tarjeta sigue el ejemplo resuelto
        {' '}
        <MathMarkdown content={'$p(t)=-4e^{-t}+2e^{-2t}+6$'} className="rich-text rich-text--compact" />
        {' '}
        y muestra cómo el precio pasa de 4 al equilibrio 6 mientras cambian su velocidad, su aceleración y la lectura económica.
      </div>
      <div className="controls-grid controls-grid--wide">
        <div className="toggle-row">
          <button type="button" className="toggle-button is-active" onClick={handlePlay}>
            Reproducir
          </button>
          <button type="button" className="toggle-button" onClick={() => setPlaying(false)}>
            Pausar
          </button>
          <button
            type="button"
            className="toggle-button"
            onClick={() => {
              setPlaying(false);
              setTimeValue(0);
            }}
          >
            Reiniciar
          </button>
        </div>
        <Control
          label="Tiempo"
          value={timeValue.toFixed(2)}
          min={0}
          max={tMax}
          step={0.01}
          onChange={(value) => {
            setPlaying(false);
            setTimeValue(value);
          }}
          hint="Mueve el deslizador para revisar la trayectoria a cualquier instante."
        />
        <Control
          label="Velocidad de animación"
          value={`${speed.toFixed(1)}x`}
          min={0.5}
          max={3}
          step={0.1}
          onChange={setSpeed}
          hint="Ajusta qué tan rápido avanza el punto móvil sobre la trayectoria."
        />
      </div>
      <div className="chart-grid">
        <div className="plot-card plot-card--wide">
          <PlotFigure
            data={[
              {
                type: 'scatter',
                mode: 'lines',
                x: times,
                y: prices,
                name: 'Trayectoria del precio',
                line: { color: palette.navy, width: 3.4 },
              },
              {
                type: 'scatter',
                mode: 'lines',
                x: [0, tMax],
                y: [equilibrium, equilibrium],
                name: 'Equilibrio',
                line: { color: palette.wine, width: 2.1, dash: 'dash' },
              },
              {
                type: 'scatter',
                mode: 'markers',
                x: [timeValue],
                y: [price],
                name: 'Punto móvil',
                marker: { size: 13, color: palette.gold, line: { color: palette.surface, width: 2 } },
              },
            ]}
            layout={{
              margin: { l: 52, r: 24, t: 24, b: 132 },
              xaxis: { title: 'Tiempo t', gridcolor: palette.grid, color: palette.graphite, range: [0, tMax] },
              yaxis: {
                title: 'Precio p(t)',
                gridcolor: palette.grid,
                color: palette.graphite,
                range: [Math.min(...prices) - 0.35, equilibrium + 0.8],
              },
              legend: getBottomLegendLayout(),
              annotations: [
                {
                  x: 0,
                  y: startValue,
                  text: 'Inicio',
                  showarrow: true,
                  arrowcolor: palette.wine,
                  ay: -36,
                  ax: 28,
                  bgcolor: palette.surface,
                  bordercolor: palette.border,
                  font: { color: palette.graphite, size: 12 },
                },
                {
                  x: tMax * 0.84,
                  y: equilibrium,
                  text: 'Equilibrio',
                  showarrow: false,
                  xanchor: 'left',
                  yanchor: 'bottom',
                  font: { color: palette.wine, size: 12 },
                },
              ],
            }}
            style={{ width: '100%', height: '430px' }}
            theme={theme}
          />
        </div>
        <div className="plot-card plot-card--info">
          <div className="summary-grid summary-grid--stacked">
            <article className="summary-card">
              <p className="prompt-label">Modelo observado</p>
              <MathMarkdown content={'$$p(t)=-4e^{-t}+2e^{-2t}+6$$'} className="rich-text" />
            </article>
            <div className="metric-grid">
              {[
                { label: 'Valor actual de $p(t)$', value: formatNumber(price, 3) },
                { label: 'Valor actual de $p\'(t)$', value: formatNumber(velocity, 3) },
                { label: 'Valor actual de $p\'\'(t)$', value: formatNumber(acceleration, 3) },
                { label: 'Distancia al equilibrio $|p(t)-6|$', value: formatNumber(distance, 3) },
              ].map((item) => (
                <article key={item.label} className="metric-card">
                  <MathMarkdown content={item.label} className="rich-text rich-text--compact metric-card__label" />
                  <strong className="metric-card__value">{item.value}</strong>
                </article>
              ))}
            </div>
            <article className="summary-card">
              <p className="prompt-label">Acercamiento al equilibrio</p>
              <div className="equilibrium-meter">
                <div className="equilibrium-meter__label">
                  <span>Progreso visual</span>
                  <strong>{formatNumber(progress, 1)}%</strong>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar__fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="equilibrium-meter__note">
                  La barra aumenta conforme la trayectoria reduce la brecha respecto a $p=6$.
                </p>
              </div>
            </article>
            <article className="summary-card interpretation-panel">
              <p className="prompt-label">Interpretación económica en tiempo real</p>
              <p>{interpretation}</p>
            </article>
          </div>
        </div>
      </div>
      <div className="mini-note mini-note--soft">
        <strong>Lectura actual.</strong> En
        {' '}
        <MathMarkdown content={`$t=${formatNumber(timeValue, 2)}$`} className="rich-text rich-text--compact" />
        {' '}
        el precio vale
        {' '}
        <MathMarkdown content={`$p(t)=${formatNumber(price, 2)}$`} className="rich-text rich-text--compact" />
        , con velocidad
        {' '}
        <MathMarkdown content={`$p'(t)=${formatNumber(velocity, 2)}$`} className="rich-text rich-text--compact" />
        {' '}
        y aceleración
        {' '}
        <MathMarkdown content={`$p''(t)=${formatNumber(acceleration, 2)}$`} className="rich-text rich-text--compact" />
        .
      </div>
    </VisualizationShell>
  );
}

function ModelComparisonVisualizer({ title, summary, props, theme }) {
  const palette = getPalette(theme);
  const left = props?.left ?? {};
  const right = props?.right ?? {};
  const rows = props?.rows ?? [];
  const derivedRows =
    rows.length > 0
      ? rows
      : [
          {
            label: 'Ecuación',
            left: "Primera derivada: velocidad de ajuste instantáneo.",
            right: "Segunda derivada + fricción: ajuste con memoria.",
          },
          {
            label: 'Forma de curva',
            left: 'Aproximación directa al equilibrio, sin rebotes.',
            right: 'Puede acercarse con rebotes amortiguados.',
          },
        ];

  return (
    <VisualizationShell title={title} summary={summary}>
      <div className="comparison-visual">
        <article className="comparison-track comparison-track--evans">
          <div className="comparison-track__head">
            <p className="eyebrow" style={{ color: palette.gold }}>
              {left.title}
            </p>
            <h5>{left.subtitle}</h5>
            <p>La respuesta depende del desequilibrio actual y corrige el precio sin memoria adicional.</p>
          </div>
          <svg
            viewBox="0 0 360 180"
            className="comparison-track__plot"
            role="img"
            aria-label="Trayectoria monotónica del modelo de Evans"
          >
            <line x1="44" y1="26" x2="44" y2="146" stroke={palette.graphite} strokeWidth="2.4" opacity="0.48" />
            <line x1="44" y1="146" x2="322" y2="146" stroke={palette.graphite} strokeWidth="2.4" opacity="0.48" />
            <line x1="44" y1="74" x2="322" y2="74" stroke={palette.gold} strokeWidth="2.2" strokeDasharray="8 8" opacity="0.9" />
            <path
              d="M52 132 C92 116 122 102 160 90 C198 80 236 75 316 74"
              fill="none"
              stroke={palette.navy}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="52" cy="132" r="6" fill={palette.gold} />
            <circle cx="316" cy="74" r="6" fill={palette.navy} />
            <text x="20" y="34" fontSize="13" fill={palette.textMuted}>
              p
            </text>
            <text x="309" y="168" fontSize="13" fill={palette.textMuted}>
              t
            </text>
            <text x="248" y="64" fontSize="13" fill={palette.gold}>
              Equilibrio
            </text>
          </svg>
          <div className="comparison-track__chips">
            <span className="comparison-chip">Una derivada</span>
            <span className="comparison-chip">Exceso actual</span>
            <span className="comparison-chip">Ajuste directo</span>
          </div>
        </article>
        <article className="comparison-track comparison-track--second">
          <div className="comparison-track__head">
            <p className="eyebrow" style={{ color: palette.accent }}>
              {right.title}
            </p>
            <h5>{right.subtitle}</h5>
            <p>La trayectoria toma en cuenta velocidad y aceleración, por eso puede amortiguarse o rebotar.</p>
          </div>
          <svg
            viewBox="0 0 360 180"
            className="comparison-track__plot"
            role="img"
            aria-label="Trayectoria oscilatoria amortiguada del modelo de segundo orden"
          >
            <line x1="44" y1="26" x2="44" y2="146" stroke={palette.graphite} strokeWidth="2.4" opacity="0.48" />
            <line x1="44" y1="146" x2="322" y2="146" stroke={palette.graphite} strokeWidth="2.4" opacity="0.48" />
            <line x1="44" y1="86" x2="322" y2="86" stroke={palette.accent} strokeWidth="2.2" strokeDasharray="8 8" opacity="0.9" />
            <path
              d="M52 134 C84 134 98 60 126 60 C150 60 160 124 188 124 C214 124 224 80 250 80 C270 80 280 98 316 89"
              fill="none"
              stroke={palette.wine}
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="52" cy="134" r="6" fill={palette.wine} />
            <circle cx="316" cy="89" r="6" fill={palette.accent} />
            <text x="20" y="34" fontSize="13" fill={palette.textMuted}>
              p
            </text>
            <text x="309" y="168" fontSize="13" fill={palette.textMuted}>
              t
            </text>
            <text x="238" y="76" fontSize="13" fill={palette.accent}>
              Equilibrio
            </text>
          </svg>
          <div className="comparison-track__chips">
            <span className="comparison-chip">Dos derivadas</span>
            <span className="comparison-chip">Memoria del ajuste</span>
            <span className="comparison-chip">Puede oscilar</span>
          </div>
        </article>
      </div>
      <div className="comparison-grid">
        <article className="comparison-card">
          <p className="eyebrow" style={{ color: palette.gold }}>
            {left.title}
          </p>
          <h5>{left.subtitle}</h5>
          <MathMarkdown content={left.equation ?? ''} className="rich-text" />
          <ul className="comparison-list">
            {(left.bullets ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
        <article className="comparison-card">
          <p className="eyebrow" style={{ color: palette.gold }}>
            {right.title}
          </p>
          <h5>{right.subtitle}</h5>
          <MathMarkdown content={right.equation ?? ''} className="rich-text" />
          <ul className="comparison-list">
            {(right.bullets ?? []).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
      <div className="comparison-strip">
        {derivedRows.map((row) => (
          <article key={row.label} className="comparison-strip__item">
            <p className="prompt-label">{row.label}</p>
            <p>
              <strong>Evans.</strong> {row.left}
            </p>
            <p>
              <strong>Segundo orden.</strong> {row.right}
            </p>
          </article>
        ))}
      </div>
      {props?.note ? (
        <div className="mini-note">
          {props.noteTitle ? <strong>{props.noteTitle}.</strong> : <strong>Lectura final.</strong>}{' '}
          <MathMarkdown content={props.note} className="rich-text rich-text--compact" />
        </div>
      ) : (
        <div className="mini-note">
          <strong>Lectura final.</strong> Evans conecta directamente el signo del exceso de demanda con la dirección del
          precio. El modelo de segundo orden agrega inercia y permite visualizar cuándo el sistema entra con rebotes y
          cuándo converge sin oscilación.
        </div>
      )}
    </VisualizationShell>
  );
}

function UnknownVisualizer({ type }) {
  return (
    <div className="visual-shell visual-shell--empty">
      <p className="eyebrow">Visualización no disponible</p>
      <h4>Tipo desconocido</h4>
      <p className="rich-text">
        No se encontró un visualizador para <code>{type}</code>. Revisa el valor de <code>visual.type</code>.
      </p>
    </div>
  );
}

export default function VisualizationPanel({ visual, theme = 'light' }) {
  if (!visual) {
    return null;
  }

  const { type, title, summary, props } = visual;

  switch (type) {
    case 'linearRelation':
      return <LinearRelationVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'rationalHole':
      return <RationalHoleVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'derivative':
      return <DerivativeVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'linearAutonomous':
      return <LinearAutonomousVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'separable':
      return <SeparableVisualizer title={title} summary={summary} theme={theme} />;
    case 'growthField':
      return <GrowthFieldVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'bernoulli':
      return <BernoulliVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'logistic':
      return <LogisticVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'summaryGrid':
      return <SummaryGridVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'secondOrderPrice':
      return <SecondOrderPriceVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'secondOrderApplied':
      return <SecondOrderAppliedVisualizer title={title} summary={summary} props={props} theme={theme} />;
    case 'modelComparison':
      return <ModelComparisonVisualizer title={title} summary={summary} props={props} theme={theme} />;
    default:
      return <UnknownVisualizer type={type} />;
  }
}
