import { Box, BoxProps, Card, chakra, HStack, Text } from "@chakra-ui/react";
import {
  CalendarDaysIcon,
  ChartBarIcon,
  ChartPieIcon,
  CpuChipIcon,
  UsersIcon,
  WifiIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import { FC, PropsWithChildren, ReactElement, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import dayjs from "dayjs";
import useGetUser from "hooks/useGetUser";
import { fetch } from "service/http";
import { formatBytes, numberWithCommas } from "utils/formatByte";

// Backend `/api/system` uses a 24h online window; keep frontend scope calc aligned.
const ONLINE_WINDOW_SECONDS = 24 * 60 * 60;

const parseOnlineAtTs = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    if (value > 1e12) return Math.floor(value / 1000); // ms
    if (value > 1e9) return Math.floor(value); // sec
    return null;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const asNum = Number(raw);
  if (Number.isFinite(asNum)) {
    if (asNum > 1e12) return Math.floor(asNum / 1000);
    if (asNum > 1e9) return Math.floor(asNum);
  }
  let ms = new Date(raw).getTime();
  if (!Number.isFinite(ms)) ms = new Date(`${raw}Z`).getTime();
  if (!Number.isFinite(ms)) return null;
  return Math.floor(ms / 1000);
};

const TotalUsersIcon = chakra(UsersIcon, {
  baseStyle: {
    w: { base: 4, md: 5 },
    h: { base: 4, md: 5 },
    position: "relative",
    zIndex: "2",
    color: "#4d63ff",
    filter:
      "drop-shadow(0 0 4px rgba(77,99,255,0.72)) drop-shadow(0 0 10px rgba(59,130,246,0.36))",
  },
});

const NetworkIcon = chakra(ChartBarIcon, {
  baseStyle: {
    w: { base: 4, md: 5 },
    h: { base: 4, md: 5 },
    position: "relative",
    zIndex: "2",
    color: "#4d63ff",
    filter:
      "drop-shadow(0 0 4px rgba(77,99,255,0.72)) drop-shadow(0 0 10px rgba(59,130,246,0.36))",
  },
});

const MemoryIcon = chakra(ChartPieIcon, {
  baseStyle: {
    w: { base: 4, md: 5 },
    h: { base: 4, md: 5 },
    position: "relative",
    zIndex: "2",
    color: "#4d63ff",
    filter:
      "drop-shadow(0 0 4px rgba(77,99,255,0.72)) drop-shadow(0 0 10px rgba(59,130,246,0.36))",
  },
});
const OnlineIcon = chakra(WifiIcon, {
  baseStyle: {
    w: { base: 4, md: 5 },
    h: { base: 4, md: 5 },
    position: "relative",
    zIndex: "2",
    color: "#4d63ff",
    filter:
      "drop-shadow(0 0 4px rgba(77,99,255,0.72)) drop-shadow(0 0 10px rgba(59,130,246,0.36))",
  },
});
const TodayTrafficIcon = chakra(CalendarDaysIcon, {
  baseStyle: {
    w: { base: 4, md: 5 },
    h: { base: 4, md: 5 },
    position: "relative",
    zIndex: "2",
    color: "#4d63ff",
    filter:
      "drop-shadow(0 0 4px rgba(77,99,255,0.72)) drop-shadow(0 0 10px rgba(59,130,246,0.36))",
  },
});
const CpuIcon = chakra(CpuChipIcon, {
  baseStyle: {
    w: { base: 4, md: 5 },
    h: { base: 4, md: 5 },
    position: "relative",
    zIndex: "2",
    color: "#4d63ff",
    filter:
      "drop-shadow(0 0 4px rgba(77,99,255,0.72)) drop-shadow(0 0 10px rgba(59,130,246,0.36))",
  },
});

type StatisticCardProps = {
  title: string;
  content: ReactNode;
  icon: ReactElement;
};

const StatisticCard: FC<PropsWithChildren<StatisticCardProps>> = ({
  title,
  content,
  icon,
}) => {
  return (
    <Card
      p={{ base: 3, md: 4 }}
      borderWidth="1px"
      borderColor="light-border"
      bg="#F9FAFB"
      _dark={{
        bg: "rgba(13, 18, 36, 0.56)",
        borderColor: "rgba(148, 163, 184, 0.24)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow:
          "inset 0 1px 0 rgba(148,163,184,0.12), inset 0 -1px 0 rgba(15,23,42,0.28), 0 12px 28px rgba(0,0,0,0.3)",
      }}
      borderStyle="solid"
      boxShadow="none"
      borderRadius="12px"
      width="full"
      minH={{ base: "96px", md: "86px" }}
      alignSelf="stretch"
      display="flex"
      justifyContent="space-between"
      flexDirection="row"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      <HStack alignItems="center" columnGap={{ base: 3, md: 3 }} flex="1">
        <Box
          p={{ base: "1.5", md: "1.5" }}
          position="relative"
          color="#4d63ff"
          _before={{
            content: `""`,
            position: "absolute",
            top: 0,
            left: 0,
            bg: "rgba(77, 99, 255, 0.16)",
            display: "block",
            w: "full",
            h: "full",
            borderRadius: "5px",
            border: "1px solid rgba(96, 165, 250, 0.4)",
            opacity: ".9",
            z: "1",
          }}
          _after={{
            content: `""`,
            position: "absolute",
            top: "-5px",
            left: "-5px",
            bg: "rgba(77, 99, 255, 0.08)",
            display: "block",
            w: "calc(100% + 10px)",
            h: "calc(100% + 10px)",
            borderRadius: "8px",
            filter: "blur(1px)",
            opacity: ".8",
            z: "1",
          }}
        >
          {icon}
        </Box>
        <Text
          color="gray.600"
          _dark={{
            color: "gray.300",
          }}
          fontWeight="medium"
          textTransform="capitalize"
          fontSize={{ base: "2xs", md: "xs" }}
          textAlign="left"
        >
          {title}
        </Text>
      </HStack>
      <Box
        fontSize={{ base: "sm", md: "2xl" }}
        fontWeight="semibold"
        mt={0}
        lineHeight="1.1"
        textAlign="right"
        w="auto"
        minW={{ base: "40%", md: "34%" }}
      >
        {content}
      </Box>
    </Card>
  );
};
export const StatisticsQueryKey = "statistics-query-key";
export const Statistics: FC<BoxProps> = (props) => {
  const { userData, getUserIsSuccess } = useGetUser();
  const { version, filters } = useDashboard();
  const isSudo = getUserIsSuccess ? !!userData?.is_sudo : false;
  const selectedAdmin = isSudo ? filters?.admin : "";
  const hasSelectedAdminScope = !!selectedAdmin && selectedAdmin !== "__all__";
  const fetchScopedStats = async (query: Record<string, any>) => {
    const [allResp, activeResp, usageResp] = await Promise.all([
      fetch("/users", { query: { ...query, limit: 1 } }),
      fetch("/users", { query: { ...query, status: "active", limit: 1 } }),
      fetch("/users", { query: { ...query, limit: 5000, sort: "-created_at" } }),
    ]);

    const usage = Array.isArray(usageResp?.users)
      ? usageResp.users.reduce((sum: number, u: any) => sum + Number(u?.used_traffic || 0), 0)
      : 0;
    const usersOnline = Array.isArray(usageResp?.users)
      ? usageResp.users.filter((u: any) => {
          const status = String(u?.status || "").toLowerCase();
          if (status === "connected") return true;
          const ts = parseOnlineAtTs(u?.online_at);
          if (!ts) return false;
          const diff = Math.floor(Date.now() / 1000) - ts;
          return diff <= ONLINE_WINDOW_SECONDS;
        }).length
      : 0;

    return {
      users_active: Number(activeResp?.total || 0),
      total_user: Number(allResp?.total || 0),
      users_online: Number(usersOnline || 0),
      usage,
    };
  };
  const { data: systemData, error: systemError } = useQuery({
    queryKey: StatisticsQueryKey,
    queryFn: () => fetch("/system"),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    staleTime: 20000,
    retry: 3,
    retryDelay: 1000,
    onSuccess: ({ version: currentVersion }) => {
      if (version !== currentVersion)
        useDashboard.setState({ version: currentVersion });
    },
    onError: (error) => {
      console.error("Statistics query failed:", error);
    },
  });
  const { data: allScopeStats } = useQuery({
    queryKey: [
      "statistics-admin-scope-all",
      isSudo ? "__all__" : "__self__",
      userData?.username || "",
    ],
    enabled: !isSudo || !hasSelectedAdminScope,
    staleTime: 60000,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    keepPreviousData: false,
    queryFn: () => fetchScopedStats({}),
  });
  const { data: selectedScopeStats } = useQuery({
    queryKey: ["statistics-admin-scope-selected", selectedAdmin || "__none__", userData?.username || ""],
    enabled: isSudo && hasSelectedAdminScope,
    staleTime: 60000,
    refetchInterval: 10000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    keepPreviousData: false,
    queryFn: () => fetchScopedStats({ admin: selectedAdmin }),
  });
  const { data: adminLimits } = useQuery({
    queryKey: ["statistics-admin-limits", selectedAdmin || "__all__"],
    enabled: isSudo && hasSelectedAdminScope,
    staleTime: 60000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const list: any[] = await fetch("/admins");
      return (list || []).find((a: any) => a?.username === selectedAdmin) || null;
    },
  });
  const { data: todayUsage } = useQuery({
    queryKey: ["statistics-today-traffic", isSudo ? (selectedAdmin || "__all__") : "__self__"],
    staleTime: 60000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const start = dayjs().utc().startOf("day").format("YYYY-MM-DDTHH:00:00");
      const query: Record<string, any> = { start };
      if (isSudo && hasSelectedAdminScope) query.admin = selectedAdmin;
      const data: any = await fetch("/users/usage", { query });
      const total = Array.isArray(data?.usages)
        ? data.usages.reduce((sum: number, v: any) => sum + Number(v?.used_traffic || 0), 0)
        : 0;
      return total;
    },
  });
  const scopedStatsSource =
    isSudo && hasSelectedAdminScope ? selectedScopeStats : allScopeStats;
  const hasScoped = !!scopedStatsSource;
  const scopedData = hasScoped
    ? {
        users_active: Number(scopedStatsSource?.users_active || 0),
        total_user: Number(scopedStatsSource?.total_user || 0),
        users_online: Number(scopedStatsSource?.users_online || 0),
        data_usage: Number(scopedStatsSource?.usage || 0),
      }
    : null;

  const activeUsersValue = scopedData?.users_active ?? systemData?.users_active ?? 0;
  const totalUsersValue = scopedData?.total_user ?? systemData?.total_user ?? 0;
  const scopedOnlineValue = Number(scopedData?.users_online);
  const hasScopedOnlineValue = Number.isFinite(scopedOnlineValue) && scopedOnlineValue >= 0;
  const systemOnlineCandidates = [
    Number(systemData?.users_online),
    Number(systemData?.online_users),
    Number(systemData?.users_connected),
  ].filter((v) => Number.isFinite(v) && v >= 0);
  const systemOnlineValue = systemOnlineCandidates.length ? Math.max(...systemOnlineCandidates) : null;
  const onlineUsersValue = !isSudo
    ? hasScopedOnlineValue
      ? scopedOnlineValue
      : 0
    : hasSelectedAdminScope
    ? hasScopedOnlineValue
      ? scopedOnlineValue
      : 0
    : systemOnlineValue ?? (hasScopedOnlineValue ? scopedOnlineValue : 0);
  const scopedUsageValue = Number(scopedData?.data_usage ?? 0);
  const scopedLimitValue = Number(adminLimits?.traffic_limit ?? 0);
  const selfUsageValue = Number(scopedData?.data_usage ?? (userData as any)?.users_usage ?? 0);
  const selfLimitValue = Number((userData as any)?.traffic_limit ?? 0);
  const systemUsageValue =
    Number(systemData?.incoming_bandwidth || 0) +
    Number(systemData?.outgoing_bandwidth || 0);
  const dataUsageValue =
    !isSudo
      ? selfUsageValue
      : hasSelectedAdminScope
      ? scopedUsageValue
      : systemUsageValue;
  const trafficLimitValue = !isSudo ? selfLimitValue : hasSelectedAdminScope ? scopedLimitValue : 0;
  const todayUsageValue = Number(todayUsage || 0);
  const { t } = useTranslation();
  return (
    <Box
      display="grid"
      gridTemplateColumns={{ base: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" }}
      gap={{ base: 2, md: 4 }}
      w="full"
      sx={{ direction: "ltr" }}
      {...props}
    >
      <Box order={{ base: 1, lg: 1 }}>
        <StatisticCard
          title={t("activeUsers")}
          content={
            (systemData || scopedData) && (
              <HStack alignItems="flex-end" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Text>{numberWithCommas(activeUsersValue)}</Text>
                <Text
                  fontWeight="normal"
                  fontSize={{ base: "xs", md: "lg" }}
                  as="span"
                  display="inline-block"
                  pb={{ base: "2px", md: "5px" }}
                >
                  / {numberWithCommas(totalUsersValue)}
                </Text>
              </HStack>
            )
          }
          icon={<TotalUsersIcon />}
        />
      </Box>
      <Box order={{ base: 2, lg: 4 }}>
        <StatisticCard
          title={t("onlineNow")}
          content={(systemData || scopedData) && numberWithCommas(onlineUsersValue)}
          icon={<OnlineIcon />}
        />
      </Box>
      <Box order={{ base: 3, lg: 2 }}>
        <StatisticCard
          title={t("dataUsage")}
          content={
            (systemData || scopedData) &&
            (trafficLimitValue > 0 ? (
              <HStack alignItems="flex-end" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Text>{formatBytes(dataUsageValue)}</Text>
                <Text fontWeight="normal" fontSize={{ base: "xs", md: "lg" }} as="span" display="inline-block" pb={{ base: "2px", md: "5px" }}>
                  / {formatBytes(trafficLimitValue)}
                </Text>
              </HStack>
            ) : (
              formatBytes(dataUsageValue)
            ))
          }
          icon={<NetworkIcon />}
        />
      </Box>
      <Box order={{ base: 4, lg: 5 }}>
        <StatisticCard
          title={t("todayUsage")}
          content={(systemData || todayUsage) && formatBytes(todayUsageValue)}
          icon={<TodayTrafficIcon />}
        />
      </Box>
      <Box order={{ base: 5, lg: 3 }}>
        <StatisticCard
          title={t("memoryUsage")}
          content={
            systemData && (
              <HStack alignItems="flex-end" spacing={1} flexWrap="wrap" justifyContent="flex-end">
                <Text>{formatBytes(systemData.mem_used, 1, true)[0]}</Text>
                <Text
                  fontWeight="normal"
                  fontSize={{ base: "xs", md: "lg" }}
                  as="span"
                  display="inline-block"
                  pb={{ base: "2px", md: "5px" }}
                >
                  {formatBytes(systemData.mem_used, 1, true)[1]} /{" "}
                  {formatBytes(systemData.mem_total, 1)}
                </Text>
              </HStack>
            )
          }
          icon={<MemoryIcon />}
        />
      </Box>
      <Box order={{ base: 6, lg: 6 }}>
        <StatisticCard
          title={t("cpuUsage")}
          content={systemData ? `${Math.round(Number(systemData.cpu_usage || 0))}%` : "-"}
          icon={<CpuIcon />}
        />
      </Box>
    </Box>
  );
};
