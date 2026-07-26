import { useState } from 'react';

import useAuth from '../../hooks/useAuth';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
};

function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === 'register';

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setFieldErrors((currentErrors) => ({
      ...currentErrors,
      [name]: '',
    }));
    setSubmitError('');
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setForm((currentForm) => ({
      ...EMPTY_FORM,
      email: currentForm.email,
    }));
    setFieldErrors({});
    setSubmitError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const errors = {};

    if (isRegisterMode && !form.name.trim()) {
      errors.name = 'Tên hiển thị là bắt buộc.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email là bắt buộc.';
    }

    if (!form.password) {
      errors.password = 'Password là bắt buộc.';
    } else if (isRegisterMode && form.password.length < 12) {
      errors.password = 'Password phải có ít nhất 12 ký tự.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setSubmitError('');

    try {
      if (isRegisterMode) {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await login({
          email: form.email.trim(),
          password: form.password,
        });
      }
    } catch (error) {
      setFieldErrors(error.fieldErrors || {});
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(32rem,1.1fr)]">
      <section className="relative hidden overflow-hidden px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 18% 20%, rgba(99,102,241,0.48), transparent 32%), radial-gradient(circle at 82% 78%, rgba(14,165,233,0.25), transparent 34%)',
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-white text-sm font-bold text-slate-950">
            CF
          </div>
          <div>
            <p className="font-semibold tracking-tight">CampusFlow</p>
            <p className="text-xs text-slate-400">Student project workspace</p>
          </div>
        </div>

        <div className="relative max-w-xl py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Plan with clarity
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-0.04em]">
            Một nơi cho course, project và mọi deadline quan trọng.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
            Tổ chức học kỳ theo đúng luồng công việc của bạn, từ môn học đến task hoàn thành.
          </p>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-white/10 pt-6 text-sm text-slate-300">
            <span>Course ownership</span>
            <span>Deadline tracking</span>
            <span>Progress overview</span>
          </div>
        </div>

        <p className="relative text-xs text-slate-500">Phase 2 · Personal accounts</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
              CF
            </div>
            <div>
              <p className="font-semibold text-slate-950">CampusFlow</p>
              <p className="text-xs text-slate-500">Không gian học tập cá nhân</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
            <div>
              <p className="text-sm font-semibold text-indigo-600">
                {isRegisterMode ? 'Tạo tài khoản' : 'Chào mừng trở lại'}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {isRegisterMode ? 'Bắt đầu workspace của bạn' : 'Đăng nhập CampusFlow'}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {isRegisterMode
                  ? 'Dữ liệu course và project sẽ được tách riêng theo tài khoản.'
                  : 'Tiếp tục quản lý tiến độ học tập của bạn.'}
              </p>
            </div>

            <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1" role="tablist">
              {[
                ['login', 'Đăng nhập'],
                ['register', 'Đăng ký'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={mode === value}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    mode === value
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  onClick={() => switchMode(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              {isRegisterMode && (
                <AuthField
                  id="auth-name"
                  label="Tên hiển thị"
                  name="name"
                  value={form.name}
                  error={fieldErrors.name}
                  autoComplete="name"
                  maxLength={100}
                  placeholder="Nguyễn Văn A"
                  onChange={handleChange}
                />
              )}

              <AuthField
                id="auth-email"
                label="Email"
                name="email"
                type="email"
                value={form.email}
                error={fieldErrors.email}
                autoComplete="email"
                maxLength={255}
                placeholder="student@hcmut.edu.vn"
                onChange={handleChange}
              />

              <AuthField
                id="auth-password"
                label="Password"
                name="password"
                type="password"
                value={form.password}
                error={fieldErrors.password}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                maxLength={128}
                placeholder={isRegisterMode ? 'Tối thiểu 12 ký tự' : 'Nhập password'}
                onChange={handleChange}
              />

              {submitError && (
                <div
                  className="rounded-xl border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  role="alert"
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Đang xử lý...' : isRegisterMode ? 'Tạo tài khoản' : 'Đăng nhập'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              Session được bảo vệ bằng HttpOnly cookie và không lưu token trong trình duyệt.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthField({ id, label, error, type = 'text', ...inputProps }) {
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
        className={`mt-2 w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-300 focus:ring-2 ${
          error
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-slate-200 focus:border-indigo-400 focus:ring-indigo-100'
        }`}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function AuthLoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-6">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
          CF
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">Đang kiểm tra phiên đăng nhập...</p>
      </div>
    </main>
  );
}

export function SessionErrorScreen({ message, onRetry }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fa] px-6">
      <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg shadow-slate-200/50">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-50 font-bold text-red-600">
          !
        </div>
        <h1 className="mt-4 text-xl font-semibold text-slate-950">Không thể kết nối đến API</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
        <button
          type="button"
          className="mt-6 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-600"
          onClick={onRetry}
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}

export default AuthScreen;
