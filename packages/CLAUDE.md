# CLAUDE.md

## Packages

A pasta `/packages` contém código compartilhado entre `apps/mobile` e `apps/server`.

### shared

Responsável por:

- Schemas Zod
- Validações
- Contratos de entrada e saída da API

Regras:

- Use Zod para todas as validações.
- Nomeie schemas com o sufixo `Schema`.
- Exporte os tipos inferidos quando necessário.
- Não coloque lógica de negócio.

### types

Responsável por:

- Tipos TypeScript compartilhados

Regras:

- Não importar Zod.
- Não criar validações.
- Não depender de runtime.
- Manter tipos simples e reutilizáveis.

### api-client

Responsável por:

- Cliente Hono RPC
- Comunicação entre aplicações e API

Regras:

- Centralizar a criação do cliente.
- Não conter componentes, hooks ou telas.
- Não conter lógica de negócio específica do app.

## Regras Gerais

- Código em `/packages` deve ser compartilhável entre frontend e backend.
- Evite duplicação entre `apps/*` e `packages/*`.
- Não utilizar dependências específicas de Expo ou React Native.
- Não utilizar dependências específicas de Hono server runtime.
- Evite dependências circulares entre packages.
- Exporte APIs públicas através de `src/index.ts`.
- Prefira imports a partir do package (`@martinez/shared`, `@martinez/types`, `@martinez/api-client`) em vez de caminhos internos.

## Estrutura

```txt
packages/
├── shared/
├── types/
└── api-client/
```

## Objetivo

Manter uma única fonte de verdade para contratos, validações, tipos e integração com a API, garantindo consistência entre mobile e server.
