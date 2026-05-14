const toMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const getFamilyId = (family) => family.id ?? family.familyId;

const getExpensePayerId = (expense) =>
  expense.paidBy ?? expense.familyId ?? expense.paidById;

export function calculateTotalExpenses(expenses = []) {
  return toMoney(
    expenses.reduce((total, expense) => total + (Number(expense.amount) || 0), 0)
  );
}

export function calculateEqualShare(totalExpenses, familyCount) {
  if (!familyCount) {
    return 0;
  }

  return toMoney(totalExpenses / familyCount);
}

export function calculateFamilyBalances(families = [], expenses = []) {
  const totalExpenses = calculateTotalExpenses(expenses);
  const equalShare = calculateEqualShare(totalExpenses, families.length);

  const paidByFamily = families.reduce((totals, family) => {
    totals[getFamilyId(family)] = 0;
    return totals;
  }, {});

  for (const expense of expenses) {
    const payerId = getExpensePayerId(expense);

    if (payerId && payerId in paidByFamily) {
      paidByFamily[payerId] = toMoney(paidByFamily[payerId] + Number(expense.amount));
    }
  }

  return families.map((family) => {
    const familyId = getFamilyId(family);
    const paid = toMoney(paidByFamily[familyId] ?? 0);
    const balance = toMoney(paid - equalShare);

    return {
      familyId,
      familyName: family.familyName ?? family.name,
      paid,
      share: equalShare,
      balance,
      status: balance > 0 ? 'receive' : balance < 0 ? 'pay' : 'settled',
    };
  });
}

export function generateSettlementTransactions(familyBalances = []) {
  const receivers = familyBalances
    .filter((family) => family.balance > 0)
    .map((family) => ({
      ...family,
      remaining: toMoney(family.balance),
    }))
    .sort((a, b) => b.remaining - a.remaining);

  const payers = familyBalances
    .filter((family) => family.balance < 0)
    .map((family) => ({
      ...family,
      remaining: toMoney(Math.abs(family.balance)),
    }))
    .sort((a, b) => b.remaining - a.remaining);

  const transactions = [];
  let payerIndex = 0;
  let receiverIndex = 0;

  while (payerIndex < payers.length && receiverIndex < receivers.length) {
    const payer = payers[payerIndex];
    const receiver = receivers[receiverIndex];
    const amount = toMoney(Math.min(payer.remaining, receiver.remaining));

    if (amount > 0) {
      transactions.push({
        fromFamilyId: payer.familyId,
        fromFamilyName: payer.familyName,
        toFamilyId: receiver.familyId,
        toFamilyName: receiver.familyName,
        amount,
        whoShouldPay: payer.familyName,
        whoShouldReceive: receiver.familyName,
      });
    }

    payer.remaining = toMoney(payer.remaining - amount);
    receiver.remaining = toMoney(receiver.remaining - amount);

    if (payer.remaining === 0) {
      payerIndex += 1;
    }

    if (receiver.remaining === 0) {
      receiverIndex += 1;
    }
  }

  return transactions;
}

export function calculateSettlements(families = [], expenses = []) {
  const totalExpenses = calculateTotalExpenses(expenses);
  const equalShare = calculateEqualShare(totalExpenses, families.length);
  const familyBalances = calculateFamilyBalances(families, expenses);
  const transactions = generateSettlementTransactions(familyBalances);

  return {
    totalExpenses,
    equalShare,
    familyBalances,
    transactions,
  };
}
