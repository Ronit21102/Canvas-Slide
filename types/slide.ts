export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Transform {
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scaleX: number
  scaleY: number
}

export interface BaseElement {
  id: string
  type: "text" | "image" | "shape" | "group"
  transform: Transform
  zIndex: number
  locked: boolean
  visible: boolean
  opacity: number
}

export interface TextElement extends BaseElement {
  type: "text"
  content: string
  fontSize: number
  fontFamily: string
  fontWeight: "normal" | "bold"
  fontStyle: "normal" | "italic"
  textDecoration: "none" | "underline"
  textAlign: "left" | "center" | "right"
  color: string
  backgroundColor?: string
}

export interface ImageElement extends BaseElement {
  type: "image"
  src: string
  alt?: string
  fit: "contain" | "cover" | "fill"
}

export interface ShapeElement extends BaseElement {
  type: "shape"
  shapeType:
    | "rectangle"
    | "circle"
    | "line"
    | "arrow"
    | "sticky-note"
    | "triangle"
    | "diamond"
    | "pentagon"
    | "hexagon"
    | "star"
    | "heart"
    | "cloud"
    | "speech-bubble"
    | "thought-bubble"
    | "callout"
    | "banner"
    | "shield"
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius?: number
  dashArray?: string
  startMarker?: "none" | "arrow" | "circle" | "square"
  endMarker?: "none" | "arrow" | "circle" | "square"
}

export interface GroupElement extends BaseElement {
  type: "group"
  children: string[] // IDs of child elements
}

export type Element = TextElement | ImageElement | ShapeElement | GroupElement

export interface Slide {
  id: string
  title: string
  elements: Element[]
  background: {
    type: "color" | "image" | "gradient"
    value: string
  }
  thumbnail?: string
  createdAt: Date
  updatedAt: Date
}

export interface CanvasState {
  zoom: number
  pan: Point
  selectedElements: string[]
  clipboard: Element[]
  gridEnabled: boolean
  snapToGrid: boolean
  gridSize: number
}

export interface HistoryState {
  slides: Slide[]
  currentSlideId: string
  canvasState: CanvasState
}

export interface EditorState {
  slides: Slide[]
  currentSlideId: string
  canvasState: CanvasState
  history: HistoryState[]
  historyIndex: number
  tool:
    | "select"
    | "text"
    | "rectangle"
    | "circle"
    | "line"
    | "arrow"
    | "sticky-note"
    | "image"
    | "triangle"
    | "diamond"
    | "pentagon"
    | "hexagon"
    | "star"
    | "heart"
    | "cloud"
    | "speech-bubble"
    | "thought-bubble"
    | "callout"
    | "banner"
    | "shield"
  isDrawing: boolean
  dragStart?: Point
}
