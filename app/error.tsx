"use client";

type ErrorPageProps = {
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-[480px] flex-col justify-center bg-white px-5 min-[500px]:border-x min-[500px]:border-[var(--line)]">
      <h1 className="text-[26px] font-bold leading-8">다시 시도해 주세요</h1>
      <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
        화면을 불러오지 못했습니다. 입력 내용이 있다면 가능한 범위에서 유지합니다.
      </p>
      <button
        className="focus-ring mt-5 min-h-12 rounded-xl bg-[var(--primary)] px-4 text-[14px] font-semibold text-white"
        onClick={reset}
        type="button"
      >
        다시 시도
      </button>
    </div>
  );
}
