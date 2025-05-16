import React, { Fragment } from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { expectCSSMatches, getRenderedCSS, resetStyled } from './utils';

let styled: ReturnType<typeof resetStyled>;

describe('props', () => {
  beforeEach(() => {
    styled = resetStyled();
  });

  it('should execute interpolations and fall back', () => {
    const Comp = styled.div<{ fg?: string }>`
      color: ${props => props.fg || 'black'};
    `;
    render(<Comp />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: black;
      }"
    `);
  });

  it('should execute interpolations and inject props', () => {
    const Comp = styled.div<{ fg: string }>`
      color: ${props => props.fg || 'black'};
    `;
    render(<Comp fg="red" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: red;
      }"
    `);
  });

  it('should ignore non-0 falsy object interpolations', () => {
    const Comp = styled.div<{ fg: string }>`
      ${
        // @ts-expect-error improper input
        () => ({
          borderWidth: 0,
          colorA: null,
          colorB: false,
          colorC: undefined,
          colorD: '',
        })
      };
    `;
    render(<Comp fg="red" />);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        border-width: 0;
      }"
    `);
  });

  it('should filter out props prefixed with dollar sign (transient props)', () => {
    const Comp = styled((p: any) => <div {...p} />)<{ $fg?: string; fg?: string }>`
      color: ${props => props.$fg || 'black'};
    `;
    expect(
      render(
        <>
          <Comp $fg="red" />
          <Comp fg="red" />
        </>
      ).container
    ).toMatchInlineSnapshot(`
      <div>
        <div
          class="sc-a b"
        />
        <div
          class="sc-a c"
          fg="red"
        />
      </div>
    `);
    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        color: red;
      }
      .c {
        color: black;
      }"
    `);
  });

  it('should forward the "as" prop if "forwardedAs" is used', () => {
    const Comp = ({ as: Component = 'div', ...props }) => <Component {...props} />;

    const Comp2 = styled(Comp)`
      background: red;
    `;

    expect(render(<Comp2 forwardedAs="button" />).container).toMatchInlineSnapshot(`
      <div>
        <button
          class="sc-a b"
        />
      </div>
    `);

    expect(getRenderedCSS()).toMatchInlineSnapshot(`
      ".b {
        background: red;
      }"
    `);
  });

  describe('shouldForwardProp', () => {
    // NB existing functionality (when `shouldForwardProp` is not set) is tested elsewhere

    it('allows for custom prop filtering for elements', async () => {
      const Comp = styled('input').withConfig({
        shouldForwardProp: prop => !['hidden'].includes(prop),
      })<{ hidden: boolean; type: string }>`
        --type: ${props => props.type};
        --hidden: ${props => (props.hidden ? 'true' : 'false')};
      `;
      const { getByTestId } = render(<Comp data-testid="inner" hidden type="text" />);

      const node = getByTestId('inner');
      expect(node).toHaveAttribute('type', 'text');
      expect(node).not.toHaveAttribute('hidden');
      expectCSSMatches(`
        .b {
          --type:text;
          --hidden:true;
        }
      `);
    });

    it('allows custom prop filtering for components', () => {
      const Inner = ({ filterThis, passThru }: { filterThis: string; passThru: string }) => {
        return <div data-testid="inner" data-filter-this={filterThis} data-pass-thru={passThru} />;
      };
      const Comp = styled(Inner).withConfig({
        shouldForwardProp: prop => !['filterThis'].includes(prop),
      })<{ filterThis: string; passThru: string }>`
        --filter-this: ${props => props.filterThis};
        --pass-thru: ${props => props.passThru};
      `;
      const { getByTestId } = render(<Comp filterThis="abc" passThru="def" />);

      const node = getByTestId('inner');
      expect(node).toHaveAttribute('data-pass-thru', 'def');
      expect(node).not.toHaveAttribute('data-filter-this', 'abc');
      expectCSSMatches(`
        .b {
          --filter-this: abc;
          --pass-thru: def;
        }
      `);
    });

    it('composes shouldForwardProp on composed styled components', () => {
      const StyledDiv = styled('div').withConfig({
        shouldForwardProp: prop => prop === 'a' || prop === 'data-testid',
      })<{ a: boolean; b: boolean }>`
        color: red;
      `;
      const ComposedDiv = styled(StyledDiv).withConfig({
        shouldForwardProp: () => true,
      })``;
      const { getByTestId } = render(<ComposedDiv data-testid="inner" a b />);
      const node = getByTestId('inner');
      expect(node).not.toHaveAttribute('a');
      expect(node).not.toHaveAttribute('b');
    });

    it('should inherit shouldForwardProp for wrapped styled components', () => {
      const Div1 = styled('div').withConfig({
        shouldForwardProp: prop => prop !== 'color',
      })<{ color: string }>`
        background-color: ${({ color }) => color};
      `;
      const Div2 = styled(Div1)``;
      const wrapper = render(
        <Fragment>
          <Div1 color="red" id="test-1" />
          <Div2 color="green" id="test-2" />
        </Fragment>
      );
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".c {
          background-color: red;
        }
        .d {
          background-color: green;
        }"
      `);
      expect(wrapper.container).toMatchSnapshot();
    });

    it('should filter out props when using "as" to a custom component', () => {
      const AsComp = (props: React.JSX.IntrinsicElements['div']) => (
        <div data-testid="inner" {...props} />
      );
      const Comp = styled('div').withConfig({
        shouldForwardProp: prop => !['data-filter-this'].includes(prop),
      })<{ ['data-filter-this']: string; ['data-pass-thru']: string }>`
        color: red;
      `;

      const { getByTestId } = render(
        <Comp as={AsComp} data-filter-this="abc" data-pass-thru="def" />
      );

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }"
      `);
      const node = getByTestId('inner');
      expect(node).toHaveAttribute('data-pass-thru', 'def');
      expect(node).not.toHaveAttribute('data-filter-this', 'abc');
    });

    it('can set computed styles based on props that are being filtered out', () => {
      const AsComp = (props: React.JSX.IntrinsicElements['div']) => (
        <div data-testid="inner" {...props} />
      );
      const Comp = styled('div').withConfig({
        shouldForwardProp: prop => !['data-filter-this'].includes(prop),
      })<{ ['data-filter-this']: string; ['data-pass-thru']: string }>`
        color: ${props => (props['data-filter-this'] === 'abc' ? 'red' : undefined)};
      `;
      const { getByTestId } = render(
        <Comp as={AsComp} data-filter-this="abc" data-pass-thru="def" />
      );

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }"
      `);
      const node = getByTestId('inner');
      expect(node).toHaveAttribute('data-pass-thru', 'def');
      expect(node).not.toHaveAttribute('data-filter-this', 'abc');
    });

    it('should filter our props when using "as" to a different element', () => {
      const Comp = styled('div').withConfig({
        shouldForwardProp: prop => !['data-filter-this'].includes(prop),
      })<{ ['data-filter-this']: string; ['data-pass-thru']: string }>`
        color: red;
      `;
      const { getByTestId } = render(
        <Comp as="a" data-testid="inner" data-filter-this="abc" data-pass-thru="def" />
      );
      const node = getByTestId('inner');
      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".b {
          color: red;
        }"
      `);
      expect(node).toHaveAttribute('data-pass-thru', 'def');
      expect(node).not.toHaveAttribute('data-filter-this', 'abc');
    });

    it('passes the target element for use if desired', () => {
      const stub = vi.fn();

      const Comp = styled('div').withConfig({
        shouldForwardProp: stub,
      })<{ filterThis: string; passThru: string }>`
        color: red;
      `;

      render(<Comp as="a" href="/foo" filterThis="abc" passThru="def" />);

      expect(stub).toHaveBeenCalledWith('filterThis', 'a');
      expect(stub).toHaveBeenCalledWith('href', 'a');
    });

    it('warns in development mode when shouldForwardProp is not provided for an unknown prop', () => {
      let originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const Comp = styled('div')<{ filterThis: string }>`
        color: red;
      `;

      render(<Comp as="a" href="/foo" filterThis="abc" />);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('filterThis'));
      process.env.NODE_ENV = originalEnv;
    });

    it('do not warn in development mode when shouldForwardProp is not provided for an unknown prop on React component', () => {
      let originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      vi.spyOn(console, 'warn').mockImplementation(() => {});

      const Comp = styled(({ className, myLabel }: { className?: string; myLabel: string }) => (
        <span className={className}>{myLabel}</span>
      ))`
        color: red;
      `;

      render(<Comp myLabel="My label" />);

      expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining('myLabel'));
      expect(console.warn).toHaveBeenCalledTimes(0);
      process.env.NODE_ENV = originalEnv;
    });
  });
});
