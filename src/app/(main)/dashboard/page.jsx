import CreateAccountDrawer from "@/src/components/CreateAccountDrawer";
import { Card, CardContent } from "@/src/components/ui/card";
import { Plus } from "lucide-react";
import React, { Suspense } from "react";
import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import AccountCard from "./_components/AccountCard";
import { getCurrentBudget } from "@/actions/budget";
import BudgetProgress from "./_components/budget-progress";
import DashboardOverview from "./_components/transaction-overview";

const DashboardPage = async () => {
  const accounts = await getUserAccounts();

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Budget Progress */}
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />
      )}

      {/* Dashboard overview */}
      <Suspense fallback={"Loading Overview"}>
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />
      </Suspense>

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
