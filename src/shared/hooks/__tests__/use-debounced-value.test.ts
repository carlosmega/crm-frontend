import { renderHook, act } from '@testing-library/react'
import { useDebouncedValue } from '../use-debounced-value'

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('initial', 300))
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'initial' } }
    )

    // Change value
    rerender({ value: 'updated' })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Advance timers and check updated value
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Value should now be updated
    expect(result.current).toBe('updated')
  })

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'v1' } }
    )

    rerender({ value: 'v2' })
    act(() => vi.advanceTimersByTime(100))

    rerender({ value: 'v3' })
    act(() => vi.advanceTimersByTime(100))

    // After 200ms total, still on initial
    expect(result.current).toBe('v1')

    // After full 300ms from last change
    act(() => vi.advanceTimersByTime(200))

    expect(result.current).toBe('v3')
  })

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 500),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('initial') // Still initial after 300ms

    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('updated') // Updated after 500ms
  })

  it('should use default delay of 300ms when not specified', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: 'initial' } }
    )

    rerender({ value: 'updated' })

    act(() => vi.advanceTimersByTime(299))
    expect(result.current).toBe('initial')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('updated')
  })

  it('should handle number values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 0 } }
    )

    rerender({ value: 42 })

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(42)
  })

  it('should handle boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: false } }
    )

    rerender({ value: true })

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe(true)
  })

  it('should handle object values', () => {
    const initialObj = { count: 0 }
    const updatedObj = { count: 1 }

    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: initialObj } }
    )

    rerender({ value: updatedObj })

    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toEqual(updatedObj)
  })

  it('should handle rapid multiple changes correctly', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      { initialProps: { value: 'v1' } }
    )

    // Rapid changes
    rerender({ value: 'v2' })
    act(() => vi.advanceTimersByTime(50))

    rerender({ value: 'v3' })
    act(() => vi.advanceTimersByTime(50))

    rerender({ value: 'v4' })
    act(() => vi.advanceTimersByTime(50))

    rerender({ value: 'v5' })

    // Still on initial
    expect(result.current).toBe('v1')

    // Advance full delay from last change
    act(() => vi.advanceTimersByTime(300))

    // Should have final value
    expect(result.current).toBe('v5')
  })
})
