export type TourPlacement = 'top' | 'bottom' | 'left' | 'right'

export type TourStep = {
  /** Valor del atributo data-tour del elemento que se resalta. */
  target: string
  title: string
  description: string
  placement?: TourPlacement
}

export type TourDefinition = {
  id: string
  title: string
  description: string
  steps: TourStep[]
}
