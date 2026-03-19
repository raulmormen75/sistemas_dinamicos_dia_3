const md = (strings, ...values) =>
  String.raw(strings, ...values).replace(/\\\\/g, '\\');

export const courseMeta = {
  title: 'Lección de Evans y precio de segundo orden',
  subtitle: 'Ajuste de precios, equilibrio y estabilidad con ecuaciones diferenciales',
  footerText: 'Material de clase · Prof. Morales Mendoza Raul',
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
        md`Primer dato: $$p(0)=4$$. Este valor fija el punto inicial de la trayectoria en el plano $(t,p)$.`,
        md`Si en cualquier solución de precio sustituimos $$t=0$$, el resultado debe ser 4 para cumplir la condición inicial.`,
        md`Segundo dato: $$p'(0)=1$$. Como la derivada es positiva, la curva inicia con pendiente ascendente.`,
        md`De forma local, eso implica que para valores pequeños de $$t>0$$ se espera $$p(t)>4$$.`,
        md`Estos datos no determinan el equilibrio. El equilibrio $$p^*$$ se obtiene de la ecuación del modelo, no de la condición inicial.`,
      ],
      result: md`
El precio arranca en $4$ y comienza con tendencia ascendente.
`,
      interpretation: md`
Las condiciones iniciales responden desde dónde y en qué dirección arranca el precio. El nivel al que converge depende de la estructura de la ecuación diferencial.
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
            title: 'Precio y Dinámica',
            content: md`
- **Nivel ($p$):** Posición actual del precio en el mercado.
- **Velocidad ($p'$):** Ritmo y dirección del ajuste instantáneo.
- **Inercia ($p''$):** Aceleración o freno de la tendencia actual.
            `,
          },
          {
            title: 'Señales de Mercado',
            content: md`
- **Demanda y Oferta:** Determinan las fuerzas opuestas.
- **Exceso ($E$):** La brecha que genera la presión del precio.
- **Respuesta:** Magnitud del ajuste según el desequilibrio.
            `,
          },
          {
            title: 'Estado del Sistema',
            content: md`
- **Arranque:** Definido por las condiciones iniciales.
- **Equilibrio ($p^*$):** El punto donde las fuerzas se anulan.
- **Estabilidad:** Capacidad del sistema para converger al destino.
            `,
          },
        ],
        noteTitle: 'Estrategia de lectura',
        note: md`
La **condición inicial** determina el punto de partida y la velocidad de arranque, mientras que el **equilibrio** define el nivel de largo plazo hacia el cual tiende el sistema.
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
        md`Sustitución directa:
$$
p'(t)=2\big[(14-2p)-(-4+p)\big]
$$`,
        md`Limpieza de signos en el corchete:
$$
(14-2p)-(-4+p)=14-2p+4-p=18-3p
$$`,
        md`Aplicación del factor de ajuste:
$$
p'(t)=2(18-3p)=36-6p
$$`,
        md`Reacomodo en forma lineal:
$$
p'(t)+6p=36
$$`,
        md`Homogénea asociada:
$$
p'_h+6p_h=0 \Rightarrow p_h(t)=Ce^{-6t}
$$`,
        md`Particular constante: proponemos $$p_p(t)=A$$.
Al sustituir:
$$
0+6A=36 \Rightarrow A=6
$$`,
        md`Solución general:
$$
p(t)=p_h(t)+p_p(t)=Ce^{-6t}+6
$$`,
        md`Condición inicial:
$$
p(0)=4 \Rightarrow 4=C+6 \Rightarrow C=-2
$$`,
        md`Trayectoria final:
$$
p(t)=6-2e^{-6t}
$$`,
      ],
      result: md`
$$
p(t)=6-2e^{-6t}
$$
`,
      interpretation: md`
El precio arranca en 4, por debajo del equilibrio. Por eso la curva sube con rapidez al inicio y después se aplana hasta converger de manera estable a 6.
`,
      errors: [
        'Cambiar mal los signos dentro de $D(p)-S(p)$.',
        'Olvidar multiplicar por $k=2$.',
        'Confundir el valor inicial con el equilibrio.',
        'No usar la condición inicial para fijar $C$.',
      ],
      visualPrompt: 'La gráfica debe mostrar inicio en 4, pendiente positiva alta al principio y convergencia monótona hacia la recta de equilibrio p=6.',
    },
    recap: md`
En Evans se ve toda la cadena matemática: sustitución, simplificación, homogénea, particular y condición inicial. Esa secuencia explica por qué la curva termina en el equilibrio que muestra la visualización.
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
        md`Equilibrio del sistema: en estado estacionario $$p''=0$$ y $$p'=0$$.
Entonces:
$$
6p=24 \Rightarrow p^*=4
$$`,
        md`Parte homogénea:
$$
p''+5p'+6p=0
$$
con polinomio característico
$$
r^2+5r+6=0
$$`,
        md`Factorización:
$$
r^2+5r+6=(r+2)(r+3)=0
$$
por lo tanto $$r_1=-2$$ y $$r_2=-3$$.`,
        md`Solución homogénea:
$$
p_h(t)=c_1e^{-2t}+c_2e^{-3t}
$$`,
        md`Particular constante: si $$p_p(t)=A$$, al sustituir en la ecuación completa:
$$
0+0+6A=24 \Rightarrow A=4
$$`,
        md`Solución general:
$$
p(t)=c_1e^{-2t}+c_2e^{-3t}+4
$$`,
        md`Con $$p(0)=1$$:
$$
c_1+c_2+4=1 \Rightarrow c_1+c_2=-3
$$`,
        md`Derivada para usar $$p'(0)=0$$:
$$
p'(t)=-2c_1e^{-2t}-3c_2e^{-3t}
$$
Luego:
$$
-2c_1-3c_2=0
$$`,
        md`Sistema lineal:
$$
\begin{cases}
c_1+c_2=-3\\
-2c_1-3c_2=0
\end{cases}
$$
De aquí se obtiene $$c_2=6$$ y $$c_1=-9$$.`,
        md`Trayectoria final:
$$
p(t)=4-9e^{-2t}+6e^{-3t}
$$`,
      ],
      result: md`
$$
p(t)=4-9e^{-2t}+6e^{-3t}
$$
`,
      interpretation: md`
El precio parte en 1 y se aproxima a 4 sin oscilaciones porque la homogénea tiene dos raíces reales negativas. La gráfica confirma un ajuste estable y amortiguado.
`,
      errors: [
        'Olvidar que el equilibrio se obtiene al anular $p\'$ y $p\'\'.$',
        'Resolver mal el polinomio característico.',
        'Perder una de las condiciones iniciales.',
        'No revisar el signo de la solución particular.',
      ],
      visualPrompt: 'La visualización debe reflejar convergencia estable a p=4, ascenso desde p(0)=1 y ausencia de rebotes persistentes en el plano de fase.',
    },
    recap: md`
Con segundo orden se separan equilibrio, homogénea y particular, y después se fijan constantes con dos condiciones iniciales. Esa ruta matemática permite explicar con precisión la forma de la curva.
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
        md`En Evans:
$$
p'(t)=k(D-S)
$$
la ecuación usa solo primera derivada. El signo de $$D-S$$ determina de inmediato si el precio sube o baja.`,
        md`En segundo orden:
$$
p''(t)+ap'(t)+bp(t)=c
$$
se añade aceleración, de modo que la trayectoria depende no solo del desequilibrio actual, sino también de la inercia del ajuste.`,
        md`Si la serie de precios muestra rebotes alrededor de un nivel de equilibrio, Evans suele quedarse corto porque no modela esa memoria dinámica.`,
        md`Si el ajuste es directo y sin rebotes, Evans es más simple y suele ser suficiente para interpretación básica.`,
      ],
      result: md`
Evans es más directo. El segundo orden incorpora inercia y puede producir oscilaciones amortiguadas.
`,
      interpretation: md`
La elección correcta del modelo debe apoyarse en la forma observada de la gráfica: convergencia directa sugiere Evans; ajuste con rebotes o amortiguamiento sugiere segundo orden.
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
          md`Sustitución:
$$
p'(t)=2\big[(14-2p)-(-4+p)\big]
$$`,
          md`Simplificación del corchete:
$$
(14-2p)-(-4+p)=14-2p+4-p=18-3p
$$`,
          md`Aplicación del factor de ajuste:
$$
p'(t)=2(18-3p)=36-6p
$$`,
          md`Reacomodo en forma lineal:
$$
p'(t)+6p=36
$$`,
          md`Ecuación homogénea:
$$
p'_h+6p_h=0 \Rightarrow p_h(t)=Ce^{-6t}
$$`,
          md`Particular constante:
$$
p_p(t)=A,\;6A=36\Rightarrow A=6
$$`,
          md`Solución general:
$$
p(t)=Ce^{-6t}+6
$$`,
          md`Condición inicial:
$$
p(0)=4\Rightarrow 4=C+6\Rightarrow C=-2
$$`,
          md`Resultado:
$$
p(t)=6-2e^{-6t},\qquad p^*=6
$$`,
        ],
        result: md`
$$
p(t)=6-2e^{-6t}
$$
`,
        interpretation: md`
El precio arranca en 4 y, al estar por debajo del equilibrio, la trayectoria sube con rapidez al inicio. Después la pendiente se reduce y la curva converge de forma estable hacia 6.
`,
        errors: [
          'Olvidar cambiar el signo de la oferta.',
          'Perder el factor 2.',
          'Confundir el equilibrio con el valor inicial.',
        ],
        visualHint: 'La gráfica debe mostrar un ascenso monótono desde 4 y una aproximación asintótica a la recta de equilibrio p=6.',
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
          md`Sustitución:
$$
p'(t)=3\big[(20-p)-(2+p)\big]
$$`,
          md`Simplificación del exceso de demanda:
$$
(20-p)-(2+p)=20-p-2-p=18-2p
$$`,
          md`Multiplicación por 3:
$$
p'(t)=3(18-2p)=54-6p
$$`,
          md`Reacomodo:
$$
p'(t)+6p=54
$$`,
          md`Homogénea:
$$
p'_h+6p_h=0\Rightarrow p_h(t)=Ce^{-6t}
$$`,
          md`Particular:
$$
p_p(t)=A,\;6A=54\Rightarrow A=9
$$`,
          md`General:
$$
p(t)=Ce^{-6t}+9
$$`,
          md`Condición inicial:
$$
p(0)=12\Rightarrow 12=C+9\Rightarrow C=3
$$`,
          md`Resultado:
$$
p(t)=9+3e^{-6t},\qquad p^*=9
$$`,
        ],
        result: md`
$$
p(t)=9+3e^{-6t}
$$
`,
        interpretation: md`
El precio comienza en 12, por encima de 9. Por eso la trayectoria desciende de manera estable y se acerca al equilibrio sin oscilaciones.
`,
        errors: [
          'Restar mal demanda y oferta.',
          'Olvidar el factor 3.',
          'No usar la condición inicial para fijar la constante.',
        ],
        visualHint: 'La visualización debe mostrar descenso monótono desde 12 y convergencia gradual a la línea horizontal p=9.',
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
          md`Sustitución:
$$
p'(t)=(30-2p)-(6+p)
$$`,
          md`Simplificación:
$$
30-2p-6-p=24-3p
$$`,
          md`Forma lineal:
$$
p'(t)+3p=24
$$`,
          md`Homogénea:
$$
p'_h+3p_h=0\Rightarrow p_h(t)=Ce^{-3t}
$$`,
          md`Particular:
$$
p_p(t)=A,\;3A=24\Rightarrow A=8
$$`,
          md`Solución general:
$$
p(t)=Ce^{-3t}+8
$$`,
          md`Condición inicial:
$$
p(0)=2\Rightarrow 2=C+8\Rightarrow C=-6
$$`,
          md`Resultado:
$$
p(t)=8-6e^{-3t},\qquad p^*=8
$$`,
        ],
        result: md`
$$
p(t)=8-6e^{-3t}
$$
`,
        interpretation: md`
El precio arranca en 2 y está por debajo del equilibrio. Por eso la trayectoria sube de forma estable hasta acercarse a 8.
`,
        errors: [
          'Sacar mal el exceso de demanda.',
          'Olvidar que aquí no hay factor 3 adicional.',
          'Cambiar el signo de la constante al aplicar la condición inicial.',
        ],
        visualHint: 'La curva debe iniciar en 2, mostrar pendiente positiva y aproximarse de manera asintótica a p=8.',
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
          md`Equilibrio:
$$
6p=24\Rightarrow p^*=4
$$`,
          md`Homogénea:
$$
p''+5p'+6p=0
$$
y polinomio característico:
$$
r^2+5r+6=0
$$`,
          md`Factorización:
$$
(r+2)(r+3)=0\Rightarrow r_1=-2,\;r_2=-3
$$`,
          md`Solución homogénea:
$$
p_h(t)=c_1e^{-2t}+c_2e^{-3t}
$$`,
          md`Particular:
$$
p_p(t)=A,\;6A=24\Rightarrow A=4
$$`,
          md`General:
$$
p(t)=c_1e^{-2t}+c_2e^{-3t}+4
$$`,
          md`Con $$p(0)=1$$:
$$
c_1+c_2+4=1\Rightarrow c_1+c_2=-3
$$`,
          md`Derivamos y usamos $$p'(0)=0$$:
$$
p'(t)=-2c_1e^{-2t}-3c_2e^{-3t}\Rightarrow -2c_1-3c_2=0
$$`,
          md`Sistema:
$$
\begin{cases}
c_1+c_2=-3\\
-2c_1-3c_2=0
\end{cases}
$$
de donde $$c_1=-9$$ y $$c_2=6$$.`,
          md`Resultado:
$$
p(t)=4-9e^{-2t}+6e^{-3t}
$$`,
        ],
        result: md`
$$
p(t)=4-9e^{-2t}+6e^{-3t}
$$
`,
        interpretation: md`
El precio parte en 1 y sube hacia 4 sin rebotes. Las raíces reales negativas explican la convergencia estable que se observa en la gráfica.
`,
        errors: [
          'Olvidar que el equilibrio se obtiene al anular $p\'$ y $p\'\'.$',
          'Resolver mal el polinomio característico.',
          'Perder una de las condiciones iniciales.',
        ],
        visualHint: 'La visualización debe confirmar convergencia a p=4 sin oscilaciones persistentes y con retrato de fase estable.',
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
          md`Equilibrio:
$$
4p=20\Rightarrow p^*=5
$$`,
          md`Parte homogénea:
$$
p''+4p'+4p=0
$$`,
          md`Característico:
$$
r^2+4r+4=(r+2)^2=0
$$
hay raíz doble $$r=-2$$.`,
          md`Con raíz doble:
$$
p_h(t)=(c_1+c_2t)e^{-2t}
$$`,
          md`Particular:
$$
p_p(t)=A,\;4A=20\Rightarrow A=5
$$`,
          md`General:
$$
p(t)=(c_1+c_2t)e^{-2t}+5
$$`,
          md`Con $$p(0)=7$$:
$$
7=c_1+5\Rightarrow c_1=2
$$`,
          md`Derivada:
$$
p'(t)=\big(c_2-2c_1-2c_2t\big)e^{-2t}
$$
Con $$p'(0)=-2$$:
$$
-2=c_2-2(2)\Rightarrow c_2=2
$$`,
          md`Resultado:
$$
p(t)=(2+2t)e^{-2t}+5
$$`,
        ],
        result: md`
$$
p(t)=(2+2t)e^{-2t}+5
$$
`,
        interpretation: md`
El precio inicia en 7 y desciende hacia 5. El término exponencial con raíz doble produce un ajuste estable, sin oscilación, y cada vez más lento.
`,
        errors: [
          'Olvidar la raíz doble.',
          'Derivar mal el término $(c_1+c_2t)e^{-2t}$.',
          'Cambiar el signo al aplicar la condición inicial.',
        ],
        visualHint: 'La gráfica debe mostrar caída desde 7 y aproximación suave a p=5 con pendiente decreciente.',
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
          md`Equilibrio:
$$
5p=15\Rightarrow p^*=3
$$`,
          md`Polinomio característico:
$$
r^2+2r+5=0
$$`,
          md`Raíces complejas:
$$
r=\frac{-2\pm\sqrt{4-20}}{2}=-1\pm2i
$$`,
          md`Homogénea real:
$$
p_h(t)=e^{-t}(c_1\cos 2t+c_2\sin 2t)
$$`,
          md`Particular:
$$
p_p(t)=A,\;5A=15\Rightarrow A=3
$$`,
          md`General:
$$
p(t)=3+e^{-t}(c_1\cos 2t+c_2\sin 2t)
$$`,
          md`Con $$p(0)=4$$:
$$
4=3+c_1\Rightarrow c_1=1
$$`,
          md`Derivamos para usar $$p'(0)=1$$:
$$
p'(t)=e^{-t}\big[(-c_1+2c_2)\cos 2t+(-c_2-2c_1)\sin 2t\big]
$$
Al evaluar en $$t=0$$:
$$
1=-c_1+2c_2=-1+2c_2\Rightarrow c_2=1
$$`,
          md`Resultado:
$$
p(t)=3+e^{-t}(\cos 2t+\sin 2t)
$$`,
        ],
        result: md`
$$
p(t)=3+e^{-t}(\cos 2t+\sin 2t)
$$
`,
        interpretation: md`
El precio oscila alrededor de 3 porque aparecen seno y coseno. La amplitud disminuye por el factor $$e^{-t}$$, así que cada rebote es menor que el anterior.
`,
        errors: [
          'Ignorar la parte imaginaria de las raíces.',
          'Olvidar el factor $e^{-t}$ que amortigua la oscilación.',
          'Perder el equilibrio al escribir la solución particular.',
        ],
        visualHint: 'La visualización debe mostrar cruces alrededor de p=3 y una envolvente decreciente que evidencie oscilación amortiguada.',
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
