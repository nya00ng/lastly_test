"use client";

import { useEffect, useState } from "react";
import { DemoAppShell } from "./DemoAppShell";

type PermissionState = "unsupported" | "default" | "requesting" | "granted" | "denied";

function getPermissionState(): PermissionState {
  if (typeof window === "undefined" || typeof Notification === "undefined") return "unsupported";
  return Notification.permission;
}

export function SettingsDemo() {
  const [permission, setPermission] = useState<PermissionState>("default");
  const [notificationTime, setNotificationTime] = useState("09:00");
  const [weekendEnabled, setWeekendEnabled] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setPermission(getPermissionState()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  async function requestPermission() {
    if (typeof Notification === "undefined") return setPermission("unsupported");
    setPermission("requesting");
    try {
      setPermission(await Notification.requestPermission());
    } catch {
      setPermission("unsupported");
    }
  }

  const permissionCopy = permission === "granted"
    ? "허용됨"
    : permission === "denied"
      ? "차단됨"
      : permission === "unsupported"
        ? "사용할 수 없음"
        : permission === "requesting"
          ? "요청 중…"
          : "알림 켜기";

  return (
    <DemoAppShell activeRoute="settings" showBack title="설정">
      <section>
        <h2 className="text-[17px] font-semibold">알림</h2>
        <div className="mt-3 rounded-xl border border-[var(--line)] bg-white px-4">
          <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--divider)] py-3">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold">알림 권한</p>
              {permission === "denied" ? <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">브라우저 설정에서 권한을 변경해주세요.</p> : null}
              {permission === "unsupported" ? <p className="mt-1 text-[12px] leading-5 text-[var(--muted)]">이 브라우저에서는 알림 권한을 사용할 수 없어요.</p> : null}
            </div>
            {permission === "default" || permission === "requesting" ? (
              <button className="focus-ring min-h-11 shrink-0 rounded-lg bg-[var(--soft-primary)] px-3 text-[13px] font-semibold text-[var(--primary-strong)] disabled:opacity-60" disabled={permission === "requesting"} onClick={requestPermission} type="button">{permissionCopy}</button>
            ) : <span className="shrink-0 text-[13px] font-semibold text-[var(--muted)]">{permissionCopy}</span>}
          </div>
          <label className="flex min-h-16 items-center justify-between gap-4 border-b border-[var(--divider)] py-3 text-[15px] font-semibold">
            알림 받을 시간
            <input aria-label="알림 받을 시간" className="focus-ring min-h-11 max-w-28 rounded-lg border border-[var(--line)] bg-white px-2 text-right text-[15px]" onChange={(event) => setNotificationTime(event.target.value)} type="time" value={notificationTime} />
          </label>
          <div className="flex min-h-16 items-center justify-between gap-4 py-3">
            <span className="text-[15px] font-semibold">주말에도 알림</span>
            <button aria-checked={weekendEnabled} aria-label="주말에도 알림" className={`focus-ring flex h-7 w-12 items-center rounded-full px-[3px] transition-colors ${weekendEnabled ? "justify-end bg-[var(--primary)]" : "justify-start bg-[#d9ded7]"}`} onClick={() => setWeekendEnabled((current) => !current)} role="switch" type="button"><span className="h-[22px] w-[22px] rounded-full bg-white" /></button>
          </div>
        </div>
        <p className="mt-3 text-[12px] leading-5 text-[var(--muted)]">권한과 설정값을 이 데모 화면에서만 확인합니다. 실제 푸시 구독이나 알림 예약은 하지 않아요.</p>
      </section>
    </DemoAppShell>
  );
}
