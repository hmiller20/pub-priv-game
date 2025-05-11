import { Button } from "./button";
import * as React from "react";

export const SendButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", children = "Send", ...props }, ref) => (
    <Button
      ref={ref}
      className={
        "h-10 bg-white text-blue-700 font-semibold min-w-[100px] rounded-2xl border border-blue-100 shadow transition-all duration-200 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50 " +
        className
      }
      style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
      {...props}
    >
      <span className="transition-all duration-200 mx-auto">{children}</span>
    </Button>
  )
);
SendButton.displayName = "SendButton";

export const StartGameButton = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className = "", children = "Start Game", ...props }, ref) => (
    <Button
      ref={ref}
      className={
        "h-10 min-w-[120px] bg-white text-blue-700 font-semibold rounded-2xl border border-blue-100 shadow transition-all duration-200 ml-0 md:ml-2 flex items-center gap-2 group hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed " +
        className
      }
      style={{ boxShadow: "0 4px 16px 0 rgba(80, 112, 255, 0.08)" }}
      {...props}
    >
      <span className="transition-all duration-200 mx-auto">{children}</span>
    </Button>
  )
);
StartGameButton.displayName = "StartGameButton"; 