
import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <div className="relative group">
    {/* Animated border background */}
    <div className={cn(
      "absolute inset-0 rounded-sm opacity-0 transition-opacity duration-300",
      "bg-gradient-to-r from-purple-400 via-pink-400 to-red-400",
      "bg-[length:300%_300%] animate-[gradient-shift_4s_ease-in-out_infinite]",
      "group-hover:opacity-100",
      "group-data-[state=active]:opacity-100"
    )} />
    
    {/* Inner background with thin border effect */}
    <div className={cn(
      "absolute inset-[1px] rounded-sm bg-background transition-all duration-300"
    )} />
    
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(
        "relative z-10 inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        "hover:scale-105 hover:shadow-md active:scale-95",
        "data-[state=active]:scale-105 data-[state=active]:shadow-lg",
        className
      )}
      {...props}
    />
  </div>
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
