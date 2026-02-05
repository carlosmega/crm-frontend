La aplicación debe funcionar como un **Sistema de Operaciones de Producto (ProdOps)**. Su objetivo principal es optimizar la asignación de recursos especializados (Devs y BAs) en un modelo de Squads independientes. Debe priorizar la transparencia en la entrega de valor, la gestión de dependencias en sprints de dos semanas y permitir una toma de decisiones basada en la capacidad real y el impacto de negocio, alejándose del modelo tradicional de seguimiento de tareas (tickets) para enfocarse en la salud y eficiencia de las células de producto.

Necesito que generes tres modulos principales
# 📋 Historias de Usuario - Sistema de Gestión de Fábrica de Software

**Versión:** 1.0  
**Fecha:** 29 de Enero de 2026  
**Metodología:** Agile/Scrum - Sprints de 2 semanas  
**Organización:** Squads por producto

---


## 📑 Índice de Módulos

1. [Módulo de Operaciones](#módulo-de-operaciones)
2. [Módulo Gestión de Recursos](#gestión-de-recursos-contratados)
3. [Módulo de Administración de Recursos](#administración-de-recursos)
4. [Recomendaciones Adicionales](#recomendaciones-adicionales)

---

## 🔧 Módulo de Operaciones

### EPIC-OP-001: Roadmap y Planificación de Recursos

#### HUS-OP-001: Visualización de Roadmap de Asignaciones
**Como** Líder de Operaciones  
**Quiero** visualizar un roadmap con la asignación de recursos a sprints y features  
**Para** identificar la disponibilidad y ocupación de mi equipo en el tiempo

**Criterios de Aceptación:**
- [ ] Mostrar vista tipo Gantt/Timeline con recursos en el eje Y y sprints en el eje X
- [ ] Visualizar por cada recurso: sprints asignados, features asignadas, producto asociado
- [ ] Permitir filtrar por: producto, squad, tecnología, período de tiempo
- [ ] Mostrar indicador visual de % de ocupación por recurso (verde <80%, amarillo 80-100%, rojo >100%)
- [ ] Permitir drill-down para ver detalle de asignación por recurso
- [ ] Exportar vista a PDF/imagen para presentaciones

**Datos Mock requeridos:**
- Lista de recursos con asignaciones a sprints
- Features con fechas de inicio/fin
- Relación recurso-feature-producto

**Prioridad:** Alta | **Story Points:** 13

---

#### HUS-OP-002: Vista de Disponibilidad Futura
**Como** Líder de Operaciones  
**Quiero** ver qué recursos estarán disponibles en los próximos sprints  
**Para** planificar asignaciones a nuevas iniciativas

**Criterios de Aceptación:**
- [ ] Mostrar calendario de disponibilidad por recurso para los próximos 6 sprints (3 meses)
- [ ] Indicar fecha estimada de liberación de cada recurso
- [ ] Mostrar horas disponibles vs horas comprometidas por sprint
- [ ] Alertar cuando un recurso tiene menos de 20% de capacidad disponible
- [ ] Permitir simulación de asignaciones "what-if"

**Prioridad:** Alta | **Story Points:** 8

---

### EPIC-OP-002: Seguimiento del Sprint Actual

#### HUS-OP-003: Dashboard de Actividades del Sprint
**Como** Líder de Squad  
**Quiero** ver las actividades asignadas a cada recurso en el sprint actual  
**Para** monitorear el progreso y carga de trabajo del equipo

**Criterios de Aceptación:**
- [ ] Mostrar listado de recursos con sus tareas asignadas en el sprint actual
- [ ] Visualizar estado de cada tarea: To Do, In Progress, In Review, Done
- [ ] Mostrar story points asignados vs completados por recurso
- [ ] Indicar % de avance del sprint (burndown)
- [ ] Resaltar tareas bloqueadas o en riesgo

**Datos Mock (fuente futura: Azure DevOps):**
- Work items del sprint actual
- Asignaciones por recurso
- Estados de las tareas

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-004: Tracking de Bugs por Recurso
**Como** Líder de Calidad  
**Quiero** ver cuántos bugs han sido detectados por recurso  
**Para** identificar áreas de mejora y necesidades de capacitación

**Criterios de Aceptación:**
- [ ] Mostrar conteo de bugs por recurso: reportados, en progreso, resueltos
- [ ] Clasificar bugs por severidad: crítico, alto, medio, bajo
- [ ] Mostrar tendencia de bugs por recurso (últimos 5 sprints)
- [ ] Calcular ratio bugs/story points entregados
- [ ] Identificar bugs recurrentes por tipo o módulo
- [ ] Generar alerta si un recurso supera umbral de bugs (configurable)

**Prioridad:** Media | **Story Points:** 5

---

### EPIC-OP-003: Estimación y Proyección de Features

#### HUS-OP-005: Proyección de Fecha de Término por Feature
**Como** Product Owner  
**Quiero** ver la fecha tentativa de finalización de cada feature  
**Para** comunicar expectativas al negocio y planificar releases

**Criterios de Aceptación:**
- [ ] Calcular fecha estimada basada en: velocity del equipo, story points restantes, capacidad asignada
- [ ] Mostrar rango de fechas (optimista, probable, pesimista)
- [ ] Actualizar proyección automáticamente al cierre de cada sprint
- [ ] Mostrar indicador de confianza basado en variabilidad histórica
- [ ] Alertar si la fecha proyectada excede la fecha comprometida
- [ ] Permitir ajuste manual con justificación

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-006: Historial de Estimaciones vs Real
**Como** Líder de Operaciones  
**Quiero** comparar las estimaciones originales contra el tiempo real de entrega  
**Para** mejorar la precisión de futuras estimaciones

**Criterios de Aceptación:**
- [ ] Mostrar por feature: fecha estimada original vs fecha real de entrega
- [ ] Calcular % de desviación promedio por squad/producto
- [ ] Identificar patrones de subestimación o sobreestimación
- [ ] Generar factor de ajuste sugerido para futuras estimaciones

**Prioridad:** Media | **Story Points:** 5

---

### EPIC-OP-004: Planificación de Capacidad para Nuevas Iniciativas

#### HUS-OP-007: Pipeline de Iniciativas Entrantes
**Como** Director de Fábrica  
**Quiero** visualizar las iniciativas que están por llegar  
**Para** planificar la capacidad necesaria y decisiones de contratación

**Criterios de Aceptación:**
- [ ] Mostrar listado de iniciativas en pipeline con: nombre, producto, fecha tentativa inicio, esfuerzo estimado (T-shirt sizing)
- [ ] Clasificar iniciativas por estado: en análisis, aprobada, en espera de recursos
- [ ] Mostrar tecnologías requeridas por iniciativa
- [ ] Calcular gap de capacidad: recursos necesarios vs disponibles
- [ ] Indicar si se puede cubrir con recursos existentes o requiere contratación
- [ ] Simular escenarios de asignación

**Prioridad:** Alta | **Story Points:** 13

---

#### HUS-OP-008: Simulador de Asignación de Recursos
**Como** Líder de Operaciones  
**Quiero** simular diferentes escenarios de asignación  
**Para** optimizar el uso de recursos entre iniciativas actuales y nuevas

**Criterios de Aceptación:**
- [ ] Permitir arrastrar recursos entre iniciativas/productos
- [ ] Calcular impacto en fechas de entrega al reasignar
- [ ] Mostrar conflictos de capacidad o skills
- [ ] Guardar escenarios para comparación
- [ ] Generar reporte de escenario óptimo recomendado

**Prioridad:** Media | **Story Points:** 13

---

### EPIC-OP-005: Gestión del Backlog por Producto

#### HUS-OP-009: Vista de Iniciativas Encoladas por Producto
**Como** Product Manager  
**Quiero** ver el estado del pipeline de iniciativas por producto  
**Para** priorizar y comunicar el backlog al negocio

**Criterios de Aceptación:**
- [ ] Mostrar por producto el conteo de iniciativas en cada etapa:
  - En análisis (Business Analyst)
  - Refinadas (listas para desarrollo)
  - Aprobadas por Product Management
  - En desarrollo
  - En QA
  - Completadas
- [ ] Visualizar como funnel o kanban
- [ ] Mostrar tiempo promedio en cada etapa
- [ ] Identificar cuellos de botella (etapas con acumulación)
- [ ] Alertar si el backlog refinado cae por debajo de 2 sprints

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-010: Carga de Trabajo del Business Analyst
**Como** Líder de BA  
**Quiero** ver cuántas iniciativas está analizando cada BA  
**Para** balancear la carga de trabajo del equipo de análisis

**Criterios de Aceptación:**
- [ ] Mostrar por BA: iniciativas asignadas, complejidad, producto
- [ ] Indicar capacidad disponible para nuevos análisis
- [ ] Mostrar tiempo promedio de análisis por tipo de iniciativa
- [ ] Alertar si un BA tiene más de 3 iniciativas simultáneas

**Prioridad:** Media | **Story Points:** 5

---

### EPIC-OP-006: Dashboard de Indicadores Agile

#### HUS-OP-011: Dashboard de Métricas de Sprint
**Como** Scrum Master  
**Quiero** visualizar los indicadores clave de cada sprint  
**Para** identificar áreas de mejora en el proceso

**Criterios de Aceptación:**
- [ ] Mostrar métricas principales:
  - **Velocity:** Story points completados por sprint (tendencia últimos 6 sprints)
  - **Sprint Burndown:** Progreso diario del sprint actual
  - **Commitment vs Delivered:** % de cumplimiento de lo planificado
  - **Scope Change:** Story points agregados/removidos durante el sprint
- [ ] Comparar métricas entre squads (benchmark)
- [ ] Mostrar tendencias con gráficos de línea
- [ ] Exportar datos para análisis externo

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-012: Métricas de Flujo y Eficiencia
**Como** Líder de Operaciones  
**Quiero** medir la eficiencia del flujo de trabajo  
**Para** optimizar el proceso de desarrollo

**Criterios de Aceptación:**
- [ ] Mostrar métricas de flujo:
  - **Lead Time:** Tiempo desde solicitud hasta entrega (días promedio)
  - **Cycle Time:** Tiempo en desarrollo activo (días promedio)
  - **Throughput:** Número de items completados por semana/sprint
  - **Work In Progress (WIP):** Items en progreso simultáneo
  - **Flow Efficiency:** % tiempo en trabajo activo vs tiempo en espera
- [ ] Mostrar distribución de tiempo por etapa (análisis, desarrollo, QA, deploy)
- [ ] Identificar items con cycle time anormal (outliers)

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-013: Métricas de Calidad
**Como** QA Lead  
**Quiero** medir indicadores de calidad del desarrollo  
**Para** mantener estándares y reducir defectos

**Criterios de Aceptación:**
- [ ] Mostrar métricas de calidad:
  - **Defect Density:** Bugs por cada 100 story points
  - **Defect Escape Rate:** % bugs encontrados en producción vs QA
  - **First Time Pass Rate:** % items que pasan QA en primer intento
  - **Test Coverage:** % de código cubierto por pruebas (si disponible)
  - **Technical Debt Ratio:** Tiempo dedicado a deuda técnica vs features
- [ ] Tendencia histórica por sprint/mes
- [ ] Comparativo por squad/producto

**Prioridad:** Media | **Story Points:** 8

---

#### HUS-OP-014: Métricas de Predictibilidad
**Como** Director de Fábrica  
**Quiero** medir qué tan predecibles son nuestras entregas  
**Para** mejorar la confiabilidad de nuestros compromisos

**Criterios de Aceptación:**
- [ ] Mostrar métricas de predictibilidad:
  - **Estimation Accuracy:** % de desviación estimado vs real
  - **Sprint Success Rate:** % de sprints donde se cumplió el objetivo
  - **Release Predictability:** % de releases en fecha planificada
  - **Velocity Stability:** Variación de velocity entre sprints
- [ ] Calcular intervalos de confianza para proyecciones

**Prioridad:** Media | **Story Points:** 5

---

### EPIC-OP-007: Control de Horas y Prorrateo

#### HUS-OP-015: Registro de Horas por Proyecto
**Como** Desarrollador  
**Quiero** registrar las horas que dedico a cada proyecto  
**Para** que la empresa pueda prorratear correctamente los costos

**Criterios de Aceptación:**
- [ ] Interfaz de timesheet semanal con vista de calendario
- [ ] Permitir registro por bloques de tiempo mínimo de 30 minutos
- [ ] Asociar cada registro a: proyecto, feature, tipo de actividad (desarrollo, reuniones, investigación, soporte)
- [ ] Autocompletar con tareas asignadas del sprint actual
- [ ] Mostrar resumen diario y semanal de horas registradas
- [ ] Alertar si las horas registradas difieren significativamente de las estimadas
- [ ] Permitir registro retroactivo hasta 5 días hábiles

**Prioridad:** Alta | **Story Points:** 13

---

#### HUS-OP-016: Aprobación de Horas por Líder
**Como** Líder de Squad  
**Quiero** revisar y aprobar las horas registradas por mi equipo  
**Para** validar la distribución de esfuerzo antes del cierre

**Criterios de Aceptación:**
- [ ] Dashboard de horas pendientes de aprobación
- [ ] Comparar horas registradas vs horas disponibles por recurso
- [ ] Identificar anomalías: días sin registro, exceso de horas, distribución inusual
- [ ] Aprobar/rechazar con comentarios
- [ ] Enviar recordatorio automático a recursos con horas faltantes

**Prioridad:** Media | **Story Points:** 5

---

#### HUS-OP-017: Reporte de Prorrateo de Costos
**Como** Administrador Financiero  
**Quiero** generar reportes de horas por proyecto y recurso  
**Para** distribuir costos correctamente entre proyectos

**Criterios de Aceptación:**
- [ ] Generar reporte por período (semanal, quincenal, mensual)
- [ ] Desglosar por: proyecto, recurso, tipo de actividad
- [ ] Calcular costo prorrateado basado en tarifa/hora del recurso
- [ ] Exportar a Excel para integración con sistemas financieros
- [ ] Comparar presupuesto vs ejecutado por proyecto

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-018: Integración con Tareas (Sugerencia de Registro)
**Como** Desarrollador  
**Quiero** que el sistema sugiera registros de tiempo basado en mis actividades  
**Para** reducir el esfuerzo manual de captura de horas

**Criterios de Aceptación:**
- [ ] Sugerir registros basados en:
  - Tareas movidas a "In Progress" o "Done" en el sprint
  - Commits realizados (si hay integración con Git)
  - Reuniones del calendario
- [ ] Permitir aceptar, modificar o rechazar sugerencias
- [ ] Aprender de patrones del usuario para mejorar sugerencias

**Prioridad:** Baja | **Story Points:** 13

---

### EPIC-OP-008: Métricas de Releases y Estabilidad

#### HUS-OP-019: Dashboard de Releases por Producto
**Como** Release Manager  
**Quiero** ver el historial y frecuencia de releases por producto  
**Para** medir la velocidad de entrega y estabilidad

**Criterios de Aceptación:**
- [ ] Mostrar por producto:
  - Número de releases por semana/mes
  - Calendario de releases realizados
  - Próximos releases planificados
  - Contenido de cada release (features, fixes)
- [ ] Calcular frecuencia promedio de releases
- [ ] Comparar entre productos

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-020: Tracking de Rollbacks
**Como** Líder de Operaciones  
**Quiero** monitorear los rollbacks por aplicativo  
**Para** identificar problemas de calidad y mejorar el proceso de release

**Criterios de Aceptación:**
- [ ] Registrar cada rollback con: fecha, producto, motivo, impacto, duración
- [ ] Calcular tasa de rollback: % de releases con rollback
- [ ] Mostrar tendencia histórica de rollbacks
- [ ] Categorizar causas: bug crítico, performance, error de configuración, etc.
- [ ] Identificar patrones: productos, horarios, tipos de cambio con mayor riesgo
- [ ] Alertar si la tasa supera umbral (ej: >5%)

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-OP-021: Métricas DORA
**Como** Director de Fábrica  
**Quiero** medir las métricas DORA de nuestros equipos  
**Para** evaluar el rendimiento de ingeniería según estándares de la industria

**Criterios de Aceptación:**
- [ ] Calcular y mostrar:
  - **Deployment Frequency:** Frecuencia de deploys a producción
  - **Lead Time for Changes:** Tiempo desde commit hasta producción
  - **Change Failure Rate:** % de deploys que causan incidentes
  - **Time to Restore:** Tiempo promedio para recuperarse de un incidente
- [ ] Clasificar equipo según niveles DORA (Elite, High, Medium, Low)
- [ ] Mostrar tendencia y benchmark de la industria

**Prioridad:** Media | **Story Points:** 8

---

## 👥 Módulo Gestión de Recursos

### EPIC-RC-001: Pipeline de Contratación

#### HUS-RC-001: Gestión de Candidatos a Contratar
**Como** Líder de Reclutamiento  
**Quiero** llevar el control de los recursos que voy a contratar  
**Para** dar seguimiento al pipeline de contratación

**Criterios de Aceptación:**
- [ ] Crear registro de candidato con: nombre, posición, tecnologías, expectativa salarial, fecha aplicación
- [ ] Gestionar estados del proceso:
  - **Nuevo** - Candidato identificado
  - **En Evaluación Técnica** - Realizando pruebas
  - **Entrevista HR** - Proceso de entrevista
  - **Oferta Enviada** - Propuesta económica enviada
  - **Negociación** - Ajustando términos
  - **Aceptado** - Confirmó ingreso
  - **En Onboarding** - Proceso de incorporación
  - **Rechazado** - No cumple requisitos
  - **Declinado** - Candidato rechazó oferta
  - **Pausado** - Proceso en espera
  - **Cancelado** - Vacante cancelada
- [ ] Registrar motivo de cambio de estado
- [ ] Mostrar histórico de estados con fechas
- [ ] Filtrar por estado, posición, tecnología

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-RC-002: Vinculación con Iniciativas
**Como** Líder de Operaciones  
**Quiero** asociar contrataciones a iniciativas específicas  
**Para** justificar y priorizar las contrataciones

**Criterios de Aceptación:**
- [ ] Vincular candidato a una o más iniciativas/proyectos destino
- [ ] Mostrar fecha requerida de incorporación según la iniciativa
- [ ] Calcular urgencia basada en fecha de inicio de la iniciativa
- [ ] Alertar si hay iniciativas sin recursos asignados ni en proceso de contratación

**Prioridad:** Media | **Story Points:** 5

---

#### HUS-RC-003: Dashboard de Pipeline de Reclutamiento
**Como** Director de Fábrica  
**Quiero** ver el estado general del pipeline de contratación  
**Para** tomar decisiones sobre capacidad y presupuesto

**Criterios de Aceptación:**
- [ ] Mostrar funnel de conversión por etapa
- [ ] Calcular tiempo promedio en cada etapa
- [ ] Mostrar tasa de conversión y abandono
- [ ] Comparar costo de contratación vs presupuesto
- [ ] Proyectar fechas de incorporación

**Prioridad:** Media | **Story Points:** 5

---

### EPIC-RC-002: Onboarding de Nuevos Recursos

#### HUS-RC-004: Checklist de Onboarding Administrativo
**Como** HR  
**Quiero** gestionar el checklist de incorporación administrativa  
**Para** asegurar que todos los trámites se completen

**Criterios de Aceptación:**
- [ ] Checklist configurable con items como:
  - Documentación personal
  - Contrato firmado
  - Alta en nómina
  - Credencial de acceso
  - Equipo asignado
  - Cuentas de correo y herramientas
  - Accesos a repositorios
- [ ] Asignar responsable y fecha límite por item
- [ ] Marcar completado con evidencia/comentario
- [ ] Notificar a responsables de tareas pendientes
- [ ] Mostrar % de avance del onboarding

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-RC-005: Perfil Técnico Inicial (Acta de Nacimiento)
**Como** Líder Técnico  
**Quiero** documentar el perfil técnico inicial del nuevo recurso  
**Para** tener un baseline de sus conocimientos y planificar su desarrollo

**Criterios de Aceptación:**
- [ ] Registrar información técnica:
  - Tecnologías que conoce (con nivel: básico, intermedio, avanzado, experto)
  - Certificaciones actuales
  - Proyectos/experiencia relevante
  - Resultados de evaluación técnica de ingreso
  - Fortalezas identificadas
  - Áreas de oportunidad
- [ ] Adjuntar CV y documentos relevantes
- [ ] Establecer fecha de próxima evaluación (ej: 3 meses)
- [ ] Asignar mentor inicial

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-RC-006: Plan de Onboarding Técnico
**Como** Nuevo Desarrollador  
**Quiero** tener un plan estructurado de onboarding técnico  
**Para** integrarme rápidamente al equipo y proyectos

**Criterios de Aceptación:**
- [ ] Generar plan basado en:
  - Proyecto/squad asignado
  - Tecnologías del proyecto
  - Gap entre conocimientos actuales y requeridos
- [ ] Incluir actividades como:
  - Lectura de documentación del proyecto
  - Setup de ambiente de desarrollo
  - Code review de PRs recientes
  - Pair programming con mentor
  - Tareas de práctica de complejidad incremental
- [ ] Establecer checkpoints de validación
- [ ] Duración típica: 2-4 semanas según seniority

**Prioridad:** Media | **Story Points:** 8

---

#### HUS-RC-007: Seguimiento de Período de Prueba
**Como** Líder de Squad  
**Quiero** dar seguimiento al período de prueba del nuevo recurso  
**Para** evaluar su desempeño y confirmar la contratación

**Criterios de Aceptación:**
- [ ] Establecer duración del período de prueba (ej: 90 días)
- [ ] Agendar evaluaciones periódicas (30, 60, 90 días)
- [ ] Registrar feedback de cada evaluación
- [ ] Documentar logros y áreas de mejora
- [ ] Generar recomendación: confirmar, extender período, no continuar
- [ ] Notificar a HR antes del vencimiento del período

**Prioridad:** Media | **Story Points:** 5

---

## 🎓 Módulo de Administración de Recursos

### EPIC-AR-001: Gestión de Skills y Tecnologías

#### HUS-AR-001: Catálogo de Tecnologías de la Fábrica
**Como** Administrador  
**Quiero** mantener un catálogo de tecnologías y skills  
**Para** estandarizar la clasificación de conocimientos

**Criterios de Aceptación:**
- [ ] Definir categorías: Lenguajes, Frameworks, Bases de Datos, Cloud, DevOps, Metodologías, Soft Skills
- [ ] Registrar por tecnología: nombre, descripción, nivel de demanda en la fábrica
- [ ] Definir niveles de dominio:
  - **Básico:** Conoce fundamentos, requiere supervisión
  - **Intermedio:** Trabaja de forma independiente en tareas comunes
  - **Avanzado:** Resuelve problemas complejos, puede guiar a otros
  - **Experto:** Referente técnico, define arquitecturas y estándares
- [ ] Marcar tecnologías estratégicas vs en desuso
- [ ] Asociar recursos de aprendizaje por tecnología

**Prioridad:** Alta | **Story Points:** 5

---

#### HUS-AR-002: Perfil de Skills por Desarrollador
**Como** Desarrollador  
**Quiero** mantener mi perfil de tecnologías actualizado  
**Para** que se me asignen proyectos acordes a mis conocimientos

**Criterios de Aceptación:**
- [ ] Listar tecnologías conocidas con nivel de dominio
- [ ] Permitir auto-evaluación de nivel
- [ ] Registrar fecha de última actualización/validación
- [ ] Mostrar historial de evolución de skills
- [ ] Indicar tecnologías en aprendizaje
- [ ] Validación de nivel por líder técnico (opcional)

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-AR-003: Matriz de Skills del Equipo
**Como** Líder de Operaciones  
**Quiero** ver una matriz de skills de todo el equipo  
**Para** identificar fortalezas, gaps y riesgos de conocimiento

**Criterios de Aceptación:**
- [ ] Mostrar matriz: recursos (filas) vs tecnologías (columnas)
- [ ] Indicar nivel con código de colores
- [ ] Identificar tecnologías con pocos expertos (riesgo de bus factor)
- [ ] Identificar recursos con perfil único (especialistas críticos)
- [ ] Filtrar por squad, producto, tecnología
- [ ] Exportar matriz para análisis

**Prioridad:** Alta | **Story Points:** 8

---

### EPIC-AR-002: Plan de Capacitación

#### HUS-AR-004: Catálogo de Cursos y Recursos de Aprendizaje
**Como** Administrador de Capacitación  
**Quiero** mantener un catálogo de recursos de aprendizaje  
**Para** ofrecer opciones estructuradas de desarrollo

**Criterios de Aceptación:**
- [ ] Registrar por recurso de aprendizaje:
  - Nombre, proveedor, URL
  - Tecnología/skill asociada
  - Duración estimada
  - Costo (si aplica)
  - Nivel: básico, intermedio, avanzado
  - Tipo: curso online, certificación, libro, workshop, mentoring interno
- [ ] Marcar recursos recomendados vs opcionales
- [ ] Mostrar rating y reseñas de otros desarrolladores
- [ ] Indicar si la empresa cubre el costo

**Prioridad:** Media | **Story Points:** 5

---

#### HUS-AR-005: Rutas de Aprendizaje por Tecnología
**Como** Desarrollador  
**Quiero** ver rutas de aprendizaje estructuradas  
**Para** saber qué debo aprender para dominar una tecnología

**Criterios de Aceptación:**
- [ ] Definir por tecnología una ruta de aprendizaje con:
  - Prerequisitos
  - Cursos/recursos para cada nivel (básico → intermedio → avanzado → experto)
  - Proyectos de práctica recomendados
  - Certificaciones disponibles
- [ ] Mostrar tiempo estimado para completar cada nivel
- [ ] Indicar recursos completados por el usuario
- [ ] Sugerir siguiente paso basado en nivel actual

**Prioridad:** Media | **Story Points:** 8

---

#### HUS-AR-006: Plan de Desarrollo Individual
**Como** Desarrollador  
**Quiero** crear y gestionar mi propio plan de desarrollo  
**Para** crecer profesionalmente con objetivos claros

**Criterios de Aceptación:**
- [ ] Seleccionar tecnologías objetivo de la matriz
- [ ] Agregar cursos/recursos del catálogo a mi plan
- [ ] Establecer fechas meta para completar cada item
- [ ] Marcar avance y completitud
- [ ] Ver estimación de tiempo total del plan
- [ ] Compartir plan con líder para validación/apoyo
- [ ] Recibir recordatorios de deadlines próximos

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-AR-007: Seguimiento de Capacitación
**Como** Líder de Capacitación  
**Quiero** monitorear el avance de capacitación del equipo  
**Para** medir la inversión en desarrollo de talento

**Criterios de Aceptación:**
- [ ] Dashboard con:
  - Horas de capacitación por persona/mes
  - Cursos completados vs planificados
  - Certificaciones obtenidas
  - Inversión en capacitación por área
- [ ] Identificar recursos sin actividad de aprendizaje
- [ ] Medir impacto: mejora de nivel post-capacitación

**Prioridad:** Media | **Story Points:** 5

---

### EPIC-AR-003: Sistema de Evaluación y Compensación

#### HUS-AR-008: Definición de Niveles y Bandas Salariales
**Como** Director de Fábrica  
**Quiero** definir niveles de carrera con rangos salariales  
**Para** tener un sistema transparente de compensación

**Criterios de Aceptación:**
- [ ] Definir niveles de carrera:
  - **Junior (N1):** 0-2 años experiencia
  - **Semi-Senior (N2):** 2-4 años experiencia
  - **Senior (N3):** 4-6 años experiencia
  - **Tech Lead (N4):** 6+ años + liderazgo técnico
  - **Architect (N5):** 8+ años + visión estratégica
- [ ] Establecer por nivel:
  - Salario mínimo, punto medio, máximo
  - Skills y tecnologías esperadas (mínimo X tecnologías en nivel avanzado)
  - Responsabilidades y expectativas
  - Criterios de promoción al siguiente nivel
- [ ] Diferenciar por área/especialidad si aplica
- [ ] Revisar y ajustar anualmente

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-AR-009: Evaluación de Desempeño
**Como** Líder de Squad  
**Quiero** realizar evaluaciones periódicas de mi equipo  
**Para** medir su desempeño y dar feedback estructurado

**Criterios de Aceptación:**
- [ ] Configurar ciclos de evaluación (trimestral, semestral, anual)
- [ ] Evaluar dimensiones:
  - Competencia técnica (skills, calidad de código)
  - Productividad (entregables, cumplimiento)
  - Colaboración (trabajo en equipo, comunicación)
  - Iniciativa (proactividad, mejora continua)
  - Alineación a valores de la empresa
- [ ] Escala de evaluación: 1-5 con descriptores
- [ ] Incluir sección de feedback cualitativo
- [ ] Permitir auto-evaluación del recurso
- [ ] Generar calificación general ponderada

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-AR-010: Feedback 360°
**Como** Desarrollador  
**Quiero** recibir feedback de mis compañeros y líder  
**Para** tener una visión completa de mi desempeño

**Criterios de Aceptación:**
- [ ] Solicitar feedback de: líder, pares, reportes directos (si aplica)
- [ ] Cuestionario configurable por rol
- [ ] Garantizar anonimidad de respuestas de pares
- [ ] Consolidar feedback en reporte para el evaluado
- [ ] Identificar patrones consistentes vs opiniones aisladas

**Prioridad:** Baja | **Story Points:** 8

---

#### HUS-AR-011: Scoring de Nivel y Elegibilidad de Promoción
**Como** Sistema  
**Quiero** calcular un score de nivel para cada recurso  
**Para** determinar elegibilidad de promoción o ajuste salarial

**Criterios de Aceptación:**
- [ ] Calcular score basado en:
  - Nivel de skills (ponderado por relevancia para la fábrica)
  - Certificaciones obtenidas
  - Antigüedad
  - Evaluaciones de desempeño (últimas 2-3)
  - Feedback 360 (si disponible)
  - Contribuciones especiales (mentoring, liderazgo técnico)
- [ ] Comparar score vs requisitos del nivel actual y siguiente
- [ ] Identificar automáticamente candidatos a promoción
- [ ] Generar recomendación: mantener, ajuste salarial, promoción
- [ ] Mostrar gaps específicos para alcanzar siguiente nivel

**Prioridad:** Alta | **Story Points:** 13

---

### EPIC-AR-004: Portal de Crecimiento para el Desarrollador

#### HUS-AR-012: Mi Dashboard de Crecimiento
**Como** Desarrollador  
**Quiero** ver mi situación actual y posibilidades de crecimiento  
**Para** tener certidumbre sobre mi desarrollo profesional

**Criterios de Aceptación:**
- [ ] Mostrar en un solo lugar:
  - Mi nivel actual y banda salarial
  - Mi score actual vs score requerido para el siguiente nivel
  - Gap de skills: qué me falta para subir de nivel
  - Plan de desarrollo activo y % de avance
  - Próxima evaluación programada
  - Histórico de evaluaciones y feedback
- [ ] Visualizar ruta de crecimiento con próximos hitos
- [ ] Estimar tiempo para alcanzar siguiente nivel basado en ritmo actual

**Prioridad:** Alta | **Story Points:** 8

---

#### HUS-AR-013: Simulador de Crecimiento
**Como** Desarrollador  
**Quiero** simular qué pasaría si completo ciertas capacitaciones o certificaciones  
**Para** priorizar mi plan de desarrollo

**Criterios de Aceptación:**
- [ ] Permitir agregar skills/certificaciones hipotéticas
- [ ] Recalcular score simulado
- [ ] Mostrar impacto en elegibilidad de promoción
- [ ] Sugerir combinación óptima de capacitaciones para maximizar avance
- [ ] Comparar diferentes escenarios

**Prioridad:** Baja | **Story Points:** 8

---

#### HUS-AR-014: Solicitud de Promoción/Ajuste
**Como** Desarrollador  
**Quiero** solicitar una revisión de mi nivel o salario  
**Para** iniciar formalmente el proceso de promoción

**Criterios de Aceptación:**
- [ ] Generar solicitud con justificación basada en:
  - Score actual
  - Logros recientes
  - Skills adquiridos
  - Feedback positivo recibido
- [ ] Enviar a líder para revisión
- [ ] Tracking de estado de la solicitud
- [ ] Documentar resolución (aprobado, rechazado con motivo, diferido)

**Prioridad:** Media | **Story Points:** 5

---

## 💡 Recomendaciones Adicionales

### Módulos Complementarios Sugeridos

#### HUS-AD-001: Gestión de Vacaciones y Ausencias
**Como** Líder de Operaciones  
**Quiero** gestionar las ausencias del equipo  
**Para** considerar la capacidad real en la planificación

**Criterios de Aceptación:**
- [ ] Registrar tipos de ausencia: vacaciones, incapacidad, permiso, capacitación
- [ ] Flujo de aprobación de vacaciones
- [ ] Mostrar calendario de ausencias del equipo
- [ ] Calcular capacidad ajustada por sprint considerando ausencias
- [ ] Alertar conflictos (muchas ausencias en mismo período)

**Prioridad:** Media | **Story Points:** 8

---

#### HUS-AD-002: Gestión de Equipos y Assets
**Como** Administrador de IT  
**Quiero** llevar control del equipo asignado a cada recurso  
**Para** tener inventario actualizado y planificar renovaciones

**Criterios de Aceptación:**
- [ ] Registrar por recurso: laptop, monitores, licencias asignadas
- [ ] Tracking de estado del equipo
- [ ] Fecha de asignación y garantía
- [ ] Proceso de devolución al término de contrato
- [ ] Alertas de renovación de licencias

**Prioridad:** Baja | **Story Points:** 5

---

#### HUS-AD-003: Comunicación y Anuncios Internos
**Como** Director de Fábrica  
**Quiero** un canal para comunicados internos  
**Para** mantener informado al equipo sobre cambios importantes

**Criterios de Aceptación:**
- [ ] Publicar anuncios con categoría: general, urgente, celebración
- [ ] Segmentar por squad, producto, nivel
- [ ] Registro de lectura por usuario
- [ ] Destacar anuncios no leídos en el dashboard

**Prioridad:** Baja | **Story Points:** 5

---

#### HUS-AD-004: Health Check del Equipo
**Como** Scrum Master  
**Quiero** realizar health checks periódicos del equipo  
**Para** identificar problemas de clima laboral tempranamente

**Criterios de Aceptación:**
- [ ] Encuestas anónimas configurables
- [ ] Dimensiones: satisfacción, carga de trabajo, comunicación, herramientas, crecimiento
- [ ] Tendencia histórica por dimensión
- [ ] Comparativo entre squads (agregado)
- [ ] Plan de acción para dimensiones críticas

**Prioridad:** Baja | **Story Points:** 5

---

#### HUS-AD-005: Alertas Inteligentes y Notificaciones
**Como** Líder de Operaciones  
**Quiero** recibir alertas proactivas sobre riesgos  
**Para** tomar acciones correctivas a tiempo

**Criterios de Aceptación:**
- [ ] Configurar umbrales para alertas como:
  - Recurso con >100% de capacidad asignada
  - Feature con proyección de retraso >1 sprint
  - Tasa de bugs superior al promedio
  - Recurso sin registro de horas >3 días
  - Candidato en pipeline >30 días sin avance
  - Recurso sin plan de desarrollo activo
  - Evaluación pendiente vencida
- [ ] Notificaciones por email y/o in-app
- [ ] Dashboard de alertas activas con prioridad

**Prioridad:** Media | **Story Points:** 8

---

## 📊 Resumen de Indicadores Recomendados

### Indicadores de Operaciones
| Indicador | Descripción | Meta Sugerida |
|-----------|-------------|---------------|
| Velocity Promedio | Story points por sprint por squad | Estable ±15% |
| Commitment Reliability | % cumplimiento del sprint | >85% |
| Lead Time | Días desde solicitud hasta producción | <15 días |
| Cycle Time | Días en desarrollo activo | <5 días |
| Defect Density | Bugs por 100 SP | <5 bugs |
| Release Frequency | Releases por semana | >1 por producto |
| Rollback Rate | % releases con rollback | <5% |
| Estimation Accuracy | Desviación estimado vs real | <20% |

### Indicadores de Gestión de Talento
| Indicador | Descripción | Meta Sugerida |
|-----------|-------------|---------------|
| Time to Hire | Días desde vacante hasta incorporación | <45 días |
| Onboarding Completion | % recursos con onboarding completo | 100% |
| Training Hours | Horas de capacitación por persona/mes | >8 horas |
| Skill Coverage | % tecnologías con >2 expertos | >80% |
| Turnover Rate | % rotación anual | <15% |
| Promotion Rate | % recursos promovidos/año | 10-20% |

---

## 🔗 Integraciones Futuras Recomendadas

1. **Azure DevOps** - Sincronización de work items, sprints, commits
2. **Git (Azure Repos/GitHub)** - Métricas de commits, PRs, code review
3. **Azure Pipelines** - Datos de releases y deployments
4. **Calendario (Outlook/Google)** - Ausencias y reuniones
5. **Sistema de Nómina** - Datos de compensación y costos
6. **LMS (Learning Management System)** - Cursos y certificaciones

---

## 📝 Notas Finales

### Priorización Sugerida para MVP

**Sprint 1-2 (Fundamentos):**
- HUS-AR-001: Catálogo de Tecnologías
- HUS-AR-002: Perfil de Skills
- HUS-RC-001: Gestión de Candidatos
- HUS-OP-015: Registro de Horas

**Sprint 3-4 (Operaciones Core):**
- HUS-OP-001: Roadmap de Asignaciones
- HUS-OP-003: Dashboard de Sprint
- HUS-OP-009: Iniciativas Encoladas
- HUS-OP-011: Métricas de Sprint

**Sprint 5-6 (Capacitación y Crecimiento):**
- HUS-AR-006: Plan de Desarrollo Individual
- HUS-AR-008: Niveles y Bandas Salariales
- HUS-AR-012: Dashboard de Crecimiento
- HUS-RC-005: Perfil Técnico Inicial

**Sprint 7-8 (Avanzado):**
- HUS-OP-007: Pipeline de Iniciativas
- HUS-OP-019: Dashboard de Releases
- HUS-AR-009: Evaluación de Desempeño
- HUS-AR-011: Scoring de Nivel

---

*Documento generado para planificación de desarrollo. Todas las HUS deben ser refinadas con el equipo antes de su implementación.*
