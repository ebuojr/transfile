const ANIMALS = [
  'WOLF', 'BEAR', 'HAWK', 'LYNX', 'DEER', 'CROW', 'SEAL', 'MINK',
  'DUCK', 'FROG', 'CRAB', 'MOTH', 'WREN', 'VOLE', 'HARE', 'PIKE',
  'BISON', 'CRANE', 'EAGLE', 'FINCH', 'GECKO', 'HYENA', 'IBIS',
  'JACKAL', 'KOALA', 'LLAMA', 'MOOSE', 'NEWT', 'OTTER', 'PANDA',
  'QUAIL', 'RAVEN', 'STOAT', 'TAPIR', 'URIAL', 'VIPER', 'WALRUS',
  'XENOPS', 'YAPOK', 'ZEBRA', 'BONGO', 'CAIMAN', 'DINGO', 'ERMINE',
  'FALCON', 'GIBBON', 'IGUANA', 'JAGUAR', 'KESTREL',
]

export function generateCode(): string {
  const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const number = Math.floor(Math.random() * 90) + 10 // 10–99
  return `${animal}-${number}`
}

export function isValidCode(code: string): boolean {
  return /^[A-Z]+-\d+$/.test(code)
}

export function normalizeCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '-')
}
