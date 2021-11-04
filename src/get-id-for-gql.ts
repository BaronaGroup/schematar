import crypto from 'crypto'

export function getIdForGql(root: any, rootName: string, key: string, item: any, index: number) {
  const baseId = root.id || `${rootName}/${root._id}`
  const rootId = baseId.split(':')[0]
  return (
    rootId +
    ':' +
    crypto
      .createHash('sha256')
      .update(`${baseId}/${key}/${item.id || item._id || index.toString()}`)
      .digest('hex')
  )
}
