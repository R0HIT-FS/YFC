import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function RoomHover() {
  return (
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger asChild>
        <Button variant="link" className="text-xs text-zinc-500 px-0 mt-4 cursor-text">Delete Room</Button>
      </HoverCardTrigger>
      <HoverCardContent side={"right"} className="flex w-64 flex-col gap-0.5 bg-zinc-700">
        <div className="text-xs text-yellow-500">Cannot delete (room not empty)</div>
      </HoverCardContent>
    </HoverCard>
  )
}
