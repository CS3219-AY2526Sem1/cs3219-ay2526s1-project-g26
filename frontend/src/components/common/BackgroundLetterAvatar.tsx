import * as React from 'react'
import Avatar from '@mui/material/Avatar'
import { stringToColor } from '../../utils'
import { forwardRef, Ref } from 'react'

// source: https://mui.com/material-ui/react-avatar/
function backgroundLetterAvatar(name: string) {
  const nameSplit = name.split(' ')
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${nameSplit.length >= 2 ? nameSplit[0][0] + nameSplit[1][0] : nameSplit.length === 1 ? nameSplit[0][0] : ''}`,
  }
}

interface BackgroundLetterAvatarsProps {
  content: string
  alt?: string
}

export default forwardRef(function BackgroundLetterAvatar(
  props: BackgroundLetterAvatarsProps,
  ref: Ref<HTMLDivElement>
) {
  return (
    <Avatar ref={ref} {...props} {...backgroundLetterAvatar(props.content)} />
  )
})
