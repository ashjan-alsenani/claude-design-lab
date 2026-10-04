"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CameraIcon, CheckIcon } from "@phosphor-icons/react";
import type { Locale } from "@/i18n/config";
import type { LicensingCopy } from "@/i18n/licensing";
import { AVATAR_COLOR_VALUES, AVATAR_COLORS, AVATAR_SIZE, defaultAvatarColor, initials, type Avatar } from "@/lib/profile";
import { buttonClass } from "@/components/ui/Button";
import { inputClass } from "@/components/ui/Field";
import { saveProfileAction } from "@/app/[locale]/account/actions";

type User = { id: string; email: string; name?: string; avatar?: Avatar; country?: string; phone?: string; locale: Locale; marketingOptIn?: boolean };
/** Country names come from the server so the first render matches exactly (ICU data differs between Node and browsers). */
type Props = { locale: Locale; t: LicensingCopy["profile"]; securityLabel: string; user: User; from: "welcome" | "profile"; next?: string | null; countries: { code: string; name: string }[] };

const RAW_LIMIT = 5 * 1024 * 1024;

/** Center-crops to a square and scales to AVATAR_SIZE, so uploads are small and EXIF (location) is dropped. */
async function shrink(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = AVATAR_SIZE;
  canvas.getContext("2d")!.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.86));
  if (!blob) throw new Error("encode");
  return new File([blob], "avatar.jpg", { type: "image/jpeg" });
}

export function ProfileForm({ locale, t, securityLabel, user, from, next, countries }: Props) {
  const startColor = user.avatar?.kind === "initials" ? user.avatar.color : defaultAvatarColor(user.id);
  const hasPhoto = user.avatar?.kind === "photo";
  const [mode, setMode] = useState<"photo" | "color">(hasPhoto ? "photo" : "color");
  const [color, setColor] = useState(startColor);
  const [name, setName] = useState(user.name ?? "");
  const [preview, setPreview] = useState<string | null>(hasPhoto && user.avatar?.kind === "photo" ? `/api/avatar/${encodeURIComponent(user.id)}?v=${user.avatar.v}` : null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    setPhotoError(null);
    if (!file) return;
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      setPhotoError(t.errors.type);
      input.value = "";
      return;
    }
    if (file.size > RAW_LIMIT) {
      setPhotoError(t.errors.size);
      input.value = "";
      return;
    }
    try {
      const small = await shrink(file);
      const dt = new DataTransfer();
      dt.items.add(small);
      input.files = dt.files;
      setPreview(URL.createObjectURL(small));
      setMode("photo");
    } catch {
      setPhotoError(t.errors.type);
      input.value = "";
    }
  }

  const swatch = AVATAR_COLOR_VALUES[color];
  const label = "text-sm font-medium text-ink";

  return (
    <form action={saveProfileAction} className="space-y-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="from" value={from} />
      {next && <input type="hidden" name="next" value={next} />}
      <input type="hidden" name="avatar" value={mode === "photo" ? "photo" : color} />

      <fieldset>
        <legend className={label}>{t.photo}</legend>
        <p className="mt-1 text-sm text-muted">{t.photoHelp}</p>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <span className="relative">
            {mode === "photo" && preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local preview or private avatar
              <img src={preview} alt="" width={88} height={88} className="size-22 rounded-full object-cover shadow-soft" />
            ) : (
              <span aria-hidden="true" className="grid size-22 place-items-center rounded-full text-3xl font-bold shadow-soft transition-colors duration-200" style={{ background: swatch.bg, color: swatch.fg }}>
                {initials(name, user.email)}
              </span>
            )}
          </span>
          <div className="flex flex-col gap-3">
            <label className={buttonClass("secondary", "sm", "cursor-pointer")}>
              <CameraIcon size={18} />
              {mode === "photo" && preview ? t.changePhoto : t.upload}
              <input ref={fileRef} type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} />
            </label>
            <div role="radiogroup" aria-label={`${t.useInitials}: ${t.colorLabel}`} className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => {
                const on = mode === "color" && c === color;
                return (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={`${t.useInitials} (${c})`}
                    onClick={() => {
                      setColor(c);
                      setMode("color");
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                    className="grid size-8 place-items-center rounded-full ring-offset-2 ring-offset-surface transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:scale-95 aria-checked:ring-2 aria-checked:ring-ink"
                    style={{ background: AVATAR_COLOR_VALUES[c].bg, color: AVATAR_COLOR_VALUES[c].fg }}
                  >
                    {on && <CheckIcon size={16} weight="bold" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {photoError && (
          <p role="alert" className="mt-3 text-sm font-medium text-error">
            {photoError}
          </p>
        )}
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="name" className={label}>
          {t.name}
        </label>
        <input id="name" name="name" required minLength={2} maxLength={60} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        <p className="text-xs text-muted">{t.nameHelp}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="account-email" className={label}>
          {t.email}
        </label>
        <input id="account-email" type="email" value={user.email} readOnly aria-describedby="account-email-help" dir="ltr" className={`${inputClass} cursor-default bg-bg-sunken text-ink-soft`} />
        <p id="account-email-help" className="text-xs text-muted">
          {t.emailHelp.split("{link}").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <span key={i}>
                <Link href={`/${locale}/account/security`} className="underline underline-offset-4">
                  {securityLabel}
                </Link>
                {part}
              </span>
            ),
          )}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="country" className={label}>
            {t.country}
          </label>
          <select id="country" name="country" required defaultValue={user.country ?? "OM"} className={inputClass} autoComplete="country">
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="lang" className={label}>
            {t.language}
          </label>
          <select id="lang" name="lang" defaultValue={user.locale} className={inputClass}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="phone" className={label}>
          {t.phone}
        </label>
        <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" maxLength={20} defaultValue={user.phone ?? ""} placeholder="+968" className={inputClass} />
        <p className="text-xs text-muted">{t.phoneHelp}</p>
      </div>

      <label className="flex items-start gap-3 text-sm text-ink-soft">
        <input type="checkbox" name="marketing" defaultChecked={!!user.marketingOptIn} className="mt-0.5 size-4 accent-[var(--oc-primary)]" />
        {t.marketing}
      </label>

      {from === "welcome" && (
        <p className="text-xs text-muted">
          {t.terms.split(/(\{terms\}|\{privacy\})/).map((part, i) =>
            part === "{terms}" ? (
              <Link key={i} href={`/${locale}/legal/terms`} className="underline underline-offset-4">
                {t.termsLink}
              </Link>
            ) : part === "{privacy}" ? (
              <Link key={i} href={`/${locale}/legal/privacy`} className="underline underline-offset-4">
                {t.privacyLink}
              </Link>
            ) : (
              part
            ),
          )}
        </p>
      )}

      <button className={buttonClass("primary", "lg", "w-full sm:w-auto")}>{from === "welcome" ? t.continue : t.save}</button>
    </form>
  );
}
