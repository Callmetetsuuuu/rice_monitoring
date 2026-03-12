import { useRef, useState } from 'react'
import { Camera, Square, Power } from 'lucide-react'
import { insertPlantImage, insertPlantAnalysis } from '../lib/api'
import { analyzeRicePlantImage } from '../utils/imageAnalysis'

interface CameraCaptureProps {
  onCapture: () => void
  onCameraStart?: () => void
  onCaptureStop?: () => void
}

const PI_URL = "http://192.168.1.45:5000" // CHANGE TO YOUR RASPBERRY PI IP

export function CameraCapture({
  onCapture,
  onCameraStart,
  onCaptureStop
}: CameraCaptureProps) {

  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isStreaming, setIsStreaming] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  // START CAMERA
  const startCamera = async () => {
    setIsStarting(true)
    setError('')

    try {

      await fetch(`${PI_URL}/start`)

      if (imgRef.current) {
        imgRef.current.src = `${PI_URL}/stream`
      }

      setIsStreaming(true)
      onCameraStart?.()

    } catch (err) {

      setError("Cannot connect to Raspberry Pi camera")

    } finally {

      setIsStarting(false)

    }
  }

  // STOP CAMERA
  const stopCamera = async () => {

    try {
      await fetch(`${PI_URL}/stop`)
    } catch { }

    if (imgRef.current) {
      imgRef.current.src = ''
    }

    setIsStreaming(false)
    onCaptureStop?.()
  }

  // CAPTURE IMAGE
  const captureImage = async () => {

    if (!imgRef.current || !canvasRef.current || isCapturing) return

    setIsCapturing(true)
    setError('')

    try {

      const img = imgRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      canvas.width = img.width
      canvas.height = img.height

      ctx.drawImage(img, 0, 0)

      const imageData = canvas.toDataURL('image/jpeg', 0.6)

      const imageRecord = await insertPlantImage(
        imageData,
        new Date().toISOString()
      )

      const analysis = await analyzeRicePlantImage(imageData)

      await insertPlantAnalysis({
        image_id: imageRecord.id,
        health_status: analysis.healthStatus,
        health_score: analysis.healthScore,
        green_percentage: analysis.greenPercentage,
        yellow_percentage: analysis.yellowPercentage,
        brown_percentage: analysis.brownPercentage,
        harvest_ready: analysis.harvestReady,
        recommendations: analysis.recommendations
      })

      onCapture()

    } catch (err) {

      setError("Capture failed")

    } finally {

      setIsCapturing(false)

    }
  }

  return (
    <div className="relative rounded-2xl border p-6">

      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">

        {isStreaming && (
          <img
            ref={imgRef}
            className="h-full w-full object-cover"
            alt="camera stream"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

      </div>

      {error && (
        <p className="text-red-500 mt-2">{error}</p>
      )}

      <div className="flex gap-2 mt-4 justify-center">

        {!isStreaming && (
          <button
            onClick={startCamera}
            disabled={isStarting}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
          >
            <Power size={18} />
            {isStarting ? "Starting..." : "Start Camera"}
          </button>
        )}

        {isStreaming && (
          <>
            <button
              onClick={captureImage}
              disabled={isCapturing}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded"
            >
              <Square size={18} />
              Capture
            </button>

            <button
              onClick={stopCamera}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded"
            >
              <Power size={18} />
              Stop Camera
            </button>
          </>
        )}

      </div>
    </div>
  )
}