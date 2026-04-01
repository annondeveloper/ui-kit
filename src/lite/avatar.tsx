import { forwardRef } from 'react'
import { Avatar as StandardAvatar, type AvatarProps } from '../components/avatar'

export type LiteAvatarProps = AvatarProps

export const Avatar = forwardRef<HTMLDivElement, LiteAvatarProps>(
  (props, ref) => <StandardAvatar ref={ref} {...props} />
)
Avatar.displayName = 'Avatar'
