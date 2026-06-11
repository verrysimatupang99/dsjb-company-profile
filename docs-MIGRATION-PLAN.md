# Rencana Migrasi Hosting DSJB (draft, lanjut nanti)

_Dibuat: 2026-06-11. Status: PERENCANAAN — belum dieksekusi._

## Keputusan arah (disepakati)
- SuperApp (Next.js + Postgres, dinamis) -> DigitalOcean droplet (pakai kredit $200).
- Company profile (statis) -> Cloudflare Pages / GitHub Pages (gratis), BUKAN Heroku.
- Heroku di-skip (mubazir untuk static; DO lebih hemat untuk dinamis).
- Konsolidasi sebelum kredit/subscription AWS & Azure habis.

## Kenapa bukan Heroku
- Company profile = HTML statis -> ideal di CDN gratis, bukan dyno berbayar.
- Heroku ~$12/bln x 24 = ~Rp5,1jt keluar, kredit DO ~Rp3,5jt hangus.
- DO: tahun-1 gratis dari kredit, total 2 thn keluar ~Rp1,6-2,6jt. Hemat ~Rp2,5-3,5jt.
- Rate acuan: 1 USD = ~Rp17.917 (11 Jun 2026).

## Domain (penting, sumber kebingungan)
- `dsitujayabersama.com` SUDAH dimiliki (registrar Spaceship). Tidak perlu daftar/beli lagi.
- "Custom domain" di Pages = hubungkan domain yang sudah ada. Pengunjung tetap buka
  `dsitujayabersama.com` (bukan URL *.github.io). HTTPS otomatis.
- Domain != hosting. Pindah hosting = pindah "gedung", alamat (domain) tetap.
- Email (Spacemail MX/DKIM/SPF) TIDAK disentuh saat pindah web. admin@, direkturutama@,
  komisaris@ tetap aman. Yang diubah hanya record web: A `@` dan CNAME `www`.

## Opsi company profile (pilih salah satu nanti)
### Opsi A — GitHub Pages (DNS manual)
- Aku urus: file CNAME (sudah ada), aktifkan Pages + custom domain via `gh` CLI, verifikasi.
- Kamu bantu: 1 klik `Edit` baris DNS di Spaceship; aku isi nilainya.
- A `@` -> 185.199.108.153 / .109 / .110 / .111 ; CNAME `www` -> verrysimatupang99.github.io
- JANGAN sentuh: MX, TXT SPF, spacemail._domainkey DKIM, SRV autodiscover, tbolt TXT,
  openai-domain-verification TXT, record portal.*

### Opsi B — Cloudflare Pages (DNS via Cloudflare, aku full-handle)
- Pindahkan manage DNS domain ke Cloudflare (ganti nameserver di Spaceship).
- Setelah itu DNS bisa aku kelola penuh via API; CDN terbaik untuk Indonesia.
- Saat pindah NS, semua record (termasuk email) harus disalin ke Cloudflare dulu.

## SuperApp -> DigitalOcean (ringkas)
- Droplet 2GB RAM / 1 vCPU / 50GB, region SGP1 (Singapura, latensi terkecil ke ID).
- Stack: Nginx (reverse proxy + TLS) -> Next.js + Postgres, satu box.
- Migrasi Postgres SUDAH disiapkan di staging EC2 (corporate-superapp-pg, port 3100).
- Cutover, bukan mulai dari nol. Runbook: docs/CUTOVER-POSTGRES-DOMAIN.md (di repo corporate-superapp).
- Subdomain rencana: app.dsitujayabersama.com.

## Urutan eksekusi (saat lanjut)
1. Pilih Opsi A atau B untuk company profile.
2. Provision droplet DO SGP1 + Docker/Nginx/Postgres.
3. Deploy SuperApp ke droplet (pakai runbook Postgres).
4. Pindah company profile ke Pages (Opsi A/B).
5. Arahkan domain: app.* -> droplet, root/www -> Pages.
6. Matikan resource lama (EC2 AWS, Spaceship web) setelah verifikasi.

## Utang teknis terkait (jangan lupa)
- Rotasi Google service-account key yang ter-commit di repo dsjb-superapp (URGEN).
- Auto-deploy company profile: .github/workflows/deploy.yml sudah ada (FTP). Untuk Pages
  tidak perlu FTP; cukup push ke main.
