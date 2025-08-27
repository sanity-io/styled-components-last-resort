import React from 'react'
import {Client as Styletron} from 'styletron-engine-atomic'
import {Provider as StyletronProvider} from 'styletron-react'
import {View} from './View'

const styletron = new Styletron()

export function Provider({children}: {children: React.ReactNode}) {
  return (
    <StyletronProvider value={styletron}>
      <View>{children}</View>
    </StyletronProvider>
  )
}
