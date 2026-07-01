type Listener = (message: string) => void;

let listeners: Listener[] = [];

export function writeTerminal(message: string) {
  listeners.forEach((listener) => listener(message));
}

export function subscribeTerminal(listener: Listener) {
  listeners.push(listener);

  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}