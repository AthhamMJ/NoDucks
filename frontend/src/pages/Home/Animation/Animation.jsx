import { useEffect, useRef } from "react";

export const Animation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const animation = window.lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/jupiternoducks.json",
    });

    return () => animation.destroy();
  }, []);

  return <div ref={containerRef} />;
}

export const Cradle = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const animation = window.lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/cradle.json",
    });

    return () => animation.destroy();
  }, []);

  return <div ref={containerRef} />;
}