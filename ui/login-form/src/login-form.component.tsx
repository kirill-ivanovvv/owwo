import type { LoginFormType } from "./login-form.interface";

const LoginForm: LoginFormType = (props) => {
  const { action, children } = props;

  return (
    <form method="POST" action={action} class="login-form">
      {children}
    </form>
  );
};

export { LoginForm };