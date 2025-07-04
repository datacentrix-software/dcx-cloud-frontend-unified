"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page which now serves as the landing page
    router.push('/auth/login');
  }, [router]);

  return null;
}
