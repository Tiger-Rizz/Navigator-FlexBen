/** Recognition points. Kept separate from the Flex Fund on purpose. */
export function PointsPill() {
  return (
    <span
      className="inline-flex items-center gap-1.5 self-start rounded-full border border-points-border bg-points-bg px-2.5 py-[5px] text-xs font-medium"
      title="Recognition points. Separate from your Flex Fund."
    >
      <span aria-hidden className="size-[13px] rounded-full bg-points" />
      100 to spend
    </span>
  );
}
