import { Navigate } from 'react-router-dom'

/** Internal preview/design routes — only available in local dev builds. */
export default function DevOnlyRoute({ children }) {
  if (import.meta.env.PROD) {
    return <Navigate to="/" replace />
  }
  return children
}
