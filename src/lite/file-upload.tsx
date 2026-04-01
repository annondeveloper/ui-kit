import { forwardRef } from 'react'
import { FileUpload as StandardFileUpload, type FileUploadProps } from '../components/file-upload'

export type LiteFileUploadProps = Omit<FileUploadProps, 'motion'>

export const FileUpload = forwardRef<HTMLDivElement, LiteFileUploadProps>(
  (props, ref) => <StandardFileUpload ref={ref} motion={0} {...props} />
)
FileUpload.displayName = 'FileUpload'
