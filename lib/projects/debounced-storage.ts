const DEBOUNCE_MS = 300

interface DebouncedStorage {
  getItem: (name: string) => string | null
  setItem: (name: string, value: string) => void
  removeItem: (name: string) => void
  flush: () => void
}

const memoryStore = new Map<string, string>()

function nativeStorage(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  if (typeof localStorage === "undefined") {
    return {
      getItem: (name) => memoryStore.get(name) ?? null,
      setItem: (name, value) => {
        memoryStore.set(name, value)
      },
      removeItem: (name) => {
        memoryStore.delete(name)
      },
    }
  }
  return localStorage
}

export function createDebouncedStorage(delayMs = DEBOUNCE_MS): DebouncedStorage {
  let timer: ReturnType<typeof setTimeout> | null = null
  let pendingKey: string | null = null
  let pendingValue: string | null = null
  const storage = nativeStorage()

  function flush(): void {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    if (pendingKey !== null && pendingValue !== null) {
      storage.setItem(pendingKey, pendingValue)
      pendingKey = null
      pendingValue = null
    }
  }

  if (typeof window !== "undefined") {
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush()
    })
    window.addEventListener("pagehide", flush)
  }

  return {
    getItem: (name) => storage.getItem(name),
    setItem: (name, value) => {
      pendingKey = name
      pendingValue = value
      if (timer) clearTimeout(timer)
      timer = setTimeout(flush, delayMs)
    },
    removeItem: (name) => {
      flush()
      storage.removeItem(name)
    },
    flush,
  }
}

export const debouncedLocalStorage = createDebouncedStorage()
