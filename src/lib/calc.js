export function calcSplit(exp, members) {
  const shares = {};
  members.forEach(m => (shares[m.id] = 0));
  const amt = exp.amount;

  if (exp.splitType === 'equal') {
    const each = amt / members.length;
    members.forEach(m => (shares[m.id] = each));
  } else if (exp.splitType === 'solo') {
    shares[exp.soloOwner || exp.paidBy] = amt;
  } else if (exp.splitType === 'custom') {
    members.forEach(m => {
      shares[m.id] = amt * ((exp.customSplits?.[m.id] || 0) / 100);
    });
  }

  return shares;
}

export function calcBalance(expenses, members) {
  const paid = {};
  const owes = {};
  members.forEach(m => {
    paid[m.id] = 0;
    owes[m.id] = 0;
  });

  expenses.forEach(exp => {
    paid[exp.paidBy] = (paid[exp.paidBy] || 0) + exp.amount;
    const shares = calcSplit(exp, members);
    Object.keys(shares).forEach(id => {
      owes[id] = (owes[id] || 0) + shares[id];
    });
  });

  const net = {};
  members.forEach(m => {
    net[m.id] = paid[m.id] - owes[m.id];
  });

  // Simplify debts using greedy algorithm
  const debts = [];
  const balances = members.map(m => ({ id: m.id, bal: net[m.id] }));
  const debtors = balances.filter(b => b.bal < -0.01).sort((a, b) => a.bal - b.bal);
  const creditors = balances.filter(b => b.bal > 0.01).sort((a, b) => b.bal - a.bal);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const amount = Math.min(-debtors[i].bal, creditors[j].bal);
    if (amount > 0.01) {
      debts.push({ from: debtors[i].id, to: creditors[j].id, amount });
    }
    debtors[i].bal += amount;
    creditors[j].bal -= amount;
    if (Math.abs(debtors[i].bal) < 0.01) i++;
    if (Math.abs(creditors[j].bal) < 0.01) j++;
  }

  return { paid, owes, net, debts };
}

export function getCategoryBreakdown(expenses) {
  const cats = {};
  expenses.forEach(e => {
    cats[e.category] = (cats[e.category] || 0) + e.amount;
  });
  return cats;
}
