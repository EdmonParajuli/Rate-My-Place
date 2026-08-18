import { useEffect, useState } from "react"

// Marketing verbs for the hero's "Help it {word}" line - each frames what
// reviews do for a local business, "grow" first to match the line's
// original static copy before this became a rotating typewriter effect.
const WORDS = ["grow", "shine", "thrive", "succeed", "reach further", "stand out"]

const TYPE_SPEED_MS = 90
const DELETE_SPEED_MS = 45
const PAUSE_AFTER_TYPE_MS = 1500
const PAUSE_AFTER_DELETE_MS = 300
// Lets the CSS entrance animation on the "Help it " prefix (HomePage.tsx's
// delay-[600ms] duration-700 fade/slide/zoom-in) land before the first word
// starts typing, so the two don't compete for attention on load.
const INITIAL_DELAY_MS = 1300

type Phase = "idle" | "typing" | "deleting"

// Cycles WORDS with a type -> pause -> delete -> next-word rhythm, looping
// forever. A plain setTimeout state machine rather than CSS keyframes - CSS
// can't express "delete however many characters this word has, then type a
// different string of a different length" without a hand-written keyframe
// set per word.
export function TypingWord() {
  const [wordIndex, setWordIndex] = useState(0)
  const [text, setText] = useState("")
  const [phase, setPhase] = useState<Phase>("idle")

  useEffect(() => {
    const word = WORDS[wordIndex]

    if (phase === "idle") {
      const timer = setTimeout(() => setPhase("typing"), INITIAL_DELAY_MS)
      return () => clearTimeout(timer)
    }

    if (phase === "typing") {
      if (text.length < word.length) {
        const timer = setTimeout(() => setText(word.slice(0, text.length + 1)), TYPE_SPEED_MS)
        return () => clearTimeout(timer)
      }
      const timer = setTimeout(() => setPhase("deleting"), PAUSE_AFTER_TYPE_MS)
      return () => clearTimeout(timer)
    }

    // deleting
    if (text.length > 0) {
      const timer = setTimeout(() => setText(text.slice(0, -1)), DELETE_SPEED_MS)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      setWordIndex((i) => (i + 1) % WORDS.length)
      setPhase("typing")
    }, PAUSE_AFTER_DELETE_MS)
    return () => clearTimeout(timer)
  }, [phase, text, wordIndex])

  return (
    <>
      {text}
      {/* Solid color, not inherited from the gradient-clipped parent - a
          transparent-clipped caret with no background-image of its own would
          just be invisible. */}
      <span aria-hidden className="ml-0.5 animate-pulse text-white">
        |
      </span>
    </>
  )
}
