import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ErrorCard } from './ErrorCard'

type Props = {
  children: ReactNode
  onRetry: () => void
}

type State = {
  error: Error | null
}

export class TransitErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[NovaTransit] render error', error, info.componentStack)
  }

  private handleRetry = () => {
    this.setState({ error: null })
    this.props.onRetry()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full items-center justify-center p-5">
          <ErrorCard
            message="Something went wrong rendering the dashboard."
            onRetry={this.handleRetry}
          />
        </div>
      )
    }

    return this.props.children
  }
}
