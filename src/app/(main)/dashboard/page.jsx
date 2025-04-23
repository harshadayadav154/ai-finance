import CreateAccountDrawer from "@/src/components/CreateAccountDrawer";
import { Card, CardContent } from "@/src/components/ui/card";
import { Plus } from "lucide-react";
import React from "react";
import { getUserAccounts } from "@/actions/dashboard";
import AccountCard from "./_components/AccountCard";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();

  return (
    <div className="px-5">
      {/* Budget Progress */}

      {/* Dashboard overview */}

      {/* Accounts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground pt-5">
              <Plus className="h-10 w-10 mb-2" />
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length > 0 &&
          accounts.map((account, index) => {
            return <AccountCard key={index} account={account} />;
          })}
      </div>
    </div>
  );
};

export default DashboardPage;
