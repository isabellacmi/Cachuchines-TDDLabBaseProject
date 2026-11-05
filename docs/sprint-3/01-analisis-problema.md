# Bitácora visual del experimento con ramas Git

HU 02 Análisis del problema actual y experimentación

Experimento del 2 de noviembre de 2026. Revisión visual del 3 de noviembre de 2026. Resultado final: 11 pruebas exitosas, 12 ejecuciones registradas y 9 commits o merges nuevos.

## Cómo leer las evidencias

Las primeras imágenes son capturas reales de la sesión de estudiante de TDDLab con el proyecto Cachuchines TDDLabBaseProject. Después se presenta cada ejecución, commit, cambio de rama y merge en orden.

Las láminas de etapas anteriores son reconstrucciones realizadas ahora con los logs conservados y los componentes originales. El encabezado de cada imagen lo indica. Las vistas previas al commit se reconstruyen con la ejecución registrada y el historial anterior; no se presentan como capturas tomadas durante el experimento original.

Cada lámina reúne las gráficas de tests, cobertura, líneas modificadas, burbujas de commits y ciclos de ejecución. Cuando el historial todavía no existe o el JSON está en conflicto, se muestra su indisponibilidad. El log completo de cada etapa está reunido en [logs-experimento.json](logs-experimento.json).

## Capturas reales de TDDLab

### Tests y cobertura

![Total de tests en la sesión real](capturas/real-tests.jpg)

![Cobertura en la sesión real](capturas/real-cobertura.jpg)

Observación: TDDLab muestra 9 puntos. La serie de tests es 2, 4, 6, 7, 6, 7, 5, 8 y 11; la cobertura es 100 por ciento en los 9 commits registrados.

### Líneas modificadas y ciclos

![Líneas modificadas en la sesión real](capturas/real-lineas.jpg)

![Ciclos de la sesión real recortados del dashboard](capturas/real-ciclos.jpg)

Observación: el ciclo conserva 12 ejecuciones, con 10 exitosas y 2 fallidas. Los fallos intermedios permanecen aunque todos los commits se realizaron en verde. La imagen del ciclo es un recorte del dashboard real.

### Dashboard completo

![Dashboard de la sesión real](capturas/real-dashboard.jpg)

Observación: el dashboard reúne las cinco gráficas, pero las tres vistas pequeñas tienen etiquetas comprimidas. La presentación no distingue a qué rama perteneció cada punto.

## Secuencia de pruebas commits y merges

### Etapa 00 Inicio del experimento

**Acción:** Sin ejecutar pruebas. **Rama:** `main`. **HEAD local:** `118ceb32`.

Sin ejecución de pruebas.

Log: 0 entradas = 0 ejecuciones + 0 marcadores de commit. Métricas: 0.

![Gráficas de la etapa 00](capturas/etapa-00.jpg)

**Observación:** Todavía no existen tdd_log.json ni commit-history.json. No hay métricas que graficar.

### Etapa 01 Prueba existente del sumador

**Acción:** Ejecución E01. **Rama:** `main`. **HEAD local:** `118ceb32`.

1 aprobadas y 0 fallidas de 1.

Log: 1 entradas = 1 ejecuciones + 0 marcadores de commit. Métricas: 0. Último testId: 0.

![Gráficas de la etapa 01](capturas/etapa-01.jpg)

**Observación:** Pasa 1 de 1. Se crea tdd_log.json con una ejecución; el historial de métricas aún no existe.

### Etapa 02 Sumador con cero antes de M1

**Acción:** Ejecución E02. **Rama:** `main`. **HEAD local:** `118ceb32`.

2 aprobadas y 0 fallidas de 2.

Log: 2 entradas = 2 ejecuciones + 0 marcadores de commit. Métricas: 0. Último testId: 0.

![Gráficas de la etapa 02](capturas/etapa-02.jpg)

**Observación:** Pasan 2 de 2. Se guarda otra ejecución; todavía no existe un punto de commit en las métricas.

### Etapa 03 Commit M1 suma con cero

**Acción:** Commit. **Rama:** `main`. **HEAD local:** `55c8f5f5`.

Commit en verde; última ejecución: 2 aprobadas y 0 fallidas de 2.

Log: 3 entradas = 2 ejecuciones + 1 marcadores de commit. Métricas: 1. Último testId: 0.

![Gráficas de la etapa 03](capturas/etapa-03.jpg)

**Observación:** El hook agrega el marcador del commit y el historial de métricas. Aparece el primer punto con 2 tests y 100 por ciento de cobertura.

### Etapa 04 Sumador con negativos y decimales antes de M2

**Acción:** Ejecución E03. **Rama:** `main`. **HEAD local:** `55c8f5f5`.

4 aprobadas y 0 fallidas de 4.

Log: 4 entradas = 3 ejecuciones + 1 marcadores de commit. Métricas: 1. Último testId: 1.

![Gráficas de la etapa 04](capturas/etapa-04.jpg)

**Observación:** Pasan 4 de 4. El ciclo acumula la ejecución nueva; las métricas siguen mostrando un solo commit de 2 tests.

### Etapa 05 Commit M2 negativos y decimales

**Acción:** Commit. **Rama:** `main`. **HEAD local:** `eedd04ea`.

Commit en verde; última ejecución: 4 aprobadas y 0 fallidas de 4.

Log: 5 entradas = 3 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 1.

![Gráficas de la etapa 05](capturas/etapa-05.jpg)

**Observación:** Las métricas pasan a 2 registros con 2 y 4 tests. Este main se publicó antes de las pruebas en ramas.

### Etapa 06 Restador en rojo

**Acción:** Crear feature/restador y ejecutar E04. **Rama:** `feature/restador`. **HEAD local:** `eedd04ea`.

4 aprobadas y 2 fallidas de 6.

Log: 6 entradas = 4 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 2.

![Gráficas de la etapa 06](capturas/etapa-06.jpg)

**Observación:** Fallan 2 de 6. El ciclo conserva el rojo; los dos commits previos siguen verdes porque aún no se hizo un nuevo commit.

### Etapa 07 Restador en verde antes de R1

**Acción:** Ejecución E05. **Rama:** `feature/restador`. **HEAD local:** `eedd04ea`.

6 aprobadas y 0 fallidas de 6.

Log: 7 entradas = 5 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 2.

![Gráficas de la etapa 07](capturas/etapa-07.jpg)

**Observación:** Pasan 6 de 6. El mismo grupo testId 2 conserva rojo y verde; las métricas aún contienen solo los 2 commits de main.

### Etapa 08 Commit R1 restador positivos y negativos

**Acción:** Commit. **Rama:** `feature/restador`. **HEAD local:** `4d637f3a`.

Commit en verde; última ejecución: 6 aprobadas y 0 fallidas de 6.

Log: 8 entradas = 5 ejecuciones + 3 marcadores de commit. Métricas: 3. Último testId: 2.

![Gráficas de la etapa 08](capturas/etapa-08.jpg)

**Observación:** Se añade un punto con 6 tests y cobertura 100. La rama guarda 3 métricas, pero TDDLab publicado sigue leyendo main con 2.

### Etapa 09 Restador decimal antes de R2

**Acción:** Ejecución E06. **Rama:** `feature/restador`. **HEAD local:** `4d637f3a`.

7 aprobadas y 0 fallidas de 7.

Log: 9 entradas = 6 ejecuciones + 3 marcadores de commit. Métricas: 3. Último testId: 3.

![Gráficas de la etapa 09](capturas/etapa-09.jpg)

**Observación:** Pasan 7 de 7. La ejecución se guarda en el log; el punto de 7 tests aparece únicamente después del siguiente commit.

### Etapa 10 Commit R2 restador decimal

**Acción:** Commit. **Rama:** `feature/restador`. **HEAD local:** `5ab01590`.

Commit en verde; última ejecución: 7 aprobadas y 0 fallidas de 7.

Log: 10 entradas = 6 ejecuciones + 4 marcadores de commit. Métricas: 4. Último testId: 3.

![Gráficas de la etapa 10](capturas/etapa-10.jpg)

**Observación:** El historial de la rama contiene 4 métricas y el log 6 ejecuciones. Se publicó la feature; la API de TDDLab siguió devolviendo los 2 registros de main.

### Etapa 11 Regreso de restador a main

**Acción:** Cambio de rama sin ejecutar pruebas. **Rama:** `main`. **HEAD local:** `eedd04ea`.

Sin nueva ejecución; último log: 4 aprobadas y 0 fallidas de 4.

Log: 5 entradas = 3 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 1. report.json conserva 7 tests y queda obsoleto hasta ejecutar de nuevo.

![Gráficas de la etapa 11](capturas/etapa-11.jpg)

**Observación:** El log vuelve de 10 a 5 entradas al restaurar main. Los registros no se borraron de la feature. report.json conserva 7 tests porque está ignorado por Git.

### Etapa 12 Multiplicador en rojo

**Acción:** Crear feature/multiplicador y ejecutar E07. **Rama:** `feature/multiplicador`. **HEAD local:** `eedd04ea`.

4 aprobadas y 2 fallidas de 6.

Log: 6 entradas = 4 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 2.

![Gráficas de la etapa 12](capturas/etapa-12.jpg)

**Observación:** Fallan 2 de 6. Se reutiliza testId 2 en otra rama. El rojo queda registrado sin cambiar las métricas de los commits anteriores.

### Etapa 13 Multiplicador en verde antes de X1

**Acción:** Ejecución E08. **Rama:** `feature/multiplicador`. **HEAD local:** `eedd04ea`.

6 aprobadas y 0 fallidas de 6.

Log: 7 entradas = 5 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 2.

![Gráficas de la etapa 13](capturas/etapa-13.jpg)

**Observación:** Pasan 6 de 6. El ciclo reúne rojo y verde; las métricas todavía son las 2 de main.

### Etapa 14 Commit X1 multiplicador positivos y cero

**Acción:** Commit. **Rama:** `feature/multiplicador`. **HEAD local:** `e2a9e0af`.

Commit en verde; última ejecución: 6 aprobadas y 0 fallidas de 6.

Log: 8 entradas = 5 ejecuciones + 3 marcadores de commit. Métricas: 3. Último testId: 2.

![Gráficas de la etapa 14](capturas/etapa-14.jpg)

**Observación:** El commit añade la métrica de 6 tests. La feature tiene su propio historial sin restador, aunque ambas ramas reutilizan testId 2.

### Etapa 15 Multiplicador negativo antes de X2

**Acción:** Ejecución E09. **Rama:** `feature/multiplicador`. **HEAD local:** `e2a9e0af`.

7 aprobadas y 0 fallidas de 7.

Log: 9 entradas = 6 ejecuciones + 3 marcadores de commit. Métricas: 3. Último testId: 3.

![Gráficas de la etapa 15](capturas/etapa-15.jpg)

**Observación:** Pasan 7 de 7. Se guarda una ejecución nueva; la cantidad de puntos de métricas se mantiene hasta hacer commit.

### Etapa 16 Commit X2 multiplicador negativo

**Acción:** Commit. **Rama:** `feature/multiplicador`. **HEAD local:** `31a7921a`.

Commit en verde; última ejecución: 7 aprobadas y 0 fallidas de 7.

Log: 10 entradas = 6 ejecuciones + 4 marcadores de commit. Métricas: 4. Último testId: 3.

![Gráficas de la etapa 16](capturas/etapa-16.jpg)

**Observación:** La rama llega a 4 métricas y 6 ejecuciones; el último punto es de 7 tests. Se publica la feature sin incorporarla aún a main.

### Etapa 17 Regreso de multiplicador a main

**Acción:** Cambio de rama sin ejecutar pruebas. **Rama:** `main`. **HEAD local:** `eedd04ea`.

Sin nueva ejecución; último log: 4 aprobadas y 0 fallidas de 4.

Log: 5 entradas = 3 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 1. report.json conserva 7 tests y queda obsoleto hasta ejecutar de nuevo.

![Gráficas de la etapa 17](capturas/etapa-17.jpg)

**Observación:** Main recupera 5 entradas de log y 2 métricas. report.json aún dice 7 tests; no representa una ejecución nueva en main.

### Etapa 18 Suma de signos distintos antes de M3

**Acción:** Ejecución E10. **Rama:** `main`. **HEAD local:** `eedd04ea`.

5 aprobadas y 0 fallidas de 5.

Log: 6 entradas = 4 ejecuciones + 2 marcadores de commit. Métricas: 2. Último testId: 2.

![Gráficas de la etapa 18](capturas/etapa-18.jpg)

**Observación:** Pasan 5 de 5. report.json se actualiza al estado correcto de main. El historial de métricas todavía termina en M2 con 4 tests.

### Etapa 19 Commit M3 main divergente

**Acción:** Commit. **Rama:** `main`. **HEAD local:** `04dd5bdd`.

Commit en verde; última ejecución: 5 aprobadas y 0 fallidas de 5.

Log: 7 entradas = 4 ejecuciones + 3 marcadores de commit. Métricas: 3. Último testId: 2.

![Gráficas de la etapa 19](capturas/etapa-19.jpg)

**Observación:** Main local añade el punto de 5 tests. Ya diverge de ambas features, condición que provocará conflictos en los logs al integrar.

### Etapa 20 Merge del restador con conflicto

**Acción:** Merge con conflicto. **Rama:** `main`. **HEAD local:** `04dd5bdd`.

Sin nueva ejecución; último resultado anterior al conflicto: 5 aprobadas y 0 fallidas de 5.

Log local no parseable por los marcadores de conflicto Git.

![Gráficas de la etapa 20](capturas/etapa-20.jpg)

**Observación:** Ambos JSON quedan con marcadores Git y no son parseables. No se publica este estado; main remoto conserva su versión anterior.

### Etapa 21 Pruebas integradas del restador antes del merge commit

**Acción:** Resolución manual y ejecución E11. **Rama:** `main`. **HEAD local:** `04dd5bdd`.

8 aprobadas y 0 fallidas de 8.

Log: 13 entradas = 8 ejecuciones + 5 marcadores de commit. Métricas: 5. Último testId: 3.

![Gráficas de la etapa 21](capturas/etapa-21.jpg)

**Observación:** La unión manual conserva los registros de ambas ramas. Pasan 8 de 8; hay 5 métricas previas y una ejecución integrada pendiente de commit.

### Etapa 22 Merge MR restador confirmado

**Acción:** Merge confirmado. **Rama:** `main`. **HEAD local:** `0be805da`.

Commit en verde; última ejecución: 8 aprobadas y 0 fallidas de 8.

Log: 14 entradas = 8 ejecuciones + 6 marcadores de commit. Métricas: 6. Último testId: 3.

![Gráficas de la etapa 22](capturas/etapa-22.jpg)

**Observación:** El merge añade la sexta métrica con 8 tests. La serie mezcla 2, 4, 6, 7, 5 y 8 porque une líneas de desarrollo distintas.

### Etapa 23 Merge del multiplicador con conflicto

**Acción:** Merge con conflicto. **Rama:** `main`. **HEAD local:** `0be805da`.

Sin nueva ejecución; último resultado anterior al conflicto: 8 aprobadas y 0 fallidas de 8.

Log local no parseable por los marcadores de conflicto Git.

![Gráficas de la etapa 23](capturas/etapa-23.jpg)

**Observación:** Ambos JSON quedan con marcadores Git y no son parseables. No se publica este estado; main remoto conserva su versión anterior.

### Etapa 24 Pruebas integradas del multiplicador antes del merge commit

**Acción:** Resolución manual y ejecución E12. **Rama:** `main`. **HEAD local:** `0be805da`.

11 aprobadas y 0 fallidas de 11.

Log: 20 entradas = 12 ejecuciones + 8 marcadores de commit. Métricas: 8. Último testId: 4.

![Gráficas de la etapa 24](capturas/etapa-24.jpg)

**Observación:** Se conservan ambas features y pasan 11 de 11. El log reúne 12 ejecuciones; falta añadir la métrica del merge final.

### Etapa 25 Merge MX multiplicador confirmado

**Acción:** Merge confirmado. **Rama:** `main`. **HEAD local:** `86bc5fe3`.

Commit en verde; última ejecución: 11 aprobadas y 0 fallidas de 11.

Log: 21 entradas = 12 ejecuciones + 9 marcadores de commit. Métricas: 9. Último testId: 4.

![Gráficas de la etapa 25](capturas/etapa-25.jpg)

**Observación:** Resultado publicado: 21 entradas, 12 ejecuciones y 9 métricas. La serie mezcla 2, 4, 6, 7, 6, 7, 5, 8 y 11 sin etiquetas de rama.

## Qué observamos y qué mejorar

**Guardar una ejecución y guardar una métrica son acciones distintas.** Ejecutar pruebas agrega un registro al log. El commit agrega su marcador y su métrica. Antes de hacer commit puede aparecer un rojo o un verde nuevo en el ciclo sin que aumenten los puntos de tests o cobertura.

**Las ramas conservan historiales diferentes.** Al volver a main se recuperan sus archivos; las ejecuciones de la feature siguen en esa rama. La página real lee main: publicar una feature no hace aparecer automáticamente sus registros. La API consultada antes del merge devolvió 2 métricas de main aunque la feature tenía 4.

**Los dos merges tuvieron conflictos en ambos logs.** Se conservaron los archivos en conflicto y se unieron manualmente los registros, resolviendo cada HEAD con el SHA de su rama. El resultado final tiene 12 timestamps de ejecución distintos y 9 identidades de commit distintas. La ausencia final de duplicados depende de esa resolución manual.

**La gráfica final mezcla líneas de desarrollo.** Las bajadas de 7 a 6 y a 5 tests corresponden a otras ramas y no prueban una eliminación de tests dentro de una misma rama. Faltan datos y etiquetas de procedencia para interpretar esa secuencia correctamente.

**Hay dos problemas adicionales de registro.** report.json queda obsoleto al cambiar de rama porque está ignorado por Git. Además, npm test devolvió código 0 en las dos ejecuciones rojas, aunque el JSON registró success false. La repetición de testId dentro de rojo verde es esperada; su reutilización entre ramas resulta ambigua al unirlas.

**La transformación del dashboard también omite información.** En la comprobación de su función de asociación, 3 ejecuciones se redujeron a 1 antes de las ramas y 12 a 10 en el historial integrado. Es una omisión en la transformación para la vista; las entradas permanecen en el archivo. La gráfica de ciclos capturada sí muestra los 12 marcadores.

**Qué hicimos bien:** ejecutar primero la prueba existente, conservar rojo y verde antes del commit, comprobar decimales con tolerancia, guardar logs antes de resolver conflictos y verificar las 11 pruebas después de integrar ambas ramas.

**Qué mejorar:** guardar un identificador único por ejecución, rama y SHA real; seleccionar la rama en la página; asociar pruebas con commits mediante identificadores; propagar el fallo de Jest al proceso; unir eventos sin duplicar el prefijo común; y mostrar la procedencia de los puntos y etiquetas legibles. La lista real también enlaza el último registro a HEAD en lugar de fijarlo a un SHA.

## Confirmación de los criterios

| Criterio | Evidencia |
| --- | --- |
| Crear ramas | feature/restador en etapa 06 y feature/multiplicador en etapa 12. |
| Pruebas y commits en main | Etapas 01 a 05 y 18 a 19. |
| Pruebas y commits en nuevas ramas | Etapas 06 a 10 y 12 a 16. |
| Merges | Conflictos y resolución en etapas 20 a 25. |
| Observar logs | Contadores por etapa y logs-experimento.json con los registros completos. |
| Analizar gráficas | Capturas reales y láminas de las 26 etapas, con las cinco gráficas cuando hay datos válidos. |
| Pérdida duplicación o mezcla | Omisión en la transformación y mezcla confirmadas; unión manual sin duplicados finales. |
| Documentar y adjuntar evidencia | Este Markdown, el Word, las láminas y el JSON de logs. |

Las capturas reales verifican el estado final en la sesión de estudiante. Las etapas históricas documentan los estados locales conservados, no una consulta retrospectiva ofrecida por la página. Main se publicó después de M2 y después del merge final; no se afirma que cada commit local intermedio hubiera estado publicado. TDDLab no recibió cambios de código, commits, merges ni PR.
