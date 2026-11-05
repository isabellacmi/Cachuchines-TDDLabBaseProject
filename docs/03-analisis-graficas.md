# 03 — Análisis de gráficas y visualización por rama

**Responsable:** Henry — Integrante 3.
**Sprint:** 3. **Fecha de revisión:** 2 de noviembre de 2026.
**Objetivo:** determinar cómo afectan las ramas Git a las gráficas y estadísticas de TDDLab y proponer su consulta por rama, sin implementar cambios.

## 1. Alcance y evidencia

Se revisaron dos repositorios locales:

- **Proyecto base:** `Cachuchines-TDDLabBaseProject`, referencia inicial `a1adafd`. Contiene la aplicación de ejemplo, scripts de captura y hooks; no contiene el frontend ni el backend de la plataforma.
- **Plataforma:** carpeta vecina `TDDLab`, referencia `5066d4aa247e6f5139f1a897006dcfb8e1c8bb64`. Se inspeccionaron en modo de lectura `Web Ui/src/` y `server/src/`. Tenía una modificación previa en `server/package-lock.json`, ajena a este análisis.

La estructura real de la plataforma usa `Web Ui/` y `server/`, equivalentes al frontend y backend del esquema del sprint. El entregable se guarda en la estructura solicitada: `03-analisis-graficas.md`. No se reubican los documentos anteriores.

**Método:** inspección estática de componentes, adaptadores, rutas, repositorios, generadores de logs y configuración Git. Las conclusiones sobre merges son deducciones del código; no se presentan como un experimento ejecutado ni como observaciones de producción. No se ejecutaron pruebas, hooks, instalación, merges ni consultas remotas: esas acciones generarían datos innecesarios para esta revisión.

Los documentos existentes [02 — scripts y logs](02-analisis-scripts-logs.md) y [05 — arquitectura y backlog](../05-arquitectura-backlog.md) se usaron como contexto. Los experimentos descritos en el documento 02 pertenecen a ese análisis y no se repitieron aquí.

## 2. Resultado principal

**Las gráficas principales leen archivos de `main` y no ofrecen selección de rama.** No consultan automáticamente todas las ramas ni distinguen el origen de los registros que llegan a `main` después de una integración. La información de una rama de trabajo puede permanecer invisible hasta que sus logs se integren y publiquen en `main`.

Un filtro visual por sí solo no resuelve el problema: hoy no se transporta la rama en las consultas ni se registra su origen en los logs. También hay asociaciones por posición y criterios de color distintos entre vistas que pueden distorsionar una comparación.

## 3. Inventario de gráficas y vistas actuales

Rutas de esta sección relativas a `TDDLab/Web Ui/src/presentation/tdd-visualization/components/`.

| Vista / opción | Implementación | Datos y representación | Disponibilidad comprobada en código |
|---|---|---|---|
| Dashboard | `TDDBoard.tsx` | Burbujas: X = número de commit, Y = `test_count`, radio = `max(10, stats.total / 1.5)`; color según resultado, cobertura y mensaje. Incluye tres líneas y el ciclo de ejecuciones. | Caso `Dashboard` de `TDDLineChart`. |
| Total Número de Tests | `TDDLineChart.tsx` | Línea de `test_count` por posición del commit. | Selector principal y miniatura del dashboard. |
| Porcentaje de Cobertura de Código | `TDDLineChart.tsx` | Línea de `coverage` por commit. | Selector principal y miniatura. |
| Líneas de Código Modificadas | `TDDLineChart.tsx` | Línea de `stats.total` por commit. | Selector principal y miniatura. |
| Ciclo de ejecución de pruebas | `TDDCycleChart.tsx` | SVG con círculos apilados: cada círculo es una ejecución de la suite; verde si `failedTests === 0` y `success === true`, rojo en otro caso. Agrupa por orden de aparición de commits. | Selector principal y al pie del dashboard. |
| Lista de Commits | `TDDList.tsx`, `TDDCycleList.tsx`, `TDDCycleCard.tsx` | Vista de detalle de los commits, complementaria a las gráficas. | Caso `Lista`; vuelve a consultar commits. |
| Distribución de Commits | `Graficas-Adicionales/TDDPie.tsx` | Pastel de porcentajes categorizados por cobertura y palabra `refactor`. | Opción `Pie` del modo `aditionalgraph`. |
| Lista de Complejidad | Opción declarada en `TDDChart.tsx` | Existe en el selector adicional, pero no se encontró caso `Complejidad` en el switch de `TDDLineChart.tsx`. | Opción incompleta en este recorrido; no se confirma una gráfica funcional de complejidad. |
| Barras de ciclos | `Graficas-Adicionales/TDDBarCycle.tsx` | Porcentajes de `RojoVerde`, `Rojo`, `Verde` y `null`. | Componente existente; no conectado al switch revisado. No contarlo como opción activa confirmada. |

`TDDChart.tsx` separa opciones principales y adicionales por `typegraphs`. Si faltan logs, oculta Dashboard y Ciclo del menú. La selección de métrica se guarda globalmente en `localStorage.selectedMetric`, sin contexto de repositorio o rama.

## 4. De dónde obtienen sus datos

### 4.1 Flujo principal de lectura

1. `useTDDChartPage.ts` identifica propietario y repositorio; `tddVisualization.service.ts::fetchTDDVisualizationData` solicita logs, commits y ciclos en paralelo.
2. `CommitHistoryAdapter.obtainCommitsOfRepo(owner, repoName)` llama a `/TDDCycles/commits-history`.
3. La ruta y el controlador delegan al caso de uso y a `GithubRepository.getCommitHistoryData` del servidor. Este lee `https://raw.githubusercontent.com/{owner}/{repoName}/main/script/commit-history.json`, mapea los campos y ordena por fecha descendente.
4. `obtainCommitTddCycle` llama a `/TDDCycles/commit-cycles`. El backend usa el mismo archivo y toma `tdd_cycle`, con fallback a la cadena `"null"`. El generador actual del proyecto base no escribe `tdd_cycle`.
5. `obtainTDDLogs` lee directamente desde el navegador `https://raw.githubusercontent.com/{owner}/{repoName}/main/script/tdd_log.json`. Un 404 devuelve `[]`.
6. Los resultados llegan a `TDDChart`, `TDDLineChart` y `TDDBoard`. No hay parámetro de rama en este recorrido.

**Consecuencia:** los dos archivos se solicitan por separado a una referencia mutable (`main`). Una actualización entre respuestas podría producir una combinación de versiones; se propone resolver ambas lecturas a un mismo SHA.

### 4.2 Generación de los datos en el proyecto base

| Fuente | Generación | Campos relevantes |
|---|---|---|
| `../script/tdd_log.json` — ejecución | `npm test` → `../script/tddScript.js` → Jest → `script/report.json` | `numPassedTests`, `failedTests`, `numTotalTests`, `timestamp`, `success`, `testId`. |
| Mismo log — commit | `../script/commitScript.js`, desde `.husky/post-commit` | `commitId`, `commitName`, `commitTimestamp`, `testId`. |
| `../script/commit-history.json` | `../script/commit-tracker.js`, desde el mismo hook; ejecuta Jest nuevamente con cobertura | `sha`, `commit.date/message/url`, `stats.total/additions/deletions`, `coverage`, `test_count`, `failed_tests`, `conclusion`. |

El hook agrega los logs y realiza `git commit --amend --no-edit`. Por ello se usa el marcador `HEAD` y en la siguiente captura se reemplaza el primer marcador encontrado por `HEAD~1`. No se registra `branch`, identificador único de ejecución ni padres del commit en estos JSON.

La cobertura del tracker es de **sentencias**: calcula sentencias cubiertas sobre el total de sentencias. El número de pruebas del commit procede de una ejecución adicional, y puede diferir de las ejecuciones intermedias del log. Una ejecución de suite no equivale a una prueba individual.

### 4.3 Otros caminos que no deben confundirse con el principal

`GithubRepository` conserva métodos que consultan commits, comentarios y ejecuciones de GitHub Actions; la consulta de commits usa `per_page: 100` sin `sha` explícito. Esto no significa que las líneas del dashboard actual se alimenten de esos comentarios: el adaptador revisado utiliza `/commits-history` y los JSON.

El dashboard consulta `/TDDCycles/commit-timeline?sha=...&repoName=...&owner=...` al seleccionar una burbuja. El caso de uso del servidor consulta ejecuciones en base de datos, pero el frontend descarta el cuerpo recibido y prepara el detalle a partir del log local cargado y sus índices. La existencia de ese endpoint no garantiza una asociación correcta por SHA en el modal.

El workflow del proyecto base solo dispara `push` en `main` y `pull_request` hacia `main` o `master`. Esto limita la disponibilidad de datos de CI en ramas, aunque la fuente principal del dashboard son los JSON generados por los hooks.

## 5. Cómo se representan commits y resultados

### 5.1 Orden, identidad y detalle

- El backend ordena el historial de commits de más reciente a más antiguo. Las líneas y burbujas invierten los valores para mostrarlos del más antiguo al más reciente y rotulan `Commit 1`, `Commit 2`, etc.
- Esa numeración es una posición de visualización, no una identidad Git ni una relación de ancestros. Al cambiar el conjunto de registros cambia su significado.
- Las líneas incluyen mensaje, cambios, fecha y cobertura en tooltips; el clic abre el enlace del commit. `HEAD` es una referencia mutable: el último registro todavía no identifica un SHA inmutable.
- `TDDCycleChart` recorre el log e incrementa un contador cuando encuentra un commit. No une por `testId` ni SHA. El resumen llamado “Total de commits” cuenta grupos que tienen ejecuciones, no necesariamente todos los commits del historial.
- `TDDBoard.preprocessTDDLogs` guarda las pruebas posteriores a un marcador junto a ese marcador y busca por `commitIndex`. En cambio, el generador escribe pruebas antes del commit que cierra su grupo. Las pruebas anteriores al primer marcador no quedan asociadas por esa función. Es una inconsistencia detectable por lectura que requiere validación funcional posterior.

### 5.2 Significado de colores y magnitudes

| Vista | Regla observada | Riesgo interpretativo |
|---|---|---|
| Líneas | Sin cobertura → negro; sin tests, cobertura cero o `conclusion: failure` → rojo; resto verde o azul por `refactor`, con opacidad según cobertura. | Color mezcla resultado, cobertura e intención del mensaje. |
| Dashboard | Similar, pero no incluye cobertura cero como condición independiente de rojo. | Un mismo registro puede tener color distinto al de la línea. |
| Pastel | Cobertura presente → verde o azul; sin cobertura → rojo o azul según `refactor`; el contador negro nunca aumenta. | Cobertura presente, incluso cero, no demuestra éxito; no usa `conclusion` para clasificar. |
| Ciclo | Cada ejecución es verde solo con éxito y cero fallos. | Describe ejecuciones, no verifica por sí solo un ciclo TDD completo ni refactorización. |

`TDDChart.tsx` modifica directamente `commit.stats.total`: cuando supera 100 lo reemplaza por **50**. Esto afecta líneas, burbujas y tooltips que reutilizan el objeto; no es únicamente un límite del dibujo. Asimismo, algunos recorridos convierten cobertura ausente en cero. Antes de comparar ramas conviene preservar los valores originales y distinguir “sin dato” de “0 %”.

## 6. ¿Se mezclan datos de diferentes ramas?

**No se consulta una unión de todas las ramas. Sí puede haber registros de orígenes distintos en el archivo leído de `main`, sin posibilidad de separarlos por origen.**

| Situación | Resultado deducido del código |
|---|---|
| Commits y pruebas solo en `feature/x`, sin integrar | No aparecen en las vistas que leen `main`, aunque estén publicados en la rama remota. |
| Cambio de rama con logs versionados y árbol limpio | Git presenta la versión de archivos de esa rama; no hay una base global que una todo automáticamente. |
| Ejecuciones sin commit que Git permite trasladar a otra rama | Pueden terminar registradas en otra rama sin conservar su origen. Git también puede bloquear el cambio si sobrescribe archivos modificados. |
| Logs de dos ramas conservados al resolver un merge | El archivo final puede incluir ambos conjuntos; el frontend los trata como una sola secuencia. |
| Logs históricos anteriores a la creación de una rama | Son ancestros compartidos, no duplicados por el mero hecho de ser visibles desde varias ramas. |
| Dos ramas generan el mismo `testId` o contienen marcadores `HEAD` | No existe identidad suficiente para desambiguar solo por esos campos; una asociación por posición puede ser incorrecta. |

Es necesario separar dos conceptos: **rama de ejecución** (dónde se produjo el evento) y **pertenencia actual** (desde qué ramas es alcanzable un commit). Un commit puede pertenecer a varias historias; su SHA no permite reconstruir de forma general la rama original. Para registros antiguos debe mostrarse “origen desconocido”, sin inventar una rama.

## 7. Qué puede pasar después de un merge

| Operación / resultado | Efecto esperado sobre la visualización tras publicar en `main` |
|---|---|
| Fast-forward | Se lee la versión del log incorporada. Pueden aparecer registros nuevos, sin distinguir la rama donde se originaron. |
| Merge con commit de integración | Si los archivos finales conservan eventos de ambos lados, se dibujan juntos. No hay carriles por rama ni indicación de padres/merge. El tracker calcula cambios frente al primer padre, no cambios exclusivos nuevos del equipo. |
| Conflicto en los JSON | No se garantiza una unión semántica. Elegir un lado puede descartar eventos; dejar marcadores o JSON inválido impide su lectura correcta. `-diff` en `.gitattributes` no implementa una unión de registros. |
| Squash merge | Los SHA originales pueden desaparecer de la historia destino mientras sobreviven dentro del log copiado. No debe suponerse correspondencia uno a uno entre registro y commit alcanzable. |
| Merge realizado en GitHub | Los hooks locales del proyecto base no corren allí. El commit de integración no queda registrado automáticamente por esos hooks; el workflow no sustituye la escritura de los JSON. |

Después de un merge, `findIndex` solo corrige el primer `HEAD` usando el primer padre (`HEAD~1`); si hay marcadores de ambos lados, no puede resolverlos de manera fiable. El problema se propaga a enlaces y detalle de las gráficas.

La línea de cambios por commit tampoco equivale a esfuerzo total: sumar cambios de commits de feature y cambios del merge frente al primer padre puede contar de nuevo parte de las mismas líneas. Una comparación debe mostrar por separado el commit de integración.

**Límite de esta verificación:** se comprobó la lógica de lectura y captura; el contenido concreto conservado después de un merge depende de los archivos y de la resolución de conflictos. No se afirma que todos los merges pierdan o dupliquen datos.

## 8. Cambios necesarios propuestos, sin implementación

| Capa | Cambio propuesto | Motivo |
|---|---|---|
| Captura | Registrar rama de ejecución, `runId` único, contexto de trabajo y referencia al commit base; capturar padres para eventos de commit cuando corresponda. | Distinguir origen y evitar colisiones de `testId`. Una prueba con cambios sin commit describe un árbol de trabajo, no necesariamente el contenido exacto del SHA base. |
| Identidad | Resolver el SHA final pese al amend; conservar eventos inmutables y validar relaciones. Tratar `HEAD` como pendiente hasta resolverlo. | No presentar como identidad definitiva un marcador mutable ni resolver todos los eventos con el primer padre. |
| Integración de logs | Definir unión por identificadores, validación de esquema y manejo explícito de conflictos. | Evitar que el orden textual o elegir un lado del merge determine silenciosamente las estadísticas. |
| Backend | Listar ramas; aceptar rama/ref en historial, ciclos y detalle; resolver el tip de cada rama y leer ambos logs desde ese SHA. | Mantener una instantánea consistente y soportar ramas con `/`, sin concatenaciones ambiguas de URL. |
| Contratos | Transportar repositorio, rama consultada, SHA de instantánea, origen conocido/desconocido y procedencia de métricas. | Distinguir lo observado de lo inferido y detectar datos incompletos. |
| Frontend | Extender puertos, casos de uso, servicio, hook y vistas con el contexto de rama. Incluirlo en claves de caché y navegación. | Evitar que el dashboard, la lista y el modal consulten contextos diferentes. |
| Asociación | Reemplazar índices por SHA final e identificadores de ejecución; conservar referencias pendientes sin atribuirlas a otro commit. | Un filtro, merge o cambio de orden no debe reasignar pruebas. |
| Métricas | Preservar datos originales, separar cero de ausencia y unificar reglas de clasificación entre vistas. | Comparaciones fiables; limitar visualmente el radio sin cambiar `stats.total`. |
| Git / CI | Revisar cobertura de ramas del workflow si se mostrarán resultados de Actions y distinguir esos resultados de la ejecución local del tracker. | La ausencia de un run de CI no significa fallo de pruebas. |

No se define una migración de base de datos en este entregable. El diseño físico y contrato definitivo se coordinan con Lucas (04); la estrategia de captura y unión, con Carlos (02); el alcance e integración, con Isabella (05).

### 8.1 Compatibilidad

- Mantener el comportamiento existente para clientes sin parámetro de rama durante la transición: actualmente leen `main`. Adoptar la rama predeterminada real del repositorio es una mejora distinta que debe acordarse y probarse.
- Una rama explícita inexistente debe devolver un error claro, sin sustituirla silenciosamente por `main`.
- Logs antiguos siguen siendo legibles. La referencia desde la que se descargan es conocida; su **rama de ejecución** puede ser desconocida. No rellenar ese dato con la rama consultada.
- Si falta `commit-history.json` o `tdd_log.json`, mostrar qué archivo falta. No representar ausencia como cero tests o cero cobertura.
- Los nuevos controles pueden activarse gradualmente con un flag. Una sola rama debe seguir siendo un caso simple.

## 9. Filtros y reglas de consulta

### 9.1 Tres modos

| Modo | Controles | Qué muestra | Regla de conteo |
|---|---|---|---|
| Una rama | Selector de rama y métrica. | Instantánea de los logs de esa rama, con indicador de origen cuando esté disponible. | Un registro válido por identidad; advertir registros no reconciliados con la historia Git. |
| Todas las ramas | Ramas incluidas y métrica. | Paneles o carriles por rama, con resumen global de eventos únicos. | Commits compartidos se cuentan una vez por `(repositorio, SHA)` en el global y se señalan en cada rama. Ejecuciones se deduplican por `runId`, no por `testId`. |
| Comparar ramas | Dos ramas inicialmente; perspectiva completa o desde ancestro común. | Paneles alineados con misma escala, valores por rama y diferencias. | Cada panel conserva su historia; mostrar comunes/exclusivos sin sumar los totales como si fueran disjuntos. |

Para logs antiguos sin `runId`, la deduplicación de ejecuciones entre ramas no es fiable. Mostrar “total global no disponible para registros sin identidad” o separar datos identificados y heredados; no eliminar por coincidencia de fecha y contador.

**Filtros complementarios:** rango temporal (zona horaria visible), autor, estado (éxito, fallo, sin datos, pendiente) e inclusión de commits de merge. Deben aplicarse al mismo conjunto de datos en gráficos, totales y detalle. El rango temporal usa fecha de commit para commits y fecha de ejecución para ejecuciones, indicándolo en la vista.

### 9.2 Semántica para comparar

- El modo inicial consulta la historia completa de cada rama. “Desde ancestro común” excluye el tramo compartido y permite comparar trabajo exclusivo; no debe presentarse como el mismo cálculo.
- Eje por fecha para alinear eventos entre ramas; eje ordinal opcional rotulado “secuencia local de la rama”. `Commit 3` de dos ramas no representa el mismo commit.
- Cobertura: mostrar valor del último resultado válido dentro del período por rama y su SHA; diferencia en **puntos porcentuales**, no sumar porcentajes ni hacer promedio sin denominadores compatibles.
- Tests: distinguir cantidad de pruebas de una suite en un commit, número de ejecuciones y número de fallos. No sumar tamaños de suites repetidas como “tests únicos”.
- Líneas: comparar cambios por commit, con merges separados o excluidos por defecto de la suma de actividad. No interpretar la suma como tamaño final del código ni esfuerzo.
- Distribución: categorías mutuamente excluyentes con una regla compartida y explícita. Propuesta: fallo, éxito sin marca de refactor, éxito con marca de refactor, sin resultado. La marca del mensaje no demuestra refactorización ni cumplimiento completo de TDD.
- Si una rama se elimina, solo se puede seguir consultando su contexto histórico si previamente se conservó una instantánea accesible; listar ramas actuales no reconstruye ramas borradas.

## 10. Propuesta visual

Boceto de estructura, sin implementación ni datos reales. Se conserva el selector actual de métricas y se añade el contexto de ramas encima para estudiantes y docentes. La finalidad es consultar y comparar, sin controles que modifiquen Git.

### 10.1 Una rama

```text
Tarea: [repositorio]                          Autor: [estudiante]

Modo: [Una rama v]   Rama: [feature/login v]
Métrica: [Cobertura de código v]   Período: [Desde] [Hasta]
                                               [Consultar]

Consultando: feature/login · Instantánea: [SHA corto]
Última ejecución: [fecha y zona] · Datos: [completos / parciales]

[Commits únicos]   [Ejecuciones]   [Cobertura del último resultado]

Cobertura (%)
  |
  |          o--------o
  |    o-----o
  +-------------------------------------- Fecha

Detalle: [SHA] [fecha] [resultado] [cobertura] [abrir commit]
Origen de ejecución: [rama / desconocido]
```

Los puntos indican resultados disponibles; una ausencia deja un hueco y una etiqueta “Sin dato”. No se dibuja cero para suplirla. El tooltip muestra rama consultada, SHA, fecha, resultado y origen de la métrica. El detalle de pruebas se obtiene por identidad y conserva el mismo contexto.

### 10.2 Todas las ramas

```text
Modo: [Todas las ramas v]   Métrica: [Ciclo de ejecuciones v]
Ramas: [main] [feature/login] [feature/pago]      [Consultar]

Resumen global: [commits únicos] [ejecuciones identificadas]
Aviso: los eventos compartidos cuentan una vez en el resumen.

main           | [éxito A] [fallo B]              [merge M]
feature/login  | [común A]       [éxito C] [éxito D]
feature/pago   | [común A]       [fallo E]
               +---------------------------------- Fecha

Leyenda: resultado por texto y símbolo; comunes y merges rotulados.
```

Los carriles evitan unir una ejecución de una rama con otra mediante una línea única. Un commit compartido puede aparecer en varios carriles, con la misma identidad visible. Las métricas de commits se muestran como paneles por rama; el resumen global distingue eventos únicos y pertenencias.

### 10.3 Comparar ramas

```text
Modo: [Comparar ramas v]
Rama A: [main v]              Rama B: [feature/login v]
Historia: [Desde ancestro común v]
Métrica: [Cobertura de código v]                  [Comparar]

main · [SHA A]                 feature/login · [SHA B]
Cobertura (%)                  Cobertura (%)
100 |                          100 |
    |   o---o                      |   o-----o
  0 +------------ Fecha          0 +------------ Fecha

                 MISMO PERÍODO Y MISMA ESCALA

Indicador           Rama A          Rama B         Diferencia
Cobertura final     [valor o N/D]   [valor o N/D]   [puntos]
Commits exclusivos  [cantidad]      [cantidad]      [cantidad]
Ejecuciones         [cantidad]      [cantidad]      [cantidad]

[Ver commits comunes]  [Ver merges]  [Ver datos incompletos]
```

La rama se identifica mediante encabezado y etiqueta; el resultado mantiene texto y símbolo además del color. Evitar reutilizar rojo/verde/azul para identificar ramas, pues ya comunican estados. La escala de cobertura permanece de 0 a 100 % en ambos paneles. En pantalla pequeña los paneles se apilan y conservan filtros, leyenda y escala.

### 10.4 Estados y comportamiento

| Estado | Mensaje / comportamiento propuesto |
|---|---|
| Carga | Mostrar qué ramas se están consultando; no mezclar tarjetas antiguas con una gráfica nueva. Descartar respuestas obsoletas si cambia la consulta. |
| Rama sin ejecuciones | “No hay ejecuciones registradas en esta rama para el período seleccionado”. Permitir ampliar el período. |
| Log ausente | “Esta rama no contiene script/tdd_log.json”; conservar métricas del historial si están disponibles y advertir la limitación. |
| Rama inexistente | “La rama seleccionada ya no está disponible”. Permitir elegir otra, sin fallback silencioso. |
| JSON inválido | Identificar archivo y rama; no dibujar resultados parciales como si fueran completos. |
| Error de red o permisos | Mensaje específico y acción Reintentar. En comparación, marcar el panel afectado y suspender las diferencias que dependan de él. |
| Origen desconocido / HEAD pendiente | Etiquetas explícitas y exclusión de comparaciones que requieran identidad confirmada. |

Controles con etiquetas, uso por teclado y foco visible; una tabla de datos equivalente acompaña las gráficas para lectura accesible. La acción Consultar aplica juntos los filtros y actualiza el contexto en la URL. La navegación docente entre estudiantes mantiene el modo elegido, pero vuelve a validar la rama en cada repositorio.

## 11. Verificación sugerida para una implementación futura

Estos son **casos propuestos, no pruebas ejecutadas en esta revisión**. Deben realizarse en un repositorio de ensayo aislado.

| Caso | Criterio observable |
|---|---|
| Una rama y consulta sin filtro | El comportamiento previo se conserva; cada valor coincide con el JSON de referencia. |
| Rama feature con pruebas aún no integradas | Se ve al seleccionar esa rama y no aparece como evento exclusivo de `main`. |
| Ancestros compartidos entre dos ramas | Cada panel puede mostrarlos, pero el total global los cuenta una vez. |
| Igual `testId` en dos ramas | Las ejecuciones no se cruzan; se usa identidad de evento y contexto. |
| Merge normal / fast-forward | Datos conservados según la política de unión; integración señalada; ningún cambio de asociación por reordenamiento. |
| Squash o JSON conflictivo | Se señalan referencias no alcanzables o errores; no se inventa correspondencia con otro SHA. |
| Rama con `/`, sin logs o eliminada | Consulta correctamente codificada y estado explícito en cada caso. |
| Cobertura cero, cobertura ausente y pruebas fallidas | Estados diferentes; clasificación consistente entre pastel, líneas y dashboard. |
| Commit con más de 100 líneas modificadas | La tabla y el tooltip conservan el valor original aunque se limite el radio visual. |
| Cambio rápido de rama y actualización remota | Ambos archivos pertenecen al SHA de la consulta; una respuesta anterior no reemplaza la actual. |
| Comparación con un panel fallido | No se calcula una diferencia usando cero en lugar del dato faltante. |

## 12. Trazabilidad y coordinación

| Tarea del integrante 3 | Sección |
|---|---|
| Identificar gráficas disponibles | 3 |
| Investigar origen de datos | 4 |
| Analizar representación de commits y pruebas | 5 |
| Verificar mezcla de ramas | 6 |
| Analizar efecto de merges | 7 |
| Identificar cambios necesarios | 8 |
| Proponer filtros de todas, una y comparación | 9 |
| Elaborar propuesta visual | 10 |

Prioridad recomendada: primero identidad y consistencia de datos; después consulta de una rama; finalmente todas las ramas y comparación. Corresponde con el enfoque gradual de 05 (BR-14, BR-19 a BR-22 y BR-24), pero la comparación y reglas de agregación requieren acordar alcance explícito. Este documento no cambia el backlog de otros integrantes.

Pendientes de validar con el equipo: política de deduplicación de logs heredados; contrato de instantáneas y conservación de ramas eliminadas; semántica del grupo ejecución/commit; y validación funcional con datos de ensayo de las vistas declaradas pero no conectadas. No hay evidencia visual de una sesión real ni capturas de producción adjuntas.

## 13. Fuentes de código para reproducir la revisión

Rutas relativas a cada repositorio, verificadas durante esta revisión. Se usan rutas en texto para mantener el documento portable aunque la plataforma no esté como carpeta hermana del proyecto base.

**Proyecto base:**

- `../package.json`: disparador de pruebas.
- `../script/tddScript.js`, `script/id_execution_tests_commit.js`: ejecución y agrupación local.
- `../script/commitScript.js`, `script/commit-tracker.js`: captura de commits, métricas y marcador `HEAD`.
- `../.husky/post-commit`, `.gitattributes`, `.gitignore`: versionado e integración de logs.
- `../.github/workflows/integrate.yml`: alcance de CI.

**Plataforma TDDLab:**

- `Web Ui/src/presentation/tdd-visualization/pages/TDDChartPage.tsx`: contenedor de la vista.
- `Web Ui/src/presentation/tdd-visualization/hooks/useTDDChartPage.ts`: contexto y carga.
- `Web Ui/src/presentation/tdd-visualization/services/tddVisualization.service.ts`: consultas concurrentes.
- `Web Ui/src/modules/TDDCycles-Visualization/repository/CommitHistoryAdapter.ts`: URLs y parámetros.
- `Web Ui/src/presentation/tdd-visualization/components/`: archivos inventariados en la sección 3, además de `TDDCommitTimelineDialog.tsx`.
- `server/src/routes/TDDCyclesRoutes.ts` y `server/src/controllers/TDDCycles/TDDCyclesController.ts`: entrada HTTP.
- `server/src/modules/TDDCycles/Application/getCommitHistoryUseCase.ts`, `getCommitCyclesUseCase.ts`, `getCommitTimeLineUseCase.ts`: delegación de consultas.
- `server/src/modules/TDDCycles/Repositories/GithubRepository.ts`: lectura de JSON, mapeo y caminos alternativos de GitHub.
