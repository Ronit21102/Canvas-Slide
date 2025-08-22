import type { ShapeElement } from "@/types/slide"

export function renderShapePath(element: ShapeElement): string {
  const { transform, shapeType } = element
  const { width, height } = transform
  const cx = width / 2
  const cy = height / 2

  switch (shapeType) {
    case "triangle":
      return `M ${cx} 0 L ${width} ${height} L 0 ${height} Z`

    case "diamond":
      return `M ${cx} 0 L ${width} ${cy} L ${cx} ${height} L 0 ${cy} Z`

    case "pentagon":
      const pentagonPoints = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        const x = cx + cx * 0.9 * Math.cos(angle)
        const y = cy + cy * 0.9 * Math.sin(angle)
        pentagonPoints.push(`${x} ${y}`)
      }
      return `M ${pentagonPoints.join(" L ")} Z`

    case "hexagon":
      const hexagonPoints = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6
        const x = cx + cx * 0.9 * Math.cos(angle)
        const y = cy + cy * 0.9 * Math.sin(angle)
        hexagonPoints.push(`${x} ${y}`)
      }
      return `M ${hexagonPoints.join(" L ")} Z`

    case "star":
      const starPoints = []
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const radius = i % 2 === 0 ? cx * 0.9 : cx * 0.4
        const x = cx + radius * Math.cos(angle)
        const y = cy + radius * Math.sin(angle)
        starPoints.push(`${x} ${y}`)
      }
      return `M ${starPoints.join(" L ")} Z`

    case "heart":
      const heartScale = Math.min(width, height) / 100
      return `M 50,25 C 50,15 35,5 25,15 C 15,5 0,15 0,25 C 0,35 25,60 50,85 C 75,60 100,35 100,25 C 100,15 85,5 75,15 C 65,5 50,15 50,25 Z`.replace(
        /(\d+)/g,
        (match) => String(Number(match) * heartScale),
      )

    case "cloud":
      const cloudScale = Math.min(width, height) / 100
      return `M 25,60 C 10,60 0,45 0,30 C 0,15 15,0 30,0 C 40,0 50,5 55,15 C 65,5 80,10 85,25 C 95,25 100,35 95,45 C 100,55 90,65 80,60 Z`.replace(
        /(\d+)/g,
        (match) => String(Number(match) * cloudScale),
      )

    case "speech-bubble":
      const bubbleWidth = width - 20
      const bubbleHeight = height - 20
      return `M 10,10 L ${bubbleWidth},10 Q ${bubbleWidth + 10},10 ${bubbleWidth + 10},20 L ${bubbleWidth + 10},${bubbleHeight - 10} Q ${bubbleWidth + 10},${bubbleHeight} ${bubbleWidth},${bubbleHeight} L 30,${bubbleHeight} L 20,${height} L 25,${bubbleHeight} L 20,${bubbleHeight} Q 10,${bubbleHeight} 10,${bubbleHeight - 10} L 10,20 Q 10,10 20,10 Z`

    case "thought-bubble":
      return `M ${cx} ${cy - 15} C ${cx + 20} ${cy - 15} ${cx + 20} ${cy + 15} ${cx} ${cy + 15} C ${cx - 20} ${cy + 15} ${cx - 20} ${cy - 15} ${cx} ${cy - 15} Z M ${cx - 10} ${cy + 25} C ${cx - 5} ${cy + 25} ${cx - 5} ${cy + 35} ${cx - 10} ${cy + 35} C ${cx - 15} ${cy + 35} ${cx - 15} ${cy + 25} ${cx - 10} ${cy + 25} Z M ${cx - 20} ${cy + 40} C ${cx - 17} ${cy + 40} ${cx - 17} ${cy + 45} ${cx - 20} ${cy + 45} C ${cx - 23} ${cy + 45} ${cx - 23} ${cy + 40} ${cx - 20} ${cy + 40} Z`

    case "callout":
      return `M 10,10 L ${width - 10},10 Q ${width},10 ${width},20 L ${width},${height - 30} Q ${width},${height - 20} ${width - 10},${height - 20} L ${cx + 10},${height - 20} L ${cx},${height} L ${cx - 10},${height - 20} L 20,${height - 20} Q 10,${height - 20} 10,${height - 30} L 10,20 Q 10,10 20,10 Z`

    case "banner":
      return `M 0,${cy - 15} L ${width - 20},${cy - 15} L ${width},${cy} L ${width - 20},${cy + 15} L 0,${cy + 15} Z`

    case "shield":
      return `M ${cx},0 C ${width * 0.8},0 ${width},${height * 0.3} ${width},${height * 0.6} C ${width},${height * 0.9} ${cx},${height} ${cx},${height} C ${cx},${height} 0,${height * 0.9} 0,${height * 0.6} C 0,${height * 0.3} ${width * 0.2},0 ${cx},0 Z`

    default:
      return ""
  }
}

export function isCustomShape(shapeType: string): boolean {
  return [
    "triangle",
    "diamond",
    "pentagon",
    "hexagon",
    "star",
    "heart",
    "cloud",
    "speech-bubble",
    "thought-bubble",
    "callout",
    "banner",
    "shield",
  ].includes(shapeType)
}
