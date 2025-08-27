import {render} from '@testing-library/react'
import {SC_ATTR as DEFAULT_SC_ATTR} from '../constants'
import {expectCSSMatches} from './utils'

describe('constants', () => {
  afterEach(() => {
    vi.resetModules()
  })

  describe('SC_ATTR', () => {
    async function renderAndExpect(expectedAttr: string) {
      const {SC_ATTR} = await import('../constants')
      const styled = (await import('./utils')).resetStyled()

      const Comp = styled.div`
        color: blue;
      `

      render(<Comp />)

      expectCSSMatches('.b { color:blue; }')

      expect(SC_ATTR).toEqual(expectedAttr)
      expect(document.head.querySelectorAll(`style[${SC_ATTR}]`)).toHaveLength(1)
    }

    it('should work with default SC_ATTR', async () => {
      await renderAndExpect(DEFAULT_SC_ATTR)
    })

    it('should work with custom SC_ATTR', async () => {
      const CUSTOM_SC_ATTR = 'data-custom-styled-components'
      process.env.SC_ATTR = CUSTOM_SC_ATTR
      vi.resetModules()

      await renderAndExpect(CUSTOM_SC_ATTR)

      delete process.env.SC_ATTR
    })

    it('should work with REACT_APP_SC_ATTR', async () => {
      const REACT_APP_CUSTOM_SC_ATTR = 'data-custom-react_app-styled-components'
      process.env.REACT_APP_SC_ATTR = REACT_APP_CUSTOM_SC_ATTR
      vi.resetModules()

      await renderAndExpect(REACT_APP_CUSTOM_SC_ATTR)

      delete process.env.REACT_APP_SC_ATTR
    })
  })
})
