import { render } from '@testing-library/react';
import { getRenderedCSS, resetStyled } from './utils';

// Disable isStaticRules optimisation since we're not
// testing for ComponentStyle specifics here
vi.mock('../utils/isStaticRules', () => ({ default: () => false }));

let styled: ReturnType<typeof resetStyled>;

describe('extending', () => {
  /**
   * Make sure the setup is the same for every test
   */
  beforeEach(() => {
    styled = resetStyled();
  });

  it('should let you use another component in a css rule', () => {
    const Inner = styled.div`
      color: blue;
      font-weight: light;
    `;
    const Outer = styled.div`
      padding: 1rem;
      > ${Inner} {
        font-weight: bold;
      }
    `;
    render(<Inner />);
    render(<Outer />);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".c {
        color: blue;
        font-weight: light;
      }
      .d {
        padding: 1rem;
      }
      .d > .sc-a {
        font-weight: bold;
      }"
    `);
  });

  it('folded components should not duplicate styles', () => {
    const Inner = styled.div`
      color: blue;

      & + & {
        color: green;
      }
    `;

    const Outer = styled(Inner)`
      padding: 1rem;
    `;

    render(<Inner />);

    const tree = render(<Outer />);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".c {
        color: blue;
      }
      .sc-a + .sc-a {
        color: green;
      }
      .d {
        padding: 1rem;
      }"
    `);

    // ensure both static classes are applied and dynamic classes are also present
    expect(tree.container).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a sc-b c d"
        />
      </div>
    `);
  });

  describe('inheritance', () => {
    const setupParent = () => {
      const colors = {
        primary: 'red',
        secondary: 'blue',
        tertiary: 'green',
      };

      const Parent = styled.h1<{ $color?: keyof typeof colors }>`
        position: relative;
        color: ${props => colors[props.$color! || 'primary']};
      `;

      return Parent;
    };

    it('should override parents defaultProps', () => {
      const Parent = setupParent();
      const Child = styled(Parent).attrs({ $color: 'secondary' })``;
      const Grandson = styled(Child).attrs({ $color: 'tertiary' })``;
      render(<Parent />);
      render(<Child />);
      render(<Grandson />);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".d {
          position: relative;
          color: red;
        }
        .e {
          position: relative;
          color: blue;
        }
        .f {
          position: relative;
          color: green;
        }"
      `);
    });

    describe('when overriding with another component', () => {
      it('should override parents defaultProps', () => {
        const Parent = setupParent();
        const Child = styled(Parent).attrs({ $color: 'secondary', as: 'h2' })``;
        const Grandson = styled(Child).attrs(() => ({ $color: 'tertiary', as: 'h3' }))``;
        render(<Parent />);
        render(<Child />);
        render(<Grandson />);

        expect(getRenderedCSS()).toMatchInlineSnapshot(`
          ".d {
            position: relative;
            color: red;
          }
          .e {
            position: relative;
            color: blue;
          }
          .f {
            position: relative;
            color: green;
          }"
        `);
      });

      it('should evaluate grandsons props', () => {
        const Parent = setupParent();
        const Child = styled(Parent).attrs({ $color: 'secondary', as: 'h2' })``;
        const Grandson = styled(Child).attrs(() => ({ $color: 'tertiary', as: 'h3' }))``;

        expect(render(<Parent />).container).toMatchInlineSnapshot(`
          <div>
            <h1
              class="sc-a d"
            />
          </div>
        `);
        expect(render(<Child />).container).toMatchInlineSnapshot(`
          <div>
            <h2
              class="sc-a sc-b e"
            />
          </div>
        `);

        expect(render(<Grandson color="primary" />).container).toMatchInlineSnapshot(`
          <div>
            <h3
              class="sc-a sc-b sc-c f"
              color="primary"
            />
          </div>
        `);
        expect(getRenderedCSS()).toMatchInlineSnapshot(`
          ".d {
            position: relative;
            color: red;
          }
          .e {
            position: relative;
            color: blue;
          }
          .f {
            position: relative;
            color: green;
          }"
        `);
      });
    });
  });
});
