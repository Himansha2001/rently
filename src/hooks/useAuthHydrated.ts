import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'

export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.getState().hydrated)

  useEffect(() => {
    const unsub = useAuthStore.subscribe(state => setHydrated(state.hydrated))
    setHydrated(useAuthStore.getState().hydrated)
    return unsub
  }, [])

  return hydrated
}
