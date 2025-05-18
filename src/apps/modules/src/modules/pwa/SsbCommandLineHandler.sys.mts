/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*-
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import type { Manifest } from "../../../../main/core/common/pwa/type.ts";

const { AppConstants } = ChromeUtils.importESModule(
  "resource://gre/modules/AppConstants.sys.mjs",
);

const { SessionStore } = ChromeUtils.importESModule(
  "resource:///modules/sessionstore/SessionStore.sys.mjs",
);

export const PWA_WINDOW_NAME = "FloorpPWAWindow";

type TQueryInterface = <T extends nsIID>(aIID: T) => nsQIResult<T>;

export class SsbRunnerUtils {
  static openSsbWindow(ssb: Manifest, initialLaunch = false) {
    let initialLaunchWin: nsIDOMWindow | null = null;

    // SSB用ウィンドウを開く前にフラグを設定
    const args = Cc["@mozilla.org/supports-string;1"].createInstance(
      Ci.nsISupportsString,
    );

    args.data = ssb.start_url;

    const uniqueWindowName = `${PWA_WINDOW_NAME}_${ssb.id}_${Date.now()}`;
    const browserWindowFeatures =
      "chrome,location=yes,centerscreen,dialog=no,resizable=yes,scrollbars=yes";

    // SSB専用ウィンドウを開く
    const win = Services.ww.openWindow(
      null as unknown as mozIDOMWindowProxy,
      AppConstants.BROWSER_CHROME_URL,
      uniqueWindowName,
      browserWindowFeatures,
      args,
    ) as nsIDOMWindow;

    win.focus();

    // 初期起動の場合のみ、通常のブラウザウィンドウを開く
    if (initialLaunch) {
      // セッション復元完了を待ってから通常ウィンドウを開く
      SessionStore.promiseAllWindowsRestored.then(() => {
        initialLaunchWin = Services.ww.openWindow(
          null as unknown as mozIDOMWindowProxy,
          AppConstants.BROWSER_CHROME_URL,
          "_blank",
          "",
          {},
        ) as nsIDOMWindow;
      });
    }

    return win;
  }

  static async applyWindowsIntegration(ssb: Manifest, win: Window) {
    if (AppConstants.platform === "win") {
      const { WindowsSupport } = ChromeUtils.importESModule(
        "resource://noraneko/modules/pwa/supports/Windows.sys.mjs",
      );
      const windowsSupport = new WindowsSupport();
      await windowsSupport.applyOSIntegration(ssb, win);
    }
  }
}

async function startSSBFromCmdLine(id: string) {
  // サバイバルエリアに入る (ウィンドウなしでの起動を許可)
  Services.startup.enterLastWindowClosingSurvivalArea();

  // 必ずサバイバルエリアを出る
  try {
    const { DataStoreProvider } = ChromeUtils.importESModule(
      "resource://noraneko/modules/pwa/DataStore.sys.mjs",
    );

    const dataManager = DataStoreProvider.getDataManager();
    const ssbData = await dataManager.getCurrentSsbData();

    for (const value of Object.values(ssbData)) {
      if ((value as Manifest).id === id) {
        const ssb = value as Manifest;

        // SSBウィンドウを開く
        // initialLaunchをtrueにして、SSBウィンドウ開いた後で
        // 通常のブラウザウィンドウを開くようにする
        const win = SsbRunnerUtils.openSsbWindow(ssb, true);

        // Windowsの統合機能を適用
        await SsbRunnerUtils.applyWindowsIntegration(ssb, win);
        break;
      }
    }
  } finally {
    // 処理完了後、サバイバルエリアを出る
    Services.startup.exitLastWindowClosingSurvivalArea();
  }
}

export class SSBCommandLineHandler {
  QueryInterface = ChromeUtils.generateQI([
    "nsICommandLineHandler",
  ]) as TQueryInterface;

  handle(cmdLine: nsICommandLine) {
    const id = cmdLine.handleFlagWithParam("start-ssb", false);
    if (id) {
      startSSBFromCmdLine(id);
      cmdLine.preventDefault = true;
    }
  }

  get helpInfo() {
    return "  --start-ssb <id>  Start the SSB with the given id.\n";
  }
}
