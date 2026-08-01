import { useState } from 'react';

import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import { getDataExport } from '../../services/exportApi';

const EMPTY_PASSWORD_FORM = {
  current_password: '',
  new_password: '',
  confirm_password: '',
};

function AccountSettings() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user.name);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileError, setProfileError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  async function handleProfileSubmit(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setProfileErrors({ name: 'Tên hiển thị là bắt buộc.' });
      return;
    }

    setIsSavingProfile(true);
    setProfileErrors({});
    setProfileError('');

    try {
      await updateProfile({ name: trimmedName });
      setName(trimmedName);
      showToast('Thông tin tài khoản đã được cập nhật.');
    } catch (error) {
      setProfileErrors(error.fieldErrors || {});
      setProfileError(error.message);
    } finally {
      setIsSavingProfile(false);
    }
  }

  function handlePasswordChange(event) {
    const { name: fieldName, value } = event.target;
    setPasswordForm((currentForm) => ({
      ...currentForm,
      [fieldName]: value,
    }));
    setPasswordErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: '',
    }));
    setPasswordError('');
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    const errors = {};

    if (!passwordForm.current_password) {
      errors.current_password = 'Current password là bắt buộc.';
    }

    if (passwordForm.new_password.length < 12) {
      errors.new_password = 'Password mới phải có ít nhất 12 ký tự.';
    }

    if (passwordForm.confirm_password !== passwordForm.new_password) {
      errors.confirm_password = 'Password xác nhận không khớp.';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsChangingPassword(true);
    setPasswordErrors({});
    setPasswordError('');

    try {
      await changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      showToast('Password đã đổi. Các phiên đăng nhập khác đã được thu hồi.');
    } catch (error) {
      setPasswordErrors(error.fieldErrors || {});
      setPasswordError(error.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleExport() {
    setIsExporting(true);
    setExportError('');

    try {
      const data = await getDataExport();
      const date = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `campusflow-backup-${date}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(downloadUrl);
      showToast('File backup CampusFlow đã được tải xuống.');
    } catch (error) {
      setExportError(error.message);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <div className="border-b border-slate-200 pb-6">
        <p className="text-sm font-medium text-indigo-600">Tài khoản</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
          Cài đặt cá nhân
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Quản lý thông tin hiển thị và bảo mật đăng nhập của bạn.
        </p>
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="font-semibold text-slate-950">Thông tin cá nhân</h2>
            <p className="mt-1 text-sm text-slate-400">
              Tên này xuất hiện trên thanh điều hướng và dashboard.
            </p>
          </div>

          <form className="mt-5 space-y-5" onSubmit={handleProfileSubmit} noValidate>
            <SettingsField
              id="settings-name"
              label="Tên hiển thị"
              name="name"
              value={name}
              maxLength={100}
              autoComplete="name"
              error={profileErrors.name}
              onChange={(event) => {
                setName(event.target.value);
                setProfileErrors({});
                setProfileError('');
              }}
            />

            <SettingsField
              id="settings-email"
              label="Email"
              name="email"
              type="email"
              value={user.email}
              disabled
              help="Email đăng nhập chưa thể thay đổi trong phase này."
              onChange={() => {}}
            />

            {profileError && <ErrorMessage message={profileError} />}

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
              disabled={isSavingProfile || name.trim() === user.name}
            >
              {isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="border-b border-slate-100 pb-5">
            <h2 className="font-semibold text-slate-950">Đổi password</h2>
            <p className="mt-1 text-sm text-slate-400">
              Sau khi đổi, các session khác sẽ bị đăng xuất để bảo vệ tài khoản.
            </p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handlePasswordSubmit} noValidate>
            <SettingsField
              id="current-password"
              label="Current password"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              autoComplete="current-password"
              maxLength={128}
              error={passwordErrors.current_password}
              onChange={handlePasswordChange}
            />
            <SettingsField
              id="new-password"
              label="Password mới"
              name="new_password"
              type="password"
              value={passwordForm.new_password}
              autoComplete="new-password"
              maxLength={128}
              help="Từ 12 đến 128 ký tự."
              error={passwordErrors.new_password}
              onChange={handlePasswordChange}
            />
            <SettingsField
              id="confirm-password"
              label="Xác nhận password mới"
              name="confirm_password"
              type="password"
              value={passwordForm.confirm_password}
              autoComplete="new-password"
              maxLength={128}
              error={passwordErrors.confirm_password}
              onChange={handlePasswordChange}
            />

            {passwordError && <ErrorMessage message={passwordError} />}

            <button
              type="submit"
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600 disabled:opacity-60"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? 'Đang đổi...' : 'Đổi password'}
            </button>
          </form>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-slate-950">Backup dữ liệu</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Tải một file JSON chứa profile cùng toàn bộ Course, Project và Task của tài khoản này.
              File không chứa password hoặc session.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:text-indigo-700 disabled:opacity-60"
            disabled={isExporting}
            onClick={handleExport}
          >
            {isExporting ? 'Đang tạo backup...' : 'Tải file backup'}
          </button>
        </div>
        {exportError && (
          <div className="mt-4">
            <ErrorMessage message={exportError} />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-100/70 p-5 text-sm text-slate-500">
        <p className="font-semibold text-slate-700">Security boundary</p>
        <p className="mt-1 leading-6">
          Password không được gửi lại trong response hoặc lưu trong React state sau khi form thành
          công. CampusFlow lưu password hash và session phía server.
        </p>
      </section>
    </div>
  );
}

function SettingsField({ id, label, error, help, type = 'text', ...inputProps }) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="text-sm font-semibold text-slate-700" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition disabled:bg-slate-50 disabled:text-slate-400 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100'
        }`}
        {...inputProps}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : (
        help && <p className="mt-1.5 text-xs text-slate-400">{help}</p>
      )}
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div
      className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
      role="alert"
    >
      {message}
    </div>
  );
}

export default AccountSettings;
