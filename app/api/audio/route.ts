import { NextRequest, NextResponse } from 'next/server'

async function generateSpeech(text: string): Promise<ArrayBuffer> {
  const elevenlabsApiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM" // Default voice

  if (!elevenlabsApiKey) {
    throw new Error('ELEVENLABS_API_KEY is not configured')
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': elevenlabsApiKey
    },
    body: JSON.stringify({
      text: text,
      model_id: "eleven_turbo_v2",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5
      }
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('ElevenLabs API Error:', errorText)
    throw new Error(`ElevenLabs API error: ${response.status}`)
  }

  return await response.arrayBuffer()
}

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const cleanText = text.trim()

    if (cleanText.length === 0) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 })
    }

    // Generate speech
    const audioBuffer = await generateSpeech(cleanText)

    // Return audio as response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString()
      }
    })

  } catch (error) {
    console.error('Thera Audio API Error:', error)

    if (error instanceof Error && error.message.includes('ELEVENLABS_API_KEY')) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    )
  }
}