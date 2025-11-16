import { useState } from "react";
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

//  IMPORT DIRETO DO AVATAR GENÉRICO
import genericAvatar from '../../assets/Generic_avatar.png';

function Login({ navigateTo }) {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !senha) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        //  SALVA OS DADOS DO USUÁRIO NO LOCALSTORAGE
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        // CORREÇÃO: Usa avatar do banco se existir, senão usa genérico
        if (data.user.avatar) {
          localStorage.setItem('userAvatar', data.user.avatar);
          console.log('✅ Avatar carregado do banco:', data.user.avatar);
        } else {
          localStorage.setItem('userAvatar', genericAvatar);
          console.log('✅ Avatar definido como genérico');
        }
        
        alert(`Bem-vindo(a), ${data.user.nome}!`);
        navigateTo('dashboard');
      } else {
        alert(data.error || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro de conexão com o servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <LoginBody>
      <LoginHeader>
        <HeaderSection>
          <Logo src="src/assets/logo_navbar.png" alt="Logo Navbar" />
          <Navbar>
            <b><a href="home" onClick={(e) => { e.preventDefault(); navigateTo('home'); }}>Home</a></b>
            <b><a href="IA" onClick={(e) => { e.preventDefault(); navigateTo('ia'); }}>IA</a></b>
            <b><a href="about" onClick={(e) => { e.preventDefault(); navigateTo('about'); }}>Sobre Nós</a></b>
            <b><a class="login_nav" href="#login" onClick={(e) => { e.preventDefault(); navigateTo('login', e)}}>Login</a></b>
          </Navbar>
        </HeaderSection>
      </LoginHeader>

      <Container_Login>
        <LoginWrapper>
          <LoginBox>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>Email:</label>
                <Input
                  type="email"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </FormGroup>

              <FormGroup>
                <label>Senha:</label>
                <Input
                  type="password"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  disabled={loading}
                />
              </FormGroup>
              
              <LoginButton>
                <Button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Carregando...' : 'Login'}
                </Button>
                
                <RegisterLink 
                  href="/cadastro"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('cadastro');
                  }}
                >
                  Cadastrar
                </RegisterLink>
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