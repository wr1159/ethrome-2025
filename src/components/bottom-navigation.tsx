"use client";

import { Tabs, TabItem } from "@worldcoin/mini-apps-ui-kit-react";
import { Settings, User, Wallet } from "iconoir-react";
import { TabType } from "~/types";

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border py-3">
      <div className="max-w-lg mx-auto">
        <Tabs value={activeTab}>
          <TabItem 
            value="actions"
            onClick={() => onTabChange("actions")}
            icon={<Settings width={20} height={20} />}
            label="Actions"
          />
          <TabItem 
            value="context"
            onClick={() => onTabChange("context")}
            icon={<User width={20} height={20} />}
            label="Context"
          />
          <TabItem 
            value="wallet"
            onClick={() => onTabChange("wallet")}
            icon={<Wallet width={20} height={20} />}
            label="Wallet"
          />
        </Tabs>
      </div>
    </div>
  );
}
