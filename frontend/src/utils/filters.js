export function filterVehicles(vehicles, filters) {
  return vehicles.filter(v => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!v.name.toLowerCase().includes(q) && !v.brand.toLowerCase().includes(q) && !v.location.toLowerCase().includes(q)) return false;
    }
    if (filters.type && filters.type !== 'all' && v.type !== filters.type) return false;
    if (filters.fuelType && filters.fuelType !== 'all' && v.fuelType !== filters.fuelType) return false;
    if (filters.transmission && filters.transmission !== 'all' && v.transmission !== filters.transmission) return false;
    if (filters.location && filters.location !== 'all' && v.location !== filters.location) return false;
    if (filters.availableOnly && !v.available) return false;
    if (filters.maxPrice && v.price.daily > filters.maxPrice) return false;
    return true;
  });
}

export function sortVehicles(vehicles, sortBy) {
  const arr = [...vehicles];
  switch (sortBy) {
    case 'price_asc': return arr.sort((a, b) => a.price.daily - b.price.daily);
    case 'price_desc': return arr.sort((a, b) => b.price.daily - a.price.daily);
    case 'rating': return arr.sort((a, b) => b.rating - a.rating);
    case 'name': return arr.sort((a, b) => a.name.localeCompare(b.name));
    default: return arr;
  }
}
