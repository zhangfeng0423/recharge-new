#!/usr/bin/env node

/**
 * AUTH_001 修复验证测试脚本
 * 使用 Chrome DevTools MCP 进行端到端测试，验证认证问题是否已修复
 */

class AuthE2ETestTool {
  constructor() {
    this.baseUrl = "http://localhost:3000";
    this.testResults = [];
    this.currentTest = null;
  }

  /**
   * 运行完整的端到端测试
   */
  async runFullE2ETest() {
    console.log("🧪 开始 AUTH_001 修复验证端到端测试...\n");

    try {
      // 1. 环境准备测试
      await this.testEnvironmentSetup();

      // 2. 应用加载测试
      await this.testApplicationLoading();

      // 3. 认证状态检查测试
      await this.testAuthenticationState();

      // 4. 错误处理测试
      await this.testErrorHandling();

      // 5. 国际化消息测试
      await this.testInternationalization();

      // 6. 性能测试
      await this.testPerformance();

      // 7. 生成测试报告
      await this.generateTestReport();
    } catch (error) {
      console.error("❌ 端到端测试过程中出现错误:", error);
      this.addTestResult("E2E_TEST_ERROR", false, error.message);
    }
  }

  /**
   * 记录测试结果
   */
  addTestResult(testName, passed, message = "") {
    const result = {
      testName,
      passed,
      message,
      timestamp: new Date().toISOString(),
    };
    this.testResults.push(result);

    const status = passed ? "✅" : "❌";
    console.log(
      `${status} ${testName}: ${message || (passed ? "PASSED" : "FAILED")}`,
    );
  }

  /**
   * 1. 环境准备测试
   */
  async testEnvironmentSetup() {
    console.log("\n🔧 测试环境准备...");

    try {
      // 初始化浏览器页面
      await mcp__chrome_devtools__new_page({
        url: this.baseUrl,
        timeout: 15000,
      });

      await mcp__chrome_devtools__select_page({ pageIdx: 0 });

      // 等待页面加载
      await mcp__chrome_devtools__wait_for({ text: "body", timeout: 10000 });

      this.addTestResult("环境初始化", true, "浏览器页面初始化成功");

      // 检查 Next.js 应用是否正常加载
      const appStatus = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => ({
            readyState: document.readyState,
            hasNextData: !!window.__NEXT_DATA__,
            title: document.title,
            url: window.location.href
          })
        `,
      });

      if (appStatus.readyState === "complete") {
        this.addTestResult("应用状态检查", true, "应用完全加载");
      } else {
        this.addTestResult(
          "应用状态检查",
          false,
          `应用未完全加载: ${appStatus.readyState}`,
        );
      }
    } catch (error) {
      this.addTestResult("环境准备", false, error.message);
      throw error;
    }
  }

  /**
   * 2. 应用加载测试
   */
  async testApplicationLoading() {
    console.log("\n📱 测试应用加载...");

    try {
      // 检查关键脚本和资源
      const resourceCheck = await mcp__chrome_devtools__list_network_requests({
        pageSize: 30,
        pageIdx: 0,
        resourceTypes: ["script", "document"],
        includePreservedRequests: false,
      });

      const scriptsLoaded =
        resourceCheck.requests?.filter(
          (req) => req.resourceType === "script" && req.status === 200,
        ).length || 0;

      if (scriptsLoaded > 0) {
        this.addTestResult(
          "脚本加载",
          true,
          `成功加载 ${scriptsLoaded} 个脚本文件`,
        );
      } else {
        this.addTestResult("脚本加载", false, "未检测到成功加载的脚本文件");
      }

      // 检查 Supabase 客户端
      const supabaseCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => ({
            hasSupabase: !!window.supabase,
            supabaseMethods: window.supabase ?
              Object.keys(window.supabase).filter(key => typeof window.supabase[key] === 'function') : [],
            globalVars: Object.keys(window).filter(key => key.toLowerCase().includes('supabase'))
          })
        `,
      });

      if (supabaseCheck.hasSupabase) {
        this.addTestResult(
          "Supabase客户端",
          true,
          `Supabase客户端已加载，包含 ${supabaseCheck.supabaseMethods.length} 个方法`,
        );
      } else {
        this.addTestResult("Supabase客户端", false, "Supabase客户端未找到");
      }
    } catch (error) {
      this.addTestResult("应用加载测试", false, error.message);
    }
  }

  /**
   * 3. 认证状态检查测试
   */
  async testAuthenticationState() {
    console.log("\n🔐 测试认证状态...");

    try {
      // 导航到认证页面
      await mcp__chrome_devtools__navigate_page({
        type: "url",
        url: `${this.baseUrl}/auth`,
        ignoreCache: true,
        timeout: 10000,
      });

      await mcp__chrome_devtools__wait_for({ text: "body", timeout: 5000 });

      // 检查认证页面元素
      const authPageCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            const hasForm = document.querySelector('form') !== null;
            const hasEmailInput = document.querySelector('input[type="email"]') !== null;
            const hasPasswordInput = document.querySelector('input[type="password"]') !== null;
            const hasSubmitButton = document.querySelector('button[type="submit"]') !== null;

            return {
              hasForm,
              hasEmailInput,
              hasPasswordInput,
              hasSubmitButton,
              title: document.title,
              url: window.location.href
            };
          }
        `,
      });

      const formElements = [
        { name: "登录表单", has: authPageCheck.hasForm },
        { name: "邮箱输入框", has: authPageCheck.hasEmailInput },
        { name: "密码输入框", has: authPageCheck.hasPasswordInput },
        { name: "提交按钮", has: authPageCheck.hasSubmitButton },
      ];

      formElements.forEach((element) => {
        this.addTestResult(
          element.name,
          element.has,
          element.has ? "元素存在" : "元素缺失",
        );
      });

      // 测试未登录状态下的认证检查
      const authStateCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          async () => {
            try {
              if (window.supabase) {
                const { data, error } = await window.supabase.auth.getSession();
                return {
                  hasSession: !!data.session,
                  sessionError: error ? error.message : null,
                  user: data.session ? data.session.user : null
                };
              } else {
                return { error: 'Supabase client not available' };
              }
            } catch (err) {
              return { error: err.message };
            }
          }
        `,
      });

      if (authStateCheck.error) {
        this.addTestResult("认证状态检查", false, authStateCheck.error);
      } else {
        this.addTestResult(
          "认证状态检查",
          true,
          authStateCheck.hasSession ? "用户已登录" : "用户未登录（正常状态）",
        );
      }
    } catch (error) {
      this.addTestResult("认证状态测试", false, error.message);
    }
  }

  /**
   * 4. 错误处理测试
   */
  async testErrorHandling() {
    console.log("\n⚠️ 测试错误处理...");

    try {
      // 监控控制台错误
      const consoleMessages = await mcp__chrome_devtools__list_console_messages(
        {
          pageSize: 50,
          pageIdx: 0,
          types: ["error", "warn"],
          includePreservedMessages: true,
        },
      );

      // 检查是否有 AUTH_001 相关错误
      const authErrors =
        consoleMessages.messages?.filter(
          (msg) =>
            msg.text?.includes("AUTH_001") ||
            msg.text?.includes("Auth session missing") ||
            msg.text?.includes("Server authentication failed"),
        ) || [];

      if (authErrors.length === 0) {
        this.addTestResult("AUTH_001错误检查", true, "未发现AUTH_001相关错误");
      } else {
        this.addTestResult(
          "AUTH_001错误检查",
          false,
          `发现 ${authErrors.length} 个AUTH_001相关错误`,
        );
        authErrors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.text}`);
        });
      }

      // 测试网络错误处理
      const networkRequests = await mcp__chrome_devtools__list_network_requests(
        {
          pageSize: 20,
          pageIdx: 0,
          resourceTypes: ["fetch", "xhr"],
          includePreservedRequests: false,
        },
      );

      const failedRequests =
        networkRequests.requests?.filter(
          (req) => (req.status >= 400 && req.status < 600) || req.status === 0,
        ) || [];

      if (failedRequests.length === 0) {
        this.addTestResult("网络请求错误", true, "所有网络请求成功");
      } else {
        this.addTestResult(
          "网络请求错误",
          false,
          `发现 ${failedRequests.length} 个失败请求`,
        );
      }
    } catch (error) {
      this.addTestResult("错误处理测试", false, error.message);
    }
  }

  /**
   * 5. 国际化消息测试
   */
  async testInternationalization() {
    console.log("\n🌐 测试国际化消息...");

    try {
      // 检查英文消息
      await mcp__chrome_devtools__navigate_page({
        type: "url",
        url: `${this.baseUrl}/en`,
        ignoreCache: true,
        timeout: 5000,
      });

      const englishCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            // 检查页面是否正确加载英文版本
            const lang = document.documentElement.lang || document.documentElement.getAttribute('data-locale');
            const title = document.title;

            return {
              locale: lang,
              title: title,
              url: window.location.href
            };
          }
        `,
      });

      // 检查中文消息
      await mcp__chrome_devtools__navigate_page({
        type: "url",
        url: `${this.baseUrl}/zh`,
        ignoreCache: true,
        timeout: 5000,
      });

      const chineseCheck = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            const lang = document.documentElement.lang || document.documentElement.getAttribute('data-locale');
            const title = document.title;

            return {
              locale: lang,
              title: title,
              url: window.location.href
            };
          }
        `,
      });

      const englishWorking =
        englishCheck.locale === "en" || englishCheck.url.includes("/en");
      const chineseWorking =
        chineseCheck.locale === "zh" || chineseCheck.url.includes("/zh");

      this.addTestResult(
        "英文国际化",
        englishWorking,
        englishWorking ? "英文页面正常" : "英文页面异常",
      );
      this.addTestResult(
        "中文国际化",
        chineseWorking,
        chineseWorking ? "中文页面正常" : "中文页面异常",
      );
    } catch (error) {
      this.addTestResult("国际化测试", false, error.message);
    }
  }

  /**
   * 6. 性能测试
   */
  async testPerformance() {
    console.log("\n⚡ 测试性能...");

    try {
      // 开始性能追踪
      await mcp__chrome_devtools__performance_start_trace({
        reload: true,
        autoStop: true,
      });

      // 等待性能追踪完成
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // 检查页面加载时间
      const performanceMetrics = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            const navigation = performance.getEntriesByType('navigation')[0];
            return {
              loadTime: navigation.loadEventEnd - navigation.loadEventStart,
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              firstPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-paint')?.startTime,
              firstContentfulPaint: performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint')?.startTime
            };
          }
        `,
      });

      const loadTime = performanceMetrics.loadTime || 0;

      if (loadTime < 5000) {
        // 5秒内
        this.addTestResult("页面加载性能", true, `加载时间: ${loadTime}ms`);
      } else {
        this.addTestResult(
          "页面加载性能",
          false,
          `加载时间过长: ${loadTime}ms`,
        );
      }

      // 检查内存使用
      const memoryInfo = await mcp__chrome_devtools__evaluate_script({
        function: `
          () => {
            if (performance.memory) {
              return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
              };
            }
            return { error: 'Memory info not available' };
          }
        `,
      });

      if (!memoryInfo.error) {
        this.addTestResult(
          "内存使用",
          true,
          `内存使用: ${memoryInfo.used}MB / ${memoryInfo.total}MB`,
        );
      }
    } catch (error) {
      this.addTestResult("性能测试", false, error.message);
    }
  }

  /**
   * 7. 生成测试报告
   */
  async generateTestReport() {
    console.log("\n📊 生成测试报告...");

    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter((r) => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate =
      totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        successRate: `${successRate}%`,
      },
      results: this.testResults,
      environment: {
        baseUrl: this.baseUrl,
        userAgent: navigator?.userAgent || "Unknown",
      },
    };

    // 保存报告到文件
    const reportPath = "./auth-e2e-test-report.json";
    const fs = require("fs");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // 输出摘要
    console.log("\n📋 测试报告摘要:");
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   通过: ${passedTests}`);
    console.log(`   失败: ${failedTests}`);
    console.log(`   成功率: ${successRate}%`);
    console.log(`   报告文件: ${reportPath}`);

    // 输出失败的测试
    const failedTestsList = this.testResults.filter((r) => !r.passed);
    if (failedTestsList.length > 0) {
      console.log("\n❌ 失败的测试:");
      failedTestsList.forEach((test) => {
        console.log(`   - ${test.testName}: ${test.message}`);
      });
    }

    // 输出关键指标
    console.log("\n🎯 关键指标:");
    const keyTests = [
      "环境初始化",
      "AUTH_001错误检查",
      "Supabase客户端",
      "认证状态检查",
    ];
    keyTests.forEach((testName) => {
      const test = this.testResults.find((r) => r.testName.includes(testName));
      if (test) {
        const status = test.passed ? "✅" : "❌";
        console.log(`   ${status} ${test.testName}`);
      }
    });

    console.log("\n🎉 端到端测试完成！");

    return report;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const e2eTestTool = new AuthE2ETestTool();

  e2eTestTool
    .runFullE2ETest()
    .then((report) => {
      const allPassed = report.summary.failed === 0;
      console.log(
        `\n${allPassed ? "🎉" : "⚠️"} 测试${allPassed ? "全部通过" : "存在失败项"}`,
      );
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error("\n❌ 端到端测试失败:", error);
      process.exit(1);
    });
}

module.exports = AuthE2ETestTool;
