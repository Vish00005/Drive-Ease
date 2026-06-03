export function calculatePrice(vehicle, startDate, endDate) {
  if (!startDate || !endDate || !vehicle) return { days: 0, type: 'daily', total: 0 };
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (days <= 0) return { days: 0, type: 'daily', total: 0 };
  
  let type, total;
  if (days >= 28) {
    const months = Math.ceil(days / 30);
    type = 'monthly';
    total = months * vehicle.price.monthly;
  } else if (days >= 7) {
    const weeks = Math.ceil(days / 7);
    type = 'weekly';
    total = weeks * vehicle.price.weekly;
  } else {
    type = 'daily';
    total = days * vehicle.price.daily;
  }
  return { days, type, total };
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function getDurationLabel(type) {
  const labels = { daily: 'per day', weekly: 'per week', monthly: 'per month' };
  return labels[type] || 'per day';
}
