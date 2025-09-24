"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

const colorSchemes = {
  dark: {
    gradientBackgroundStart: "rgb(13, 32, 66)", // Deep navy blue
    gradientBackgroundEnd: "rgb(5, 15, 35)", // Even deeper navy
    firstColor: "255, 165, 0", // Bright orange flame
    secondColor: "0, 191, 255", // Bright cyan lotus
    thirdColor: "64, 224, 255", // Light blue highlights
    fourthColor: "255, 140, 0", // Orange-yellow flame
    fifthColor: "20, 184, 166", // Teal lotus center
    pointerColor: "255, 100, 50", // Warm orange interaction
    blendingValue: "hard-light",
    textColor: "text-white",
    titleGradient: "from-orange-400 via-cyan-400 to-blue-400",
  },
  light: {
    gradientBackgroundStart: "rgb(245, 248, 255)", // Very light blue-white
    gradientBackgroundEnd: "rgb(230, 240, 255)", // Soft blue-white
    firstColor: "255, 140, 0", // Softer orange flame
    secondColor: "30, 144, 255", // Deeper blue lotus
    thirdColor: "135, 206, 250", // Sky blue highlights
    fourthColor: "255, 165, 50", // Warm orange-yellow
    fifthColor: "72, 187, 200", // Muted teal
    pointerColor: "255, 120, 80", // Soft orange interaction
    blendingValue: "multiply",
    textColor: "text-slate-800",
    titleGradient: "from-orange-600 via-blue-600 to-teal-600",
  },
};

export const BackgroundGradientAnimation = ({
  //   gradientBackgroundStart = "rgb(108, 0, 162)",
  //   gradientBackgroundEnd = "rgb(0, 17, 82)",
  //   firstColor = "18, 113, 255",
  //   secondColor = "221, 74, 255",
  //   thirdColor = "100, 220, 255",
  //   fourthColor = "200, 50, 50",
  //   fifthColor = "180, 180, 50",
  //   pointerColor = "140, 100, 255",
  //   gradientBackgroundStart = "rgb(13, 32, 66)", // Deep navy blue from logo background
  //   gradientBackgroundEnd = "rgb(5, 15, 35)", // Even deeper navy
  //   firstColor = "255, 165, 0", // Bright orange from the flame
  //   secondColor = "0, 191, 255", // Bright cyan from lotus petals
  //   thirdColor = "64, 224, 255", // Light blue from lotus highlights
  //   fourthColor = "255, 140, 0", // Orange-yellow flame gradient
  //   fifthColor = "20, 184, 166", // Teal from lotus center
  //   pointerColor = "255, 100, 50", // Warm orange for interaction
  size = "80%",
  blendingValue = "hard-light",
  children,
  className,
  interactive = true,
  containerClassName,
  ...colors
}: {
  gradientBackgroundStart?: string;
  gradientBackgroundEnd?: string;
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  pointerColor?: string;
  size?: string;
  blendingValue?: string;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  containerClassName?: string;
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();

  const colorScheme = useMemo(
    () => colorSchemes[(resolvedTheme as "light" | "dark" | undefined) || "dark"],
    [resolvedTheme]
  );
  const {
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
  } = { ...colorScheme, ...colors };

  const [curX, setCurX] = useState(0);
  const [curY, setCurY] = useState(0);
  const [tgX, setTgX] = useState(0);
  const [tgY, setTgY] = useState(0);
  useEffect(() => {
    document.body.style.setProperty("--gradient-background-start", gradientBackgroundStart);
    document.body.style.setProperty("--gradient-background-end", gradientBackgroundEnd);
    document.body.style.setProperty("--first-color", firstColor);
    document.body.style.setProperty("--second-color", secondColor);
    document.body.style.setProperty("--third-color", thirdColor);
    document.body.style.setProperty("--fourth-color", fourthColor);
    document.body.style.setProperty("--fifth-color", fifthColor);
    document.body.style.setProperty("--pointer-color", pointerColor);
    document.body.style.setProperty("--size", size);
    document.body.style.setProperty("--blending-value", blendingValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedTheme]);

  useEffect(() => {
    function move() {
      if (!interactiveRef.current) {
        return;
      }
      setCurX(curX + (tgX - curX) / 20);
      setCurY(curY + (tgY - curY) / 20);
      interactiveRef.current.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    }

    move();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tgX, tgY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (interactiveRef.current) {
      const rect = interactiveRef.current.getBoundingClientRect();
      setTgX(event.clientX - rect.left);
      setTgY(event.clientY - rect.top);
    }
  };

  const [isSafari, setIsSafari] = useState(false);
  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  return (
    <div
      className={cn(
        "h-screen w-screen  fixed inset-0 overflow-hidden  bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))]",
        containerClassName
      )}
    >
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={cn("", className)}>{children}</div>
      <div
        className={cn(
          "gradients-container h-full w-full blur-lg",
          isSafari ? "blur-2xl" : "[filter:url(#blurMe)_blur(40px)]"
        )}
      >
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-400px)]`,
            `animate-second`,
            `opacity-100`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+400px)]`,
            `animate-third`,
            `opacity-100`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-200px)]`,
            `animate-fourth`,
            `opacity-70`
          )}
        ></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-800px)_calc(50%+800px)]`,
            `animate-fifth`,
            `opacity-100`
          )}
        ></div>

        {interactive && (
          <div
            ref={interactiveRef}
            onMouseMove={handleMouseMove}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70`
            )}
          ></div>
        )}
      </div>
    </div>
  );
};
