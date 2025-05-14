import isPropValid from '@emotion/is-prop-valid';
import React, {
  createElement,
  Ref,
  useCallback,
  useDebugValue,
  useInsertionEffect,
  useSyncExternalStore,
} from 'react';
import { IS_BROWSER, SC_VERSION } from '../constants';
import type {
  AnyComponent,
  Attrs,
  BaseObject,
  Dict,
  ExecutionContext,
  ExecutionProps,
  IStyledComponent,
  IStyledComponentFactory,
  IStyledStatics,
  OmitNever,
  RuleSet,
  StyledOptions,
  WebTarget,
} from '../types';
import { checkDynamicCreation } from '../utils/checkDynamicCreation';
import createWarnTooManyClasses from '../utils/createWarnTooManyClasses';
import determineTheme from '../utils/determineTheme';
import domElements from '../utils/domElements';
import { EMPTY_ARRAY, EMPTY_OBJECT } from '../utils/empties';
import escape from '../utils/escape';
import generateComponentId from '../utils/generateComponentId';
import generateDisplayName from '../utils/generateDisplayName';
import hoist from '../utils/hoist';
import isFunction from '../utils/isFunction';
import isStyledComponent from '../utils/isStyledComponent';
import isTag from '../utils/isTag';
import { joinStrings } from '../utils/joinStrings';
import merge from '../utils/mixinDeep';
import { setToString } from '../utils/setToString';
import ComponentStyle from './ComponentStyle';
import { useStyleSheetContext } from './StyleSheetManager';
import { DefaultTheme, ThemeContext } from './ThemeProvider';
import StyleSheet from '../sheet';
import type Sheet from '../sheet';
import { getIdForGroup } from '../sheet/GroupIDAllocator';

const identifiers: { [key: string]: number } = {};

/* We depend on components having unique IDs */
function generateId(
  displayName?: string | undefined,
  parentComponentId?: string | undefined
): string {
  const name = typeof displayName !== 'string' ? 'sc' : escape(displayName);
  // Ensure that no displayName can lead to duplicate componentIds
  identifiers[name] = (identifiers[name] || 0) + 1;

  const componentId = `${name}-${generateComponentId(
    // SC_VERSION gives us isolation between multiple runtimes on the page at once
    // this is improved further with use of the babel plugin "namespace" feature
    SC_VERSION + name + identifiers[name]
  )}`;

  return parentComponentId ? `${parentComponentId}-${componentId}` : componentId;
}

function useInjectedStyle<T extends ExecutionContext>(
  componentStyle: ComponentStyle,
  styleSheet: StyleSheet,
  resolvedAttrs: T
): [className: string, insertionEffectBuffer: [name: string, rules: string[]][]] {
  const ssc = useStyleSheetContext();

  const insertionEffectBuffer: [name: string, rules: string[]][] = [];
  const className = componentStyle.generateAndInjectStyles(
    resolvedAttrs,
    styleSheet,
    ssc.stylis,
    insertionEffectBuffer
  );

  // useInsertionEffect(() => {
  //   if (Array.isArray(insertionEffectBuffer) && insertionEffectBuffer.length > 0) {
  //     componentStyle.flushStyles(insertionEffectBuffer, ssc.styleSheet);
  //   }
  // });

  if (process.env.NODE_ENV !== 'production') useDebugValue(className);

  return [className, insertionEffectBuffer];
}

function resolveContext<Props extends object>(
  attrs: Attrs<React.HTMLAttributes<Element> & Props>[],
  props: React.HTMLAttributes<Element> & ExecutionProps & Props,
  theme: DefaultTheme
) {
  const context: React.HTMLAttributes<Element> &
    ExecutionContext &
    Props & { [key: string]: any; class?: string; ref?: React.Ref<any> } = {
    ...props,
    // unset, add `props.className` back at the end so props always "wins"
    className: undefined,
    theme,
  };
  let attrDef;

  for (let i = 0; i < attrs.length; i += 1) {
    attrDef = attrs[i];
    const resolvedAttrDef = isFunction(attrDef) ? attrDef(context) : attrDef;

    for (const key in resolvedAttrDef) {
      context[key as keyof typeof context] =
        key === 'className'
          ? joinStrings(context[key] as string | undefined, resolvedAttrDef[key] as string)
          : key === 'style'
            ? { ...context[key], ...resolvedAttrDef[key] }
            : resolvedAttrDef[key as keyof typeof resolvedAttrDef];
    }
  }

  if (props.className) {
    context.className = joinStrings(context.className, props.className);
  }

  return context;
}

let seenUnknownProps = new Set();

function useStyledComponentImpl<Props extends object>(
  forwardedComponent: IStyledComponent<'web', Props>,
  props: ExecutionProps & Props,
  forwardedRef: Ref<Element>
) {
  const {
    attrs: componentAttrs,
    componentStyle,
    defaultProps,
    foldedComponentIds,
    styledComponentId,
    target,
  } = forwardedComponent;

  const contextTheme = React.useContext(ThemeContext);
  const ssc = useStyleSheetContext();
  const shouldForwardProp = forwardedComponent.shouldForwardProp || ssc.shouldForwardProp;

  if (process.env.NODE_ENV !== 'production') useDebugValue(styledComponentId);

  // NOTE: the non-hooks version only subscribes to this when !componentStyle.isStatic,
  // but that'd be against the rules-of-hooks. We could be naughty and do it anyway as it
  // should be an immutable value, but behave for now.
  const theme = determineTheme(props, contextTheme, defaultProps) || EMPTY_OBJECT;

  const context = resolveContext<Props>(componentAttrs, props, theme);
  const ElementToBeCreated: WebTarget = context.as || target;
  const propsForElement: Dict<any> = {};

  for (const key in context) {
    if (context[key] === undefined) {
      // Omit undefined values from props passed to wrapped element.
      // This enables using .attrs() to remove props, for example.
    } else if (key[0] === '$' || key === 'as' || (key === 'theme' && context.theme === theme)) {
      // Omit transient props and execution props.
    } else if (key === 'forwardedAs') {
      propsForElement.as = context.forwardedAs;
    } else if (!shouldForwardProp || shouldForwardProp(key, ElementToBeCreated)) {
      propsForElement[key] = context[key];

      if (
        !shouldForwardProp &&
        process.env.NODE_ENV === 'development' &&
        !isPropValid(key) &&
        !seenUnknownProps.has(key) &&
        // Only warn on DOM Element.
        domElements.has(ElementToBeCreated as any)
      ) {
        seenUnknownProps.add(key);
        console.warn(
          `styled-components: it looks like an unknown prop "${key}" is being sent through to the DOM, which will likely trigger a React console error. If you would like automatic filtering of unknown props, you can opt-into that behavior via \`<StyleSheetManager shouldForwardProp={...}>\` (connect an API like \`@emotion/is-prop-valid\`) or consider using transient props (\`$\` prefix for automatic filtering.)`
        );
      }
    }
  }

  const isHydrating = useSyncExternalStore(
    useCallback(() => () => {}, []),
    () => false,
    () => true
  );
  const styleSheet = isHydrating ? new StyleSheet({ isServer: true }) : ssc.styleSheet;
  const [generatedClassName, styles] = useInjectedStyle(componentStyle, styleSheet, context);

  if (process.env.NODE_ENV !== 'production' && forwardedComponent.warnTooManyClasses) {
    forwardedComponent.warnTooManyClasses(generatedClassName);
  }

  let classString = joinStrings(foldedComponentIds, styledComponentId);
  if (generatedClassName) {
    classString += ' ' + generatedClassName;
  }
  if (context.className) {
    classString += ' ' + context.className;
  }

  propsForElement[
    // handle custom elements which React doesn't properly alias
    isTag(ElementToBeCreated) &&
    !domElements.has(ElementToBeCreated as Extract<typeof domElements, string>)
      ? 'class'
      : 'className'
  ] = classString;

  // forwardedRef is coming from React.forwardRef.
  // But it might not exist. Since React 19 handles `ref` like a prop, it only define it if there is a value.
  // We don't want to inject an empty ref.
  if (forwardedRef) {
    propsForElement.ref = forwardedRef;
  }

  useInsertionEffect(() => {
    if (!isHydrating && Array.isArray(styles) && styles.length > 0) {
      // for (const style of document.querySelectorAll(`[data-href*="${styledComponentId}"]`)) {
      // const remove = [] as HTMLStyleElement[];
      // for (const style of document.querySelectorAll(`[data-precedence^="sc"]`)) {
      //   if (style.hasAttribute('data-rehydrated')) continue;
      //   rehydrateSheetFromTag(ssc.styleSheet, style as HTMLStyleElement);
      //   style.setAttribute('data-rehydrated', 'true');
      //   console.log('rehydrating the style', style);
      //   // remove.push(style as HTMLStyleElement);
      // }

      componentStyle.flushStyles(styles, ssc.styleSheet);
      // for (const style of document.querySelectorAll(`[data-href^="${styledComponentId}"]`)) {
      //   console.log('removing the style', style);
      //   style.remove();
      // }
      // for (const style of remove) {
      //   console.log('removing the rehydrated style', style);
      //   style.remove();
      // }
    }
  }, [isHydrating, styles]);

  const children = <ElementToBeCreated {...propsForElement} />;

  if (isHydrating && Array.isArray(styles) && styles.length > 0) {
    componentStyle.flushStyles(styles, styleSheet);
    const css = outputSheetModern(styleSheet);

    return (
      <>
        {children}
        {css.map(([id, cssRules]) => (
          <style
            key={id}
            href={hash(cssRules)}
            // href={styledComponentId + '-' + hash(cssRules)}
            // precedence="scc"
            // precedence={SC_VERSION}
            precedence="sc"
            // precedence={`sc:${i}`}
          >
            {cssRules}
          </style>
        ))}
      </>
    );
  }

  return children;
}

const outputSheetModern = (sheet: Sheet) => {
  const tag = sheet.getTag();
  const { length } = tag;

  let css: [id: string, css: string][] = [];
  for (let group = 0; group < length; group++) {
    const id = getIdForGroup(group);
    if (id === undefined) continue;

    const rules = tag.getGroup(group);
    if (rules.length === 0) continue;

    css.push([id, rules]);
  }

  return css;
};

function createStyledComponent<
  Target extends WebTarget,
  OuterProps extends object,
  Statics extends object = BaseObject,
>(
  target: Target,
  options: StyledOptions<'web', OuterProps>,
  rules: RuleSet<OuterProps>
): ReturnType<IStyledComponentFactory<'web', Target, OuterProps, Statics>> {
  const isTargetStyledComp = isStyledComponent(target);
  const styledComponentTarget = target as IStyledComponent<'web', OuterProps>;
  const isCompositeComponent = !isTag(target);

  const {
    attrs = EMPTY_ARRAY,
    componentId = generateId(options.displayName, options.parentComponentId),
    displayName = generateDisplayName(target),
  } = options;

  const styledComponentId =
    options.displayName && options.componentId
      ? `${escape(options.displayName)}-${options.componentId}`
      : options.componentId || componentId;

  // fold the underlying StyledComponent attrs up (implicit extend)
  const finalAttrs =
    isTargetStyledComp && styledComponentTarget.attrs
      ? styledComponentTarget.attrs.concat(attrs as unknown as Attrs<OuterProps>[]).filter(Boolean)
      : (attrs as Attrs<OuterProps>[]);

  let { shouldForwardProp } = options;

  if (isTargetStyledComp && styledComponentTarget.shouldForwardProp) {
    const shouldForwardPropFn = styledComponentTarget.shouldForwardProp;

    if (options.shouldForwardProp) {
      const passedShouldForwardPropFn = options.shouldForwardProp;

      // compose nested shouldForwardProp calls
      shouldForwardProp = (prop, elementToBeCreated) =>
        shouldForwardPropFn(prop, elementToBeCreated) &&
        passedShouldForwardPropFn(prop, elementToBeCreated);
    } else {
      shouldForwardProp = shouldForwardPropFn;
    }
  }

  const componentStyle = new ComponentStyle(
    rules,
    styledComponentId,
    isTargetStyledComp ? (styledComponentTarget.componentStyle as ComponentStyle) : undefined
  );

  function forwardRefRender(props: ExecutionProps & OuterProps, ref: Ref<Element>) {
    return useStyledComponentImpl<OuterProps>(WrappedStyledComponent, props, ref);
  }

  forwardRefRender.displayName = displayName;

  /**
   * forwardRef creates a new interim component, which we'll take advantage of
   * instead of extending ParentComponent to create _another_ interim class
   */
  let WrappedStyledComponent = React.forwardRef(forwardRefRender) as unknown as IStyledComponent<
    'web',
    any
  > &
    Statics;
  WrappedStyledComponent.attrs = finalAttrs;
  WrappedStyledComponent.componentStyle = componentStyle;
  WrappedStyledComponent.displayName = displayName;
  WrappedStyledComponent.shouldForwardProp = shouldForwardProp;

  // this static is used to preserve the cascade of static classes for component selector
  // purposes; this is especially important with usage of the css prop
  WrappedStyledComponent.foldedComponentIds = isTargetStyledComp
    ? joinStrings(styledComponentTarget.foldedComponentIds, styledComponentTarget.styledComponentId)
    : '';

  WrappedStyledComponent.styledComponentId = styledComponentId;

  // fold the underlying StyledComponent target up since we folded the styles
  WrappedStyledComponent.target = isTargetStyledComp ? styledComponentTarget.target : target;

  Object.defineProperty(WrappedStyledComponent, 'defaultProps', {
    get() {
      return this._foldedDefaultProps;
    },

    set(obj) {
      this._foldedDefaultProps = isTargetStyledComp
        ? merge({}, styledComponentTarget.defaultProps, obj)
        : obj;
    },
  });

  if (process.env.NODE_ENV !== 'production') {
    checkDynamicCreation(displayName, styledComponentId);

    WrappedStyledComponent.warnTooManyClasses = createWarnTooManyClasses(
      displayName,
      styledComponentId
    );
  }

  setToString(WrappedStyledComponent, () => `.${WrappedStyledComponent.styledComponentId}`);

  if (isCompositeComponent) {
    const compositeComponentTarget = target as AnyComponent;

    hoist<typeof WrappedStyledComponent, typeof compositeComponentTarget>(
      WrappedStyledComponent,
      compositeComponentTarget,
      {
        // all SC-specific things should not be hoisted
        attrs: true,
        componentStyle: true,
        displayName: true,
        foldedComponentIds: true,
        shouldForwardProp: true,
        styledComponentId: true,
        target: true,
      } as { [key in keyof OmitNever<IStyledStatics<'web', OuterProps>>]: true }
    );
  }

  return WrappedStyledComponent;
}

export default createStyledComponent;

/** Hash a string using the djb2 algorithm. */
// from: https://github.com/souporserious/restyle/blob/4e71e9aa295803dd3cb47a47e3600a52b68bac38/src/utils.ts#L70C1-L77C2
function hash(value: string): string {
  let h = 5381;
  for (let index = 0, len = value.length; index < len; index++) {
    h = ((h << 5) + h + value.charCodeAt(index)) >>> 0;
  }
  return h.toString(36);
}
