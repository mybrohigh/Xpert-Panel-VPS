import {
  Box,
  Button,
  chakra,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import {
  AdjustmentsHorizontalIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  ChartPieIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  DocumentMinusIcon,
  LinkIcon,
  MoonIcon,
  SquaresPlusIcon,
  SunIcon,
  LockClosedIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { DONATION_URL, REPO_URL } from "constants/Project";
import { useDashboard } from "contexts/DashboardContext";
import differenceInDays from "date-fns/differenceInDays";
import isValid from "date-fns/isValid";
import { FC, ReactNode, useEffect, useState } from "react";
import GitHubButton from "react-github-btn";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { updateThemeColor } from "utils/themeColor";
import { Language } from "./Language";
import useGetUser from "hooks/useGetUser";
import { useFeatures } from "hooks/useFeatures";

type HeaderProps = {
  actions?: ReactNode;
};
const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};
const neonHostIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#67e8f9",
    filter: "drop-shadow(0 0 2px rgba(103,232,249,0.85))",
  },
};
const neonNodesIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#a78bfa",
    filter: "drop-shadow(0 0 2px rgba(167,139,250,0.85))",
  },
};
const neonNodesUsageIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#f472b6",
    filter: "drop-shadow(0 0 2px rgba(244,114,182,0.85))",
  },
};
const neonResetIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#fb7185",
    filter: "drop-shadow(0 0 2px rgba(251,113,133,0.85))",
  },
};
const neonAdminLimitsIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#facc15",
    filter: "drop-shadow(0 0 2px rgba(250,204,21,0.85))",
  },
};
const neonAdminManagerIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#34d399",
    filter: "drop-shadow(0 0 2px rgba(52,211,153,0.85))",
  },
};
const neonCryptoIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#22d3ee",
    filter: "drop-shadow(0 0 2px rgba(34,211,238,0.85))",
  },
};
const neonDonationIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#f59e0b",
    filter: "drop-shadow(0 0 2px rgba(245,158,11,0.85))",
  },
};
const neonLogoutIconProps = {
  baseStyle: {
    w: 4,
    h: 4,
    color: "#60a5fa",
    filter: "drop-shadow(0 0 2px rgba(96,165,250,0.85))",
  },
};

const DarkIcon = chakra(MoonIcon, iconProps);
const LightIcon = chakra(SunIcon, iconProps);
const CoreSettingsIcon = chakra(Cog6ToothIcon, iconProps);
const CryptoLinkIcon = chakra(LockClosedIcon, neonCryptoIconProps);
const SettingsIcon = chakra(Bars3Icon, iconProps);
const LogoutIcon = chakra(ArrowLeftOnRectangleIcon, neonLogoutIconProps);
const DonationIcon = chakra(CurrencyDollarIcon, neonDonationIconProps);
const HostsIcon = chakra(LinkIcon, neonHostIconProps);
const NodesIcon = chakra(SquaresPlusIcon, neonNodesIconProps);
const NodesUsageIcon = chakra(ChartPieIcon, neonNodesUsageIconProps);
const ResetUsageIcon = chakra(DocumentMinusIcon, neonResetIconProps);
const AdminLimitsIcon = chakra(AdjustmentsHorizontalIcon, neonAdminLimitsIconProps);
const AdminManagerIcon = chakra(ClipboardDocumentListIcon, neonAdminManagerIconProps);
const NotificationCircle = chakra(Box, {
  baseStyle: {
    bg: "yellow.500",
    w: "2",
    h: "2",
    rounded: "full",
    position: "absolute",
  },
});

const NOTIFICATION_KEY = "xpert-menu-notification";
const SIDE_MENU_WIDTH = "240px";
const SIDE_MENU_TOP = "82px";
const SIDE_MENU_RIGHT = "10px";
const SIDE_MENU_BUTTON_HEIGHT = "46px";
const SIDE_MENU_CONTENT_GAP = "16px";

export const shouldShowDonation = (): boolean => {
  const date = localStorage.getItem(NOTIFICATION_KEY);
  if (!date) return true;
  try {
    if (date && isValid(parseInt(date))) {
      if (differenceInDays(new Date(), new Date(parseInt(date))) >= 7)
        return true;
      return false;
    }
    return true;
  } catch (err) {
    return true;
  }
};

export const Header: FC<HeaderProps> = ({ actions }) => {
  const { userData, getUserIsSuccess, getUserIsPending } = useGetUser();

  const isSudo = () => {
    if (!getUserIsPending && getUserIsSuccess) {
      return userData.is_sudo;
    }
    return false;
  };

  const {
    onEditingHosts,
    onResetAllUsage,
    onEditingNodes,
    onShowingNodesUsage,
    onEditingAdminLimits,
    onEditingCrypto,
  } = useDashboard();
  const { t } = useTranslation();
  const { hasFeature } = useFeatures();
  const { colorMode, toggleColorMode } = useColorMode();
  const [showDonationNotif, setShowDonationNotif] = useState(
    shouldShowDonation()
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const gBtnColor = colorMode === "dark" ? "dark_dimmed" : colorMode;

  const handleOnClose = () => {
    localStorage.setItem(NOTIFICATION_KEY, new Date().getTime().toString());
    setShowDonationNotif(false);
  };

  const closeSideMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    const body = document.body;
    const desktop = window.matchMedia("(min-width: 48em)").matches;
    if (desktop && isMenuOpen) {
      body.classList.add("xpert-side-open");
      body.style.setProperty("--xpert-side-menu-width", SIDE_MENU_WIDTH);
      body.style.setProperty("--xpert-side-menu-right", SIDE_MENU_RIGHT);
      body.style.setProperty("--xpert-side-menu-content-gap", SIDE_MENU_CONTENT_GAP);
    } else {
      body.classList.remove("xpert-side-open");
      body.style.removeProperty("--xpert-side-menu-width");
      body.style.removeProperty("--xpert-side-menu-right");
      body.style.removeProperty("--xpert-side-menu-content-gap");
    }
    return () => {
      body.classList.remove("xpert-side-open");
      body.style.removeProperty("--xpert-side-menu-width");
      body.style.removeProperty("--xpert-side-menu-right");
      body.style.removeProperty("--xpert-side-menu-content-gap");
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 48em)").matches;
    if (!desktop) return;
    if (isMenuOpen) {
      setIsControlsVisible(true);
      return;
    }
    let lastY = window.scrollY || 0;
    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = y - lastY;
      if (y < 24 || delta < -6) setIsControlsVisible(true);
      else if (y > 80 && delta > 8) setIsControlsVisible(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isMenuOpen]);

  return (
    <HStack
      gap={2}
      justifyContent="space-between"
      position="relative"
    >
      <HStack>
        <Link to="/">
          <Text
            as="h1"
            fontWeight="semibold"
            fontSize={{ base: "xl", md: "2xl" }}
            cursor="pointer"
            _hover={{ color: "primary.500" }}
          >
            Xpert
          </Text>
        </Link>
        {isSudo() && hasFeature("xpanel") && (
          <>
            <Text fontSize={{ base: "xl", md: "2xl" }} color="gray.400">
              |
            </Text>
            <Link to="/xpert/">
              <Text
                as="h1"
                fontWeight="semibold"
                fontSize={{ base: "xl", md: "2xl" }}
                cursor="pointer"
                _hover={{ color: "primary.500" }}
              >
                Xpanel
              </Text>
            </Link>
          </>
        )}
      </HStack>
      <Box
        overflow="visible"
        css={{ direction: "rtl" }}
        position={{ base: "static", md: "fixed" }}
        top={{ base: "auto", md: "16px" }}
        right={{ base: "auto", md: "24px" }}
        zIndex={{ base: "auto", md: 1300 }}
        opacity={{ base: 1, md: isControlsVisible ? 1 : 0 }}
        transform={{ base: "none", md: isControlsVisible ? "none" : "translateY(-12px)" }}
        pointerEvents={{ base: "auto", md: isControlsVisible ? "auto" : "none" }}
        transition="opacity .2s ease, transform .2s ease"
      >
        <HStack alignItems="center">
          <Menu placement="bottom-end">
            <Box position="relative" display={{ base: "inline-flex", md: "none" }}>
              <MenuButton
                as={IconButton}
                size="sm"
                variant="outline"
                icon={<SettingsIcon />}
                position="relative"
                display={{ base: "inline-flex", md: "none" }}
              />
              {showDonationNotif && <NotificationCircle top="1" right="1" zIndex={2} />}
            </Box>
            <MenuList minW="170px" zIndex={99999} sx={{ direction: "ltr" }}>
              {isSudo() && (
                <>
                  <MenuItem maxW="170px" fontSize="sm" icon={<HostsIcon />} onClick={onEditingHosts.bind(null, true)}>
                    {t("header.hostSettings")}
                  </MenuItem>
                  <MenuItem maxW="170px" fontSize="sm" icon={<NodesIcon />} onClick={onEditingNodes.bind(null, true)}>
                    {t("header.nodeSettings")}
                  </MenuItem>
                  <MenuItem maxW="170px" fontSize="sm" icon={<NodesUsageIcon />} onClick={onShowingNodesUsage.bind(null, true)}>
                    {t("header.nodesUsage")}
                  </MenuItem>
                  <MenuItem maxW="170px" fontSize="sm" icon={<ResetUsageIcon />} onClick={onResetAllUsage.bind(null, true)}>
                    {t("resetAllUsage")}
                  </MenuItem>
                  {hasFeature("admin_limits") && (
                    <MenuItem maxW="170px" fontSize="sm" icon={<AdminLimitsIcon />} onClick={onEditingAdminLimits.bind(null, true)}>
                      {t("adminLimits.menu")}
                    </MenuItem>
                  )}
                  {hasFeature("admin_manager") && (
                    <Link to="/admin-manager/">
                      <MenuItem maxW="170px" fontSize="sm" icon={<AdminManagerIcon />} onClick={handleOnClose}>
                        {t("adminManager.menu")}
                      </MenuItem>
                    </Link>
                  )}
                </>
              )}
              {hasFeature("happ_crypto") && (
                <MenuItem maxW="170px" fontSize="sm" icon={<CryptoLinkIcon />} onClick={onEditingCrypto.bind(null, true)}>
                  {t("cryptoLink.menu")}
                </MenuItem>
              )}
              <Link to={DONATION_URL} target="_blank">
                <MenuItem maxW="170px" fontSize="sm" icon={<DonationIcon />} position="relative" onClick={handleOnClose}>
                  {t("header.donation")}
                  {showDonationNotif && <NotificationCircle top="3" right="2" />}
                </MenuItem>
              </Link>
              <Link to="/login">
                <MenuItem maxW="170px" fontSize="sm" icon={<LogoutIcon />}>
                  {t("header.logout")}
                </MenuItem>
              </Link>
            </MenuList>
          </Menu>

          <Box position="relative" display={{ base: "none", md: "inline-flex" }}>
            <IconButton
              size="sm"
              variant="outline"
              icon={<SettingsIcon />}
              position="relative"
              aria-label="open side menu"
              display={{ base: "none", md: "inline-flex" }}
              onClick={() => setIsMenuOpen((v) => !v)}
            />
            {showDonationNotif && <NotificationCircle top="1" right="1" zIndex={2} />}
          </Box>
          <Box
            display={{ base: "none", md: isMenuOpen ? "flex" : "none" }}
            position="fixed"
            top={SIDE_MENU_TOP}
            right={SIDE_MENU_RIGHT}
            h="auto"
            maxH={`calc(100vh - ${SIDE_MENU_TOP})`}
            w={SIDE_MENU_WIDTH}
            zIndex={1200}
            flexDirection="column"
            p={0}
            overflowY="auto"
            overflowX="hidden"
            _dark={{
              bg: "transparent",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
            }}
          >
            <Box
              display="grid"
              gridTemplateColumns="1fr"
              gap={2}
              w="full"
              sx={{ direction: "ltr" }}
            >
              {isSudo() && (
                <>
                  <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} w="full" px={4} textAlign="left" justifyContent="flex-start" leftIcon={<HostsIcon />} onClick={() => { onEditingHosts(true); closeSideMenu(); }}>
                    {t("header.hostSettings")}
                  </Button>
                  <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} w="full" px={4} textAlign="left" justifyContent="flex-start" leftIcon={<NodesIcon />} onClick={() => { onEditingNodes(true); closeSideMenu(); }}>
                    {t("header.nodeSettings")}
                  </Button>
                  <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} w="full" px={4} textAlign="left" justifyContent="flex-start" leftIcon={<NodesUsageIcon />} onClick={() => { onShowingNodesUsage(true); closeSideMenu(); }}>
                    {t("header.nodesUsage")}
                  </Button>
                  <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} w="full" px={4} textAlign="left" justifyContent="flex-start" leftIcon={<ResetUsageIcon />} onClick={() => { onResetAllUsage(true); closeSideMenu(); }}>
                    {t("resetAllUsage")}
                  </Button>
                  {hasFeature("admin_limits") && (
                    <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} w="full" px={4} textAlign="left" justifyContent="flex-start" leftIcon={<AdminLimitsIcon />} onClick={() => { onEditingAdminLimits(true); closeSideMenu(); }}>
                      {t("adminLimits.menu")}
                    </Button>
                  )}
                  {hasFeature("admin_manager") && (
                    <Link to="/admin-manager/" onClick={closeSideMenu} style={{ display: "block", width: "100%" }}>
                      <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} px={4} w="full" textAlign="left" justifyContent="flex-start" leftIcon={<AdminManagerIcon />}>
                        {t("adminManager.menu")}
                      </Button>
                    </Link>
                  )}
                </>
              )}
              {hasFeature("happ_crypto") && (
                <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} w="full" px={4} textAlign="left" justifyContent="flex-start" leftIcon={<CryptoLinkIcon />} onClick={() => { onEditingCrypto(true); closeSideMenu(); }}>
                  {t("cryptoLink.menu")}
                </Button>
              )}
              <Link to={DONATION_URL} target="_blank" onClick={() => { handleOnClose(); closeSideMenu(); }} style={{ display: "block", width: "100%" }}>
                <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} px={4} w="full" textAlign="left" justifyContent="flex-start" leftIcon={<DonationIcon />} position="relative">
                  {t("header.donation")}
                  {showDonationNotif && <NotificationCircle top="2" right="2" />}
                </Button>
              </Link>
              <Link to="/login" onClick={closeSideMenu} style={{ display: "block", width: "100%" }}>
                <Button size="sm" h={SIDE_MENU_BUTTON_HEIGHT} px={4} w="full" textAlign="left" justifyContent="flex-start" leftIcon={<LogoutIcon />}>
                  {t("header.logout")}
                </Button>
              </Link>
            </Box>
          </Box>

          {isSudo() && (
            <IconButton
              size="sm"
              variant="outline"
              aria-label="core settings"
              onClick={() => {
                useDashboard.setState({ isEditingCore: true });
              }}
            >
              <CoreSettingsIcon />
            </IconButton>
          )}

          <Language />

          <IconButton
            size="sm"
            variant="outline"
            aria-label="switch theme"
            onClick={() => {
              updateThemeColor(colorMode == "dark" ? "light" : "dark");
              toggleColorMode();
            }}
          >
            {colorMode === "light" ? <DarkIcon /> : <LightIcon />}
          </IconButton>

          <Box
            css={{ direction: "ltr" }}
            display="flex"
            alignItems="center"
            pr="2"
            __css={{
              "&  span": {
                display: "inline-flex",
              },
            }}
          >
            {/* Temporarily disabled GitHubButton due to private repo
            <GitHubButton
              href={REPO_URL}
              data-color-scheme={`no-preference: ${gBtnColor}; light: ${gBtnColor}; dark: ${gBtnColor};`}
              data-size="large"
              data-show-count="true"
              aria-label="Star Xpert on GitHub"
            >
              Star
            </GitHubButton>
            */}
          </Box>
        </HStack>
      </Box>
    </HStack>
  );
};
