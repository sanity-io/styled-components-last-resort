import {render, screen, act} from '@testing-library/react'
import {expectCSSMatches, resetStyled} from '../../test/utils'
import ThemeProvider, {useTheme} from '../ThemeProvider'

let styled: ReturnType<typeof resetStyled>

describe('ThemeProvider', () => {
  beforeEach(() => {
    styled = resetStyled()
  })

  it('should not throw an error when no children are passed', () => {
    render(<ThemeProvider theme={{}} />)
  })

  it("should accept a theme prop that's a plain object", () => {
    render(<ThemeProvider theme={{main: 'black'}} />)
  })

  it('should render its child', () => {
    const child = <p>Child!</p>
    const {container} = render(<ThemeProvider theme={{main: 'black'}}>{child}</ThemeProvider>)

    expect(container).toMatchSnapshot()
  })

  it('should merge its theme with an outer theme', () => {
    const outerTheme = {main: 'black'}
    const innerTheme = {secondary: 'black'}

    const MyDiv = styled.div`
      --main: ${(props) => props.theme.main};
      --secondary: ${(props) => props.theme.secondary};
    `

    render(
      <ThemeProvider theme={outerTheme}>
        <ThemeProvider theme={innerTheme}>
          <MyDiv />
        </ThemeProvider>
      </ThemeProvider>,
    )

    expectCSSMatches(`
      .b {
        --main: black;
        --secondary: black;
      }`)
  })

  it('should merge its theme with multiple outer themes', () => {
    const outerestTheme = {main: 'black'}
    const outerTheme = {main: 'blue'}
    const innerTheme = {secondary: 'black'}

    const MyDiv = styled.div`
      --main: ${(props) => props.theme.main};
      --secondary: ${(props) => props.theme.secondary};
    `

    render(
      <ThemeProvider theme={outerestTheme}>
        <ThemeProvider theme={outerTheme}>
          <ThemeProvider theme={innerTheme}>
            <MyDiv />
          </ThemeProvider>
        </ThemeProvider>
      </ThemeProvider>,
    )

    expectCSSMatches(`
      .b {
        --main: blue;
        --secondary: black;
      }`)
  })

  it('should be able to render two independent themes', () => {
    const themes = {
      one: {main: 'black', secondary: 'red'},
      two: {main: 'blue', other: 'green'},
    }

    const MyDivOne = styled.div`
      --main: ${(props) => props.theme.main};
      --secondary: ${(props) => props.theme.secondary};
    `
    const MyDivTwo = styled.div`
      --main: ${(props) => props.theme.main};
      --other: ${(props) => props.theme.other};
    `

    render(
      <div>
        <ThemeProvider theme={themes.one}>
          <MyDivOne />
        </ThemeProvider>
        <ThemeProvider theme={themes.two}>
          <MyDivTwo />
        </ThemeProvider>
      </div>,
    )

    expectCSSMatches(`
      .c {
        --main: black;
        --secondary: red;
      }
      .d {
        --main: blue;
        --other: green;
      }`)
  })

  it('ThemeProvider propagates theme updates through nested ThemeProviders', async () => {
    const theme = {themed: true}
    const augment = (outerTheme: typeof theme) => Object.assign({}, outerTheme, {augmented: true})
    const update = {updated: true}

    const MyDiv = styled.div`
      --themed: ${(props) => props.theme.themed};
      --augmented: ${(props) => props.theme.augmented};
      --updated: ${(props) => props.theme.updated};
    `

    function Component(props: {theme: React.ComponentProps<typeof ThemeProvider>['theme']}) {
      return (
        <ThemeProvider theme={props.theme}>
          <ThemeProvider theme={augment}>
            <MyDiv />
          </ThemeProvider>
        </ThemeProvider>
      )
    }

    const {rerender} = await act(() => render(<Component theme={theme} />))

    expectCSSMatches(`
      .b {
        --themed: true;
        --augmented: true;
      }`)

    await act(() => rerender(<Component theme={{...theme, ...update}} />))

    expectCSSMatches(`
      .b {
        --themed: true;
        --augmented: true;
      }
      .c {
        --themed: true;
        --augmented: true;
        --updated: true;
      }`)
  })
})

describe('useTheme', () => {
  beforeEach(() => {
    styled = resetStyled()
  })

  it('useTheme should get the same theme that is serving ThemeProvider', async () => {
    const mainTheme = {main: 'black'}

    const MyDivOne = styled.div`
      --main: ${(props) => props.theme.main};
    `
    const MyDivWithThemeContext = () => {
      const theme = useTheme()
      return <div data-testid="theme" data-theme={theme.main} />
    }

    await act(() =>
      render(
        <div>
          <ThemeProvider theme={mainTheme}>
            <>
              <MyDivOne />
              <MyDivWithThemeContext />
            </>
          </ThemeProvider>
        </div>,
      ),
    )

    expectCSSMatches(`
      .b {
        --main: black;
      }`)

    expect(screen.getByTestId('theme')).toHaveAttribute('data-theme', mainTheme.main)
  })
})
