import { useEffect, useState } from "react"
import { ChevronRight, Star } from "lucide-react"
import { TESTIMONIALS } from "@/lib/testimonials"

const ADVANCE_INTERVAL_MS = 5000
const FADE_MS = 300

export function TestimonialCarousel() {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  const advance = () => {
    setVisible(false)
    setTimeout(() => {
      setIndex((i) => (i + 1) % TESTIMONIALS.length)
      setVisible(true)
    }, FADE_MS)
  }

  useEffect(() => {
    const timer = setInterval(advance, ADVANCE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [index])

  const handleNext = () => {
    advance()
  }

  const testimonial = TESTIMONIALS[index]

  return (
    <div className="relative flex min-h-[136px] max-w-sm flex-col justify-between rounded-2xl bg-white/10 p-5 backdrop-blur">
      <div>
        <div className="mb-3 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-accent text-accent" />
          ))}
        </div>
        <div className="transition-opacity duration-300" style={{ opacity: visible ? 1 : 0 }}>
          <p className="text-sm text-slate-200 italic">&ldquo;{testimonial.text}&rdquo;</p>
          <div className="mt-3 flex items-center gap-3">
            <img
              src={testimonial.avatar}
              alt=""
              className="h-8 w-8 rounded-full border border-white/20 object-cover"
            />
            <p className="text-xs text-slate-400">— {testimonial.author}</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/30"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next review"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
