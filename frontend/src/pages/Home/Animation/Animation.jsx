import { useEffect, useRef } from "react";

export default function Animation() {
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