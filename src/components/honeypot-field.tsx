/**
 * Hidden field that only automated submitters fill in. Kept out of the
 * accessibility tree and the tab order so it never reaches a real person.
 */
export function HoneypotField({
  register,
}: {
  register: Record<string, unknown>;
}) {
  return (
    <div aria-hidden className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor="website">Leave this field empty</label>
      <input
        id="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register}
      />
    </div>
  );
}
