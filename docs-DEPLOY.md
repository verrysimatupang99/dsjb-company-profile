# Auto-Deploy Company Profile → Spaceship Hosting

Pipeline: push ke branch `main` di GitHub → jalankan test → deploy file statis via FTPS ke hosting Spaceship (LiteSpeed/cPanel).

## Setup sekali (di GitHub repo: verrysimatupang99/dsjb-company-profile)
Settings → Secrets and variables → Actions → New repository secret:

- `FTP_SERVER` : host FTP Spaceship (mis. `ftp.dsitujayabersama.com` atau IP `66.29.148.118`)
- `FTP_USERNAME` : user FTP cPanel
- `FTP_PASSWORD` : password FTP cPanel
- `FTP_REMOTE_DIR` : folder publik, biasanya `public_html/` (atau `htdocs/`)

Cara dapat kredensial FTP: cPanel Spaceship → "FTP Accounts" → buat/lihat akun FTP.

## Cara pakai
- Edit konten → commit → push ke `main`. Deploy otomatis jalan.
- Manual: tab Actions → workflow "Deploy to Spaceship Hosting (FTP)" → Run workflow.

## Catatan keamanan
- Kredensial HANYA disimpan sebagai GitHub Secrets (terenkripsi), tidak pernah di repo.
- FTPS dipakai (terenkripsi). Kalau host hanya FTP biasa, ubah `protocol: ftps` → `ftp` (kurang aman).
- File dev (node_modules, test, package.json, story PNG) di-exclude agar tidak ikut ter-upload.

## Alternatif (kalau mau pindah dari shared hosting)
- Cloudflare Pages / GitHub Pages: gratis, CDN global, auto-HTTPS, auto-deploy dari Git.
- Untuk itu DNS `@`/`www` perlu diarahkan ke target Pages (CNAME/A) di Spaceship Advanced DNS.
