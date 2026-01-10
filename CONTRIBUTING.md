# Contributing to trainee-wallet

## Flujo de trabajo
- La rama `main` siempre debe estar estable.
- Todo cambio se hace desde una rama:
  - `feat/*` nuevas funcionalidades
  - `fix/*` correcciones
  - `chore/*` tareas técnicas
  - `ci/*` infraestructura / pipelines

## Commits
Usamos Conventional Commits:
- feat: nueva funcionalidad
- fix: bugfix
- chore: tooling / config
- docs: documentación
- test: tests

Ejemplo:
feat(auth): add jwt login

## Reglas para merge
- El CI debe estar en verde
- Los tests unitarios y e2e deben pasar
- El código debe pasar lint
