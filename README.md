# skiutah — utahpublicski.org

Static site: `/` (home + Powder Petition), `/financials/`, `/contact/`, `/financial-summary.pdf`.

- `assets/css/site.css`, `assets/js/*`: shared styles and behavior. Images are WebP in `assets/img/`.
- `python3 -m http.server 8080` to preview.
- `npm i && npm run pdf` regenerates `financial-summary.pdf` from `tools/financial-summary.html`.
- `tools/reference/`: original v15 PDF (content source of truth).

## To wire up before launch
- Forms: paste `tools/apps-script.gs` into the sheet's Apps Script, deploy as web app (Anyone), put the /exec URL in `assets/js/config.js`. Goal auto-steps (500 <2k, 1k <10k, 5k <100k), jumping when within 100.
- Replace LinkedIn/Facebook URLs and confirm `hello@utahpublicski.org` in `contact/index.html`.
