// src/pages/Home/index.jsx
import {
  HomeBody,
  HomeHeader,
  HeaderSection,
  Navbar,
  Logo,
  AboutImg,
  About_Container,
  Division_About,
  Text,
  AboutText
} from './styles.js';

function About() {
  return (
    <HomeBody>
      <HomeHeader>
        <HeaderSection>
          <Logo src="src/assets/logo_navbar.png" alt="Logo Navbar" />
          <Navbar>
            <b><a href="home">Home</a></b>
            <b><a href="IA">IA</a></b>
            <b><a href="about">Sobre Nós</a></b>
          </Navbar>
        </HeaderSection>
      </HomeHeader>

      <About_Container>
        <Division_About>
            <AboutImg src="src/assets/image_about.png" alt="Imagem Sobre Nós" />
            <div class="text-about">
                <AboutText>Sobre Nós</AboutText>
                <Text>Bem-vindo ao MindFlow, sua solução definitiva para organização pessoal e produtividade! Nossa missão é ajudar você a gerenciar suas tarefas diárias de forma eficiente e intuitiva, permitindo que você se concentre no que realmente importa.</Text>
            </div>
        </Division_About>
      </About_Container>
    </HomeBody>
  );
}

export default About;
