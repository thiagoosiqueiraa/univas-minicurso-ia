import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button, buttonVariants } from './button'

describe('Button', () => {
  it('renderiza variantes, encaminha o clique e preserva o nome acessível', () => {
    const onClick = vi.fn()
    render(<Button variant="destructive" size="sm" onClick={onClick}>Remover</Button>)
    const button = screen.getByRole('button', { name: 'Remover' })
    expect(button.className).toContain('bg-destructive')
    expect(button.className).toContain('h-9')
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('fornece classes padrão para botão e variantes', () => {
    expect(buttonVariants()).toContain('bg-primary')
    expect(buttonVariants({ variant: 'outline', size: 'lg' })).toContain('h-11')
  })
})
