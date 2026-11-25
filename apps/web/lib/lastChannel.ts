function read(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem("clatter-last-channel") ?? "{}")
  } catch {
    return {}
  }
}

export function getLastChannel(slug: string): string | undefined {
  return read()[slug]
}

export function setLastChannel(slug: string, channelId: string) {
  try {
    localStorage.setItem("clatter-last-channel", JSON.stringify({ ...read(), [slug]: channelId }))
  } catch {
    
  }
}