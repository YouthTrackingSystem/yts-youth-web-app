"use client";

import {
  createContext,
  createElement,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { isPwaEnabled } from "@/lib/pwa/register";

const INSTALL_DISMISSED_KEY = "yts_pwa_install_dismissed";
const INSTALL_CONFIRMED_KEY = "yts_pwa_install_confirmed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

type PwaInstallState = {
  canInstall: boolean;
  dismiss: () => void;
  install: () => Promise<void>;
  isDismissed: boolean;
  isInstalling: boolean;
  isIosSafari: boolean;
  isStandalone: boolean;
  showSuccess: boolean;
};

const PwaInstallContext = createContext<PwaInstallState | null>(null);

function isStandaloneMode() {
  const navigatorWithStandalone = window.navigator as Navigator & {
    standalone?: boolean;
  };

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    navigatorWithStandalone.standalone === true
  );
}

function isIosSafariBrowser() {
  const userAgent = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);

  return isIos && isSafari;
}

export function PwaInstallProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isPwaEnabled()) return;

    const standalone = isStandaloneMode();
    setIsStandalone(standalone);
    setIsIosSafari(isIosSafariBrowser());
    setIsDismissed(window.localStorage.getItem(INSTALL_DISMISSED_KEY) === "true");

    if (standalone && window.localStorage.getItem(INSTALL_CONFIRMED_KEY) !== "true") {
      window.localStorage.setItem(INSTALL_CONFIRMED_KEY, "true");
      setShowSuccess(true);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    }

    function handleInstalled() {
      setInstallPrompt(null);
      setIsStandalone(true);
      setIsInstalling(false);
      setShowSuccess(true);
      window.localStorage.removeItem(INSTALL_DISMISSED_KEY);
      window.localStorage.setItem(INSTALL_CONFIRMED_KEY, "true");
    }

    const displayMode = window.matchMedia("(display-mode: standalone)");
    function handleDisplayModeChange() {
      const standalone = isStandaloneMode();
      setIsStandalone(standalone);

      if (standalone && window.localStorage.getItem(INSTALL_CONFIRMED_KEY) !== "true") {
        window.localStorage.setItem(INSTALL_CONFIRMED_KEY, "true");
        setShowSuccess(true);
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    displayMode.addEventListener("change", handleDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      displayMode.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  useEffect(() => {
    if (!showSuccess) return;

    const timeout = window.setTimeout(() => setShowSuccess(false), 6000);
    return () => window.clearTimeout(timeout);
  }, [showSuccess]);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(INSTALL_DISMISSED_KEY, "true");
    setIsDismissed(true);
  }, []);

  const install = useCallback(async () => {
    if (!installPrompt) return;

    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;

      if (choice.outcome === "dismissed") {
        setIsInstalling(false);
      }

      setInstallPrompt(null);
    } catch {
      setIsInstalling(false);
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const value = useMemo(
    () => ({
      canInstall: Boolean(installPrompt),
      dismiss,
      install,
      isDismissed,
      isInstalling,
      isIosSafari,
      isStandalone,
      showSuccess
    }),
    [
      dismiss,
      install,
      installPrompt,
      isDismissed,
      isInstalling,
      isIosSafari,
      isStandalone,
      showSuccess
    ]
  );

  return createElement(PwaInstallContext.Provider, { value }, children);
}

export function usePwaInstall() {
  const context = useContext(PwaInstallContext);

  if (!context) {
    throw new Error("usePwaInstall must be used within PwaInstallProvider.");
  }

  return context;
}
