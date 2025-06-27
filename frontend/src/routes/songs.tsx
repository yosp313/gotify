import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/songs')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>
      <h1>Songs</h1>
      <p>This is the songs route.</p>
    </div>
  )
}
