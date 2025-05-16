import React from 'react';
import { render, fireEvent, screen, act } from '@testing-library/react';
import { getRenderedCSS, resetStyled } from './utils';

// Disable isStaticRules optimisation since we're not
// testing for ComponentStyle specifics here
vi.mock('../utils/isStaticRules', () => ({ default: () => false }));

let styled: ReturnType<typeof resetStyled>;

describe('expanded api', () => {
  /**
   * Make sure the setup is the same for every test
   */
  beforeEach(() => {
    styled = resetStyled();
  });

  describe('displayName', () => {
    it('should be auto-generated if none passed', () => {
      const Comp = styled.div``;
      expect(Comp.displayName).toBe('styled.div');
    });

    it('should be attached if supplied', () => {
      const Comp = styled.div.withConfig({ displayName: 'Comp' })``;
      expect(Comp.displayName).toBe('Comp');
    });
  });

  describe('componentId', () => {
    it('should be generated as "sc" + hash', () => {
      const Comp = styled.div``;
      const Comp2 = styled.div``;
      expect(Comp.styledComponentId).toBe('sc-a');
      expect(render(<Comp />).container).toMatchSnapshot();
      expect(Comp2.styledComponentId).toBe('sc-b');
      expect(render(<Comp2 />)).toMatchSnapshot();
    });

    it('should be generated from displayName + hash', () => {
      const Comp = styled.div.withConfig({ displayName: 'Comp' })``;
      const Comp2 = styled.div.withConfig({ displayName: 'Comp2' })``;
      expect(Comp.styledComponentId).toBe('Comp-a');
      expect(render(<Comp />).container).toMatchSnapshot();
      expect(Comp2.styledComponentId).toBe('Comp2-b');
      expect(render(<Comp2 />)).toMatchSnapshot();
    });

    it('should be attached if passed in', () => {
      const Comp = styled.div.withConfig({ componentId: 'LOLOMG' })``;
      const Comp2 = styled.div.withConfig({ componentId: 'OMGLOL' })``;
      expect(Comp.styledComponentId).toBe('LOLOMG');
      expect(render(<Comp />).container).toMatchSnapshot();
      expect(Comp2.styledComponentId).toBe('OMGLOL');
      expect(render(<Comp2 />)).toMatchSnapshot();
    });

    it('should be combined with displayName if both passed in', () => {
      const Comp = styled.div.withConfig({
        displayName: 'Comp',
        componentId: 'LOLOMG',
      })``;
      const Comp2 = styled.div.withConfig({
        displayName: 'Comp2',
        componentId: 'OMGLOL',
      })``;
      expect(Comp.styledComponentId).toBe('Comp-LOLOMG');
      expect(render(<Comp />).container).toMatchSnapshot();
      expect(Comp2.styledComponentId).toBe('Comp2-OMGLOL');
      expect(render(<Comp2 />).container).toMatchSnapshot();
    });
  });

  describe('chaining', () => {
    it('should merge the options strings', () => {
      const Comp = styled.div
        .withConfig({ componentId: 'id-1' })
        .withConfig({ displayName: 'dn-2' })``;
      expect(Comp.displayName).toBe('dn-2');
      expect(render(<Comp />).container).toMatchSnapshot();
    });
  });

  describe('"as" prop', () => {
    it('changes the rendered element type', () => {
      const Comp = styled.div`
        color: red;
      `;

      expect(render(<Comp as="span" />).container).toMatchSnapshot();
    });

    it('changes the rendered element type when used with attrs', () => {
      const Comp = styled.div.attrs(() => ({
        as: 'header',
      }))`
        color: red;
      `;

      expect(render(<Comp />).container).toMatchSnapshot();
    });

    it('prefers attrs over props', () => {
      const Comp = styled.div.attrs(() => ({
        as: 'header',
      }))`
        color: red;
      `;

      expect(render(<Comp as="span" />).container).toMatchInlineSnapshot(`
        <div>
          <header
            class="sc-a b"
          />
        </div>
      `);
    });

    it('works with custom components', () => {
      const Override: React.FC<any> = props => <figure {...props} />;
      const Comp = styled.div`
        color: red;
      `;

      expect(render(<Comp as={Override} />).container).toMatchSnapshot();
    });

    it('transfers all styles that have been applied', () => {
      const Comp = styled.div`
        background: blue;
        color: red;
      `;

      const Comp2 = styled(Comp)`
        color: green;
      `;

      const Comp3 = styled(Comp2)`
        text-align: center;
      `;

      expect(Comp.displayName).toMatchInlineSnapshot(`"styled.div"`);
      expect(Comp2.displayName).toMatchInlineSnapshot(`"Styled(styled.div)"`);
      expect(Comp3.displayName).toMatchInlineSnapshot(`"Styled(Styled(styled.div))"`);
      expect(render(<Comp />).container).toMatchInlineSnapshot(`
        <div>
          <div
            class="sc-a d"
          />
        </div>
      `);
      expect(render(<Comp2 />).container).toMatchInlineSnapshot(`
        <div>
          <div
            class="sc-a sc-b d e"
          />
        </div>
      `);
      expect(render(<Comp3 as="span" />).container).toMatchInlineSnapshot(`
        <div>
          <span
            class="sc-a sc-b sc-c d e f"
          />
        </div>
      `);

      expect(getRenderedCSS()).toMatchInlineSnapshot(`
        ".d {
          background: blue;
          color: red;
        }
        .e {
          color: green;
        }
        .f {
          text-align: center;
        }"
      `);
    });

    it('"as" prop signature should inform rendered JSX if provided', () => {
      const X = styled.div<{ as?: 'div' | 'button' }>``;
      const StyledX = styled(X)``;

      render(
        <>
          <X
            // @ts-expect-error invalid input test
            as="section"
          />
          <StyledX
            // @ts-expect-error invalid input test
            as="section"
          />
        </>
      );
    });
  });
});
