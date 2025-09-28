export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const q = encodeURIComponent(text)
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=${from}|${to}`)
    const data = await res.json()
    const translated = data?.responseData?.translatedText as string | undefined
    return translated ?? ''
  } catch (_) {
    return ''
  }
}

export async function getCommonsAudioUrlForFrenchWord(word: string): Promise<string | null> {
  const candidates = [
    `Fr-${word}.ogg`,
    `Fr-${word}.mp3`,
    `${word}-fr.ogg`,
    `${word}-fr.mp3`,
  ]
  for (const file of candidates) {
    try {
      const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(file)}&prop=imageinfo&iiprop=url&format=json&origin=*`
      const res = await fetch(url)
      const data = await res.json()
      const pages = data?.query?.pages ?? {}
      const first = Object.values(pages)[0] as any
      const info = first?.imageinfo?.[0]?.url as string | undefined
      if (info) return info
    } catch (_) {
      // try next candidate
    }
  }
  return null
}

export function pickPreferredFrenchVoice(): SpeechSynthesisVoice | null {
  try {
    if (!('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    const preferredNames = [
      'Amelie','Thomas','Audrey','Marie','Helene','Yannick',
      'Google français','Google UK English Female','French',
    ].map(n => n.toLowerCase())
    const frVoices = voices.filter(v => v.lang?.toLowerCase().startsWith('fr'))
    const byName = frVoices.find(v => preferredNames.includes((v.name || '').toLowerCase()))
    return byName ?? (frVoices[0] ?? null)
  } catch {
    return null
  }
}

