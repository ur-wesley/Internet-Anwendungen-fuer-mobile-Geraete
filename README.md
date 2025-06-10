# Media Manager

mobile-first Media Manager mit SolidJS, TypeScript und UnoCSS.

> in der Abgabe ist bereits eine gebaute Version enthalten, die unter `dist/` zu finden ist. Um die App zu starten einfach installieren und den `serve` befehl ausführen. Alternativ ist hier die gebaute Version zu finden: [Github Pages](https://ur-wesley.github.io/Internet-Anwendungen-fuer-mobile-Geraete/).
> Das Repository dazu lautet: [ur-wesley/Internet-Anwendungen-fuer-mobile-Geraete](https://github.com/ur-wesley/Internet-Anwendungen-fuer-mobile-Geraete).

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

> `clearMediaStorage()` in der Browser Konsole löscht die IndexedDB-Datenbank und setzt die App zurück.

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
