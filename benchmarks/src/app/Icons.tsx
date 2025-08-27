import {createElement, StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  root: {
    display: 'flex',
    fill: 'currentcolor',
    height: '1.25em',
    maxWidth: '100%',
    position: 'relative',
    userSelect: 'none',
    textAlignVertical: 'text-bottom',
  },
})

const defaults = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
} as const

export const IconClear = () =>
  createElement('svg', {
    ...defaults,
    style: styles.root,
    children: (
      <>
        <path d="M0 0h24v24H0z" id="bounds" opacity="0" />
        <path d="M12 1.25C6.072 1.25 1.25 6.072 1.25 12S6.072 22.75 12 22.75 22.75 17.928 22.75 12 17.928 1.25 12 1.25zm0 1.5c2.28 0 4.368.834 5.982 2.207L4.957 17.982C3.584 16.368 2.75 14.282 2.75 12c0-5.1 4.15-9.25 9.25-9.25zm0 18.5c-2.28 0-4.368-.834-5.982-2.207L19.043 6.018c1.373 1.614 2.207 3.7 2.207 5.982 0 5.1-4.15 9.25-9.25 9.25z" />
      </>
    ),
  })

export const IconEye = (props: {style: unknown}) =>
  createElement('svg', {
    ...defaults,
    style: StyleSheet.compose(styles.root, props.style),
    children: (
      <>
        <path d="M0 0h24v24H0z" id="bounds" opacity="0" />
        <path d="M14.548 11.634c-1.207 0-2.188-.98-2.188-2.188 0-.664.302-1.25.77-1.653-.363-.097-.736-.165-1.13-.165-2.416 0-4.375 1.96-4.375 4.376S9.585 16.38 12 16.38c2.418 0 4.377-1.96 4.377-4.376 0-.4-.07-.78-.17-1.146-.402.47-.992.776-1.66.776z" />
        <path d="M12 19.79c-7.228 0-10.12-6.724-10.24-7.01-.254-.466-.254-1.105.035-1.642C1.88 10.923 4.772 4.2 12 4.2s10.12 6.723 10.24 7.01c.254.465.254 1.104-.035 1.64-.085.216-2.977 6.94-10.205 6.94zm0-14c-6.154 0-8.668 5.787-8.772 6.033-.068.135-.068.208-.033.273.137.316 2.65 6.104 8.805 6.104 6.18 0 8.747-5.973 8.772-6.033.07-.136.07-.21.034-.274-.138-.316-2.652-6.103-8.806-6.103z" />
      </>
    ),
  })
