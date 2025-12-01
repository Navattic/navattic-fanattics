import { ClassValue } from '.'

export type StyleableClassName<T> = {
  [K in keyof T]?: ClassValue
}

export type ClassNameProp<T> = ClassValue | StyleableClassName<T>

/**
 * Interface for styling composed elements using Tailwind classes.
 */
export interface StyleableTW<T> {
  className?: ClassNameProp<T>
}

export type Unstyleable<T> = Omit<T, 'styles'>

/**
 * @deprecated This interface is being deprecated in favor of Tailwind classes.
 * Use {@link StyleableTW} instead.
 */
export interface Styleable<T> {
  styles?: Partial<T>
}
