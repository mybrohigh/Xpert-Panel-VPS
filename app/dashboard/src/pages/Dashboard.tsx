import { Box, VStack } from "@chakra-ui/react";
import { AdminLimitsModal } from "components/AdminLimitsModal";
import { CoreSettingsModal } from "components/CoreSettingsModal";
import { CryptoLinkModal } from "components/CryptoLinkModal";
import { DeleteUserModal } from "components/DeleteUserModal";
import { Filters } from "components/Filters";
import { Footer } from "components/Footer";
import { Header } from "components/Header";
import { HostsDialog } from "components/HostsDialog";
import { NodesDialog } from "components/NodesModal";
import { NodesUsage } from "components/NodesUsage";
import { QRCodeDialog } from "components/QRCodeDialog";
import { ResetAllUsageModal } from "components/ResetAllUsageModal";
import { ResetUserUsageModal } from "components/ResetUserUsageModal";
import { RevokeSubscriptionModal } from "components/RevokeSubscriptionModal";
import { UserDialog } from "components/UserDialog";
import { UsersTable } from "components/UsersTable";
import { fetchInbounds, useDashboard } from "contexts/DashboardContext";
import { FC, useEffect } from "react";
import { Statistics } from "../components/Statistics";

export const Dashboard: FC = () => {
  useEffect(() => {
    // Добавляем небольшую задержку чтобы убедиться что все компоненты готовы
    const timer = setTimeout(() => {
      try {
        console.log("Dashboard: Starting initialization...");
        useDashboard.getState().refetchUsers();
        fetchInbounds();
      } catch (error) {
        console.error("Dashboard initialization failed:", error);
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, []);
  return (
    <VStack className="xpert-page-shift" justifyContent="space-between" minH="100vh" p="6" rowGap={4} w="full" minW={0}>
      <Box w="full">
        <Header />
        <Statistics mt="4" />
        <Filters />
        <UsersTable />
        <UserDialog />
        <DeleteUserModal />
        <QRCodeDialog />
        <HostsDialog />
        <ResetUserUsageModal />
        <RevokeSubscriptionModal />
        <NodesDialog />
        <NodesUsage />
        <ResetAllUsageModal />
        <AdminLimitsModal />
        <CoreSettingsModal />
        <CryptoLinkModal />
      </Box>
      <Footer />
    </VStack>
  );
};

export default Dashboard;
