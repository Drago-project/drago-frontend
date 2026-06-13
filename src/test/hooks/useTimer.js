import { useEffect, useRef, useState } from "react";

export function useTimer() {
  const [timerStart, setTimerStart] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (timerStart) {
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - timerStart);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerStart]);

  function start() {
    setTimerStart(Date.now());
  }

  function stop() {
    setTimerStart(null);
  }

  function reset() {
    setTimerStart(null);
    setElapsed(0);
  }

  return {
    elapsed,
    started: !!timerStart,
    start,
    stop,
    reset,
  };
}
