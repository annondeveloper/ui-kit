import { forwardRef } from 'react'
import { AvatarUpload as StandardAvatarUpload, type AvatarUploadProps } from '../components/avatar-upload'

export type LiteAvatarUploadProps = Omit<AvatarUploadProps, 'motion'>

export const AvatarUpload = forwardRef<HTMLDivElement, LiteAvatarUploadProps>(
  (props, ref) => <StandardAvatarUpload ref={ref} motion={0} {...props} />
)
AvatarUpload.displayName = 'AvatarUpload'
