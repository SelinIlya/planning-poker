export type VoteValue = number | '?' | '☕️' | null

export type Participant = {
  id: string
  name: string
  category: string
  vote: VoteValue | '•' | null
}

export type RoomState = {
  roomId: string
  hostId: string
  task: string
  revealed: boolean
  participants: Participant[]
  average: number | null
  byCategory?: Record<string, number>
}


