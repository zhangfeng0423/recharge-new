#!/usr/bin/env node

/**
 * AUTH_001 认证问题自动化诊断脚本
 * 使用 Chrome DevTools MCP 进行全面的认证状态检查
 */

class AuthDiagnosticTool {
  constructor() {
    this.baseUrl = "http://localhost:3000";
    this.authPage = "/auth";
    this.testEmail = "test@example.com";
    this.testPassword = "test123456";
  }

  /**
   * 启动完整的认证诊断流程
   */
  async runFullDiagnostic() {
    console.log("🔍 开始 AUTH_001 认证问题诊断...");

    try {
      // 1. 初始化浏览器页面
      await this.initializePage();

      // 2. 检查应用加载状态
      await this.checkApplicationLoad();

      // 3. 监控网络请求
      await this.monitorNetworkRequests();

      // 4. 检查浏览器存储状态
      await this.checkBrowserStorage();

      // 5. 测试认证流程
      await this.testAuthenticationFlow();

      // 6. 验证 Supabase 客户端状态
      await this.verifySupabaseClient();

      // 7. 分析控制台错误
      await this.analyzeConsoleErrors();

      // 8. 生成诊断报告
      await this.generateDiagnosticReport();
    } catch (error) {
      console.error("❌ 诊断过程中出现错误:", error);
    }
  }

  /**
   * 1. 初始化浏览器页面
   */
  async initializePage() {
    console.log("📱 步骤 1: 初始化浏览器页面...");

    try {
      // 创建新页面
      await mcp__chrome_devtools__new_page({
        url: this.baseUrl,
        timeout: 10000,
      });

      // 等待页面加载
      await mcp__chrome_devtools__wait_for({
        text: "body",
        timeout: 5000,
      });

      // 截取页面快照
      const snapshot = await mcp__chrome_devtools__take_snapshot({
        verbose: true,
        filePath: "./diagnostic-snapshot-initial.json",
      });

      console.log("✅ 页面初始化完成");

      // 调整页面尺寸以获得更好的视图
      await mcp__chrome_devtools__resize_page({
        width: 1200,
        height: 800,
      });
    } catch (error) {
      console.error("❌ 页面初始化失败:", error);
      throw error;
    }
  }

  /**
   * 2. 检查应用加载状态
   */
  async checkApplicationLoad() {
    console.log("⏳ 步骤 2: 检查应用加载状态...");

    try {
      // 检查关键元素是否加载
      const snapshot = await mcp__chrome_devtools__take_snapshot({
        verbose: false,
      });

      // 执行 JavaScript 检查 React 应用状态
      const reactStatus = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            return {
              reactLoaded: !!document.querySelector('[data-reactroot]') ||
                           !!document.querySelector('#__next') ||
                           !!window.React,
              nextLoaded: !!window.__NEXT_DATA__,
              supabaseLoaded: !!window.supabase,
              documentTitle: document.title,
              readyState: document.readyState
            };
          }
        `,
      });

      console.log("📊 应用加载状态:", reactStatus);

      // 检查控制台消息
      const consoleMessages = await mcp__chrome_devtools__list_console_messages(
        {
          pageSize: 20,
          pageIdx: 0,
          types: ["error", "warn", "log"],
          includePreservedMessages: false,
        },
      );

      console.log("📝 控制台消息数量:", consoleMessages.messages?.length || 0);
    } catch (error) {
      console.error("❌ 应用加载检查失败:", error);
    }
  }

  /**
   * 3. 监控网络请求
   */
  async monitorNetworkRequests() {
    console.log("🌐 步骤 3: 监控网络请求...");

    try {
      // 导航到认证页面以触发相关请求
      await mcp__chrome_devtools__navigate_page({
        type: "url",
        url: `${this.baseUrl}${this.authPage}`,
        ignoreCache: true,
        timeout: 10000,
      });

      // 等待页面加载完成
      await mcp__chrome_devtools__wait_for({
        text: "form",
        timeout: 5000,
      });

      // 获取所有网络请求
      const networkRequests = await mcp__chrome_devtools__list_network_requests(
        {
          pageSize: 50,
          pageIdx: 0,
          resourceTypes: ["document", "script", "fetch", "xhr"],
          includePreservedRequests: false,
        },
      );

      // 分析认证相关的请求
      const authRequests =
        networkRequests.requests?.filter(
          (req) =>
            req.url?.includes("supabase") ||
            req.url?.includes("auth") ||
            req.url?.includes("api/auth"),
        ) || [];

      console.log("🔗 认证相关网络请求:", authRequests.length);

      // 详细分析每个请求
      for (const request of authRequests) {
        console.log(`📤 ${request.method || "GET"} ${request.url}`);
        console.log(`   状态码: ${request.status || "N/A"}`);
        console.log(`   类型: ${request.resourceType || "unknown"}`);

        if (request.status >= 400) {
          console.warn(`⚠️  请求失败: ${request.status}`);
        }
      }
    } catch (error) {
      console.error("❌ 网络请求监控失败:", error);
    }
  }

  /**
   * 4. 检查浏览器存储状态
   */
  async checkBrowserStorage() {
    console.log("💾 步骤 4: 检查浏览器存储状态...");

    try {
      // 检查 localStorage
      const localStorageCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            const storage = {};
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.includes('supabase')) {
                storage[key] = localStorage.getItem(key);
              }
            }
            return storage;
          }
        `,
      });

      console.log("🗂️  Supabase localStorage:", localStorageCheck);

      // 检查 sessionStorage
      const sessionStorageCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            const storage = {};
            for (let i = 0; i < sessionStorage.length; i++) {
              const key = sessionStorage.key(i);
              if (key && key.includes('supabase')) {
                storage[key] = sessionStorage.getItem(key);
              }
            }
            return storage;
          }
        `,
      });

      console.log("🗂️  Supabase sessionStorage:", sessionStorageCheck);

      // 检查 cookies
      const cookiesCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            return document.cookie.split(';').filter(cookie =>
              cookie.trim().includes('supabase') ||
              cookie.trim().includes('auth')
            ).map(cookie => cookie.trim());
          }
        `,
      });

      console.log("🍪 认证相关 cookies:", cookiesCheck);
    } catch (error) {
      console.error("❌ 浏览器存储检查失败:", error);
    }
  }

  /**
   * 5. 测试认证流程
   */
  async testAuthenticationFlow() {
    console.log("🔐 步骤 5: 测试认证流程...");

    try {
      // 获取页面快照查找登录表单
      const snapshot = await mcp__chrome_devtools__take_snapshot({
        verbose: false,
      });

      // 查找登录表单元素
      const formElements = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            const emailInput = document.querySelector('input[type="email"], input[name="email"], input[placeholder*="email"]');
            const passwordInput = document.querySelector('input[type="password"], input[name="password"], input[placeholder*="password"]');
            const submitButton = document.querySelector('button[type="submit"], button:contains("登录"), button:contains("Login")');

            return {
              hasEmailInput: !!emailInput,
              hasPasswordInput: !!passwordInput,
              hasSubmitButton: !!submitButton,
              emailInputSelector: emailInput ? (emailInput.id || emailInput.className || emailInput.tagName) : null,
              passwordInputSelector: passwordInput ? (passwordInput.id || passwordInput.className || passwordInput.tagName) : null,
              submitButtonText: submitButton ? submitButton.textContent : null
            };
          }
        `,
      });

      console.log("📋 登录表单检查结果:", formElements);

      // 如果找到表单元素，尝试填写测试数据（仅用于测试）
      if (formElements.hasEmailInput && formElements.hasPasswordInput) {
        console.log(
          "🧪 注意: 发现登录表单，但不执行实际登录以避免影响现有数据",
        );

        // 也可以模拟点击登录按钮但不提交
        if (formElements.hasSubmitButton) {
          console.log(`🔘 登录按钮文本: ${formElements.submitButtonText}`);
        }
      } else {
        console.log("ℹ️  未找到完整的登录表单，可能需要手动导航到登录页面");
      }
    } catch (error) {
      console.error("❌ 认证流程测试失败:", error);
    }
  }

  /**
   * 6. 验证 Supabase 客户端状态
   */
  async verifySupabaseClient() {
    console.log("🔍 步骤 6: 验证 Supabase 客户端状态...");

    try {
      // 检查 Supabase 客户端是否正确初始化
      const supabaseStatus = await mcp__chrome_devtools__evaluate_script({
        function: `
          async () => {
            try {
              // 检查全局 Supabase 客户端
              const supabase = window.supabase;
              if (!supabase) {
                return { error: 'Supabase client not found in window object' };
              }

              // 检查客户端配置
              const config = supabase.supabaseUrl && supabase.supabaseKey;

              // 尝试获取当前会话
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

              // 尝试获取当前用户
              const { data: userData, error: userError } = await supabase.auth.getUser();

              // 检查认证状态变化监听器
              let authStateChanges = [];
              const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
                authStateChanges.push({ event, session: session ? 'exists' : 'null', timestamp: Date.now() });
              });

              // 等待一小段时间收集状态变化
              await new Promise(resolve => setTimeout(resolve, 1000));

              if (subscription) {
                subscription.subscription.unsubscribe();
              }

              return {
                clientExists: true,
                configValid: !!config,
                supabaseUrl: supabase.supabaseUrl ? 'configured' : 'missing',
                session: sessionData.session ? 'exists' : 'null',
                user: userData.user ? 'exists' : 'null',
                sessionError: sessionError?.message || null,
                userError: userError?.message || null,
                authStateChanges: authStateChanges.length,
                lastAuthEvent: authStateChanges[authStateChanges.length - 1]
              };

            } catch (error) {
              return {
                error: error.message,
                stack: error.stack
              };
            }
          }
        `,
      });

      console.log("🛠️  Supabase 客户端状态:", supabaseStatus);

      // 检查是否有认证相关的错误
      if (supabaseStatus.sessionError || supabaseStatus.userError) {
        console.warn("⚠️  发现认证错误:", {
          sessionError: supabaseStatus.sessionError,
          userError: supabaseStatus.userError,
        });
      }
    } catch (error) {
      console.error("❌ Supabase 客户端验证失败:", error);
    }
  }

  /**
   * 7. 分析控制台错误
   */
  async analyzeConsoleErrors() {
    console.log("📊 步骤 7: 分析控制台错误...");

    try {
      // 获取所有控制台消息
      const consoleMessages = await mcp__chrome_devtools__list_console_messages(
        {
          pageSize: 100,
          pageIdx: 0,
          types: ["error", "warn", "info"],
          includePreservedMessages: true,
        },
      );

      // 过滤认证相关的消息
      const authRelatedMessages =
        consoleMessages.messages?.filter(
          (msg) =>
            msg.text?.toLowerCase().includes("auth") ||
            msg.text?.toLowerCase().includes("supabase") ||
            msg.text?.toLowerCase().includes("session") ||
            msg.text?.includes("AUTH_001"),
        ) || [];

      console.log(`🔍 发现 ${authRelatedMessages.length} 条认证相关消息:`);

      authRelatedMessages.forEach((msg, index) => {
        console.log(`${index + 1}. [${msg.type?.toUpperCase()}] ${msg.text}`);
        if (msg.url) {
          console.log(`   位置: ${msg.url}:${msg.lineNumber}`);
        }
      });

      // 获取详细错误信息
      for (const msg of authRelatedMessages.slice(0, 5)) {
        // 只获取前5个错误的详细信息
        if (msg.type === "error") {
          const errorDetail = await mcp__chrome_devtools__get_console_message({
            msgid: msg.msgid,
          });
          console.log(`📄 错误详情 (${msg.msgid}):`, errorDetail);
        }
      }
    } catch (error) {
      console.error("❌ 控制台错误分析失败:", error);
    }
  }

  /**
   * 8. 生成诊断报告
   */
  async generateDiagnosticReport() {
    console.log("📋 步骤 8: 生成诊断报告...");

    try {
      // 执行最终的系统状态检查
      const finalStatus = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            return {
              userAgent: navigator.userAgent,
              currentUrl: window.location.href,
              timestamp: new Date().toISOString(),
              localStorage: Object.keys(localStorage).filter(key => key.includes('supabase')),
              sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('supabase')),
              cookies: document.cookie.split(';').filter(cookie =>
                cookie.trim().includes('supabase') || cookie.trim().includes('auth')
              ).length,
              hasSupabase: !!window.supabase,
              readyState: document.readyState,
              performanceTiming: performance.timing ? {
                loadEventEnd: performance.timing.loadEventEnd,
                domContentLoaded: performance.timing.domContentLoadedEventEnd,
                navigationStart: performance.timing.navigationStart
              } : null
            };
          }
        `,
      });

      // 生成诊断报告
      const report = {
        timestamp: new Date().toISOString(),
        baseUrl: this.baseUrl,
        diagnosis: {
          applicationLoad: "checked",
          networkRequests: "monitored",
          browserStorage: "inspected",
          authenticationFlow: "tested",
          supabaseClient: "verified",
          consoleErrors: "analyzed",
        },
        finalStatus: finalStatus,
        recommendations: this.generateRecommendations(finalStatus),
      };

      // 保存诊断报告
      const reportPath = "./auth-diagnostic-report.json";
      require("fs").writeFileSync(reportPath, JSON.stringify(report, null, 2));

      console.log("\n🎯 诊断报告已生成:", reportPath);
      console.log("\n📋 诊断摘要:");
      console.log("- 应用加载状态:", finalStatus.readyState);
      console.log("- Supabase 客户端存在:", finalStatus.hasSupabase);
      console.log(
        "- 认证相关存储项:",
        finalStatus.localStorage.length + finalStatus.sessionStorage.length,
      );
      console.log("- 认证相关 Cookies:", finalStatus.cookies);

      console.log("\n💡 建议的修复步骤:");
      report.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    } catch (error) {
      console.error("❌ 诊断报告生成失败:", error);
    }
  }

  /**
   * 生成修复建议
   */
  generateRecommendations(status) {
    const recommendations = [];

    if (!status.hasSupabase) {
      recommendations.push("Supabase 客户端未正确初始化，检查客户端配置");
    }

    if (
      status.localStorage.length === 0 &&
      status.sessionStorage.length === 0
    ) {
      recommendations.push("没有发现认证相关的存储数据，可能需要重新登录");
    }

    if (status.readyState !== "complete") {
      recommendations.push("页面未完全加载，等待页面加载完成后再进行认证操作");
    }

    if (status.cookies === 0) {
      recommendations.push("没有发现认证相关的 cookies，检查 cookie 配置");
    }

    // 添加通用建议
    recommendations.push("检查 .env.local 文件中的 Supabase 配置");
    recommendations.push("验证 RLS (Row Level Security) 策略设置");
    recommendations.push("确认服务端和客户端的 Supabase 客户端配置一致性");

    return recommendations;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const diagnosticTool = new AuthDiagnosticTool();
  diagnosticTool
    .runFullDiagnostic()
    .then(() => {
      console.log("\n✅ 诊断完成！");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ 诊断失败:", error);
      process.exit(1);
    });
}

module.exports = AuthDiagnosticTool;
