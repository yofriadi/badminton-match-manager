"use client"

import * as React from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"

type CarouselApi = {
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: () => boolean
  canScrollNext: () => boolean
  scrollTo: (index: number) => void
}

type CarouselProps = {
  opts?: {
    align?: "start" | "center" | "end"
    loop?: boolean
  }
  plugins?: any
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  slideClassName?: string
}

type CarouselContextProps = {
  carouselRef: React.RefObject<HTMLDivElement | null>
  orientation: "horizontal" | "vertical"
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
  opts?: CarouselProps["opts"]
  slideClassName?: string
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  slideClassName,
  children,
  ...props
}: React.ComponentProps<"div"> & CarouselProps) {
  const carouselRef = React.useRef<HTMLDivElement>(null)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(true)

  const scrollPrev = React.useCallback(() => {
    if (carouselRef.current) {
      const container = carouselRef.current
      const itemWidth = container.children[0]?.clientWidth || 0
      container.scrollBy({ left: -itemWidth, behavior: "smooth" })
    }
  }, [])

  const scrollNext = React.useCallback(() => {
    if (carouselRef.current) {
      const container = carouselRef.current
      const itemWidth = container.children[0]?.clientWidth || 0
      container.scrollBy({ left: itemWidth, behavior: "smooth" })
    }
  }, [])

  const scrollTo = React.useCallback((index: number) => {
    if (carouselRef.current) {
      const container = carouselRef.current
      const item = container.children[index] as HTMLElement
      if (item) {
        container.scrollTo({ left: item.offsetLeft, behavior: "smooth" })
      }
    }
  }, [])

  const handleScroll = React.useCallback(() => {
    if (!carouselRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current
    setCanScrollPrev(scrollLeft > 0)
    // Allow a small buffer for float precision
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 1)
  }, [])

  React.useEffect(() => {
    const container = carouselRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
      handleScroll() // Check initial state
      return () => container.removeEventListener("scroll", handleScroll)
    }
  }, [handleScroll])

  React.useEffect(() => {
    if (setApi) {
      setApi({
        scrollPrev,
        scrollNext,
        canScrollPrev: () => canScrollPrev,
        canScrollNext: () => canScrollNext,
        scrollTo,
      })
    }
  }, [setApi, scrollPrev, scrollNext, canScrollPrev, canScrollNext, scrollTo])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        orientation: orientation || "horizontal",
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        opts,
        slideClassName,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className={cn(
        "flex gap-4",
        orientation === "horizontal"
          ? "overflow-x-auto touch-pan-y"
          : "overflow-y-auto flex-col touch-pan-x",
        "snap-mandatory",
        orientation === "horizontal" ? "snap-x" : "snap-y",
        "scrollbar-hide",
        className
      )}
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
      data-slot="carousel-content"
      {...props}
    />
  )
}

function CarouselItem({ className, ...props }: React.ComponentProps<"div">) {
  const { slideClassName } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        "snap-start",
        slideClassName,
        className
      )}
      {...props}
    />
  )
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -left-12 -translate-y-1/2"
          : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: React.ComponentProps<typeof Button>) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute size-8 rounded-full",
        orientation === "horizontal"
          ? "top-1/2 -right-12 -translate-y-1/2"
          : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
