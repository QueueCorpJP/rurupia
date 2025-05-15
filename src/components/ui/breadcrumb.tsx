import * as React from "react"
import { Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import FragmentWrapper from "../FragmentWrapper"

import { cn } from "@/lib/utils"

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    label: string
    href: string
    current?: boolean
  }[]
  homeLink?: boolean
}

export function Breadcrumb({
  items,
  homeLink = true,
  className,
  ...props
}: BreadcrumbProps) {
  return (
    <div className={cn("mb-6 flex items-center gap-1 text-sm", className)} {...props}>
      {homeLink && (
        <span className="flex items-center">
          <Link
            to="/"
            className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </span>
      )}
      
      {items.map((item, index) => (
        <FragmentWrapper key={index} index={index}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          {item.current ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              to={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          )}
        </FragmentWrapper>
      ))}
    </div>
  )
}
