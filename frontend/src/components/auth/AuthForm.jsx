export default function AuthForm({ mode = 'login' }) {
  return (
    <form className="auth-form">
      <h2>{mode === 'login' ? 'Login' : 'SignUp'}</h2>
      <label>Email Address<input type="email" placeholder="example@gmail.com"/></label>
      <label>Password<input type="password" placeholder="********"/></label>
      <label className="remember"><input type="checkbox"/> Remember</label>
      <button className="btn primary" type="submit">{mode === 'login' ? 'Login' : 'Sign Up'}</button>
    </form>
  );
}
