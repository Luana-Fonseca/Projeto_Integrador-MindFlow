// src/pages/Home/index.jsx
import {
  HomeBody,
  HomeHeader,
  HeaderSection,
  Navbar,
  Logo,
  IaImg,
  Ia_Container,
  Division_Ia,
  Text,
  IaText
} from './styles.js';

function IA() {
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

      <Ia_Container>
        <Division_Ia>
            <div className="text-about">
                <IaText>IA no seu dia a dia</IaText>
                <Text>Bem-vindo ao MindFlow, sua solução definitiva para organização pessoal e produtividade! Nossa missão é ajudar você a gerenciar suas tarefas diárias de forma eficiente e intuitiva, permitindo que você se concentre no que realmente importa.</Text>
            </div>
            <IaImg src="src/assets/image_ia.jpg" alt="Imagem IA" />
        </Division_Ia>
      </Ia_Container>
    </HomeBody>
  );
}

export default IA;
