# Media Manager

mobile-first Media Manager mit SolidJS, TypeScript und UnoCSS.

## Schnellstart

### Entwicklungsumgebung starten

```bash
# Mit Bun (empfohlen)
bun install
bun dev

# Alternativ mit Node.js/npm
npm install
npm run dev
```

Die Anwendung läuft unter: `http://localhost:3000`

### Produktions-Build erstellen

```bash
# Mit Bun
bun run build
bun run serve

# Alternativ mit Node.js/npm
npm run build
npm run serve
```

Der Build wird unter: `http://localhost:4173` bereitgestellt.

## Hinweise

- **Bun** ist die empfohlene Runtime für beste Performance
- **Node.js** (Version 18+) wird ebenfalls unterstützt
- Die App nutzt IndexedDB für lokale Datenspeicherung
- Optimiert für mobile Geräte und Touch-Bedienung

## Techstack

- [SolidJS](https://solidjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [UnoCSS](https://unocss.dev/)
- [shadcn-solid](https://shadcn-solid.com/)
- [Vite](https://vitejs.dev/)
- [Biome](https://biomejs.dev/)
- [Bun](https://bun.sh/)
