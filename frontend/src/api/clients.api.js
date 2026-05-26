export const fetchClients = async (search = '') => {
  const params = new URLSearchParams({ limit: '1000' });
  if (search.trim()) params.set('search', search.trim());

  const res = await fetch(`/api/v1/users?${params}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch clients: ${res.statusText}`);
  }

  const json = await res.json();
  return json.data?.data ?? [];
};
