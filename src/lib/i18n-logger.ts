/**
 * 国际化日志工具
 * 提供多语言支持的日志消息
 */

import { getTranslations } from "next-intl/server";

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
}

export class I18nLogger {
  private static instance: I18nLogger;
  private locale: string = "en";

  private constructor() {}

  static getInstance(): I18nLogger {
    if (!I18nLogger.instance) {
      I18nLogger.instance = new I18nLogger();
    }
    return I18nLogger.instance;
  }

  setLocale(locale: string): void {
    this.locale = locale;
  }

  getLocale(): string {
    return this.locale;
  }

  private async getMessage(
    key: string,
    fallback: string,
    namespace?: string,
  ): Promise<string> {
    try {
      const t = await getTranslations({
        locale: this.locale,
        namespace: namespace || "logs",
      });

      const message = t(key);
      return typeof message === "string" ? message : fallback;
    } catch (_error) {
      // 如果翻译失败，返回备用消息
      return fallback;
    }
  }

  async debug(
    key: string,
    fallback: string,
    ...args: unknown[]
  ): Promise<void> {
    const message = await this.getMessage(key, fallback);
    console.debug(`[DEBUG] ${message}`, ...args);
  }

  async info(key: string, fallback: string, ...args: unknown[]): Promise<void> {
    const message = await this.getMessage(key, fallback);
    console.info(`[INFO] ${message}`, ...args);
  }

  async warn(key: string, fallback: string, ...args: unknown[]): Promise<void> {
    const message = await this.getMessage(key, fallback);
    console.warn(`[WARN] ${message}`, ...args);
  }

  async error(
    key: string,
    fallback: string,
    ...args: unknown[]
  ): Promise<void> {
    const message = await this.getMessage(key, fallback);
    console.error(`[ERROR] ${message}`, ...args);
  }

  // 同步版本，用于不能使用 async 的地方
  debugSync(_key: string, fallback: string, ...args: unknown[]): void {
    console.debug(`[DEBUG] ${fallback}`, ...args);
  }

  infoSync(_key: string, fallback: string, ...args: unknown[]): void {
    console.info(`[INFO] ${fallback}`, ...args);
  }

  warnSync(_key: string, fallback: string, ...args: unknown[]): void {
    console.warn(`[WARN] ${fallback}`, ...args);
  }

  errorSync(_key: string, fallback: string, ...args: unknown[]): void {
    console.error(`[ERROR] ${fallback}`, ...args);
  }
}

// 全局日志实例
export const logger = I18nLogger.getInstance();

// 便捷函数
export const setLogLocale = (locale: string): void => {
  logger.setLocale(locale);
};

export const logDebug = async (
  key: string,
  fallback: string,
  ...args: unknown[]
): Promise<void> => {
  await logger.debug(key, fallback, ...args);
};

export const logInfo = async (
  key: string,
  fallback: string,
  ...args: unknown[]
): Promise<void> => {
  await logger.info(key, fallback, ...args);
};

export const logWarn = async (
  key: string,
  fallback: string,
  ...args: unknown[]
): Promise<void> => {
  await logger.warn(key, fallback, ...args);
};

export const logError = async (
  key: string,
  fallback: string,
  ...args: unknown[]
): Promise<void> => {
  await logger.error(key, fallback, ...args);
};

// 同步版本
export const logDebugSync = (
  key: string,
  fallback: string,
  ...args: unknown[]
): void => {
  logger.debugSync(key, fallback, ...args);
};

export const logInfoSync = (
  key: string,
  fallback: string,
  ...args: unknown[]
): void => {
  logger.infoSync(key, fallback, ...args);
};

export const logWarnSync = (
  key: string,
  fallback: string,
  ...args: unknown[]
): void => {
  logger.warnSync(key, fallback, ...args);
};

export const logErrorSync = (
  key: string,
  fallback: string,
  ...args: unknown[]
): void => {
  logger.errorSync(key, fallback, ...args);
};
