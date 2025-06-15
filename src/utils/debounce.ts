
export function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<F>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
