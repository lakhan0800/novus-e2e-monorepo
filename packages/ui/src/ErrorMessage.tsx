export function ErrorMessage({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="fn-error" role="alert">
      {message}
    </p>
  );
}
