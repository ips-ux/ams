import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

interface WaveformPreviewProps {
  url: string
  height?: number
  color?: string
}

export function WaveformPreview({ url, height = 24, color }: WaveformPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const wavesurferRef = useRef<WaveSurfer | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor:
        color ??
        (getComputedStyle(document.documentElement)
          .getPropertyValue('--color-text-muted')
          .trim() ||
        '#666'),
      progressColor:
        getComputedStyle(document.documentElement)
          .getPropertyValue('--color-primary')
          .trim() || '#6366f1',
      height,
      barWidth: 1,
      barGap: 1,
      cursorWidth: 0,
      interact: false,
      normalize: true,
    })

    ws.load(url).catch(() => {})
    wavesurferRef.current = ws

    return () => {
      ws.destroy()
    }
  }, [url, height, color])

  return <div ref={containerRef} style={{ width: '100%' }} />
}
