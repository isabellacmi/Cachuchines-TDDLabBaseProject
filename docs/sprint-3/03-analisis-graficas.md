# 03 — Análisis de gráficas y visualización por rama

**Responsable:** Henry — Integrante 3.  
**Sprint:** 3. **Fecha de revisión:** 2 de noviembre de 2026.  
**Objetivo:** determinar cómo afectan las ramas Git a las gráficas y estadísticas de TDDLab y proponer su consulta por rama, sin implementar cambios.

## 1. Alcance y evidencia

Se revisaron dos repositorios locales:

- **Proyecto base:** `Cachuchines-TDDLabBaseProject`, referencia inicial `a1adafd`. Contiene la aplicación de ejemplo, scripts de captura y hooks; no contiene el frontend ni el backend de la plataforma.
- **Plataforma:** carpeta vecina `TDDLab`, referencia `5066d4aa247e6f5139f1a897006dcfb8e1c8bb64`. Se inspeccionaron en modo de lectura `Web Ui/src/` y `server/src/`. Tenía una modificación previa en `server/package-lock.json`, ajena a este análisis.

La estructura real de la plataforma usa `Web Ui/` y `server/`, equivalentes al frontend y backend del esquema del sprint. El entregable se guarda en la estructura solicitada: `docs/sprint-3/03-analisis-graficas.md`. No se reubican los documentos anteriores.

**Método:** inspección estática de componentes, adaptadores, rutas, repositorios, generadores de logs y configuración Git. Las conclusiones sobre merges son deducciones del código; no se presentan como un experimento ejecutado ni como observaciones de producción. No se ejecutaron pruebas, hooks, instalación, merges ni consultas remotas: esas acciones generarían datos innecesarios para esta revisión.

Los documentos existentes [02 — scripts y logs](../02-analisis-scripts-logs.md) y [05 — arquitectura y backlog](../05-arquitectura-backlog.md) se usaron como contexto. Los experimentos descritos en el documento 02 pertenecen a ese análisis y no se repitieron aquí.

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
| `script/tdd_log.json` — ejecución | `npm test` → `script/tddScript.js` → Jest → `script/report.json` | `numPassedTests`, `failedTests`, `numTotalTests`, `timestamp`, `success`, `testId`. |
| Mismo log — commit | `script/commitScript.js`, desde `.husky/post-commit` | `commitId`, `commitName`, `commitTimestamp`, `testId`. |
| `script/commit-history.json` | `script/commit-tracker.js`, desde el mismo hook; ejecuta Jest nuevamente con cobertura | `sha`, `commit.date/message/url`, `stats.total/additions/deletions`, `coverage`, `test_count`, `failed_tests`, `conclusion`. |

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
