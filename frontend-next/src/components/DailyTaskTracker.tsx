"use client";

import { useEffect, useRef } from "react";

interface DailyTaskTrackerProps {
  taskIds: string[];
}

export default function DailyTaskTracker({ taskIds }: DailyTaskTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || !taskIds || taskIds.length === 0) return;
    trackedRef.current = true;

    taskIds.forEach((taskId) => {
      fetch("/api/daily-tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      }).catch((err) => {
        console.warn(`Failed to auto-track daily task ${taskId}:`, err);
      });
    });
  }, [taskIds]);

  return null;
}
