# NodeNexus Panel

Frontend panel for [NodeNexus API](https://github.com/NodeNexusDev/node_nexus_api).

## Tech Stack

- React 19 + TypeScript 6
- Vite 8
- TailwindCSS 4

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + build |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview build |

## Documentation

Docs are built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and deployed to GitHub Pages.

```bash
# Install deps
pip install -r requirements-docs.txt

# Local preview
mkdocs serve -f mkdocs.en.yml
mkdocs serve -f mkdocs.ru.yml

# Validate docs
python scripts/docs/check_docs.py
```

## License

[MIT](LICENSE)
