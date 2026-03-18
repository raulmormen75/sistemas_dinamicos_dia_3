const md = (strings, ...values) =>
  String.raw(strings, ...values).replace(/\\\\/g, '\\');

export const courseMeta = {
  title: 'Lección de Evans y precio de segundo orden',
  subtitle: 'Ajuste de precios, equilibrio y estabilidad con ecuaciones diferenciales',
  footerText: 'Material de clase · Prof. Morales Mendoza Raúl',
};

export const introSection = {
  id: 'inicio',
  navLabel: 'Inicio',
  badge: 'Inicio',
  title: 'Lección de Evans y precio de segundo orden',
  usageIntro: md`
Esta lección está organizada para leerla de principio a fin o para saltar a cualquier bloque con la navegación lateral. Primero repasa las bases, luego resuelve el modelo de Evans y al final trabaja el modelo de segundo orden con una comparación directa.
`,
  guideItems: [
    {
      kind: 'repaso',
      title: 'Repaso previo',
      description: 'Resume precio, velocidad, aceleración, demanda, oferta, equilibrio y condición inicial.',
    },
    {
      kind: 'evans',
      title: 'Modelo de Evans',
      description: 'Muestra cómo el precio reacciona de inmediato al exceso de demanda.',
    },
    {
      kind: 'segundo',
      title: 'Segundo orden',
      description: 'Explica la inercia del precio, el equilibrio y las oscilaciones amortiguadas.',
    },
  ],
  usageNote: md`
Abre solo el desarrollo, el ejemplo o la visualización que necesites. La idea es mantener una lectura limpia y avanzar por secciones cortas.
`,
};

export const sections = [
  {
    id: 'repaso-previo',
    navLabel: 'Repaso previo',
    badge: 'Repaso',
    title: 'Bases para leer el modelo',
    meaning: md`
Antes de resolver el tema conviene fijar tres lecturas básicas:

- $p(t)$ es el precio en el tiempo $t$.
- $p'(t)$ es la velocidad con la que cambia el precio.
- $p''(t)$ es el cambio de esa velocidad.
`,
    economyUse: md`
La lógica económica también se resume en tres ideas:

- demanda: $D(p)=a-bp$
- oferta: $S(p)=c+dp$
- exceso de demanda: $E(p)=D(p)-S(p)$

Si $E(p)>0$, el precio tiende a subir. Si $E(p)<0$, tiende a bajar. Si $E(p)=0$, hay equilibrio.
`,
    explanationParts: [
      {
        title: 'Precio, velocidad y aceleración',
        content: md`
El precio describe el nivel del mercado. La derivada describe si ese nivel sube o baja. La segunda derivada indica si el cambio se acelera o se frena.
`,
      },
      {
        title: 'Demanda, oferta y exceso',
        content: md`
Cuando el precio sube, la demanda suele bajar y la oferta suele subir. Por eso se resta:

$$
E(p)=D(p)-S(p)
$$

Ese signo marca hacia dónde se mueve el precio.
`,
      },
      {
        title: 'Equilibrio y condición inicial',
        content: md`
El equilibrio $p^*$ cumple:

$$
D(p^*)=S(p^*)
$$

La condición inicial, por ejemplo $p(0)=4$, fija desde dónde empieza la trayectoria. No reemplaza al equilibrio.
`,
      },
    ],
    example: {
      number: 1,
      title: 'Lectura inicial de una trayectoria',
      statement: md`
Si se sabe que:

$$
p(0)=4,\qquad p'(0)=1
$$

interpreta qué dice cada dato.
`,
      ask: 'Identificar el punto de arranque y la dirección inicial del precio.',
      steps: [
        md`$$p(0)=4$$ significa que el precio inicia en $4$.`,
        md`$$p'(0)=1$$ significa que, al inicio, el precio sube.`,
        md`El equilibrio no se obtiene de los datos iniciales, sino del modelo.`,
      ],
      result: md`
El precio arranca en $4$ y comienza con tendencia ascendente.
`,
      interpretation: md`
Las condiciones iniciales solo fijan el punto de partida. El destino de largo plazo depende de la ecuación diferencial.
`,
      errors: [
        'Confundir condición inicial con equilibrio.',
        'Pensar que $p(0)$ ya es el precio de equilibrio.',
        "Olvidar que $p'(0)$ habla de velocidad, no de nivel.",
      ],
      visualPrompt: 'La visualización resume la lectura de p(t), p\'(t) y p\'\'(t) y la conecta con demanda, oferta y equilibrio.',
    },
    recap: md`
Primero se lee el nivel del precio, luego su cambio y al final la estabilidad del sistema.
`,
    visual: {
      type: 'summaryGrid',
      title: 'Mapa de conceptos',
      summary: md`
Este mapa junta las piezas que se usarán en toda la lección. Conviene tenerlo visible antes de pasar a los modelos de precio.
`,
      props: {
        cards: [
          {
            title: 'Precio y variación',
            content: md`
- $p(t)$: nivel del precio.
- $p'(t)$: velocidad del precio.
- $p''(t)$: aceleración del precio.
            `,
          },
          {
            title: 'Demanda y oferta',
            content: md`
- $D(p)=a-bp$
- $S(p)=c+dp$
- $E(p)=D(p)-S(p)$
            `,
          },
          {
            title: 'Equilibrio y signo',
            content: md`
- Si $E(p)>0$, el precio sube.
- Si $E(p)<0$, el precio baja.
- Si $E(p)=0$, el mercado está en equilibrio.
            `,
          },
        ],
        noteTitle: 'Lectura rápida',
        note: md`
La condición inicial fija el arranque. El equilibrio fija el nivel de largo plazo.
        `,
      },
    },
  },
  {
    id: 'modelo-evans',
    navLabel: 'Modelo de Evans',
    badge: 'Tema 1',
    title: 'Ajuste de precio por exceso de demanda',
    meaning: md`
El modelo de Evans dice que el precio cambia según el desequilibrio del mercado.

$$
p'(t)=k\big(D(p)-S(p)\big)
$$
`,
    economyUse: md`
Sirve para estudiar qué tan rápido se corrige un precio cuando la demanda supera a la oferta o cuando la oferta supera a la demanda.
`,
    explanationParts: [
      {
        title: 'Lectura económica',
        content: md`
Si $D(p)>S(p)$, entonces $p'(t)>0$ y el precio sube.  
Si $D(p)<S(p)$, entonces $p'(t)<0$ y el precio baja.
`,
      },
      {
        title: 'Sustitución con funciones lineales',
        content: md`
Si:

$$
D(p)=a-bp,\qquad S(p)=c+dp
$$

entonces:

$$
p'(t)=k\big(a-c-(b+d)p\big)
$$
`,
      },
      {
        title: 'Equilibrio',
        content: md`
El equilibrio sale de:

$$
a-c-(b+d)p=0
$$

por tanto:

$$
p^*=\frac{a-c}{b+d}
$$
`,
      },
    ],
    example: {
      number: 2,
      title: 'Ejemplo del profesor',
      statement: md`
Usa el modelo:

$$
D(p)=14-2p,\qquad S(p)=-4+p,\qquad p(0)=4
$$

y la regla:

$$
p'(t)=2\big(D(p)-S(p)\big)
$$
`,
      ask: 'Encontrar la trayectoria del precio y el precio de equilibrio.',
      steps: [
        md`$$p'(t)=2\big[(14-2p)-(-4+p)\big]$$`,
        md`$$p'(t)=2(18-3p)$$`,
        md`$$p'(t)=36-6p$$`,
        md`$$p'(t)+6p=36$$`,
        md`La solución general es $$p(t)=Ce^{-6t}+6$$`,
        md`Con $$p(0)=4$$ se obtiene $$C=-2$$`,
      ],
      result: md`
$$
p(t)=6-2e^{-6t}
$$
`,
      interpretation: md`
El precio inicia en $4$, que está por debajo del equilibrio, por eso sube rápido hasta acercarse a $6$.
`,
      errors: [
        'Cambiar mal los signos dentro de $D(p)-S(p)$.',
        'Olvidar multiplicar por $k=2$.',
        'Confundir el valor inicial con el equilibrio.',
        'No usar la condición inicial para fijar $C$.',
      ],
      visualPrompt: 'La curva arranca en 4, sube rápido y se aplana hacia 6.',
    },
    recap: md`
Cuando el precio inicia por debajo del equilibrio, el modelo lo empuja hacia arriba hasta estabilizarlo.
`,
    visual: {
      type: 'linearAutonomous',
      title: 'Trayectoria del precio en Evans',
      summary: md`
La ecuación ya quedó en forma lineal de primer orden. El equilibrio es $6$ y la curva parte de $4$.
`,
      props: {
        a: 36,
        b: 6,
        label: 'p',
        variableName: 'Precio',
        activeInitial: 4,
        initials: [2, 4, 5, 7, 9],
        xMin: 0,
        xMax: 10,
        tMax: 1.5,
      },
    },
  },
  {
    id: 'segundo-orden',
    navLabel: 'Segundo orden',
    badge: 'Tema 2',
    title: 'Precio con inercia y oscilación',
    meaning: md`
Aquí no solo importa el precio y su velocidad. También entra la aceleración.

$$
p''(t)+ap'(t)+bp(t)=c
$$
`,
    economyUse: md`
Este tipo de modelo sirve cuando el mercado no corrige de inmediato: hay retrasos, contratos, inventarios o memoria en la reacción del precio.
`,
    explanationParts: [
      {
        title: 'Equilibrio',
        content: md`
En equilibrio se anulan el cambio y la aceleración. Entonces:

$$
bp=c
$$

por lo que:

$$
p^*=\frac{c}{b}
$$
`,
      },
      {
        title: 'Parte homogénea',
        content: md`
La ecuación asociada es:

$$
r^2+ar+b=0
$$

Sus raíces indican si el ajuste será directo, repetido u oscilatorio.
`,
      },
      {
        title: 'Lectura del comportamiento',
        content: md`
- Dos raíces reales negativas: ajuste sin oscilación.
- Raíz doble negativa: ajuste crítico.
- Raíces complejas con parte real negativa: oscilación amortiguada.
`,
      },
    ],
    example: {
      number: 3,
      title: 'Ejemplo base',
      statement: md`
Resolver:

$$
p''(t)+5p'(t)+6p(t)=24,\qquad p(0)=1,\qquad p'(0)=0
$$
`,
      ask: 'Encontrar la trayectoria del precio y el equilibrio.',
      steps: [
        md`En equilibrio: $$6p=24\Rightarrow p^*=4$$`,
        md`La homogénea es $$p''+5p'+6p=0$$`,
        md`$$r^2+5r+6=(r+2)(r+3)=0$$`,
        md`$$p_h(t)=c_1e^{-2t}+c_2e^{-3t}$$`,
        md`Una particular constante es $$p_p(t)=4$$`,
        md`Con las condiciones iniciales se obtiene $$c_1=-9$$ y $$c_2=6$$`,
      ],
      result: md`
$$
p(t)=4-9e^{-2t}+6e^{-3t}
$$
`,
      interpretation: md`
El precio empieza en $1$, debajo del equilibrio, y sube hacia $4$ sin oscilar.
`,
      errors: [
        'Olvidar que el equilibrio se obtiene al anular $p\'$ y $p\'\'.$',
        'Resolver mal el polinomio característico.',
        'Perder una de las condiciones iniciales.',
        'No revisar el signo de la solución particular.',
      ],
      visualPrompt: 'La trayectoria sube hacia 4 sin cruzarlo y el plano de fase se cierra hacia el equilibrio.',
    },
    recap: md`
Cuando aparece $p''(t)$, el precio puede tardar más en acomodarse y, si las raíces son complejas, puede rebotar alrededor del equilibrio.
`,
    visual: {
      type: 'secondOrderPrice',
      title: 'Trayectoria del precio con memoria',
      summary: md`
En este caso el equilibrio es $4$ y el precio arranca en $1$. La respuesta es estable y no presenta oscilación.
`,
      props: {
        a: 5,
        b: 6,
        c: 24,
        p0: 1,
        v0: 0,
        tMax: 6,
        label: 'p',
        variableName: 'Precio',
      },
    },
  },
  {
    id: 'comparacion',
    navLabel: 'Comparación',
    badge: 'Comparación',
    title: 'Evans frente a segundo orden',
    meaning: md`
Los dos modelos hablan de precios, pero responden preguntas distintas.
`,
    economyUse: md`
Evans sirve cuando la reacción del mercado es inmediata. El modelo de segundo orden sirve cuando el ajuste tiene memoria, freno u oscilación.
`,
    explanationParts: [
      {
        title: 'Pregunta central',
        content: md`
- Evans: ¿qué pasa con el precio cuando hay exceso de demanda?
- Segundo orden: ¿cómo cambia la velocidad del precio cuando el ajuste tiene inercia?
`,
      },
      {
        title: 'Orden de la ecuación',
        content: md`
- Evans trabaja con $p'(t)$.
- Segundo orden trabaja con $p''(t)$ y $p'(t)$.
`,
      },
      {
        title: 'Lectura rápida',
        content: md`
- Evans: ajuste directo.
- Segundo orden: ajuste con memoria.
- Si hay rebotes, el segundo orden describe mejor la trayectoria.
`,
      },
    ],
    example: {
      number: 4,
      title: 'Comparación guiada',
      statement: md`
Compara estas dos ideas:

$$
p'(t)=k(D-S)
$$

y

$$
p''(t)+ap'(t)+bp(t)=c
$$
`,
      ask: 'Identificar qué pregunta responde cada modelo.',
      steps: [
        md`Evans responde al desequilibrio actual del mercado.`,
        md`El segundo orden responde además por la velocidad y la aceleración del ajuste.`,
        md`Si el precio rebota antes de estabilizarse, el segundo orden describe mejor el proceso.`,
      ],
      result: md`
Evans es más directo. El segundo orden incorpora inercia y puede producir oscilaciones amortiguadas.
`,
      interpretation: md`
La elección del modelo depende de la historia del mercado y del tipo de ajuste que se quiera describir.
`,
      errors: [
        'Tratar los dos modelos como si dijeran exactamente lo mismo.',
        'Usar Evans cuando el proceso claramente tiene inercia.',
        'Suponer oscilación solo porque la ecuación es de segundo orden.',
      ],
      visualPrompt: 'La comparación visual resume fórmula, pregunta central y tipo de comportamiento.',
    },
    recap: md`
Si el ajuste es inmediato, Evans basta. Si el precio tarda, rebota o se amortigua, conviene segundo orden.
`,
    visual: {
      type: 'modelComparison',
      title: 'Comparación directa',
      summary: md`
Esta vista pone juntos los dos modelos para que se vea de inmediato qué cambia en la ecuación, en la interpretación y en el comportamiento.
`,
      props: {
        left: {
          title: 'Modelo de Evans',
          subtitle: 'Ajuste inmediato',
          equation: md`$$p'(t)=k(D(p)-S(p))$$`,
          bullets: [
            md`Trabaja con una sola derivada.`,
            md`Responde al exceso de demanda.`,
            md`El precio sube o baja de inmediato.`,
          ],
        },
        right: {
          title: 'Segundo orden',
          subtitle: 'Ajuste con memoria',
          equation: md`$$p''(t)+ap'(t)+bp(t)=c$$`,
          bullets: [
            md`Trabaja con velocidad y aceleración.`,
            md`Puede tardar más en acomodarse.`,
            md`Puede oscilar alrededor del equilibrio.`,
          ],
        },
        rows: [
          {
            label: 'Pregunta central',
            left: '¿Qué dice el desequilibrio actual?',
            right: '¿Cómo cambia la velocidad del precio?',
          },
          {
            label: 'Equilibrio',
            left: '$D(p^*)=S(p^*)$',
            right: '$p^*=c/b$',
          },
          {
            label: 'Comportamiento',
            left: 'Ajuste directo',
            right: 'Ajuste con inercia y posible oscilación',
          },
        ],
        noteTitle: 'Lectura final',
        note: md`
Si hay reacción inmediata, Evans es suficiente. Si hay retraso, rebote o memoria del ajuste, conviene leer el segundo orden.
        `,
      },
    },
  },
];

export const exerciseGroups = [
  {
    id: 'practica',
    navLabel: 'Práctica',
    badge: 'Práctica',
    title: 'Práctica guiada',
    intro: md`
En esta parte están los seis casos trabajados en la clase. Los tres primeros pertenecen al modelo de Evans y los tres últimos al modelo de segundo orden.
`,
    exercises: [
      {
        id: 'evans-ejemplo',
        number: 1,
        type: 'Evans',
        title: 'Trayectoria del ejemplo del profesor',
        statement: md`
Usa:

$$
D(p)=14-2p,\qquad S(p)=-4+p,\qquad p(0)=4
$$

y

$$
p'(t)=2(D(p)-S(p))
$$
`,
        ask: 'Encontrar la trayectoria del precio y el precio de equilibrio.',
        steps: [
          md`$$p'(t)=2\big[(14-2p)-(-4+p)\big]$$`,
          md`$$p'(t)=2(18-3p)$$`,
          md`$$p'(t)=36-6p$$`,
          md`$$p'(t)+6p=36$$`,
          md`$$p_h(t)=Ce^{-6t}$$`,
          md`$$p_p(t)=6$$`,
          md`Con $$p(0)=4$$ se obtiene $$C=-2$$.`,
        ],
        result: md`
$$
p(t)=6-2e^{-6t}
$$
`,
        interpretation: md`
El precio arranca en $4$, sube rápido y se estabiliza en $6$.
`,
        errors: [
          'Olvidar cambiar el signo de la oferta.',
          'Perder el factor 2.',
          'Confundir el equilibrio con el valor inicial.',
        ],
        visualHint: 'La curva parte en 4, se eleva con rapidez y se pega a la recta de equilibrio $p=6$.',
        visual: {
          type: 'linearAutonomous',
          title: 'Trayectoria del ejemplo del profesor',
          summary: md`
El equilibrio es $6$ y el precio inicial es $4$. La curva sube con rapidez y luego se aplana.
`,
          props: {
            a: 36,
            b: 6,
            label: 'p',
            variableName: 'Precio',
            activeInitial: 4,
            initials: [2, 4, 5, 7, 9],
            xMin: 0,
            xMax: 10,
            tMax: 1.5,
          },
        },
      },
      {
        id: 'evans-ejercicio-1',
        number: 2,
        type: 'Evans',
        title: 'Primer ejercicio de Evans',
        statement: md`
Resolver:

$$
D(p)=20-p,\qquad S(p)=2+p,\qquad p(0)=12
$$

y

$$
p'(t)=3(D(p)-S(p))
$$
`,
        ask: 'Encontrar la trayectoria del precio y el precio de equilibrio.',
        steps: [
          md`$$p'(t)=3\big[(20-p)-(2+p)\big]$$`,
          md`$$p'(t)=3(18-2p)$$`,
          md`$$p'(t)=54-6p$$`,
          md`$$p'(t)+6p=54$$`,
          md`$$p_h(t)=Ce^{-6t}$$`,
          md`$$p_p(t)=9$$`,
          md`Con $$p(0)=12$$ se obtiene $$C=3$$.`,
        ],
        result: md`
$$
p(t)=9+3e^{-6t}
$$
`,
        interpretation: md`
El precio inicia arriba del equilibrio y desciende hacia $9$.
`,
        errors: [
          'Restar mal demanda y oferta.',
          'Olvidar el factor 3.',
          'No usar la condición inicial para fijar la constante.',
        ],
        visualHint: 'La trayectoria comienza en 12 y baja de forma suave hasta acercarse a 9.',
        visual: {
          type: 'linearAutonomous',
          title: 'Descenso del precio hacia el equilibrio',
          summary: md`
La trayectoria empieza arriba del equilibrio y se aproxima a $9$ con ajuste estable.
`,
          props: {
            a: 54,
            b: 6,
            label: 'p',
            variableName: 'Precio',
            activeInitial: 12,
            initials: [6, 9, 12, 15, 18],
            xMin: 0,
            xMax: 20,
            tMax: 1.5,
          },
        },
      },
      {
        id: 'evans-ejercicio-2',
        number: 3,
        type: 'Evans',
        title: 'Segundo ejercicio de Evans',
        statement: md`
Resolver:

$$
D(p)=30-2p,\qquad S(p)=6+p,\qquad p(0)=2
$$

y

$$
p'(t)=D(p)-S(p)
$$
`,
        ask: 'Encontrar la trayectoria del precio y el equilibrio.',
        steps: [
          md`$$p'(t)=(30-2p)-(6+p)$$`,
          md`$$p'(t)=24-3p$$`,
          md`$$p'(t)+3p=24$$`,
          md`$$p_h(t)=Ce^{-3t}$$`,
          md`$$p_p(t)=8$$`,
          md`Con $$p(0)=2$$ se obtiene $$C=-6$$.`,
        ],
        result: md`
$$
p(t)=8-6e^{-3t}
$$
`,
        interpretation: md`
El precio inicia por debajo del equilibrio y sube hasta aproximarse a $8$.
`,
        errors: [
          'Sacar mal el exceso de demanda.',
          'Olvidar que aquí no hay factor 3 adicional.',
          'Cambiar el signo de la constante al aplicar la condición inicial.',
        ],
        visualHint: 'La curva parte en 2, sube y se pega a la recta de equilibrio $p=8$.',
        visual: {
          type: 'linearAutonomous',
          title: 'Subida del precio hacia el equilibrio',
          summary: md`
La condición inicial está por debajo del equilibrio. La respuesta es estable y ascendente.
`,
          props: {
            a: 24,
            b: 3,
            label: 'p',
            variableName: 'Precio',
            activeInitial: 2,
            initials: [0, 2, 4, 8, 12],
            xMin: 0,
            xMax: 15,
            tMax: 2,
          },
        },
      },
      {
        id: 'segundo-orden-ejemplo',
        number: 4,
        type: 'Segundo orden',
        title: 'Ejemplo base de segundo orden',
        statement: md`
Resolver:

$$
p''(t)+5p'(t)+6p(t)=24,\qquad p(0)=1,\qquad p'(0)=0
$$
`,
        ask: 'Encontrar la trayectoria del precio y el equilibrio.',
        steps: [
          md`Equilibrio: $$6p=24\Rightarrow p^*=4$$`,
          md`$$p''+5p'+6p=0$$`,
          md`$$r^2+5r+6=(r+2)(r+3)=0$$`,
          md`$$p_h(t)=c_1e^{-2t}+c_2e^{-3t}$$`,
          md`$$p_p(t)=4$$`,
          md`Con las condiciones iniciales se obtiene $$c_1=-9$$ y $$c_2=6$$.`,
        ],
        result: md`
$$
p(t)=4-9e^{-2t}+6e^{-3t}
$$
`,
        interpretation: md`
El precio arranca en $1$ y sube hacia $4$ sin oscilación.
`,
        errors: [
          'Olvidar que el equilibrio se obtiene al anular $p\'$ y $p\'\'.$',
          'Resolver mal el polinomio característico.',
          'Perder una de las condiciones iniciales.',
        ],
        visualHint: 'La trayectoria sube hacia 4 y el plano de fase se cierra sin rebotes.',
        visual: {
          type: 'secondOrderPrice',
          title: 'Precio con memoria, sin oscilación',
          summary: md`
El equilibrio es $4$ y la respuesta es estable. El precio sube sin rebotar alrededor del equilibrio.
`,
          props: {
            a: 5,
            b: 6,
            c: 24,
            p0: 1,
            v0: 0,
            tMax: 6,
            label: 'p',
            variableName: 'Precio',
          },
        },
      },
      {
        id: 'segundo-orden-ejercicio-1',
        number: 5,
        type: 'Segundo orden',
        title: 'Primer ejercicio de segundo orden',
        statement: md`
Resolver:

$$
p''(t)+4p'(t)+4p(t)=20,\qquad p(0)=7,\qquad p'(0)=-2
$$
`,
        ask: 'Encontrar la trayectoria del precio y el equilibrio.',
        steps: [
          md`Equilibrio: $$4p=20\Rightarrow p^*=5$$`,
          md`$$p''+4p'+4p=0$$`,
          md`$$r^2+4r+4=(r+2)^2=0$$`,
          md`$$p_h(t)=(c_1+c_2t)e^{-2t}$$`,
          md`$$p_p(t)=5$$`,
          md`Con las condiciones iniciales se obtiene $$c_1=2$$ y $$c_2=2$$.`,
        ],
        result: md`
$$
p(t)=(2+2t)e^{-2t}+5
$$
`,
        interpretation: md`
El precio inicia arriba del equilibrio y baja hacia $5$ sin oscilar.
`,
        errors: [
          'Olvidar la raíz doble.',
          'Derivar mal el término $(c_1+c_2t)e^{-2t}$.',
          'Cambiar el signo al aplicar la condición inicial.',
        ],
        visualHint: 'La trayectoria desciende hacia 5 y el ajuste se apaga sin rebotes.',
        visual: {
          type: 'secondOrderPrice',
          title: 'Ajuste crítico del precio',
          summary: md`
La raíz doble mantiene la estabilidad, pero cambia la forma del acercamiento al equilibrio.
`,
          props: {
            a: 4,
            b: 4,
            c: 20,
            p0: 7,
            v0: -2,
            tMax: 6,
            label: 'p',
            variableName: 'Precio',
          },
        },
      },
      {
        id: 'segundo-orden-ejercicio-2',
        number: 6,
        type: 'Segundo orden',
        title: 'Segundo ejercicio de segundo orden',
        statement: md`
Resolver:

$$
p''(t)+2p'(t)+5p(t)=15,\qquad p(0)=4,\qquad p'(0)=1
$$
`,
        ask: 'Encontrar la trayectoria del precio y reconocer las oscilaciones.',
        steps: [
          md`Equilibrio: $$5p=15\Rightarrow p^*=3$$`,
          md`$$r^2+2r+5=0$$`,
          md`$$r=-1\pm 2i$$`,
          md`$$p_h(t)=e^{-t}(c_1\cos 2t+c_2\sin 2t)$$`,
          md`$$p_p(t)=3$$`,
          md`Con las condiciones iniciales se obtiene $$c_1=1$$ y $$c_2=1$$.`,
        ],
        result: md`
$$
p(t)=3+e^{-t}(\cos 2t+\sin 2t)
$$
`,
        interpretation: md`
El precio rebota alrededor de $3$ y cada rebote es menor que el anterior.
`,
        errors: [
          'Ignorar la parte imaginaria de las raíces.',
          'Olvidar el factor $e^{-t}$ que amortigua la oscilación.',
          'Perder el equilibrio al escribir la solución particular.',
        ],
        visualHint: 'La curva oscila alrededor de 3 y se va acercando al equilibrio con rebotes más pequeños.',
        visual: {
          type: 'secondOrderPrice',
          title: 'Oscilación amortiguada',
          summary: md`
La parte real negativa hace que la oscilación se apague con el tiempo.
`,
          props: {
            a: 2,
            b: 5,
            c: 15,
            p0: 4,
            v0: 1,
            tMax: 8,
            label: 'p',
            variableName: 'Precio',
          },
        },
      },
    ],
  },
];
