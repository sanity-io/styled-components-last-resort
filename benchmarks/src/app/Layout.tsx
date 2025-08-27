import {useState} from 'react'
import {StyleSheet, View} from 'react-native'
import {colors} from './theme'

export function Layout(props: {
  actionPanel: React.ReactNode
  listPanel: React.ReactNode
  viewPanel: React.ReactNode
}) {
  const {viewPanel, actionPanel, listPanel} = props
  const [widescreen, setWidescreen] = useState(false)

  return (
    <View
      onLayout={({nativeEvent}) => {
        const {layout} = nativeEvent
        const {width} = layout
        setWidescreen(width >= 740)
      }}
      style={[styles.root, widescreen && styles.row]}
    >
      <View style={[widescreen ? styles.grow : styles.stackPanel, styles.layer]}>{viewPanel}</View>
      <View style={styles.grow}>
        <View style={[styles.grow, styles.layer]}>{listPanel}</View>
        <View style={styles.divider} />
        <View style={styles.layer}>{actionPanel}</View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    height: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  divider: {
    height: 10,
    backgroundColor: colors.fadedGray,
    borderBottomWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.mediumGray,
  },
  grow: {
    flex: 1,
  },
  stackPanel: {
    height: '33.33%',
  },
  layer: {
    transform: [
      {
        // @ts-expect-error - fix later
        translateZ: '0',
      },
    ],
  },
})
