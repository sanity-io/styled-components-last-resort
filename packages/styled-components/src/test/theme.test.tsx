import { render } from '@testing-library/react';
import ThemeProvider from '../models/ThemeProvider';
import { getRenderedCSS, resetStyled } from './utils';

let styled: ReturnType<typeof resetStyled>;

describe('theming', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    styled = resetStyled();
  });

  it('should inject props.theme into a styled component', () => {
    const Comp = styled.div`
      color: ${props => props.theme.color};
    `;
    const theme = { color: 'black' };
    render(
      <ThemeProvider theme={theme}>
        <Comp />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }"
    `);
  });

  it('should inject props.theme into a styled component multiple levels deep', () => {
    const Comp = styled.div`
      color: ${props => props.theme.color};
    `;
    const theme = { color: 'black' };
    render(
      <ThemeProvider theme={theme}>
        <div>
          <div>
            <Comp />
          </div>
        </div>
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }"
    `);
  });

  it('should properly allow a component to fallback to its default props when a theme is not provided', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.test!.color};
    `;

    // @ts-expect-error
    Comp1.defaultProps = {
      theme: {
        test: {
          color: 'purple',
        },
      },
    };
    render(
      <div>
        <Comp1 />
      </div>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
      }"
    `);
  });

  // https://github.com/styled-components/styled-components/issues/344
  it('should use ThemeProvider theme instead of defaultProps theme', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.test?.color};
    `;

    // @ts-expect-error
    Comp1.defaultProps = {
      theme: {
        test: {
          color: 'purple',
        },
      },
    };
    const theme = { test: { color: 'green' } };

    render(
      <ThemeProvider theme={theme}>
        <Comp1 />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: green;
      }"
    `);
  });

  it('should properly allow a component to override the theme with a prop even if it is equal to defaultProps theme', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.test!.color};
    `;

    // @ts-expect-error
    Comp1.defaultProps = {
      theme: {
        test: {
          color: 'purple',
        },
      },
    };
    const theme = { test: { color: 'green' } };

    render(
      <ThemeProvider theme={theme}>
        <Comp1 theme={{ test: { color: 'purple' } }} />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
      }"
    `);
  });

  it('should properly allow a component to override the theme with a prop', () => {
    const Comp = styled.div`
      color: ${props => props.theme.color};
    `;

    const theme = {
      color: 'purple',
    };

    render(
      <div>
        <ThemeProvider theme={theme}>
          <Comp theme={{ color: 'red' }} />
        </ThemeProvider>
      </div>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: red;
      }"
    `);
  });

  it('should only inject props.theme into styled components within its child component tree', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.color || 'red'};
    `;
    const Comp2 = styled.div`
      color: ${props => props.theme.color || 'red'};
    `;

    const theme = { color: 'black' };
    render(
      <div>
        <ThemeProvider theme={theme}>
          <div>
            <Comp1 />
          </div>
        </ThemeProvider>
        <Comp2 />
      </div>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".c {
        color: black;
      }
      .d {
        color: red;
      }"
    `);
  });

  it('should inject props.theme into all styled components within the child component tree', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.color};
    `;
    const Comp2 = styled.div`
      background: ${props => props.theme.color};
    `;
    const theme = { color: 'black' };
    render(
      <ThemeProvider theme={theme}>
        <div>
          <div>
            <Comp1 />
          </div>
          <Comp2 />
        </div>
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".c {
        color: black;
      }
      .d {
        background: black;
      }"
    `);
  });

  it('should inject new CSS when the theme changes', () => {
    const Comp = styled.div`
      color: ${props => props.theme.color};
    `;
    const originalTheme = { color: 'black' };
    const newTheme = { color: 'blue' };
    let theme = originalTheme;
    // Force render the component
    const renderComp = () => {
      render(
        <ThemeProvider theme={theme}>
          <Comp />
        </ThemeProvider>
      );
    };
    renderComp();
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }"
    `);
    // Change the theme
    theme = newTheme;
    renderComp();
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }
      .c {
        color: blue;
      }"
    `);
  });

  it('should properly render with the same theme from default props on re-render', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.color};
    `;

    // @ts-expect-error
    Comp1.defaultProps = {
      theme: {
        color: 'purple',
      },
    };

    const jsx = <Comp1 />;

    const { rerender } = render(jsx);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
      }"
    `);

    rerender(jsx);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
      }"
    `);
  });

  it('should properly update style if theme is changed', () => {
    const Comp1 = styled.div`
      color: ${props => props.theme.color};
    `;

    const { rerender } = render(
      <ThemeProvider
        theme={{
          color: 'purple',
        }}
      >
        <Comp1 />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
      }"
    `);

    rerender(
      <ThemeProvider
        theme={{
          color: 'pink',
        }}
      >
        <Comp1 />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
      }
      .c {
        color: pink;
      }"
    `);
  });

  it('should properly update style if props used in styles is changed', () => {
    const Comp1 = styled.div<{ $zIndex?: number }>`
      color: ${props => props.theme.color};
      z-index: ${props => props.$zIndex || 0};
    `;

    const { rerender } = render(
      <ThemeProvider
        theme={{
          color: 'purple',
        }}
      >
        <Comp1 />
      </ThemeProvider>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
        z-index: 0;
      }"
    `);

    rerender(
      <ThemeProvider
        theme={{
          color: 'pink',
        }}
      >
        <Comp1 />
      </ThemeProvider>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
        z-index: 0;
      }
      .c {
        color: pink;
        z-index: 0;
      }"
    `);

    rerender(
      <ThemeProvider
        theme={{
          color: 'pink',
        }}
      >
        <Comp1 $zIndex={1} />
      </ThemeProvider>
    );
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: purple;
        z-index: 0;
      }
      .c {
        color: pink;
        z-index: 0;
      }
      .d {
        color: pink;
        z-index: 1;
      }"
    `);
  });

  it('should change the classnames when the theme changes', async () => {
    const Comp = styled.div`
      color: ${props => props.theme.color};
    `;

    const originalTheme = { color: 'black' };
    const newTheme = { color: 'blue' };

    const Theme = ({ theme }: any) => (
      <ThemeProvider theme={theme}>
        <Comp data-testid="color" />
      </ThemeProvider>
    );

    const { findByTestId, rerender } = render(<Theme theme={originalTheme} />);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }"
    `);
    expect(await findByTestId('color')).toHaveClass('sc-a', 'b');

    // Change theme
    rerender(<Theme theme={newTheme} />);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }
      .c {
        color: blue;
      }"
    `);

    const node = await findByTestId('color');
    expect(node).toHaveClass('sc-a', 'c');
    expect(node).not.toHaveClass('b');
  });

  // https://github.com/styled-components/styled-components/issues/445
  it('should use ThemeProvider theme instead of defaultProps theme after initial render', () => {
    const Text = styled.div`
      color: ${props => props.theme.color};
    `;

    Text.defaultProps = {
      theme: {
        color: 'purple',
      },
    };

    const Theme = (props: React.ComponentProps<typeof Text>) => (
      <ThemeProvider theme={{ color: 'green' }}>
        <Text {...props} />
      </ThemeProvider>
    );

    const { rerender } = render(<Theme key="a" data-prop="foo" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: green;
      }"
    `);

    rerender(<Theme key="a" data-prop="bar" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: green;
      }"
    `);
  });

  // https://github.com/styled-components/styled-components/issues/1776
  it('should allow module objects to be passed as themes', () => {
    const theme = {
      borderRadius: '2px',
      palette: {
        black: '#000',
        white: '#fff',
        [Symbol.toStringTag]: 'Module',
      },
      [Symbol.toStringTag]: 'Module',
    };

    const Comp1 = styled.div`
      background-color: ${({ theme }) => theme.palette!.white};
      color: ${({ theme }) => theme.palette!.black};
    `;

    expect(() => {
      render(
        <ThemeProvider theme={theme}>
          <Comp1 />
        </ThemeProvider>
      );
    }).not.toThrow('plain object');

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        background-color: #fff;
        color: #000;
      }"
    `);
  });

  it('should allow other complex objects to be passed as themes', () => {
    class Theme {
      borderRadius: string;

      constructor(borderRadius: string) {
        this.borderRadius = borderRadius;
      }
    }

    const theme = new Theme('2px');

    const Comp1 = styled.div`
      border-radius: ${({ theme }) => theme.borderRadius};
    `;

    render(
      <ThemeProvider theme={theme}>
        <Comp1 />
      </ThemeProvider>
    );

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        border-radius: 2px;
      }"
    `);
  });

  it('should not allow the theme to be null', () => {
    expect(() => {
      // HACK: work around the problem without changing the snapshots
      // these tests need to be changed to use error boundaries instead
      const mock = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        // @ts-expect-error properly catching null theme
        <ThemeProvider theme={null}>
          <div />
        </ThemeProvider>
      );
      expect(mock).toHaveBeenCalledTimes(1);
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not allow the theme to be an array', () => {
    expect(() => {
      // HACK: work around the problem without changing the snapshots
      // these tests need to be changed to use error boundaries instead
      const mock = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        // @ts-expect-error invalid theme input
        <ThemeProvider theme={['a', 'b', 'c']}>
          <div />
        </ThemeProvider>
      );
      expect(mock).toHaveBeenCalledTimes(1);
    }).toThrowErrorMatchingSnapshot();
  });

  it('should not allow the theme to be a non-object', () => {
    expect(() => {
      // HACK: work around the problem without changing the snapshots
      // these tests need to be changed to use error boundaries instead
      const mock = vi.spyOn(console, 'error').mockImplementation(() => {});
      render(
        // @ts-expect-error invalid input
        <ThemeProvider theme={42}>
          <div />
        </ThemeProvider>
      );
      expect(mock).toHaveBeenCalledTimes(1);
    }).toThrowErrorMatchingSnapshot();
  });
});
