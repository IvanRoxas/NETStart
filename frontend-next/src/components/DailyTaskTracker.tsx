"use client";

import { useEffect, useRef } from "react";
import { getTodayActiveDailyTaskIds } from "@/lib/dailyTasks";

interface DailyTaskTrackerProps {
  taskIds: string[];
}

export default function DailyTaskTracker({ taskIds }: DailyTaskTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current || !taskIds || taskIds.length === 0) return;

    // Only monitor daily tasks that are active for the current day
    const activeIds = getTodayActiveDailyTaskIds();
    const relevantTaskIds = taskIds.filter((id) => activeIds.includes(id));
    if (relevantTaskIds.length === 0) return;

    trackedRef.current = true;

    relevantTaskIds.forEach((taskId) => {

      fetch("/api/daily-tasks/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.success && !data.alreadyCompleted) {
              if (typeof window !== "undefined") {
                window.dispatchEvent(
                  new CustomEvent("daily_task_completed", {
                    detail: {
                      taskId,
                      title: data.task?.title || "Daily Task Completed",
                      tag: data.task?.tag || "DAILY",
                      desc: data.task?.desc || "Completed a daily mission task.",
                      xpEarned: data.xpEarned || 25,
                      gearsEarned: data.gearsEarned || 30,
                      notificationId: data.notificationId,
                    },
                  })
                );
              }
            }
          }
        })
        .catch((err) => {
          console.warn(`Failed to auto-track daily task ${taskId}:`, err);
        });
    });
  }, [taskIds]);

  return null;
}

