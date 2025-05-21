import { SC_VERSION } from '../constants';
import StyleSheet from '../sheet';
import { ExecutionContext, RuleSet, Stringifier } from '../types';
import flatten from '../utils/flatten';
import generateName from '../utils/generateAlphabeticName';
import { hash, phash } from '../utils/hash';
import isStaticRules from '../utils/isStaticRules';
import { joinStringArray, joinStrings } from '../utils/joinStrings';

const SEED = hash(SC_VERSION);

/**
 * ComponentStyle is all the CSS-specific stuff, not the React-specific stuff.
 */
export default class ComponentStyle {
  baseHash: number;
  baseStyle: ComponentStyle | null | undefined;
  componentId: string;
  isStatic: boolean;
  rules: RuleSet<any>;
  staticRulesId: string = '';
  buffer: [name: string, rules: string[]][] = [];

  constructor(rules: RuleSet<any>, componentId: string, baseStyle?: ComponentStyle | undefined) {
    this.rules = rules;
    this.isStatic =
      process.env.NODE_ENV === 'production' &&
      (baseStyle === undefined || baseStyle.isStatic) &&
      isStaticRules(rules);
    this.componentId = componentId;
    this.baseHash = phash(SEED, componentId);
    this.baseStyle = baseStyle;

    // NOTE: This registers the componentId, which ensures a consistent order
    // for this component's styles compared to others
    StyleSheet.registerId(componentId);
  }

  getBuffer() {
    this.buffer.length = 0;
    return this.buffer;
  }

  generateAndInjectStyles(
    executionContext: ExecutionContext,
    styleSheet: StyleSheet,
    stylis: Stringifier,
    insertionEffectBuffer: [name: string, rules: string[]][] = this.getBuffer()
  ): [className: string, insertionEffectBuffer: [name: string, rules: string[]][]] {
    let className = this.baseStyle
      ? this.baseStyle.generateAndInjectStyles(
          executionContext,
          styleSheet,
          stylis,
          insertionEffectBuffer
        )[0]
      : '';

    // force dynamic classnames if user-supplied stylis plugins are in use
    if (this.isStatic && !stylis.hash) {
      if (this.staticRulesId && styleSheet.hasNameForId(this.componentId, this.staticRulesId)) {
        className = joinStrings(className, this.staticRulesId);
      } else {
        const cssStatic = joinStringArray(
          flatten(this.rules, executionContext, styleSheet, stylis) as string[]
        );
        const name = generateName(phash(this.baseHash, cssStatic) >>> 0);

        if (!styleSheet.hasNameForId(this.componentId, name)) {
          const cssStaticFormatted = stylis(cssStatic, `.${name}`, undefined, this.componentId);
          insertionEffectBuffer.push([name, cssStaticFormatted]);
        }

        className = joinStrings(className, name);
        this.staticRulesId = name;
      }
    } else {
      let dynamicHash = phash(this.baseHash, stylis.hash);
      let css = '';

      for (let i = 0; i < this.rules.length; i++) {
        const partRule = this.rules[i];

        if (typeof partRule === 'string') {
          css += partRule;

          if (process.env.NODE_ENV !== 'production') dynamicHash = phash(dynamicHash, partRule);
        } else if (partRule) {
          const partString = joinStringArray(
            flatten(partRule, executionContext, styleSheet, stylis) as string[]
          );
          // The same value can switch positions in the array, so we include "i" in the hash.
          dynamicHash = phash(dynamicHash, partString + i);
          css += partString;
        }
      }

      if (css) {
        const name = generateName(dynamicHash >>> 0);

        if (!styleSheet.hasNameForId(this.componentId, name)) {
          const cssFormatted = stylis(css, `.${name}`, undefined, this.componentId);
          insertionEffectBuffer.push([name, cssFormatted]);
        }

        className = joinStrings(className, name);
      }
    }

    return [className, insertionEffectBuffer];
  }

  generateRules(
    executionContext: ExecutionContext,
    styleSheet: StyleSheet,
    stylis: Stringifier
  ): [className: string, insertionEffectBuffer: [name: string, rules: string[]][]] {
    let className = this.baseStyle
      ? this.baseStyle.generateRules(executionContext, styleSheet, stylis)[0]
      : '';

    // force dynamic classnames if user-supplied stylis plugins are in use
    if (this.isStatic && !stylis.hash) {
      if (this.staticRulesId && styleSheet.hasNameForId(this.componentId, this.staticRulesId)) {
        className = joinStrings(className, this.staticRulesId);
      } else {
        const cssStatic = joinStringArray(
          flatten(this.rules, executionContext, styleSheet, stylis) as string[]
        );
        const name = generateName(phash(this.baseHash, cssStatic) >>> 0);

        if (!styleSheet.hasNameForId(this.componentId, name)) {
          const cssStaticFormatted = stylis(cssStatic, `.${name}`, undefined, this.componentId);
          this.buffer.push([name, cssStaticFormatted]);
        }

        className = joinStrings(className, name);
        this.staticRulesId = name;
      }
    } else {
      let dynamicHash = phash(this.baseHash, stylis.hash);
      let css = '';

      for (let i = 0; i < this.rules.length; i++) {
        const partRule = this.rules[i];

        if (typeof partRule === 'string') {
          css += partRule;

          if (process.env.NODE_ENV !== 'production') dynamicHash = phash(dynamicHash, partRule);
        } else if (partRule) {
          const partString = joinStringArray(
            flatten(partRule, executionContext, styleSheet, stylis) as string[]
          );
          // The same value can switch positions in the array, so we include "i" in the hash.
          dynamicHash = phash(dynamicHash, partString + i);
          css += partString;
        }
      }

      if (css) {
        const name = generateName(dynamicHash >>> 0);

        if (!styleSheet.hasNameForId(this.componentId, name)) {
          const cssFormatted = stylis(css, `.${name}`, undefined, this.componentId);
          this.buffer.push([name, cssFormatted]);
        }

        className = joinStrings(className, name);
      }
    }

    return [className, this.buffer];
  }

  insertRules(styleSheet: StyleSheet) {
    for (const [name, rules] of this.buffer) {
      if (!styleSheet.hasNameForId(this.componentId, name)) {
        styleSheet.insertRules(this.componentId, name, rules);
      }
    }
    this.buffer.length = 0;
  }

  flushStyles(buffer: [name: string, rules: string[]][], styleSheet: StyleSheet) {
    // for (let i = 0; i < buffer.length; i++) {
    for (const [name, rules] of buffer) {
      // const [name, rules] = buffer[i];

      if (!styleSheet.hasNameForId(this.componentId, name)) {
        styleSheet.insertRules(this.componentId, name, rules);
      }
    }
    buffer.length = 0;
  }

  generateClassName(
    executionContext: ExecutionContext,
    styleSheet: StyleSheet,
    stylis: Stringifier
  ): string {
    let className = this.baseStyle
      ? this.baseStyle.generateClassName(executionContext, styleSheet, stylis)
      : '';

    // force dynamic classnames if user-supplied stylis plugins are in use
    if (this.isStatic && !stylis.hash) {
      if (this.staticRulesId && styleSheet.hasNameForId(this.componentId, this.staticRulesId)) {
        className = joinStrings(className, this.staticRulesId);
      } else {
        const cssStatic = joinStringArray(
          flatten(this.rules, executionContext, styleSheet, stylis) as string[]
        );
        const name = generateName(phash(this.baseHash, cssStatic) >>> 0);

        className = joinStrings(className, name);
        this.staticRulesId = name;
      }
    } else {
      let dynamicHash = phash(this.baseHash, stylis.hash);
      let hasCss = false;

      for (let i = 0; i < this.rules.length; i++) {
        const partRule = this.rules[i];

        if (typeof partRule === 'string') {
          hasCss = true;

          if (process.env.NODE_ENV !== 'production') dynamicHash = phash(dynamicHash, partRule);
        } else if (partRule) {
          const partString = joinStringArray(
            flatten(partRule, executionContext, styleSheet, stylis) as string[]
          );
          // The same value can switch positions in the array, so we include "i" in the hash.
          dynamicHash = phash(dynamicHash, partString + i);
          hasCss = true;
        }
      }

      if (hasCss) {
        const name = generateName(dynamicHash >>> 0);
        className = joinStrings(className, name);
      }
    }

    return className;
  }

  insertStyles(
    executionContext: ExecutionContext,
    styleSheet: StyleSheet,
    stylis: Stringifier
  ): void {
    this.baseStyle?.insertStyles(executionContext, styleSheet, stylis);

    // force dynamic classnames if user-supplied stylis plugins are in use
    if (this.isStatic && !stylis.hash) {
      if (this.staticRulesId && styleSheet.hasNameForId(this.componentId, this.staticRulesId)) {
        // do nothing
      } else {
        const cssStatic = joinStringArray(
          flatten(this.rules, executionContext, styleSheet, stylis) as string[]
        );
        const name = generateName(phash(this.baseHash, cssStatic) >>> 0);

        if (!styleSheet.hasNameForId(this.componentId, name)) {
          const cssStaticFormatted = stylis(cssStatic, `.${name}`, undefined, this.componentId);
          styleSheet.insertRules(this.componentId, name, cssStaticFormatted);
        }

        this.staticRulesId = name;
      }
    } else {
      let dynamicHash = phash(this.baseHash, stylis.hash);
      let css = '';

      for (let i = 0; i < this.rules.length; i++) {
        const partRule = this.rules[i];

        if (typeof partRule === 'string') {
          css += partRule;

          if (process.env.NODE_ENV !== 'production') dynamicHash = phash(dynamicHash, partRule);
        } else if (partRule) {
          const partString = joinStringArray(
            flatten(partRule, executionContext, styleSheet, stylis) as string[]
          );
          // The same value can switch positions in the array, so we include "i" in the hash.
          dynamicHash = phash(dynamicHash, partString + i);
          css += partString;
        }
      }

      if (css) {
        const name = generateName(dynamicHash >>> 0);

        if (!styleSheet.hasNameForId(this.componentId, name)) {
          const cssFormatted = stylis(css, `.${name}`, undefined, this.componentId);
          styleSheet.insertRules(this.componentId, name, cssFormatted);
        }
      }
    }
  }
}
