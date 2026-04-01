"use client";

import { useAutoRefresh } from "@/app/hooks/useAutoRefresh";



export default function RefreshHandler() {
  // Call your hook here
  useAutoRefresh(30000); 
  return null;
}