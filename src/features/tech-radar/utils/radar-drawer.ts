import { TechItem, TechItemPosition } from "../types/tech-item"
import { LEVEL_COLORS, LEVEL_RADIUS } from "../constants/radar-config"

interface DrawRadarParams {
  ctx: CanvasRenderingContext2D
  size: number
  centerX: number
  centerY: number
  maxRadius: number
  filteredTechItems: TechItem[]
  hoveredLegendItem: string | null
  hoveredTech: TechItem | null
  isDark: boolean
  techItemPositions: { [key: string]: TechItemPosition }
}

export const drawRadar = ({
  ctx,
  size,
  centerX,
  centerY,
  maxRadius,
  filteredTechItems,
  hoveredLegendItem,
  hoveredTech,
  isDark,
  techItemPositions,
}: DrawRadarParams) => {
  // Clear canvas
  ctx.clearRect(0, 0, size, size)

  // Draw radar circles with gradient
  const levels = ["core", "frequent", "occasional", "exploring"]
  levels.forEach((level) => {
    const radius = maxRadius * LEVEL_RADIUS[level as keyof typeof LEVEL_RADIUS]
    const isHighlighted = hoveredLegendItem === level

    // Create gradient for circle
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, isHighlighted 
      ? LEVEL_COLORS[level as keyof typeof LEVEL_COLORS] + "20" // 20% opacity
      : isDark ? "rgba(156, 163, 175, 0.1)" : "rgba(156, 163, 175, 0.05)")
    gradient.addColorStop(1, "transparent")

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw circle border
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.strokeStyle = isHighlighted
      ? LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
      : isDark ? "rgba(156, 163, 175, 0.3)" : "rgba(156, 163, 175, 0.2)"
    ctx.lineWidth = isHighlighted ? 2 : 1
    ctx.stroke()

    // Add labels with improved readability
    ctx.fillStyle = isHighlighted
      ? LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
      : isDark ? "rgba(156, 163, 175, 0.7)" : "rgba(156, 163, 175, 0.7)"
    ctx.font = isHighlighted ? "bold 12px sans-serif" : "12px sans-serif"
    ctx.textAlign = "right"
    
    // Add background for label
    const labelText = level.charAt(0).toUpperCase() + level.slice(1)
    const textWidth = ctx.measureText(labelText).width
    const labelX = centerX - radius - 10
    const labelY = centerY
    
    ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"
    ctx.fillRect(labelX - textWidth - 5, labelY - 8, textWidth + 10, 16)
    
    ctx.fillStyle = isHighlighted
      ? LEVEL_COLORS[level as keyof typeof LEVEL_COLORS]
      : isDark ? "rgba(156, 163, 175, 0.7)" : "rgba(156, 163, 175, 0.7)"
    ctx.fillText(labelText, labelX, labelY)
  })

  // Draw axis lines with improved visibility
  const numAxes = 4
  for (let i = 0; i < numAxes; i++) {
    const angle = (i * Math.PI * 2) / numAxes

    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX + Math.cos(angle) * maxRadius, centerY + Math.sin(angle) * maxRadius)
    ctx.strokeStyle = isDark ? "rgba(156, 163, 175, 0.2)" : "rgba(156, 163, 175, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // First pass: Calculate initial positions
  filteredTechItems.forEach((item, index) => {
    const angle = (index * Math.PI * 2) / filteredTechItems.length
    const radius = maxRadius * LEVEL_RADIUS[item.level]

    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    // Store position for interaction
    techItemPositions[item.name] = { 
      x, 
      y, 
      radius: 8,
      labelX: x + Math.cos(angle) * 50,
      labelY: y + Math.sin(angle) * 50
    }
  })

  // Second pass: Adjust label positions to avoid overlap
  filteredTechItems.forEach((item) => {
    const pos = techItemPositions[item.name]
    const labelWidth = ctx.measureText(item.name).width + 12
    const labelHeight = 20

    // Check for collisions with other labels
    let adjustment = 0
    let maxTries = 10
    let hasCollision = true

    while (hasCollision && maxTries > 0) {
      hasCollision = false
      for (const [otherName, otherPos] of Object.entries(techItemPositions)) {
        if (otherName === item.name || !otherPos.labelX || !otherPos.labelY) continue

        const xDist = Math.abs(pos.labelX! - otherPos.labelX)
        const yDist = Math.abs(pos.labelY! - otherPos.labelY)
        
        if (xDist < labelWidth && yDist < labelHeight) {
          hasCollision = true
          adjustment += 10
          const angle = Math.atan2(pos.y - centerY, pos.x - centerX)
          pos.labelX = pos.x + Math.cos(angle) * (50 + adjustment)
          pos.labelY = pos.y + Math.sin(angle) * (50 + adjustment)
          break
        }
      }
      maxTries--
    }
  })

  // Third pass: Draw everything
  filteredTechItems.forEach((item) => {
    const pos = techItemPositions[item.name]
    const isHighlighted = hoveredTech?.name === item.name || hoveredLegendItem === item.level

    // Draw point with glow effect
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, isHighlighted ? 9 : 8, 0, Math.PI * 2)
    
    if (isHighlighted) {
      ctx.shadowColor = LEVEL_COLORS[item.level as keyof typeof LEVEL_COLORS]
      ctx.shadowBlur = 15
    }
    
    ctx.fillStyle = LEVEL_COLORS[item.level as keyof typeof LEVEL_COLORS]
    ctx.fill()

    // Reset shadow
    ctx.shadowColor = "transparent"
    ctx.shadowBlur = 0

    // Draw label with improved readability
    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
    ctx.font = isHighlighted ? "bold 14px sans-serif" : "14px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    // Add background for label
    const textWidth = ctx.measureText(item.name).width
    ctx.fillStyle = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(255, 255, 255, 0.7)"
    ctx.fillRect(pos.labelX! - textWidth / 2 - 6, pos.labelY! - 10, textWidth + 12, 20)

    ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.8)"
    ctx.fillText(item.name, pos.labelX!, pos.labelY!)

    // Draw connecting line
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    ctx.lineTo(pos.labelX!, pos.labelY!)
    ctx.strokeStyle = isDark ? "rgba(156, 163, 175, 0.2)" : "rgba(156, 163, 175, 0.1)"
    ctx.lineWidth = 1
    ctx.stroke()
  })
} 