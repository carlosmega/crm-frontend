# Maintenance Guide

> **Políticas y procedimientos de mantenimiento del proyecto**

---

## POLÍTICA DE DUPLICADOS

### Regla de Oro

**❌ NUNCA crear archivos versionados**

Patrones prohibidos:
- `component-v2.tsx`
- `component-v3.tsx`
- `component-improved.tsx`
- `component-backup.tsx`
- `component-old.tsx`
- `component-final.tsx`
- `page-test.tsx`

**✅ Usar Git para control de versiones**

No sufijos en nombres de archivos. Git es tu sistema de versiones.

---

## FLUJO DE TRABAJO CORRECTO

### Experimentación con Git Branches

```bash
# 1. Crear rama para experimentos
git checkout -b feature/experiment-name

# 2. Hacer cambios en el archivo original (NO crear duplicados)
# Editar: component.tsx (no component-v2.tsx)

# 3. Commitear cuando funcione
git add component.tsx
git commit -m "refactor: improve component performance"

# 4. Merge a main cuando esté listo
git checkout main
git merge feature/experiment-name

# 5. Eliminar rama experimental
git branch -d feature/experiment-name
```

### Comparar Versiones

```bash
# Ver diferencias con versión anterior
git diff HEAD~1 component.tsx

# Ver historial de cambios
git log --oneline component.tsx

# Restaurar versión anterior si es necesario
git checkout HEAD~1 -- component.tsx
```

---

## ARCHIVOS TEMPORALES PROHIBIDOS

### Patrones a Evitar

```bash
# ❌ NO CREAR estos patrones:
component-v2.tsx
component-improved.tsx
component-backup.tsx
component-old.tsx
component-final.tsx
page-test.tsx
utils-copy.ts
types-new.ts
```

### Alternativas Correctas

```bash
# ✅ SÍ USAR Git branches:
git checkout -b refactor/component-name
# ... hacer cambios en component.tsx
git commit -m "refactor: improve component performance"
git checkout main
git merge refactor/component-name

# ✅ SÍ USAR stash para cambios temporales:
git stash save "temporary changes"
# ... hacer otros cambios
git stash pop

# ✅ SÍ USAR feature flags:
const useNewImplementation = process.env.NEXT_PUBLIC_USE_NEW_FEATURE === 'true'
```

---

## LIMPIEZA REGULAR

### Buscar Archivos Versionados

```bash
# Buscar archivos con patrones prohibidos
find src -name "*-v[0-9]*.tsx" -o -name "*-improved*.tsx" -o -name "*-backup*.tsx"

# En Windows PowerShell
Get-ChildItem -Recurse -Include *-v*.tsx,*-improved*.tsx,*-backup*.tsx
```

### Buscar Imports No Usados

```bash
# Instalar ts-prune
npm install -D ts-prune

# Ejecutar análisis
npx ts-prune
```

**Output esperado**:
```
src/components/unused-component.tsx:1 - default (used in module)
src/utils/old-helper.ts:15 - oldFunction
```

### Analizar Bundle Size

```bash
# Build con análisis
npm run build

# Usar @next/bundle-analyzer (opcional)
npm install -D @next/bundle-analyzer
```

**next.config.js**:
```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... config
})
```

```bash
# Analizar bundle
ANALYZE=true npm run build
```

---

## ACTUALIZACIÓN DE DEPENDENCIAS

### Dependencias de Seguridad (Crítico)

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar automáticamente (patch y minor)
npm audit fix

# Ver vulnerabilidades sin instalar
npm audit --dry-run
```

### Dependencias Mayores

```bash
# Verificar versiones desactualizadas
npm outdated

# Actualizar Next.js (verificar breaking changes)
npm install next@latest react@latest react-dom@latest

# Actualizar todas las dependencias minor/patch
npm update

# Actualizar dependencia específica a latest
npm install package-name@latest
```

### Verificación Post-Actualización

```bash
# 1. Reinstalar desde cero
rm -rf node_modules package-lock.json
npm install

# 2. Verificar tipos
npm run type-check  # (si existe el script)

# 3. Ejecutar tests
npm run test

# 4. Build de producción
npm run build

# 5. Verificar en desarrollo
npm run dev
```

---

## LIMPIEZA DE CACHE

### Next.js Cache

```bash
# Limpiar cache de Next.js
rm -rf .next

# En Windows
rmdir /s /q .next

# Rebuild
npm run build
```

### Node Modules

```bash
# Limpiar e reinstalar
rm -rf node_modules package-lock.json
npm install

# En Windows
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Git Cache

```bash
# Limpiar archivos no trackeados
git clean -fd

# Ver qué se eliminará (dry-run)
git clean -fdn
```

---

## CODE QUALITY

### ESLint

```bash
# Ejecutar linter
npm run lint

# Auto-fix cuando sea posible
npm run lint -- --fix
```

### Prettier (si configurado)

```bash
# Formatear todos los archivos
npx prettier --write "src/**/*.{ts,tsx}"

# Verificar formato sin cambiar
npx prettier --check "src/**/*.{ts,tsx}"
```

### TypeScript Strict Mode

**tsconfig.json** (recomendado):
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## MONITOREO DE HEALTH

### Checks Regulares (Semanal)

- [ ] `npm audit` sin vulnerabilidades HIGH/CRITICAL
- [ ] `npm outdated` revisado
- [ ] `npm run build` exitoso
- [ ] Bundle size dentro de targets (< 180KB/página)
- [ ] No hay archivos versionados (`*-v2.tsx`, etc.)
- [ ] Git branches obsoletas eliminadas

### Checks Mensuales

- [ ] Actualizar dependencias minor/patch
- [ ] Revisar y limpiar imports no usados
- [ ] Analizar bundle size con @next/bundle-analyzer
- [ ] Revisar logs de errores en producción
- [ ] Actualizar documentación si hay cambios

### Checks Trimestrales

- [ ] Revisar breaking changes de Next.js
- [ ] Actualizar dependencias major (con cuidado)
- [ ] Auditoría de seguridad completa
- [ ] Performance audit (Lighthouse)
- [ ] Revisar y refactorizar código legacy

---

## SCRIPTS ÚTILES

### package.json (agregar si no existen)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf .next node_modules",
    "clean:cache": "rm -rf .next",
    "analyze": "ANALYZE=true npm run build",
    "audit:deps": "npm audit",
    "audit:fix": "npm audit fix",
    "update:deps": "npm update",
    "outdated": "npm outdated"
  }
}
```

---

## GIT HOOKS (OPCIONAL)

### Pre-commit Hook

Instalar husky:
```bash
npm install -D husky lint-staged
npx husky install
```

**.husky/pre-commit**:
```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged
```

**package.json**:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## DOCUMENTACIÓN DE CAMBIOS

### CHANGELOG.md

Mantener registro de cambios significativos:

```markdown
# Changelog

## [1.2.0] - 2025-01-03

### Added
- Sub-grids en Account detail view
- Tab standardization en 8 entidades

### Changed
- Actualizado Next.js a 15.5.9 (CVE-2025-66478)
- Actualizado React a 19.2.3 (CVE-2025-55182)

### Fixed
- Card wrapper innecesario en formularios
- Portal rendering en tabs

## [1.1.0] - 2024-12-15
...
```

---

## RECURSOS

- **npm audit**: https://docs.npmjs.com/cli/v8/commands/npm-audit
- **ts-prune**: https://github.com/nadeesha/ts-prune
- **Next.js Bundle Analyzer**: https://www.npmjs.com/package/@next/bundle-analyzer
- **Husky**: https://typicode.github.io/husky/
