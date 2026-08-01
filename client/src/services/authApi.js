import { request } from './apiClient';

export async function registerAccount(account) {
  const result = await request('/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(account),
    notifyUnauthorized: false,
  });

  return result.data;
}

export async function loginAccount(credentials) {
  const result = await request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    notifyUnauthorized: false,
  });

  return result.data;
}

export async function getCurrentUser() {
  const result = await request('/auth/me', {
    notifyUnauthorized: false,
  });

  return result.data;
}

export async function updateProfileAccount(profile) {
  const result = await request('/auth/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  });

  return result.data;
}

export function changePasswordAccount(passwords) {
  return request('/auth/password', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwords),
  });
}

export function logoutAccount() {
  return request('/auth/logout', {
    method: 'POST',
  });
}
