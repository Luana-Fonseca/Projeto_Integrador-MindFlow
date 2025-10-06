import {
  LoginBody,
  LoginHeader,
  HeaderSection,
  Navbar,
  Logo,
  Container_Login,
  LoginWrapper,
  LoginBox,
  ImageBox,
  LoginImg,
  FormGroup,
  Input,
  LoginButton,
  Button,
  RegisterLink,
} from './styles.js';

function Login() {
  return (
    <LoginBody>
      <LoginHeader>
        <HeaderSection>
          <Logo src="src/assets/logo_navbar.png" alt="Logo Navbar" />
          <Navbar>
            <b><a href="home">Home</a></b>
            <b><a href="IA">IA</a></b>
            <b><a href="about">Sobre Nós</a></b>
          </Navbar>
        </HeaderSection>
      </LoginHeader>

      <Container_Login>
        <LoginWrapper>
          <LoginBox>
            <h2>Login</h2>
            <form>
              <FormGroup>
                <label>Email:</label>
                <Input type="text" placeholder="Digite seu email" />
              </FormGroup>

              <FormGroup>
                <label>Senha:</label>
                <Input type="password" placeholder="Digite sua senha" />
              </FormGroup>
              <LoginButton>
                <Button type="submit">Login</Button>
                <RegisterLink href="/register">Cadastrar</RegisterLink>
              </LoginButton>
            </form>
          </LoginBox>

          <ImageBox>
            <LoginImg src="src\assets\imagem_login.png" alt="MindFlow" />
          </ImageBox>
        </LoginWrapper>
      </Container_Login>
    </LoginBody>
  );
}

export default Login;
