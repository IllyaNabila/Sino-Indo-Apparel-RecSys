import { useEffect, useState } from "react";

function TimeDisplay() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const now = new Date().toLocaleTimeString();
    setTime(now);
  }, []);

  return <p className="text-xs text-slate-500 mt-2">{time}</p>;
}
