"use client";
import Typography from "@mui/material/Typography";
import PageContainer from "@/app/components/container/PageContainer";
import DashboardCard from "@/app/components/shared/DashboardCard";

export default function PaymentsPage() {
  return (
    <PageContainer title="Payments" description="this is Payments page">
      <DashboardCard title="Payments">
        <Typography>This is payments page</Typography>
      </DashboardCard>
    </PageContainer>
  );
}
