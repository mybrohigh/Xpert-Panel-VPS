import {
  Box,
  BoxProps,
  Button,
  chakra,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useDashboard } from "contexts/DashboardContext";
import debounce from "lodash.debounce";
import React, { FC, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetch } from "service/http";

const iconProps = {
  baseStyle: {
    w: 4,
    h: 4,
  },
};

const SearchIcon = chakra(MagnifyingGlassIcon, iconProps);
const ClearIcon = chakra(XMarkIcon, iconProps);
export const ReloadIcon = chakra(ArrowPathIcon, iconProps);

type AdminItem = {
  username: string;
  is_sudo: boolean;
};

export type FilterProps = {} & BoxProps;
const setSearchField = debounce((search: string) => {
  useDashboard.getState().onFilterChange({
    ...useDashboard.getState().filters,
    offset: 0,
    search,
  });
}, 300);

export const Filters: FC<FilterProps> = ({ ...props }) => {
  const { loading, filters, onFilterChange, refetchUsers, onCreateUser } =
    useDashboard();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [me, setMe] = useState<AdminItem | null>(null);
  const [isScrollBlurActive, setIsScrollBlurActive] = useState(false);

  useEffect(() => {
    const updateBlurState = () => {
      setIsScrollBlurActive(window.scrollY > 0);
    };

    updateBlurState();
    window.addEventListener("scroll", updateBlurState, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateBlurState);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await fetch("/admin");
        if (!alive) return;
        setMe({ username: me.username, is_sudo: !!me.is_sudo });

        if (me?.is_sudo) {
          try {
            const all = await fetch("/admins");
            if (!alive) return;
            const list = Array.isArray(all) ? all : [];
            const hasMe = list.some((a) => a?.username === me.username);
            setAdmins(
              hasMe ? list : [{ username: me.username, is_sudo: !!me.is_sudo }, ...list]
            );
          } catch {
            setAdmins([{ username: me.username, is_sudo: !!me.is_sudo }]);
          }
        } else {
          setAdmins([{ username: me.username, is_sudo: !!me.is_sudo }]);
        }
      } catch {
        setAdmins([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchField(e.target.value);
  };

  const clear = () => {
    setSearch("");
    onFilterChange({
      ...filters,
      offset: 0,
      search: "",
    });
  };

  const onAdminFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({
      ...filters,
      offset: 0,
      admin: value === "__all__" ? undefined : value,
    });
  };

  const selectedValue =
    filters.admin === me?.username ? "__sudo_self__" : filters.admin || "__all__";
  const desktopFilterColumns = me?.is_sudo
    ? "minmax(0, 1fr) minmax(0, 1fr)"
    : "1fr";

  return (
    <Grid
      id="filters"
      templateColumns={{
        base: "1fr",
        md: "minmax(0, 1fr) minmax(0, 1fr) auto",
      }}
      position="sticky"
      top={0}
      mx="-6"
      px="6"
      rowGap={4}
      gap={{
        lg: 4,
        base: 0,
      }}
      bg={isScrollBlurActive ? "rgba(255, 255, 255, 0.42)" : "transparent"}
      _dark={{
        bg: isScrollBlurActive ? "rgba(4, 6, 9, 0.44)" : "transparent",
        borderColor: isScrollBlurActive
          ? "rgba(148, 163, 184, 0.35)"
          : "transparent",
      }}
      borderBottomWidth="1px"
      borderColor={isScrollBlurActive ? "rgba(210, 210, 212, 0.7)" : "transparent"}
      backdropFilter={isScrollBlurActive ? "blur(12px)" : "none"}
      WebkitBackdropFilter={isScrollBlurActive ? "blur(12px)" : "none"}
      boxShadow={isScrollBlurActive ? "0 10px 24px rgba(0, 0, 0, 0.12)" : "none"}
      transition="background-color .18s ease, backdrop-filter .18s ease, border-color .18s ease, box-shadow .18s ease"
      py={4}
      zIndex="docked"
      {...props}
    >
      <GridItem
        colSpan={{ base: 1, md: 2 }}
        order={{ base: 2, md: 1 }}
        display="flex"
        justifyContent="stretch"
      >
        <Box
          display="grid"
          gridTemplateColumns={{ base: "1fr", md: desktopFilterColumns }}
          gap={3}
          w="full"
          minW={0}
        >
          <InputGroup w="full">
            <InputLeftElement pointerEvents="none" children={<SearchIcon />} />
            <Input
              placeholder={t("search")}
              value={search}
              borderColor="light-border"
              _dark={{ bg: "gray.750", borderColor: "gray.600" }}
              onChange={onChange}
            />

            <InputRightElement>
              {loading && <Spinner size="xs" />}
              {filters.search && filters.search.length > 0 && (
                <IconButton
                  onClick={clear}
                  aria-label="clear"
                  size="xs"
                  variant="ghost"
                >
                  <ClearIcon />
                </IconButton>
              )}
            </InputRightElement>
          </InputGroup>

          {me?.is_sudo ? (
            <Select
              className="admin-filter-select"
              size="md"
              borderColor="light-border"
              _dark={{ bg: "gray.750", borderColor: "gray.600" }}
              value={selectedValue}
              onChange={onAdminFilterChange}
              w="full"
            >
              <option value="__all__">{t("filters.adminAll")}</option>
              <option value="__sudo_self__">
                {me?.username} (sudo)
              </option>
              {admins
                .filter((a) => a.username !== me?.username)
                .map((a) => (
                  <option key={a.username} value={a.username}>
                    {a.username}
                    {a.is_sudo ? " (sudo)" : ""}
                  </option>
                ))}
            </Select>
          ) : null}
        </Box>
      </GridItem>

      <GridItem colSpan={{ base: 1, md: 1 }} order={{ base: 1, md: 2 }}>
        <HStack justifyContent="flex-end" alignItems="center" h="full">
          <IconButton
            aria-label="refresh users"
            disabled={loading}
            onClick={refetchUsers}
            size="sm"
            variant="outline"
                      >
            <ReloadIcon
              className={classNames({
                "animate-spin": loading,
              })}
            />
          </IconButton>
          <Button
            variant="solid"
            size="sm"
            onClick={() => onCreateUser(true)}
            px={5}
            _dark={{
              bg: "rgba(77, 99, 255, 0.16)",
              color: "#dbe7ff",
              border: "1px solid rgba(96, 165, 250, 0.38)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 0 8px rgba(77,99,255,0.28)",
              _hover: {
                bg: "rgba(77, 99, 255, 0.22)",
                boxShadow: "0 0 12px rgba(77,99,255,0.36)",
                transform: "translateY(-1px)",
              },
              _active: {
                bg: "rgba(77, 99, 255, 0.26)",
                transform: "translateY(0)",
              },
            }}
          >
            {t("createUser")}
          </Button>
        </HStack>
      </GridItem>
    </Grid>
  );
};
