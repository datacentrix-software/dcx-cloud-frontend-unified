"use client";
import Typography from "@mui/material/Typography";
import PageContainer from "@/app/components/container/PageContainer";
import DashboardCard from "@/app/components/shared/DashboardCard";

export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard" description="this is Dashboard page">
      <DashboardCard title="Dashboard">
        <Typography>This is dashboard page</Typography>
      </DashboardCard>
    </PageContainer>
  );
}
