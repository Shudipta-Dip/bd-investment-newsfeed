"use client"

import { useEffect, useRef, useCallback, useMemo } from "react"
import createGlobe from "cobe"
import { useTheme } from "@/components/ThemeProvider"

// Map of country/region names to [lat, lng] coordinates
const COUNTRY_COORDS: Record<string, [number, number]> = {
  "Bangladesh": [23.68, 90.35],
  "India": [20.59, 78.96],
  "China": [35.86, 104.19],
  "United States": [37.09, -95.71],
  "USA": [37.09, -95.71],
  "United Kingdom": [55.37, -3.43],
  "UK": [55.37, -3.43],
  "Japan": [36.20, 138.25],
  "Germany": [51.16, 10.45],
  "France": [46.22, 2.21],
  "Australia": [-25.27, 133.77],
  "Canada": [56.13, -106.34],
  "Singapore": [1.35, 103.82],
  "Malaysia": [4.21, 101.97],
  "Thailand": [15.87, 100.99],
  "Vietnam": [14.05, 108.27],
  "Indonesia": [-0.78, 113.92],
  "Philippines": [12.87, 121.77],
  "Pakistan": [30.37, 69.34],
  "Sri Lanka": [7.87, 80.77],
  "Myanmar": [21.91, 95.95],
  "Nepal": [28.39, 84.12],
  "Cambodia": [12.56, 104.99],
  "South Korea": [35.90, 127.76],
  "Taiwan": [23.69, 120.96],
  "Russia": [61.52, 105.31],
  "Saudi Arabia": [23.88, 45.07],
  "UAE": [23.42, 53.84],
  "Turkey": [38.96, 35.24],
  "Brazil": [-14.23, -51.92],
  "South Africa": [-30.55, 22.93],
  "Nigeria": [9.08, 8.67],
  "Egypt": [26.82, 30.80],
  "Kenya": [-0.02, 37.90],
  "Italy": [41.87, 12.56],
  "Spain": [40.46, -3.74],
  "Netherlands": [52.13, 5.29],
  "Switzerland": [46.81, 8.22],
  "Sweden": [60.12, 18.64],
  "Norway": [60.47, 8.46],
  "Denmark": [56.26, 9.50],
  "Belgium": [50.50, 4.46],
  "Austria": [47.51, 14.55],
  "Poland": [51.91, 19.14],
  "Mexico": [23.63, -102.55],
  "Argentina": [-38.41, -63.61],
  "Chile": [-35.67, -71.54],
  "Colombia": [4.57, -74.29],
  "Israel": [31.04, 34.85],
  "Qatar": [25.35, 51.18],
  "Kuwait": [29.31, 47.48],
  "Bahrain": [26.06, 50.55],
  "Oman": [21.47, 55.97],
  "Iran": [32.42, 53.68],
  "Iraq": [33.22, 43.67],
  "Ethiopia": [9.14, 40.48],
  "Tanzania": [-6.36, 34.88],
  "Ghana": [7.94, -1.02],
  "Laos": [19.85, 102.49],
  "International": [48.85, 2.35],   // Default to Paris for generic "International"
  "Global": [51.50, -0.12],         // Default to London for generic "Global"
}

interface PulseMarker {
  id: string
  location: [number, number]
  delay: number
}

interface GlobePulseProps {
  /** Array of region/country names from live dashboard articles */
  regions?: string[]
  className?: string
  speed?: number
  size?: number
}

export function GlobePulse({
  regions = [],
  className = "",
  speed = 0.003,
  size = 280,
}: GlobePulseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const { theme } = useTheme()
  const isDarkMode = useMemo(() => {
    if (theme === "system") {
      return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
    }
    return theme === "dark"
  }, [theme])

  const globeColors = useMemo(() => {
    if (isDarkMode) {
      return {
        dark: 1,
        baseColor: [0.15, 0.15, 0.2] as [number, number, number],
        glowColor: [0.03, 0.03, 0.05] as [number, number, number],
        markerColor: [0.2, 0.8, 0.6] as [number, number, number], // Emerald/mint green
      }
    } else {
      return {
        dark: 0,
        baseColor: [0.85, 0.85, 0.9] as [number, number, number],  // Light grayish blue
        glowColor: [0.95, 0.95, 0.98] as [number, number, number], // Clean white glow
        markerColor: [0.05, 0.6, 0.4] as [number, number, number], // Strong forest green
      }
    }
  }, [isDarkMode])

  // Convert unique region names to PulseMarker objects with lat/lng
  const markers: PulseMarker[] = useMemo(() => {
    const uniqueRegions = [...new Set(regions)];
    return uniqueRegions
      .filter((r) => COUNTRY_COORDS[r])
      .map((r, i) => ({
        id: `pulse-${r.replace(/\s+/g, "-").toLowerCase()}`,
        location: COUNTRY_COORDS[r],
        delay: (i * 0.4) % 3,
      }));
  }, [regions])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current !== null) {
        dragOffset.current = {
          phi: (e.clientX - pointerInteracting.current.x) / 300,
          theta: (e.clientY - pointerInteracting.current.y) / 1000,
        }
      }
    }
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null

    // Orient the globe to focus on South Asia (Bangladesh) by default
    let phi = 4.8 // Rotated to show South Asia

    function init() {
      if (globe) return

      const devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      globe = createGlobe(canvas, {
        devicePixelRatio,
        width: size * devicePixelRatio,
        height: size * devicePixelRatio,
        scale: 1.25,
        phi: phi,
        theta: 0.15,
        dark: globeColors.dark,
        diffuse: 1.5,
        mapSamples: 16000,
        mapBrightness: 10,
        baseColor: globeColors.baseColor,
        markerColor: globeColors.markerColor,
        glowColor: globeColors.glowColor,
        markerElevation: 0,
        markers: markers.map((m) => ({
          location: m.location,
          size: 0.04,
        })),
        opacity: 0.85,
        onRender: (state) => {
          if (!isPausedRef.current) {
            phi += speed;
          }
          state.phi = phi + phiOffsetRef.current + dragOffset.current.phi;
          state.theta = 0.15 + thetaOffsetRef.current + dragOffset.current.theta;
        }
      })

      setTimeout(() => canvas && (canvas.style.opacity = "1"))
    }

    init()

    return () => {
      if (globe) globe.destroy()
    }
  }, [markers, speed, globeColors, size])

  if (markers.length === 0) return null

  return (
    <div 
      className={`relative select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <style>{`
        @keyframes pulse-expand {
          0% { transform: scaleX(0.3) scaleY(0.3); opacity: 0.8; }
          100% { transform: scaleX(1.5) scaleY(1.5); opacity: 0; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          opacity: 0,
          transition: "opacity 1.2s ease",
          borderRadius: "50%",
          touchAction: "none",
        }}
      />
    </div>
  )
}
