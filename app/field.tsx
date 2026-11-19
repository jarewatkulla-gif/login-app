type Props = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
};

export function Field({ name, label, type = "text", autoComplete, defaultValue, error, hint }: Props) {
  const errId = `${name}-err`;
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errId : undefined}
        required
      />
      {error ? <span id={errId} className="err">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </div>
  );
}
