import React from "react";
import {
  CadastroBody,
  CadastroHeader,
  HeaderSection,
  Navbar,
  Logo,
  Container_Cadastro,
  CadastroWrapper,
  CadastroBox,
  ImageBox,
  CadastroImg,
  FormGroup,
  Input,
  CadastroButton,
  Button,
  RegisterLink,
} from "./styles.js";

function Cadastro() {
  return (
    <CadastroBody>
      <CadastroHeader>
        <HeaderSection>
          <Logo src="src\assets\logo_navbar.png" alt="Logo Navbar" />
          <Navbar>
            <b><a href="home">Home</a></b>
            <b><a href="IA">IA</a></b>
            <b><a href="about">Sobre Nós</a></b>
          </Navbar>
        </HeaderSection>
      </CadastroHeader>

      <Container_Cadastro>
        <CadastroWrapper>
          <ImageBox>
            <CadastroImg src="src\assets\imagem_cadastro.png" alt="MindFlow" />
          </ImageBox>
          <CadastroBox>
            <h2>Cadastro</h2>
            <form>
              <FormGroup>
                <label>Nome:</label>
                <Input type="text" placeholder="Digite seu Nome" />
              </FormGroup>

              <FormGroup>
                <label>Email:</label>
                <Input type="text" placeholder="Digite seu email" />
              </FormGroup>

              <FormGroup>
                <label>Senha:</label>
                <Input type="password" placeholder="Digite sua senha" />
              </FormGroup>

              <CadastroButton>
                <Button type="submit">Cadastrar</Button>
                <RegisterLink href="/register">Já possui <span>Login</span>?</RegisterLink>
              </CadastroButton>
            </form>
          </CadastroBox>
        </CadastroWrapper>
      </Container_Cadastro>
    </CadastroBody>
  );
}

export default Cadastro;
