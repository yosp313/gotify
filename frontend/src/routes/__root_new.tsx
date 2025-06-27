import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/__root_new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/__root_new"!</div>
}
