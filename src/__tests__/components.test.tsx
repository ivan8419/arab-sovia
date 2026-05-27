import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ConjugationTable } from '@/components/learning/conjugation-table'
import { VerbCard } from '@/components/learning/verb-card'
import { verbsData } from '@/data/verbs'

describe('VerbCard', () => {
  it('renders verb summary information', () => {
    render(<VerbCard verb={verbsData[0]} status="sedang_dipelajari" />)

    expect(screen.getByText(verbsData[0].madhi)).toBeInTheDocument()
    expect(screen.getByText(verbsData[0].meaning)).toBeInTheDocument()
    expect(screen.getByText('Sedang Dipelajari')).toBeInTheDocument()
  })
})

describe('ConjugationTable', () => {
  it('renders all 14 rows for madhi', () => {
    render(
      <ConjugationTable
        title="Madhi"
        mode="madhi"
        conjugations={verbsData[0].conjugations}
      />
    )

    expect(screen.getAllByRole('row')).toHaveLength(15)
  })

  it('renders imperative rows only when mode is amr', () => {
    render(
      <ConjugationTable
        title="Amr"
        mode="amr"
        conjugations={verbsData[0].conjugations}
      />
    )

    expect(screen.getByText('Amr')).toBeInTheDocument()
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    expect(screen.getAllByText(/Tap to copy/i).length).toBeGreaterThan(0)
  })
})
