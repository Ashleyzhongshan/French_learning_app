export async function translateText(text: string, from: string, to: string): Promise<string> {
  try {
    const q = encodeURIComponent(text)
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${q}&langpair=${from}|${to}`)
    const data = await res.json()
    const translated = data?.responseData?.translatedText as string | undefined
    return translated ?? ''
          } catch {
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
      const first = Object.values(pages)[0] as { imageinfo?: Array<{ url?: string }> } | undefined
      const info = first?.imageinfo?.[0]?.url as string | undefined
      if (info) return info
            } catch {
              // try next candidate
            }
  }
  return null
}

export function pickPreferredFrenchVoice(): SpeechSynthesisVoice | null {
  try {
    if (!('speechSynthesis' in window)) return null
    const voices = window.speechSynthesis.getVoices()
    
    // Priority list for natural-sounding French voices (most natural first)
    const preferredNames = [
      // Premium/Neural voices (most natural)
      'Amélie', 'Thomas', 'Audrey', 'Marie', 'Hélène', 'Yannick',
      'Google français', 'Microsoft Amélie', 'Microsoft Thomas',
      'Microsoft Audrey', 'Microsoft Marie', 'Microsoft Hélène',
      
      // High-quality system voices
      'Alex', 'Samantha', 'Victoria', 'Daniel', 'Fiona', 'Moira',
      'Tessa', 'Veena', 'Rishi', 'Lekha', 'Maged', 'Tarik',
      
      // Generic but good voices
      'French', 'Français', 'France', 'French Female', 'French Male',
      'Google UK English Female', 'Google UK English Male',
      'Microsoft David', 'Microsoft Zira', 'Microsoft Mark',
      
      // Fallback voices
      'Karen', 'Karen (Enhanced)', 'Karen (Premium)',
      'Samantha (Enhanced)', 'Samantha (Premium)',
      'Alex (Enhanced)', 'Alex (Premium)'
    ].map(n => n.toLowerCase())
    
    // Filter French voices first
    const frVoices = voices.filter(v => 
      v.lang?.toLowerCase().startsWith('fr') || 
      v.lang?.toLowerCase().includes('french') ||
      v.name?.toLowerCase().includes('french') ||
      v.name?.toLowerCase().includes('français')
    )
    
    // Try to find a voice by preferred name
    for (const preferredName of preferredNames) {
      const voice = frVoices.find(v => 
        v.name?.toLowerCase().includes(preferredName) ||
        v.name?.toLowerCase() === preferredName
      )
      if (voice) return voice
    }
    
    // If no preferred voice found, look for any high-quality voice
    const highQualityVoices = frVoices.filter(v => 
      v.name?.toLowerCase().includes('enhanced') ||
      v.name?.toLowerCase().includes('premium') ||
      v.name?.toLowerCase().includes('neural') ||
      v.name?.toLowerCase().includes('google') ||
      v.name?.toLowerCase().includes('microsoft')
    )
    
    if (highQualityVoices.length > 0) {
      return highQualityVoices[0]
    }
    
    // Fallback to any French voice
    return frVoices[0] ?? null
  } catch {
    return null
  }
}

export function createNaturalSpeechSettings(utterance: SpeechSynthesisUtterance) {
  // Configure for more natural speech
  utterance.rate = 0.9  // Slightly slower for clarity
  utterance.pitch = 1.1  // Slightly higher pitch for warmth
  utterance.volume = 0.8  // Comfortable volume
  
  // Add slight pauses for more natural rhythm
  const text = utterance.text
  const naturalText = text
    .replace(/\./g, '. ')
    .replace(/,/g, ', ')
    .replace(/;/g, '; ')
    .replace(/:/g, ': ')
    .replace(/\?/g, '? ')
    .replace(/!/g, '! ')
    .replace(/\s+/g, ' ') // Clean up extra spaces
  
  utterance.text = naturalText
  return utterance
}

