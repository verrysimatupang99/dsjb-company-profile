# Admin Konten DSJB

Panel admin statis tersedia di `/admin/`. Panel ini mengedit `data/company-profile.json` melalui GitHub API, lalu GitHub Actions men-deploy hasilnya ke Spaceship Hosting.

## Cara Pakai

1. Buat GitHub fine-grained personal access token.
2. Beri akses hanya ke repo `verrysimatupang99/dsjb-company-profile`.
3. Permission minimal: `Contents: Read and write`.
4. Buka `https://dsitujayabersama.com/admin/`.
5. Masukkan token.
6. Klik `Load dari GitHub`.
7. Edit konten.
8. Klik `Publish ke GitHub`.
9. Tunggu GitHub Actions selesai.

Token disimpan hanya di `localStorage` browser admin. Jangan pakai komputer publik.

## File Yang Diedit

- `data/company-profile.json`

## Deploy

Workflow `.github/workflows/deploy.yml` akan menjalankan test dan deploy via FTPS jika secrets tersedia:

- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_REMOTE_DIR`

Jika secrets tidak tersedia, workflow tetap sukses dan deploy FTP dilewati.

## Keamanan

- `/admin/` diberi `noindex,nofollow`.
- `robots.txt` menolak crawl `/admin/`.
- Tidak ada token/API key disimpan di source code.
- Semua perubahan konten masuk Git history, jadi bisa rollback.
