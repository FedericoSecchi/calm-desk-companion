# Backend TODO - Calmo

Este documento lista las tareas pendientes de backend que se identificaron durante el desarrollo del frontend.

## ✅ Implementado

### Tablas Existentes

1. **`profiles`**
   - Perfiles de usuario
   - RLS habilitado

2. **`pain_records`**
   - Registros de dolor
   - Campos: `id`, `user_id`, `intensity`, `area`, `note`, `created_at`
   - RLS habilitado

3. **`reminder_settings`**
   - Configuración del timer de Recordatorios
   - Campos: `user_id`, `preset`, `sound_enabled`, `notifications_enabled`
   - RLS habilitado

4. **`water_logs`**
   - Registros de vasos de agua
   - Campos: `id`, `user_id`, `created_at`
   - RLS habilitado

5. **`break_logs`**
   - Registros de pausas completadas
   - Campos: `id`, `user_id`, `type` ("reminder" | "exercise" | "other"), `created_at`
   - RLS habilitado

## 🔨 Pendiente

### 1. Manual Break Adjustments

**Estado:** Funciona en guest mode con `localStorage`, pero no persiste en auth mode.

**Necesidad:**
- Tabla: `manual_break_adjustments`
- Campos:
  - `id` (UUID, primary key)
  - `user_id` (UUID, foreign key to auth.users)
  - `date` (DATE, fecha del ajuste)
  - `adjustment` (INTEGER, puede ser positivo o negativo)
  - `created_at` (TIMESTAMP)
- Índices:
  - `(user_id, date)` para queries rápidas
- RLS: Usuarios solo pueden ver/insertar sus propios ajustes

**Uso:**
- Permite a usuarios corregir manualmente su contador de pausas del día
- Se suma a las pausas del timer para obtener el total

**Prioridad:** Media (funciona en guest mode, pero necesaria para auth mode)

### 2. Múltiples Zonas de Dolor

**Estado:** El frontend está preparado para múltiples zonas, pero el backend solo soporta una.

**Opciones de Implementación:**

**Opción A: Cambiar `area` a `areas` (array)**
- Modificar columna `area` en `pain_records` de `TEXT` a `TEXT[]` (PostgreSQL array)
- Ventaja: Simple, no requiere cambios en queries
- Desventaja: Menos normalizado, más difícil de consultar por zona específica

**Opción B: Tabla relacionada `pain_record_areas`**
- Crear nueva tabla: `pain_record_areas`
- Campos: `id`, `pain_record_id`, `area` (TEXT)
- Relación: `pain_record_areas.pain_record_id → pain_records.id`
- Ventaja: Normalizado, fácil de consultar por zona
- Desventaja: Requiere JOINs en queries

**Recomendación:** Opción A (más simple, suficiente para el caso de uso)

**Prioridad:** Baja (funcionalidad actual es suficiente)

### 3. Reset Diario Manual

**Estado:** Los resets automáticos funcionan (por cambio de fecha), pero no hay UI para reset manual.

**Necesidad:**
- No requiere backend nuevo
- Solo necesita UI en Dashboard:
  - Botón "Reset ajustes del día"
  - Botón "Reset agua del día"
- Estos botones llamarían a `resetToday()` del hook `useManualBreakAdjustments`

**Prioridad:** Baja (resets automáticos funcionan)

### 4. Recordatorios de Agua Avanzados

**Estado:** Documentado como futuro, no implementado.

**Necesidad:**
- Tabla: `water_reminder_settings`
- Campos:
  - `user_id` (UUID)
  - `enabled` (BOOLEAN)
  - `interval_minutes` (INTEGER, intervalo entre recordatorios)
  - `auto_enable_during_focus` (BOOLEAN, activar automáticamente durante foco)
- Integración con timer de Recordatorios
- Notificaciones independientes del timer

**Prioridad:** Baja (funcionalidad básica de agua funciona)

### 5. Ejercicios Completados

**Estado:** La sección Ejercicios existe pero no persiste completados.

**Necesidad:**
- Tabla: `exercise_completions`
- Campos:
  - `id` (UUID)
  - `user_id` (UUID)
  - `exercise_id` (TEXT, referencia al ejercicio)
  - `completed_at` (TIMESTAMP)
- RLS habilitado
- Integración con recomendaciones después de REST

**Prioridad:** Media (mejora UX de ejercicios)

### 6. Análisis y Recomendaciones (IA)

**Estado:** Documentado como futuro, no implementado.

**Necesidad:**
- Backend para análisis de patrones
- API para recomendaciones personalizadas
- Posible integración con servicios externos de IA

**Prioridad:** Muy Baja (funcionalidad core funciona sin esto)

## Notas de Implementación

### Migraciones

Todas las migraciones deben:
1. Ser idempotentes (usar `IF NOT EXISTS`, `DROP IF EXISTS`)
2. Incluir RLS policies
3. Incluir índices apropiados
4. Ser reversibles (documentar rollback)

### RLS (Row Level Security)

Todas las tablas deben:
- Habilitar RLS: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`
- Políticas para SELECT: Usuarios solo ven sus propios registros
- Políticas para INSERT: Usuarios solo pueden insertar con su `user_id`
- Políticas para UPDATE/DELETE: Usuarios solo pueden modificar sus propios registros

### Índices

Índices recomendados para performance:
- `(user_id, created_at DESC)` para queries por usuario y fecha
- `(user_id, date)` para queries de ajustes manuales
- `(created_at DESC)` para queries globales de fecha

## Testing

Antes de implementar cualquier cambio:
1. Verificar que no rompe guest mode
2. Verificar que RLS funciona correctamente
3. Verificar que los índices mejoran performance
4. Probar con datos reales (no solo mock)
