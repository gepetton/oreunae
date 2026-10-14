// One-time compatibility migration. Keep the exact previous prefix only here.
for (const [storageName, keys] of [
  ['localStorage', ['locale', 'theme', 'timezone', 'saved']],
  ['sessionStorage', ['scroll', 'expanded-indicators']],
] as const) {
  try {
    const storage = window[storageName]
    for (const key of keys) {
      const previous = `offbell:${key}`
      const current = `oreunae:${key}`
      const value = storage.getItem(previous)
      if (value === null) continue
      if (storage.getItem(current) === null) storage.setItem(current, value)
      storage.removeItem(previous)
    }
  } catch {
    // Optional browser settings must not prevent the information service from opening.
  }
}
