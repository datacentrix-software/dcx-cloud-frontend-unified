"use client";
import Typography from "@mui/material/Typography";
import PageContainer from "@/app/components/container/PageContainer";
import DashboardCard from "@/app/components/shared/DashboardCard";

export default function LaunchServerPage() {
  return (
    <PageContainer title="Launch Server" description="this is Launch Server page">
      <DashboardCard title="Launch Server">
        <Typography>This is launch server page</Typography>
      </DashboardCard>
    </PageContainer>
  );
}
