# Dockerfile PRODUCTION -- multi-stage, tanpa devDependencies di image
# akhir, non-root user. Pola sengaja dibuat SIMETRIS dengan Dockerfile
# di repo backend (builder -> prod-deps -> runner) supaya dua project
# ini konsisten secara filosofi, bukan cuma kebetulan sama-sama Docker.

# =============================================================================
# Stage 1: builder -- compile Svelte/TypeScript -> JS (adapter-node)
# via `vite build`. Butuh devDependencies (svelte, @sveltejs/kit,
# @sveltejs/adapter-node, vite, dst -- semua ada di devDependencies,
# TIDAK ADA "dependencies" terpisah di package.json project ini),
# makanya `npm ci` PENUH di stage ini, bukan --omit=dev.
# =============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# `COPY . .` di sini (BEDA dari Dockerfile backend yang copy file
# spesifik) -- SvelteKit butuh hampir seluruh root project saat build
# (vite.config.ts, tsconfig.json, src/, static/, dst), jadi tidak ada
# daftar file singkat yang lebih murah selain full copy. .dockerignore
# tetap memastikan node_modules/build lokal/test tidak ikut serta
# membengkakkan build context.
COPY . .

# Hasil: build/ -- server Node standalone (adapter-node), berisi
# build/index.js (entry point dijalankan via `node build`), aset
# client sudah di-bundle & di-hash di dalamnya.
RUN npm run build

# =============================================================================
# Stage 2: prod-deps -- install ULANG dari nol, cuma dependencies
# production (--omit=dev), dipisah dari node_modules stage builder
# (SAMA alasan dengan BE: image akhir dijamin bersih dari
# devDependencies tanpa bergantung pada `npm prune`).
#
# CATATAN JUJUR: package.json project ini SAAT INI tidak punya field
# "dependencies" sama sekali (semua di devDependencies) -- adapter-node
# nge-bundle nyaris semua kode aplikasi (termasuk dependency internal
# SvelteKit) langsung ke dalam build/ lewat Rollup, jadi node_modules
# runtime PRAKTIS kosong untuk sekarang. Stage ini tetap dipertahankan
# (bukan dihapus) supaya kalau nanti nambah dependency runtime asli
# (mis. driver database, HTTP client server-side, dst di
# "dependencies"), Dockerfile ini TIDAK perlu diubah strukturnya sama
# sekali -- cukup jalan seperti biasa.
# =============================================================================
FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# =============================================================================
# Stage 3: runner -- image akhir yang benar-benar jalan di production.
# Cuma berisi: runtime Node, node_modules production (lihat catatan di
# atas), dan build/ hasil adapter-node. TIDAK ada source Svelte/TS,
# TIDAK ada devDependencies, TIDAK ada tests/, TIDAK ada file config
# yang tidak relevan di runtime.
# =============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# adapter-node baca PORT & HOST dari env saat start -- default adapter
# sebenarnya sudah 3000/0.0.0.0, di-set eksplisit di sini murni supaya
# terlihat jelas & gampang di-override tanpa baca dokumentasi adapter.
ENV PORT=3000
ENV HOST=0.0.0.0

# node:22-alpine SUDAH menyediakan user non-root bernama `node` (uid/gid
# 1000) bawaan image resmi -- tidak perlu bikin user baru sendiri.
# `--chown` di setiap COPY memastikan file dimiliki user itu, BUKAN
# root, dari awal.
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/build ./build
COPY --chown=node:node package.json ./

USER node

EXPOSE 3000

# TIDAK ada endpoint /api/health seperti di backend -- app ini SPA
# murni (ssr = false, lihat src/routes/+layout.ts) yang selalu
# nge-serve index.html yang sama untuk request apapun ke server Node
# ini, terlepas dari status backend NestJS. Jadi cek root path `/`
# sudah representatif: kalau ini gagal, server Node-nya sendiri yang
# bermasalah (bukan soal konektivitas ke backend, itu ranah health
# check backend sendiri). wget dipakai karena itu yang tersedia bawaan
# di Alpine (BusyBox), curl tidak terpasang default.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- "http://localhost:${PORT:-3000}/" || exit 1

# Bentuk exec (array), BUKAN bentuk shell (`CMD node build`) -- supaya
# `node` benar-benar jadi PID 1 dan menerima SIGTERM langsung dari
# Docker/orchestrator untuk graceful shutdown, bukan tertelan `/bin/sh -c`
# seperti bentuk shell. (adapter-node sendiri sudah handle SIGTERM
# secara default untuk stop menerima koneksi baru & selesaikan yang
# sedang berjalan.)
CMD ["node", "build"]