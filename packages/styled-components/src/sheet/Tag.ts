import {InsertionTarget} from '../types'
import {getSheet, makeStyleTag} from './dom'
import {SheetOptions, Tag} from './types'

/** Create a CSSStyleSheet-like tag depending on the environment */
export const makeTag = ({isServer, target}: SheetOptions) => {
  if (isServer) {
    return new VirtualTag(target)
  } else {
    return new CSSOMTag(target)
  }
}

export class CSSOMTag implements Tag {
  element: HTMLStyleElement

  sheet: CSSStyleSheet

  length: number

  constructor(target?: InsertionTarget | undefined) {
    this.element = makeStyleTag(target)

    // Avoid Edge bug where empty style elements don't create sheets
    this.element.appendChild(document.createTextNode(''))

    this.sheet = getSheet(this.element)
    this.length = 0
  }

  insertRule(index: number, rule: string): boolean {
    try {
      this.sheet.insertRule(rule, index)
      this.length++
      return true
    } catch {
      return false
    }
  }

  deleteRule(index: number): void {
    this.sheet.deleteRule(index)
    this.length--
  }

  getRule(index: number): string {
    const rule = this.sheet.cssRules[index]

    // Avoid IE11 quirk where cssText is inaccessible on some invalid rules
    if (rule && rule.cssText) {
      return rule.cssText
    } else {
      return ''
    }
  }
}

/** A completely virtual (server-side) Tag that doesn't manipulate the DOM */
export class VirtualTag implements Tag {
  rules: string[]

  length: number

  constructor(_target?: InsertionTarget | undefined) {
    this.rules = []
    this.length = 0
  }

  insertRule(index: number, rule: string) {
    if (index <= this.length) {
      this.rules.splice(index, 0, rule)
      this.length++
      return true
    } else {
      return false
    }
  }

  deleteRule(index: number) {
    this.rules.splice(index, 1)
    this.length--
  }

  getRule(index: number) {
    if (index < this.length) {
      return this.rules[index]
    } else {
      return ''
    }
  }
}
