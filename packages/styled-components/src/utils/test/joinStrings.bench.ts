import {bench} from 'vitest'
import {joinStringArray} from '../joinStrings'

let arr: string[] = []
const setup = () => {
  arr = Array.from({length: 100_000}, (_, i) => `str${i}`)
}

describe('large arrays with separator', () => {
  bench(
    'joinStringArray',
    () => {
      joinStringArray(arr, ' ')
    },
    {time: 1000, setup},
  )
  bench(
    'arr.join()',
    () => {
      arr.join(' ')
    },
    {time: 1000, setup},
  )
})

describe('large arrays without separator', () => {
  bench(
    'joinStringArray',
    () => {
      joinStringArray(arr)
    },
    {time: 1000, setup},
  )
  bench(
    'arr.join()',
    () => {
      arr.join('')
    },
    {time: 1000, setup},
  )
})

describe('small arrays with separator', () => {
  bench(
    'joinStringArray',
    () => {
      joinStringArray(['a', 'b'], ' ')
    },
    {time: 1000},
  )
  bench(
    'arr.join',
    () => {
      ;['a', 'b'].join(' ')
    },
    {time: 1000},
  )
})

describe('small arrays without separator', () => {
  bench(
    'joinStringArray',
    () => {
      joinStringArray(['a', 'b'])
    },
    {time: 1000},
  )
  bench(
    'arr.join',
    () => {
      ;['a', 'b'].join('')
    },
    {time: 1000},
  )
})
