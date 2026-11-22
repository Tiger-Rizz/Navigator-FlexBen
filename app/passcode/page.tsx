import { buttonClass } from '@/components/ui/Button';

export const metadata = { title: 'Enter passcode · Meridian Benefits' };

export default async function PasscodePage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = '/', error } = await searchParams;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white px-4">
      <form method="post" action="/api/passcode" className="flex w-full max-w-[360px] flex-col gap-4 rounded-[16px] border border-line px-6 py-6">
        <div className="flex items-center gap-2">
          <span aria-hidden className="flex size-[26px] items-center justify-center rounded-[7px] bg-brand text-[13px] font-semibold text-white">M</span>
          <h1 className="text-lg">Meridian Benefits prototype</h1>
        </div>
        <input type="hidden" name="next" value={next} />
        <label className="flex flex-col gap-1.5 text-[13px] font-medium">
          Passcode
          <input
            name="passcode"
            type="password"
            autoFocus
            required
            aria-invalid={!!error}
            aria-describedby={error ? 'pc-err' : undefined}
            className={`min-h-11 rounded-[10px] border px-3 text-sm font-normal ${error ? 'border-error' : 'border-line-control'}`}
          />
        </label>
        {error && <p id="pc-err" className="text-[13px] text-error">That passcode isn’t right. Check the email it came in.</p>}
        <button type="submit" className={buttonClass('primary')}>Continue</button>
      </form>
    </div>
  );
}
