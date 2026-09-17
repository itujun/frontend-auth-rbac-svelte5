/**
 * Resolve avatarUrl dari backend jadi URL yang siap dipakai di elemen
 * <img src>.
 *
 * Backend mengirim salah satu dari dua bentuk avatarUrl:
 * - URL absolut (avatar upload user, sejak migrasi R2): sudah lengkap
 *   dengan domain (https://pub-xxxx.r2.dev/... atau custom domain nanti
 *   kalau sudah di-setup) -- dipakai APA ADANYA.
 * - Path relatif (avatar default, tetap disajikan dari backend lokal,
 *   lihat AvatarStorageService di sisi server -- default avatar sengaja
 *   TIDAK ikut pindah ke R2): perlu di-prefix dengan origin API.
 *
 * Tanpa pengecekan ini, kedua kasus diperlakukan sama (selalu di-prefix
 * apiOrigin) -- untuk avatar dari R2 hasilnya jadi URL rusak:
 * "http://localhost:3000https://pub-xxxx.r2.dev/...".
 *
 * apiOrigin diterima sebagai parameter (bukan di-import langsung dari
 * $lib/api/client di dalam fungsi ini) supaya fungsi tetap pure dan
 * gampang di-unit-test tanpa perlu mock module API client -- pemanggil
 * yang menyuplai API_ORIGIN dari import mereka sendiri.
 */
export function resolveAvatarUrl(avatarUrl: string, apiOrigin: string): string {
	if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
		return avatarUrl;
	}
	return `${apiOrigin}${avatarUrl}`;
}
